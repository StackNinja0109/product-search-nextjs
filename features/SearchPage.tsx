'use client'

import { useRef, useState } from 'react'
import LoadingIndicator from '@/components/loading-indicator'
import PlatformProducts from '@/components/platform-products'
import TopProducts from '@/components/top-products'
import useProducts from '@/hooks/use-products'
import { type ProductResponse, DEFAULT_PRODUCT_RESPONSE } from '@/types/Product.d'

const SearchPage = () => {
  const [searchKeyword, setSearchKeyword] = useState('')
  const { data, isLoading } = useProducts(searchKeyword, DEFAULT_PRODUCT_RESPONSE)

  const searchInputRef = useRef<HTMLInputElement>(null)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const query = searchInputRef.current?.value.trim()
    if (query) {
      setSearchKeyword(query) // This will trigger a new search through useProducts
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <LoadingIndicator />
      </div>
    )
  }

  const { jan_code, amazon_products, yahoo_products, rakuten_products } = data as ProductResponse
  const allProducts = [
    ...amazon_products,
    ...yahoo_products,
    ...rakuten_products,
  ]

  const cheapestProducts = allProducts
    .sort((a, b) => a.price - b.price)
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-50">
      <main className="container mx-auto px-4 py-12">
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-gray-700 tracking-tight">
            製品比較
          </h1>

          <form onSubmit={handleSearch} className="flex items-center gap-4 w-full">
            <div className="flex-1">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="商品名や型番を入力"
                defaultValue={searchKeyword}
                className="w-full px-4 py-3 rounded-sm border border-gray-200 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         transition-all duration-200 bg-white
                         placeholder:text-gray-400"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 rounded text font-bold tracking-widest
                       bg-gradient-to-r from-blue-500 to-cyan-500
                       text-white transition-all duration-300
                       hover:from-blue-600 hover:to-cyan-600
                       transform hover:scale-x-105
                       focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              検索
            </button>
          </form>

          {jan_code && (
            <>
              <p className="flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white p-4 rounded shadow-sm">
                <span className="font-mono text bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent font-semibold tracking-wide">
                  JAN Code:
                </span>
                <span className="font-mono text bg-gradient-to-r from-gray-700 to-gray-600 bg-clip-text text-transparent font-medium tracking-wider">
                  <span className="font-bold">{jan_code}</span>を使用して検索しました
                </span>
              </p>
              <TopProducts products={cheapestProducts} />
              <PlatformProducts
                amazon_products={amazon_products}
                yahoo_products={yahoo_products}
                rakuten_products={rakuten_products}
              />
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default SearchPage