import { initializeApp, cert, getApps } from 'firebase-admin/app'
import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import type { UketsukeData } from '../src/types/uketsuke'
import 'dotenv/config'

// Firebase Admin の初期化（重複初期化を防ぐ）
if (getApps().length === 0) {
  // サービスアカウントファイルのパスまたは環境変数から認証情報を取得
  const serviceAccountPath = process.env.GOOGLE_APPLICATION_CREDENTIALS

  if (serviceAccountPath) {
    // サービスアカウントファイルを使用
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const serviceAccount = require(serviceAccountPath)
    initializeApp({
      credential: cert(serviceAccount),
    })
  } else {
    // 環境変数から直接認証情報を取得（Vercel等のデプロイ環境用）
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')

    if (projectId && clientEmail && privateKey) {
      initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })
    } else {
      throw new Error(
        'Firebase Admin の認証情報が設定されていません。GOOGLE_APPLICATION_CREDENTIALS または FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY を設定してください。'
      )
    }
  }
}

const db = getFirestore()

// Firestore に保存するドキュメントの型
interface UketsukeDocument {
  data: Partial<UketsukeData>
  createdAt: Timestamp
  slackThreadTs?: string
  slackChannelId?: string
}

interface SaveOptions {
  threadTs?: string
  channelId?: string
}

/**
 * 受付表データを Firestore に保存し、ドキュメントIDを返す
 */
export async function saveUketsukeData(
  data: Partial<UketsukeData>,
  options: SaveOptions = {}
): Promise<string> {
  const docData: UketsukeDocument = {
    data,
    createdAt: Timestamp.now(),
    ...(options.threadTs && { slackThreadTs: options.threadTs }),
    ...(options.channelId && { slackChannelId: options.channelId }),
  }

  const docRef = await db.collection('uketsuke').add(docData)
  console.log('Firestore に保存しました。ID:', docRef.id)

  return docRef.id
}

/**
 * IDで受付表データを取得
 */
export async function getUketsukeData(
  id: string
): Promise<Partial<UketsukeData> | null> {
  const doc = await db.collection('uketsuke').doc(id).get()

  if (!doc.exists) {
    return null
  }

  const docData = doc.data() as UketsukeDocument
  return docData.data
}

/**
 * 受付表データを更新
 */
export async function updateUketsukeData(
  id: string,
  data: Partial<UketsukeData>
): Promise<void> {
  await db.collection('uketsuke').doc(id).update({
    data,
    updatedAt: Timestamp.now(),
  })
  console.log('Firestore を更新しました。ID:', id)
}
