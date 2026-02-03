import { useState } from 'react'
import type { UketsukeData } from '../types/uketsuke'

interface Props {
  initialData: Partial<UketsukeData>
  onSave: (data: UketsukeData) => void
}

const defaultData: UketsukeData = {
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
  sagyoNaiyo: [
    { atsusa: '', coaSize: '', honsu: '', kaikouSunpo: '', tokkiJiko: '' },
  ],
  satsueiMaisuBasho: '',
  machiawaseJikanBasho: '',
  genbaJimushoAri: false,
  genbaJimushoBasho: '',
  coaSakko: {
    jisshiDate: '',
    sagyoKaishi: '',
    dekkiPlate: false,
    dengenShiyo: false,
    hatsuriSagyo: false,
  },
  memo: '',
  genbaHokokuAte: '',
  mitsumoriseikyu: {
    sama: '',
    kaisha: '',
    genba: '',
    address: '',
  },
}

export function UketsukeForm({ initialData, onSave }: Props) {
  const [data, setData] = useState<UketsukeData>({
    ...defaultData,
    ...initialData,
  })

  const handleChange = (field: keyof UketsukeData, value: unknown) => {
    setData((prev) => ({ ...prev, [field]: value }))
  }

  const handleCoaSakkoChange = (
    field: keyof UketsukeData['coaSakko'],
    value: unknown
  ) => {
    setData((prev) => ({
      ...prev,
      coaSakko: { ...prev.coaSakko, [field]: value },
    }))
  }

  const handleMitsumoriChange = (
    field: keyof UketsukeData['mitsumoriseikyu'],
    value: string
  ) => {
    setData((prev) => ({
      ...prev,
      mitsumoriseikyu: { ...prev.mitsumoriseikyu, [field]: value },
    }))
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* 印刷・保存ボタン */}
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
      </div>

      {/* 受付表 */}
      <div className="border-2 border-black text-sm">
        {/* ヘッダー */}
        <div className="flex border-b-2 border-black">
          <div className="w-1/4 p-2 font-bold border-r border-black bg-gray-100">
            JUSTの仕事
          </div>
          <div className="flex-1 p-2 text-center font-bold text-lg">
            コンクリート内X線探査 受付表
          </div>
        </div>

        {/* 実施日・受付者 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            実施日
          </div>
          <div className="flex-1 p-2 border-r border-black">
            <input
              type="text"
              value={data.jisshiDate}
              onChange={(e) => handleChange('jisshiDate', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              placeholder="令和○年○月○日（○）"
            />
          </div>
          <div className="w-20 p-2 bg-gray-100 border-r border-black">
            受付者
          </div>
          <div className="w-32 p-2 border-r border-black">
            <input
              type="text"
              value={data.uketsukeSha}
              onChange={(e) => handleChange('uketsukeSha', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
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
            <input
              type="text"
              value={data.uketsukeDate}
              onChange={(e) => handleChange('uketsukeDate', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              placeholder="令和○年○月○日"
            />
          </div>
        </div>

        {/* 会社住所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            会社住所
          </div>
          <div className="flex-1 p-2">
            <input
              type="text"
              value={data.kaishaAddress}
              onChange={(e) => handleChange('kaishaAddress', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              placeholder="〒"
            />
          </div>
        </div>

        {/* 会社名 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            会社名
          </div>
          <div className="flex-1 p-2">
            <input
              type="text"
              value={data.kaishaName}
              onChange={(e) => handleChange('kaishaName', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* 担当者 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            担当者
          </div>
          <div className="flex-1 p-2 flex items-center gap-2">
            <input
              type="text"
              value={data.tantouSha}
              onChange={(e) => handleChange('tantouSha', e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none"
            />
            <span>様</span>
          </div>
          <div className="w-20 p-2 bg-gray-100 border-r border-black border-l">
            携帯
          </div>
          <div className="w-40 p-2">
            <input
              type="text"
              value={data.keitai}
              onChange={(e) => handleChange('keitai', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* 現場名 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            現場名
          </div>
          <div className="flex-1 p-2 flex">
            <input
              type="text"
              value={data.genbaName}
              onChange={(e) => handleChange('genbaName', e.target.value)}
              className="w-1/3 border-b border-gray-300 focus:border-blue-500 outline-none"
            />
            <span className="mx-2">件名:</span>
            <input
              type="text"
              value={data.kenName}
              onChange={(e) => handleChange('kenName', e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none text-xs"
            />
          </div>
        </div>

        {/* 現場住所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black">
            現場住所
          </div>
          <div className="flex-1 p-2">
            <input
              type="text"
              value={data.genbaAddress}
              onChange={(e) => handleChange('genbaAddress', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
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
            <input
              type="text"
              value={data.renrakusakiTel}
              onChange={(e) => handleChange('renrakusakiTel', e.target.value)}
              className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* 作業内容テーブルヘッダー */}
        <div className="flex border-b border-black bg-gray-100">
          <div className="w-24 p-2 border-r border-black"></div>
          <div className="w-16 p-2 text-center border-r border-black">厚さ</div>
          <div className="w-20 p-2 text-center border-r border-black">
            コアサイズ
          </div>
          <div className="w-16 p-2 text-center border-r border-black">本数</div>
          <div className="w-20 p-2 text-center border-r border-black">
            開口寸法
          </div>
          <div className="flex-1 p-2 text-center">特記事項</div>
        </div>

        {/* 作業内容 */}
        {data.sagyoNaiyo.map((sagyo, index) => (
          <div key={index} className="flex border-b border-black">
            <div className="w-24 p-2 border-r border-black bg-gray-100">
              {index === 0 ? '撮影枚数・箇所' : ''}
            </div>
            <div className="w-16 p-1 border-r border-black">
              <input
                type="text"
                value={sagyo.atsusa}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index].atsusa = e.target.value
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-20 p-1 border-r border-black">
              <input
                type="text"
                value={sagyo.coaSize}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index].coaSize = e.target.value
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-16 p-1 border-r border-black">
              <input
                type="text"
                value={sagyo.honsu}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index].honsu = e.target.value
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="w-20 p-1 border-r border-black">
              <input
                type="text"
                value={sagyo.kaikouSunpo}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index].kaikouSunpo = e.target.value
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full text-center border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex-1 p-1">
              <input
                type="text"
                value={sagyo.tokkiJiko}
                onChange={(e) => {
                  const newSagyo = [...data.sagyoNaiyo]
                  newSagyo[index].tokkiJiko = e.target.value
                  handleChange('sagyoNaiyo', newSagyo)
                }}
                className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        ))}

        {/* 待合時間・場所 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            待合時間・場所
          </div>
          <div className="flex-1 p-2">
            <input
              type="text"
              value={data.machiawaseJikanBasho}
              onChange={(e) =>
                handleChange('machiawaseJikanBasho', e.target.value)
              }
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
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
                <input
                  type="text"
                  value={data.genbaJimushoBasho || ''}
                  onChange={(e) =>
                    handleChange('genbaJimushoBasho', e.target.value)
                  }
                  className="flex-1 border-b border-gray-300 focus:border-blue-500 outline-none"
                />
              </>
            )}
          </div>
        </div>

        {/* コア削孔 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            コア削孔
          </div>
          <div className="flex-1 p-2">
            <div className="flex items-center gap-4 flex-wrap text-xs">
              <label className="flex items-center gap-1">
                デッキプレート
                <input
                  type="checkbox"
                  checked={data.coaSakko.dekkiPlate}
                  onChange={(e) =>
                    handleCoaSakkoChange('dekkiPlate', e.target.checked)
                  }
                />
              </label>
              <label className="flex items-center gap-1">
                電源使用
                <input
                  type="checkbox"
                  checked={data.coaSakko.dengenShiyo}
                  onChange={(e) =>
                    handleCoaSakkoChange('dengenShiyo', e.target.checked)
                  }
                />
              </label>
              <label className="flex items-center gap-1">
                はつり作業
                <input
                  type="checkbox"
                  checked={data.coaSakko.hatsuriSagyo}
                  onChange={(e) =>
                    handleCoaSakkoChange('hatsuriSagyo', e.target.checked)
                  }
                />
              </label>
            </div>
          </div>
        </div>

        {/* MEMO */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black font-bold">
            MEMO
          </div>
          <div className="flex-1 p-2">
            <textarea
              value={data.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              className="w-full h-24 border border-gray-300 focus:border-blue-500 outline-none resize-none p-1"
            />
          </div>
        </div>

        {/* 現場及び日報宛先 */}
        <div className="flex border-b border-black">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            現場及び日報宛先
          </div>
          <div className="flex-1 p-2">
            <input
              type="text"
              value={data.genbaHokokuAte}
              onChange={(e) => handleChange('genbaHokokuAte', e.target.value)}
              className="w-full border-b border-gray-300 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* 見積請求送付先 */}
        <div className="flex">
          <div className="w-24 p-2 bg-gray-100 border-r border-black text-xs">
            見積請求送付先
          </div>
          <div className="flex-1 p-2 flex gap-2">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={data.mitsumoriseikyu.sama}
                onChange={(e) => handleMitsumoriChange('sama', e.target.value)}
                className="w-24 border-b border-gray-300 focus:border-blue-500 outline-none"
              />
              <span>様</span>
            </div>
            <div className="flex items-center gap-1">
              <span>会社:</span>
              <input
                type="text"
                value={data.mitsumoriseikyu.kaisha}
                onChange={(e) =>
                  handleMitsumoriChange('kaisha', e.target.value)
                }
                className="w-32 border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-1">
              <span>現場:</span>
              <input
                type="text"
                value={data.mitsumoriseikyu.genba}
                onChange={(e) => handleMitsumoriChange('genba', e.target.value)}
                className="w-32 border-b border-gray-300 focus:border-blue-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
