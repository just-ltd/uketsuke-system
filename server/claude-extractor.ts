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

const EXTRACTION_PROMPT = `あなたは建設・測量会社の受付表作成アシスタントです。
Slackでの会話から、以下の受付表の項目を抽出してください。

## 抽出する項目
- jisshiDate: 実施日（例: 令和8年2月4日（水））
- uketsukeSha: 受付者名
- uketsukeDate: 受付日
- kaishaAddress: 会社住所（〒含む）
- kaishaName: 会社名
- tantouSha: 担当者名
- keitai: 携帯電話番号
- genbaName: 現場名
- kenName: 件名
- genbaAddress: 現場住所
- renrakusakiTel: 連絡先電話番号
- satsueiMaisuBasho: 撮影枚数・箇所
- machiawaseJikanBasho: 待合時間・場所
- genbaJimushoAri: 現場事務所の有無（true/false）
- genbaJimushoBasho: 現場事務所の場所
- memo: MEMO（特記事項）
- sagyoNaiyo: 作業内容（配列）
  - atsusa: 厚さ
  - coaSize: コアサイズ
  - honsu: 本数
  - kaikouSunpo: 開口寸法
  - tokkiJiko: 特記事項

## 出力形式
JSON形式で出力してください。抽出できなかった項目は空文字列""にしてください。

## 会話内容
`

export async function extractUketsukeData(
  messages: SlackMessage[]
): Promise<Partial<UketsukeData>> {
  // 会話をテキストに変換
  const conversationText = messages
    .map((msg) => `[${msg.user}]: ${msg.text}`)
    .join('\n')

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      messages: [
        {
          role: 'user',
          content: EXTRACTION_PROMPT + conversationText,
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

    console.log('抽出結果:', extracted)
    return extracted
  } catch (error) {
    console.error('Claude API エラー:', error)
    return {}
  }
}
