import { App, LogLevel } from '@slack/bolt'
import 'dotenv/config'
import { extractUketsukeData } from './claude-extractor'
import { saveUketsukeData } from './firebase-admin'

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

    // メッセージを整形
    const conversationText = await Promise.all(
      messages.map(async (msg) => {
        // ユーザー情報を取得
        let userName = 'Unknown'
        if (msg.user) {
          try {
            const userInfo = await client.users.info({ user: msg.user })
            userName =
              userInfo.user?.real_name || userInfo.user?.name || 'Unknown'
          } catch {
            userName = msg.user
          }
        }
        return {
          user: userName,
          text: msg.text || '',
          timestamp: msg.ts || '',
        }
      })
    )

    // Claude APIで情報を抽出
    await say({
      thread_ts: threadTs,
      text: `受付表を作成中... (${messages.length}件のメッセージを解析)`,
    })

    const extractedData = await extractUketsukeData(conversationText)
    console.log('抽出データ:', JSON.stringify(extractedData, null, 2))

    // Firestore に保存し、ドキュメントIDを取得
    const docId = await saveUketsukeData(extractedData, {
      threadTs: threadTs,
      channelId: channelId,
    })

    // 短縮URLを生成
    const appUrl = process.env.VITE_APP_URL || 'http://localhost:5173'

    await say({
      thread_ts: threadTs,
      text: `受付表を作成しました!\n\n確認・編集はこちら:\n${appUrl}/uketsuke/${docId}`,
    })
  } catch (error) {
    console.error('エラー:', error)
    // エラー時は従来の長いURLでフォールバック（データ保存が失敗した場合）
    // この部分は必要に応じて削除可能
  }
})

// アプリの起動
async function start() {
  const port = process.env.PORT || 3000
  await app.start(port)
  console.log(`⚡️ Slack Bot is running on port ${port}`)
}

start()
