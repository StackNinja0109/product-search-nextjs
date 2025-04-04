import axios from 'axios'
import { NextResponse } from 'next/server'
import { env } from '@/lib/config'

interface SearchRequest {
  keyword: string;
}

export async function POST(request: Request) {
  try {
    const { keyword } = (await request.json()) as SearchRequest

    const response = await axios.post(
      `${env.API_ENDPOINT}/v1/search/product`,
      { keyword },
      {
        headers: {
          Authorization: `Bearer ${env.API_TOKEN}`,
        },
      }
    )

    return NextResponse.json(response.data)
  } catch (error) {
    console.error('Search API error:')
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
