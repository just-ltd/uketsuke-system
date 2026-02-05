import Anthropic from '@anthropic-ai/sdk'
import type { UketsukeData } from '../src/types/uketsuke'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface SlackMessage {
  user: string
  text: string
  timestamp: string
}

const SYSTEM_PROMPT = `あなたは建設・測量会社の受付表作成専門AIです。
Slack会話からJSON形式で情報を抽出します。
指示されたJSON形式を厳密に守ってください。`

const EXTRACTION_PROMPT = `以下のSlack会話から、レーダー探査受付表の項目を抽出してJSON形式で出力してください。

## 抽出する項目
- jisshiDate: 実施日
- uketsukeSha: 受付者名（Slackワークフローの「依頼者」がこれに該当します）
- uketsukeDate: 受付日（YYYY-MM-DD形式。Slackワークフローの「依頼日」がこれに該当します）
- kaishaAddress: 会社住所（〒含む）
- kaishaName: 会社名
- tantouSha: 担当者名
- keitai: 携帯電話番号
- genbaName: 現場名
- kenName: 件名
- genbaAddress: 現場住所
- renrakusakiTel: 連絡先電話番号
- machiawaseJikanBasho: 待合時間・場所
- genbaJimushoAri: 現場事務所の有無（true/false）
- genbaJimushoBasho: 現場事務所の場所
- memo: MEMO（特記事項）
- sagyoNaiyo: 作業内容（配列）。各要素は { "tokkiJiko": "テキスト" } の形式。

## 【最重要】X線とコアの分別ルール

会話内に①②で作業種別が分かれている場合（例: ①X線 ②コア）、以下を厳守してください:

### jisshiDate の書き方:
日程をX線とコアで分けて改行(\n)で区切る。絶対に混ぜて1行にしないこと。

正しい例:
"①X線: 2025年11月14日、17日、12月1日、2日\n②コア: 2025年11月18日、19日、12月3日、4日\n夜間21:30"

間違った例（これは禁止）:
"2025年11月14日、17日、12月1日、2日、11月18日、19日、12月3日、4日 夜間21:30"

### sagyoNaiyo の書き方:
X線とコアは必ず別の配列要素にする。1つにまとめることは禁止。

正しい例:
[
  { "tokkiJiko": "①X線撮影 床、8F：24〜29箇所、7F：24〜29箇所" },
  { "tokkiJiko": "②コア削孔 トイレ改修、コアは手元付き2名" }
]

間違った例（これは禁止）:
[
  { "tokkiJiko": "①X線 ②コア、トイレ改修、床、8F：24〜29箇所..." }
]

## 作業内容の記載ルール
- X線撮影: 数量は「枚」（例: "X線撮影 20枚"）
- コア削孔: 数量は「本」、直径は「Φ」（例: "コア Φ25 9本"）
- 斫り: サイズは「mm角」（例: "斫り 100mm角 5箇所"）
- デッキプレート/電源使用/はつり作業の情報があれば括弧内に記載
  例: "②コア Φ25 9本（デッキプレート有、電源使用可、はつり作業有）"

## 調査希望日の解釈ルール
「調査希望日：2025/①11/14,17,12/1,2 ②11/18,19,12/3,4」の場合:
- ①の日程 = 11/14, 11/17, 12/1, 12/2
- ②の日程 = 11/18, 11/19, 12/3, 12/4
「17」は「11/17」の省略形です（前の月を引き継ぐ）。

## 出力形式
JSONのみ出力。説明文は不要。抽出できなかった項目は空文字列""。
sagyoNaiyoは必ず配列で、作業種別ごとに別の要素にする。

## 会話内容
`

export async function extractUketsukeData(
  messages: SlackMessage[],
  fileTexts: string[] = []
): Promise<Partial<UketsukeData>> {
  // 会話をテキストに変換
  const conversationText = messages
    .map((msg) => `[${msg.user}]: ${msg.text}`)
    .join('\n')

  // ファイル内容があれば追加
  let fullContent = conversationText
  if (fileTexts.length > 0) {
    fullContent += '\n\n--- 添付ファイルの内容 ---\n' + fileTexts.join('\n\n')
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + fullContent,
        },
      ],
    })

    // レスポンスからテキストを取得
    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type')
    }

    // JSONを抽出（```json...```で囲まれている場合に対応）
    let jsonText = content.text
    const jsonMatch = jsonText.match(/```json\s*([\s\S]*?)\s*```/)
    if (jsonMatch) {
      jsonText = jsonMatch[1]
    }

    // JSONをパース
    const extracted = JSON.parse(jsonText)

    // sagyoNaiyoの形式を正規化
    if (extracted.sagyoNaiyo && Array.isArray(extracted.sagyoNaiyo)) {
      extracted.sagyoNaiyo = extracted.sagyoNaiyo.map(
        (item: Record<string, string>) => {
          if (typeof item === 'string') {
            return { tokkiJiko: item }
          }
          if (item.tokkiJiko !== undefined) {
            return { tokkiJiko: item.tokkiJiko }
          }
          const parts = []
          if (item.atsusa) parts.push(item.atsusa)
          if (item.coaSize) parts.push(item.coaSize)
          if (item.honsu) parts.push(item.honsu)
          if (item.kaikouSunpo) parts.push(item.kaikouSunpo)
          if (item.tokkiJiko) parts.push(item.tokkiJiko)
          return { tokkiJiko: parts.join(' ') || '' }
        }
      )

      // 後処理: ①と②が1つの行にまとまっている場合は分割する
      const splitSagyoNaiyo: { tokkiJiko: string }[] = []
      for (const item of extracted.sagyoNaiyo) {
        const text = item.tokkiJiko as string
        // "①...②..." のパターンを検出して分割
        const splitMatch = text.match(/^(①.+?)\s+(②.+)$/)
        if (splitMatch) {
          splitSagyoNaiyo.push({ tokkiJiko: splitMatch[1].trim() })
          splitSagyoNaiyo.push({ tokkiJiko: splitMatch[2].trim() })
        } else {
          splitSagyoNaiyo.push(item)
        }
      }
      extracted.sagyoNaiyo = splitSagyoNaiyo
    }

    // 後処理: jisshiDateに①②が混在している場合、改行で分ける
    if (extracted.jisshiDate && typeof extracted.jisshiDate === 'string') {
      const dateStr = extracted.jisshiDate as string
      // ①と②が含まれているが改行がない場合
      if (dateStr.includes('①') && dateStr.includes('②') && !dateStr.includes('\n')) {
        const dateMatch = dateStr.match(/(①[^②]+)(②.+)/)
        if (dateMatch) {
          extracted.jisshiDate = dateMatch[1].trim() + '\n' + dateMatch[2].trim()
        }
      }
      // ①②がなく日付が全て混在している場合は、そのまま（プロンプトで対応）
    }

    // coaSakkoフィールドが返された場合は削除（廃止済み）
    delete extracted.coaSakko

    console.log('抽出結果:', extracted)
    return extracted
  } catch (error) {
    console.error('Claude API エラー:', error)
    return {}
  }
}
