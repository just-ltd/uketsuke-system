import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { UketsukeData } from '../types/uketsuke'

// Firestore に保存するドキュメントの型
interface UketsukeDocument {
  data: Partial<UketsukeData>
  createdAt: Timestamp
  updatedAt?: Timestamp
  slackThreadTs?: string
  slackChannelId?: string
}

/**
 * IDで受付表データを取得
 */
export async function getUketsukeById(
  id: string
): Promise<Partial<UketsukeData> | null> {
  try {
    const docRef = doc(db, 'uketsuke', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      console.log('ドキュメントが見つかりません:', id)
      return null
    }

    const docData = docSnap.data() as UketsukeDocument
    return docData.data
  } catch (error) {
    console.error('データ取得エラー:', error)
    throw error
  }
}

/**
 * 受付表データを保存（クライアント側から新規作成する場合）
 */
export async function saveUketsuke(
  data: Partial<UketsukeData>
): Promise<string> {
  try {
    // ランダムなIDを生成
    const id = generateId()
    const docRef = doc(db, 'uketsuke', id)

    const docData: UketsukeDocument = {
      data,
      createdAt: Timestamp.now(),
    }

    await setDoc(docRef, docData)
    console.log('Firestore に保存しました。ID:', id)

    return id
  } catch (error) {
    console.error('データ保存エラー:', error)
    throw error
  }
}

/**
 * 受付表データを更新
 */
export async function updateUketsuke(
  id: string,
  data: Partial<UketsukeData>
): Promise<void> {
  try {
    const docRef = doc(db, 'uketsuke', id)

    await updateDoc(docRef, {
      data,
      updatedAt: Timestamp.now(),
    })
    console.log('Firestore を更新しました。ID:', id)
  } catch (error) {
    console.error('データ更新エラー:', error)
    throw error
  }
}

/**
 * ランダムなIDを生成（12文字の英数字）
 */
function generateId(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
