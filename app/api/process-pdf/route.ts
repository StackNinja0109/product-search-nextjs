import { GoogleGenerativeAI } from '@google/generative-ai'
import { type NextRequest, NextResponse } from 'next/server'
import { PDFDocument } from 'pdf-lib'
import { env } from '@/lib/config'

async function splitPdfToPages(pdfBuffer: ArrayBuffer): Promise<Uint8Array[]> {
  const pdfDoc = await PDFDocument.load(pdfBuffer)
  const numberOfPages = pdfDoc.getPageCount()

  const pages: Uint8Array[] = []

  for (let i = 0; i < numberOfPages; i++) {
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [i])
    newPdf.addPage(copiedPage)
    const pdfBytes = await newPdf.save()
    pages.push(pdfBytes)
  }

  return pages
}

async function processPage(
  pageData: Uint8Array,
  formats: string[],
  model: any                // eslint-disable-line @typescript-eslint/no-explicit-any
): Promise<any[]> {         // eslint-disable-line @typescript-eslint/no-explicit-any
  const base64Data = Buffer.from(pageData).toString('base64')

  const prompt = `
    あなたはPDFから表データを抽出するAIアシスタントです。
    
    以下の規則に従ってデータを抽出し、JSON配列形式で返してください：

    1. 表または罫線で区切られた部分のみを解析対象とします
    2. 各項目は1行として扱います
    3. 数量について：
       - 単位（台、枚など）は除去し、数値のみを抽出
       - 数量は正確性が最重要
    4. 複数品番の処理：
       - 同一項目に複数品番がある場合、番号を付けて別行に分割
       - 例：1①, 1②, 1③として出力
    5. 同等品の処理：
       - "同等"という文字がある場合、同等品フラグを立てる
    6. 型番の処理：
       - 英数字の組み合わせのみを抽出
       - 日本語部分は品名に含める
       - 同等品情報は除去
    7. 原本情報：
       - 元の型番情報をそのまま保持する列を追加

    抽出する項目：
    ${formats.map((format: string) => `- ${format}`).join('\n  ')}

    出力形式：
    [
      {
        ${formats
          .map((format: string) => `"${format}": "値"`)
          .join(',\n      ')}
      }
    ]
  `

  try {
    const result = await (model as { 
      generateContent: (args: [string, { inlineData: { data: string, mimeType: string } }]) => 
      Promise<{ response: { text: () => string } }> }).generateContent([
        prompt,
        { inlineData: { data: base64Data, mimeType: 'application/pdf' } },
    ])

    const response = result.response
    let text = response.text()

    if (typeof text !== 'string') {
      text = JSON.stringify(text)
    }

    // Parse the JSON response with multiple fallback methods
    let parsedData = null

    // Method 1: Try direct JSON parse after cleaning
    try {
      const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim()
      parsedData = JSON.parse(cleanedText) as Record<string, string>[]
    } catch (error) {
      // Method 2: Try to extract JSON from the text
      try {
        const jsonStartIndex = text.indexOf('[')
        const jsonEndIndex = text.lastIndexOf(']') + 1
        if (jsonStartIndex !== -1 && jsonEndIndex !== -1) {
          const jsonText = text.substring(jsonStartIndex, jsonEndIndex)
          parsedData = JSON.parse(jsonText) as Record<string, string>[]
        }
      } catch (error) {
        console.log('Method 2 failed: ', error)
      }
    }

    if (!parsedData) {
      return []
    }

    const dataArray = Array.isArray(parsedData) ? parsedData : [parsedData]

    // Validate and format each object
    const validatedData = dataArray.map((item) => {
      const validItem: Record<string, string> = {}
      formats.forEach((format) => {
        validItem[format] = item[format] || ''
      })
      return validItem
    })

    return validatedData
  } catch (error) {
    console.error('Error in processPage:', error)
    console.error(
      'Error details:',
      error instanceof Error ? error.message : 'Unknown error'
    )
    return []
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File
    const formatsString = formData.get('formats')

    if (!formatsString) {
      return NextResponse.json(
        { error: 'Formats parameter is required' },
        { status: 400 }
      )
    }

    const formats: string[] = JSON.parse(formatsString as string) as string[]

    const pdfBuffer = await pdfFile.arrayBuffer()
    const pdfPages = await splitPdfToPages(pdfBuffer)

    const genAI = new GoogleGenerativeAI(
      env.GEMINI_API_KEY || ''
    )
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-thinking-exp-01-21',
    })

    const allResults: Record<string, string>[] = []

    for (const pageData of pdfPages) {
      const pageResults = await processPage(pageData, formats, model) as Record<string, string>[]
      if (pageResults && pageResults.length > 1) {
        allResults.push(...pageResults)
      }
    }

    if (allResults.length === 0) {
      return NextResponse.json(
        { error: 'No data could be extracted from the PDF' },
        { status: 400 }
      )
    }

    return NextResponse.json(allResults)
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to process PDF',
      },
      { status: 500 }
    )
  }
}
