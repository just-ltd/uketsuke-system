import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { UketsukeForm } from '../components/UketsukeForm'
import { getUketsukeById, updateUketsuke } from '../services/uketsuke-service'
import type { UketsukeData } from '../types/uketsuke'

export function UketsukePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [initialData, setInitialData] = useState<Partial<UketsukeData> | null>(
    null
  )
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadData() {
      if (!id) {
        setError('IDが指定されていません')
        setLoading(false)
        return
      }

      try {
        const data = await getUketsukeById(id)
        if (data) {
          setInitialData(data)
        } else {
          setError('データが見つかりません')
        }
      } catch (err) {
        console.error('データ取得エラー:', err)
        setError('データの取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [id])

  const handleSave = async (data: UketsukeData) => {
    if (!id) return

    try {
      await updateUketsuke(id, data)
      alert('保存しました')
    } catch (err) {
      console.error('保存エラー:', err)
      alert('保存に失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">!</div>
          <p className="text-gray-800 text-lg mb-2">{error}</p>
          <p className="text-gray-500 text-sm mb-4">ID: {id}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            トップに戻る
          </button>
        </div>
      </div>
    )
  }

  if (!initialData) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="no-print max-w-4xl mx-auto mb-4 px-4">
        <h1 className="text-2xl font-bold text-gray-800">受付表システム</h1>
        <p className="text-gray-600 text-sm mt-1">
          受付表を確認・編集できます
        </p>
        <p className="text-gray-400 text-xs mt-1">ID: {id}</p>
      </div>
      <UketsukeForm initialData={initialData} onSave={handleSave} />
    </div>
  )
}
