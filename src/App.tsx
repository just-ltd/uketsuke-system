import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { UketsukeForm } from './components/UketsukeForm'
import { UketsukePage } from './pages/UketsukePage'
import type { UketsukeData } from './types/uketsuke'

// 空のデータ（URLパラメータがない場合）
const emptyData: Partial<UketsukeData> = {
  jisshiDate: '',
  uketsukeSha: '',
  uketsukeDate: '',
  kaishaName: '',
  tantouSha: '',
  keitai: '',
  genbaName: '',
  kenName: '',
  genbaAddress: '',
  sagyoNaiyo: [
    { atsusa: '', coaSize: '', honsu: '', kaikouSunpo: '', tokkiJiko: '' },
  ],
  machiawaseJikanBasho: '',
  genbaJimushoAri: false,
  memo: '',
}

// 後方互換性のための従来のページ（?data= パラメータ対応）
function LegacyPage() {
  const [initialData, setInitialData] = useState<Partial<UketsukeData>>(emptyData)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // URLパラメータからデータを取得
    const params = new URLSearchParams(window.location.search)
    const dataParam = params.get('data')

    if (dataParam) {
      try {
        const decoded = decodeURIComponent(dataParam)
        const parsed = JSON.parse(decoded)
        console.log('URLから受け取ったデータ:', parsed)
        setInitialData(parsed)
      } catch (error) {
        console.error('データのパースに失敗:', error)
      }
    }
    setLoading(false)
  }, [])

  const handleSave = (data: UketsukeData) => {
    console.log('保存データ:', data)
    // TODO: バックエンドに保存
    alert('保存しました（実際はサーバーに送信します）')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">読み込み中...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="no-print max-w-4xl mx-auto mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">受付表システム</h1>
        <p className="text-gray-600 text-sm mt-1">
          Slack会話から自動生成された受付表を確認・編集できます
        </p>
      </div>
      <UketsukeForm initialData={initialData} onSave={handleSave} />
    </div>
  )
}

// トップページ（パラメータがない場合は空の受付表を表示）
function HomePage() {
  // ?data= パラメータがあれば LegacyPage を表示
  const params = new URLSearchParams(window.location.search)
  if (params.get('data')) {
    return <LegacyPage />
  }

  // パラメータがなければ新規作成ページとして空のフォームを表示
  const handleSave = (data: UketsukeData) => {
    console.log('保存データ:', data)
    alert('保存しました')
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="no-print max-w-4xl mx-auto mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">受付表システム</h1>
        <p className="text-gray-600 text-sm mt-1">
          新しい受付表を作成できます
        </p>
      </div>
      <UketsukeForm initialData={emptyData} onSave={handleSave} />
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 新しいルート: /uketsuke/:id でFirestoreからデータを取得 */}
        <Route path="/uketsuke/:id" element={<UketsukePage />} />

        {/* トップページ: ?data= パラメータがあれば従来の動作、なければ新規作成 */}
        <Route path="/" element={<HomePage />} />

        {/* 不明なルートはトップにリダイレクト */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
