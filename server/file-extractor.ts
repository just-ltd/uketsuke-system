import { createRequire } from 'module'
import * as XLSX from 'xlsx'

const require = createRequire(import.meta.url)
const pdfParse = require('pdf-parse')

/**
 * Slackからファイルをダウンロードする
 */
export async function downloadSlackFile(
  url: string,
  token: string
): Promise<Buffer> {
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!response.ok) {
    throw new Error(`ファイルダウンロード失敗: ${response.status}`)
  }
  const arrayBuffer = await response.arrayBuffer()
  return Buffer.from(arrayBuffer)
}

/**
 * PDFからテキストを抽出する
 */
async function extractFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdfParse(buffer)
  return data.text
}

/**
 * Excelからテキストを抽出する
 */
function extractFromExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: 'buffer' })
  const texts: string[] = []

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName]
    // シート名を含める
    texts.push(`【シート: ${sheetName}】`)
    // CSVライクなテキストに変換
    const csv = XLSX.utils.sheet_to_csv(sheet, { blankrows: false })
    texts.push(csv)
  }

  return texts.join('\n')
}

/**
 * ファイルの種類に応じてテキストを抽出する
 */
export async function extractTextFromFile(
  buffer: Buffer,
  filename: string,
  mimetype: string
): Promise<string | null> {
  try {
    // PDF
    if (mimetype === 'application/pdf' || filename.endsWith('.pdf')) {
      const text = await extractFromPdf(buffer)
      console.log(`PDF「${filename}」からテキスト抽出: ${text.length}文字`)
      return text
    }

    // Excel (.xlsx, .xls)
    if (
      mimetype ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimetype === 'application/vnd.ms-excel' ||
      filename.endsWith('.xlsx') ||
      filename.endsWith('.xls')
    ) {
      const text = extractFromExcel(buffer)
      console.log(`Excel「${filename}」からテキスト抽出: ${text.length}文字`)
      return text
    }

    console.log(`未対応ファイル形式: ${filename} (${mimetype})`)
    return null
  } catch (error) {
    console.error(`ファイル「${filename}」の読み取りに失敗:`, error)
    return null
  }
}
