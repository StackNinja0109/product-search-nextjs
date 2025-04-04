import Image from 'next/image'
import Link from 'next/link'

interface ProductCardProps {
  product: {
    name: string;
    price: number;
    image: string;
    url: string;
  };
  platform: string;
}

const ProductCard = ({ product, platform }: ProductCardProps) => {
  return (
    <div className="flex flex-col border rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow w-full max-w-[300px]">
      <div className="relative aspect-video h-40 w-full mb-4">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="absolute object-contain w-full h-full"
        />
      </div>
      <div className="flex-1 flex flex-col">
        <span className="text-sm font-semibold text-gray-500 mb-2">{platform}</span>
        <h3 className="text-sm font-medium line-clamp-2 mb-2">{product.name}</h3>
        <div className="mt-auto">
          <p className="text-lg font-bold text-red-600">¥{product.price.toLocaleString()}</p>
          <Link
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block w-full bg-blue-600 text-white text-center py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  )
}

export default ProductCard 