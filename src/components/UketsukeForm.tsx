import { useState } from 'react'
import type { UketsukeData } from '../types/uketsuke'

interface Props {
  initialData: Partial<UketsukeData>
  onSave: (data: UketsukeData) => void
  onConfirm?: (data: UketsukeData) => void
}

const defaultData: UketsukeData = {
  formTitle: 'レーダー探査受付表',
  jisshiDate: '',
  uketsukeSha: '',
  uketsukeDate: '',
  kaishaAddress: '',
  kaishaName: '',
  tantouSha: '',
  keitai: '',
  genbaName: '',
  kenName: '',
  genbaAddress: '',
  renrakusakiTel: '',
  sagyoNaiyo: [{ tokkiJiko: '' }],
  satsueiMaisuBasho: '',
  machiawaseJikanBasho: '',
  genbaJimushoAri: false,
  genbaJimushoBasho: '',
  memo: '',
}

export function UketsukeForm({ initialData, onSave, onConfirm }: Props) {
  const [data, setData] = useState<UketsukeData>({
    ...defaultData,
    ...initialData,
  })

  const handleChange = (field: keyof UketsukeData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 印刷・保存・確認ボタン */}
      <div className="no-print mb-4 flex gap-2">
        <button
          onClick={handlePrint}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          印刷
        </button>
        <button
          onClick={() => onSave(data)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          保存
        </button>
        {onConfirm && (
          <button
            onClick={() => onConfirm(data)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
          >
            確認
          </button>
        )}
      </div>

      {/* 受付表 */}
      <div className="border-2 border-black text-sm print-table">
        {/* ヘッダー */}
        <div className="flex border-b-2 border-black">
          <div className="w-1/4 p-2 font-bold border-r border-black bg-gray-100">
            JUSTの仕事
          </div>
          <div className="flex-1 p-2 text-center font-bold text-lg">
            <textarea
              value={data.formTitle || 'レーダー探査受付表'}
              onChange={(e) => handleChange('formTitle', e.target.value)}
              className="w-full text-center font-bold text-lg border-none outline-none bg-transparent resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 実施日・受付者 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            実施日
          </div>
          <div className="flex-1 p-2 border-r border-black">
            <textarea
              value={data.jisshiDate}
              onChange={(e) => handleChange('jisshiDate', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              placeholder="令和○年○月○日（○）"
              rows={Math.max(1, (data.jisshiDate || '').split('\n').length)}
            />
          </div>
          <div className="w-20 p-2 bg-gray-100 border-r border-black">
            受付者
          </div>
          <div className="w-32 p-2 border-r border-black">
            <textarea
              value={data.uketsukeSha}
              onChange={(e) => handleChange('uketsukeSha', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 受注状況・受付日 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            受注状況
          </div>
          <div className="flex-1 p-2 border-r border-black"></div>
          <div className="w-20 p-2 bg-gray-100 border-r border-black">
            受付日
          </div>
          <div className="w-32 p-2 border-r border-black">
            <textarea
              value={data.uketsukeDate}
              onChange={(e) => handleChange('uketsukeDate', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              placeholder="令和○年○月○日"
              rows={1}
            />
          </div>
        </div>

        {/* 会社住所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            会社住所
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.kaishaAddress}
              onChange={(e) => handleChange('kaishaAddress', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              placeholder="〒"
              rows={1}
            />
          </div>
        </div>

        {/* 会社名 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            会社名
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.kaishaName}
              onChange={(e) => handleChange('kaishaName', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 担当者 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            担当者
          </div>
          <div className="flex-1 p-2 flex items-center gap-2">
            <textarea
              value={data.tantouSha}
              onChange={(e) => handleChange('tantouSha', e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
            <span>様</span>
          </div>
          <div className="w-20 p-2 bg-gray-100 border-r border-black border-l">
            携帯
          </div>
          <div className="w-40 p-2">
            <textarea
              value={data.keitai}
              onChange={(e) => handleChange('keitai', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 現場名 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            現場名
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={`${data.genbaName}${data.kenName ? `　件名: ${data.kenName}` : ''}`}
              onChange={(e) => {
                const val = e.target.value
                const kenIdx = val.indexOf('件名:')
                if (kenIdx >= 0) {
                  handleChange('genbaName', val.substring(0, kenIdx).replace('　', '').trim())
                  handleChange('kenName', val.substring(kenIdx + 3).trim())
                } else {
                  handleChange('genbaName', val)
                }
              }}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 現場住所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            現場住所
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.genbaAddress}
              onChange={(e) => handleChange('genbaAddress', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 連絡先電話番号 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            連絡先電話番号
          </div>
          <div className="flex-1 p-2 flex items-center">
            <span className="mr-2">会社</span>
            <textarea
              value={data.renrakusakiTel}
              onChange={(e) => handleChange('renrakusakiTel', e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 撮影枚数・箇所（特記事項テキスト行） */}
        {data.sagyoNaiyo.map((sagyo, index) => (
          <div key={index} className="flex border-b border-black">
            <div className="w-24 p-2 border-r border-black bg-gray-100 text-xs">
              {index === 0 ? '撮影枚数・箇所' : ''}
            </div>
            <div className="flex-1 p-1">
              <textarea
                value={sagyo.tokkiJiko}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index] = { ...newSagyo[index], tokkiJiko: e.target.value }
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
                rows={1}
              />
            </div>
          </div>
        ))}

        {/* 行追加ボタン */}
        <div className="no-print flex border-b border-black">
          <div className="w-24 p-1 border-r border-black bg-gray-100"></div>
          <div className="flex-1 p-1">
            <button
              onClick={() => {
                const newSagyo = [...data.sagyoNaiyo, { tokkiJiko: '' }]
                handleChange('sagyoNaiyo', newSagyo)
              }}
              className="text-blue-600 text-xs hover:underline"
            >
              + 行を追加
            </button>
          </div>
        </div>

        {/* 待合時間・場所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            待合時間・場所
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.machiawaseJikanBasho}
              onChange={(e) =>
                handleChange('machiawaseJikanBasho', e.target.value)
              }
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
              rows={1}
            />
          </div>
        </div>

        {/* 現場事務所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            現場事務所
          </div>
          <div className="flex-1 p-2 flex items-center gap-4">
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={!data.genbaJimushoAri}
                onChange={() => handleChange('genbaJimushoAri', false)}
              />
              無
            </label>
            <label className="flex items-center gap-1">
              <input
                type="radio"
                checked={data.genbaJimushoAri}
                onChange={() => handleChange('genbaJimushoAri', true)}
              />
              有
            </label>
            {data.genbaJimushoAri && (
              <>
                <span>場所:</span>
                <textarea
                  value={data.genbaJimushoBasho || ''}
                  onChange={(e) =>
                    handleChange('genbaJimushoBasho', e.target.value)
                  }
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none resize-none print-wrap"
                  rows={1}
                />
              </>
            )}
          </div>
        </div>

        {/* MEMO */}
        <div className="flex">
          <div className="w-24 p-2 bg-gray-100 border-r border-black font-bold">
            MEMO
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              className="w-full min-h-24 border border-gray-300 focus:border-blue-500 outline-none resize-none p-1 print-wrap"
              rows={5}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
