import { App, LogLevel } from '@slack/bolt'
import 'dotenv/config'
import { extractUketsukeData } from './claude-extractor'
import { downloadSlackFile, extractTextFromFile } from './file-extractor'
// Firebase設定後に有効化
// import { saveUketsukeData } from './firebase-admin'

console.log('環境変数チェック:')
console.log('SLACK_BOT_TOKEN:', process.env.SLACK_BOT_TOKEN ? '設定済み' : '未設定')
console.log('SLACK_APP_TOKEN:', process.env.SLACK_APP_TOKEN ? '設定済み' : '未設定')
console.log('SLACK_SIGNING_SECRET:', process.env.SLACK_SIGNING_SECRET ? '設定済み' : '未設定')

// Slack Appの初期化
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
  logLevel: LogLevel.DEBUG, // デバッグログを有効化
})

// 確認通知用のAPIエンドポイント
async function sendConfirmNotification(
  channelId: string,
  threadTs: string
): Promise<void> {
  const now = new Date()
  const dateStr = `${now.getFullYear()}/${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

  try {
    await app.client.chat.postMessage({
      channel: channelId,
      thread_ts: threadTs,
      text: '✅ 受付表 確認完了',
      attachments: [
        {
          color: '#2eb67d',
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*✅ 受付表 確認完了*\n営業担当者が受付表の最終確認及び保存を行いました。\n📅 確認日時: ${dateStr}`,
              },
            },
          ],
        },
      ],
    })
    console.log('確認通知を送信しました')
  } catch (error) {
    console.error('確認通知の送信に失敗:', error)
    throw error
  }
}

// Botがメンションされた時の処理
app.event('app_mention', async ({ event, client, say }) => {
  try {
    console.log('メンションを受信:', event.text)

    // スレッド内のメッセージを取得
    const threadTs = event.thread_ts || event.ts
    const channelId = event.channel

    // チャンネルの会話履歴を取得
    const result = await client.conversations.replies({
      channel: channelId,
      ts: threadTs,
      limit: 100, // 最大100件
    })

    const messages = result.messages || []
    console.log(`${messages.length}件のメッセージを取得`)

    // ユーザーIDから実名へのキャッシュ（同じユーザーを何度もAPI呼び出ししない）
    const userNameCache = new Map<string, string>()

    async function resolveUserName(userId: string): Promise<string> {
      if (userNameCache.has(userId)) {
        return userNameCache.get(userId)!
      }
      try {
        const userInfo = await client.users.info({ user: userId })
        const name = userInfo.user?.real_name || userInfo.user?.name || userId
        userNameCache.set(userId, name)
        return name
      } catch {
        userNameCache.set(userId, userId)
        return userId
      }
    }

    // メッセージテキスト内の <@USER_ID> メンションを実名に変換
    async function resolveUserMentions(text: string): Promise<string> {
      const mentionPattern = /<@([A-Z0-9]+)>/g
      const matches = [...text.matchAll(mentionPattern)]
      if (matches.length === 0) return text

      let resolved = text
      for (const match of matches) {
        const userId = match[1]
        const realName = await resolveUserName(userId)
        resolved = resolved.replace(match[0], realName)
      }
      return resolved
    }

    // メッセージを整形 + ファイル添付からテキスト抽出
    const fileTexts: string[] = []
    const botToken = process.env.SLACK_BOT_TOKEN || ''

    const conversationText = await Promise.all(
      messages.map(async (msg) => {
        // ユーザー名を取得
        const userName = msg.user
          ? await resolveUserName(msg.user)
          : 'Unknown'

        // メッセージテキスト内のメンションを実名に変換
        const resolvedText = await resolveUserMentions(msg.text || '')

        // ファイル添付を処理
        if (msg.files && msg.files.length > 0) {
          for (const file of msg.files) {
            const downloadUrl = file.url_private_download || file.url_private
            if (!downloadUrl || !file.name) continue

            try {
              console.log(`ファイルダウンロード中: ${file.name} (${file.mimetype})`)
              const buffer = await downloadSlackFile(downloadUrl, botToken)
              const text = await extractTextFromFile(
                buffer,
                file.name,
                file.mimetype || ''
              )
              if (text) {
                fileTexts.push(`【添付ファイル: ${file.name}】\n${text}`)
              }
            } catch (error) {
              console.error(`ファイル「${file.name}」の処理に失敗:`, error)
            }
          }
        }

        return {
          user: userName,
          text: resolvedText,
          timestamp: msg.ts || '',
        }
      })
    )

    const fileCount = fileTexts.length
    const msgInfo = fileCount > 0
      ? `${messages.length}件のメッセージ + ${fileCount}件のファイルを解析`
      : `${messages.length}件のメッセージを解析`

    // Claude APIで情報を抽出
    await say({
      thread_ts: threadTs,
      text: `受付表を作成中... (${msgInfo})`,
    })

    const extractedData = await extractUketsukeData(conversationText, fileTexts)
    console.log('抽出データ:', JSON.stringify(extractedData, null, 2))

    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

    // TODO: Firebase設定後に短縮URLに切り替え
    // const docId = await saveUketsukeData(extractedData, {
    //   threadTs: threadTs,
    //   channelId: channelId,
    // })
    // const shortUrl = `${appUrl}/uketsuke/${docId}`

    // 現在は従来のURL方式（データをURLパラメータに埋め込み）
    // Slack通知用のチャンネル・スレッド情報もURLに含める
    const dataParam = encodeURIComponent(JSON.stringify(extractedData))
    const slackInfo = encodeURIComponent(
      JSON.stringify({ channelId, threadTs })
    )

    await say({
      thread_ts: threadTs,
      text: `受付表を作成しました!\n\n確認・編集はこちら:\n${appUrl}?data=${dataParam}&slack=${slackInfo}`,
    })
  } catch (error) {
    console.error('エラー:', error)
  }
})

// アプリの起動
async function start() {
  const port = process.env.PORT || 3000
  await app.start(port)
  console.log(`⚡️ Slack Bot is running on port ${port}`)

  // 確認通知用の簡易HTTPサーバー
  const { createServer } = await import('http')
  const apiPort = 3001
  const server = createServer(async (req, res) => {
    // CORSヘッダー
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    if (req.method === 'POST' && req.url === '/api/confirm') {
      let body = ''
      req.on('data', (chunk) => (body += chunk))
      req.on('end', async () => {
        try {
          const { channelId, threadTs } = JSON.parse(body)
          await sendConfirmNotification(channelId, threadTs)
          res.writeHead(200, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: true }))
        } catch (error) {
          console.error('API エラー:', error)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ success: false, error: 'Failed to send notification' }))
        }
      })
    } else {
      res.writeHead(404)
      res.end()
    }
  })

  server.listen(apiPort, () => {
    console.log(`📡 確認通知API: http://localhost:${apiPort}/api/confirm`)
  })
}

start()
