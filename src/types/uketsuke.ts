// 受付表のデータ型定義

export interface UketsukeData {
  // タイトル
  formTitle: string // 受付表タイトル（例: "レーダー探査受付表"）

  // 基本情報
  jisshiDate: string // 実施日
  uketsukeSha: string // 受付者
  uketsukeDate: string // 受付日

  // 顧客情報
  kaishaAddress: string // 会社住所
  kaishaName: string // 会社名
  tantouSha: string // 担当者名
  keitai: string // 携帯番号

  // 現場情報
  genbaName: string // 現場名
  kenName: string // 件名
  genbaAddress: string // 現場住所
  renrakusakiTel: string // 連絡先電話番号

  // 作業内容（特記事項テキスト行）
  sagyoNaiyo: SagyoNaiyo[]

  // 撮影情報
  satsueiMaisuBasho: string // 撮影枚数・箇所

  // 段取り
  machiawaseJikanBasho: string // 待合時間・場所
  genbaJimushoAri: boolean // 現場事務所の有無
  genbaJimushoBasho?: string // 現場事務所の場所

  // MEMO
  memo: string
}

export interface SagyoNaiyo {
  tokkiJiko: string // 特記事項（テキスト行）
}

// Slackメッセージ
export interface SlackMessage {
  user: string
  text: string
  timestamp: string
}

// AI抽出リクエスト
export interface ExtractRequest {
  messages: SlackMessage[]
}

// AI抽出レスポンス
export interface ExtractResponse {
  success: boolean
  data?: Partial<UketsukeData>
  confidence?: number
  missingFields?: string[]
  error?: string
}
