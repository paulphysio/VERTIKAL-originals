'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { formatPrice } from '@/lib/utils'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { ShoppingCart, Heart, Star, Minus, Plus, Check } from 'lucide-react'

export default function ProductDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const wishlistItems = useWishlistStore((state) => state.items)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const fetchCart = useCartStore((state) => state.fetchCart)
  
  const [product, setProduct] = useState<any>(null)
  const [selectedVariant, setSelectedVariant] = useState<any>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [addedToCart, setAddedToCart] = useState(false)

  const isInWishlist = product ? wishlistItems.some((item) => item.productId === product.id) : false

  useEffect(() => {
    fetchWishlist()
    fetchCart()
  }, [fetchWishlist, fetchCart])

  useEffect(() => {
    const fetchProduct = async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_variants(*),
          product_images(*)
        `)
        .eq('slug', params.slug)
        .single()

      if (error) {
        console.error('Error fetching product:', error)
        setLoading(false)
      } else {
        setProduct(data)
        // Select first variant by default
        if (data.product_variants?.[0]) {
          setSelectedVariant(data.product_variants[0])
          setSelectedSize(data.product_variants[0].size)
          setSelectedColor(data.product_variants[0].color)
        }
        setLoading(false)
      }
    }
    fetchProduct()
  }, [params.slug, supabase])

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.product_variants?.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      )
      setSelectedVariant(variant || null)
    }
  }, [selectedSize, selectedColor, product])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Loading product...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">Product not found</div>
      </div>
    )
  }

  const primaryImage = product.product_images?.find((img: any) => img.is_primary)
  const image = primaryImage || product.product_images?.[0] || selectedVariant?.image_url
  
  const sizes = [...new Set(product.product_variants?.map((v: any) => v.size) || [])] as string[]
  const colors = [...new Set(product.product_variants?.map((v: any) => v.color) || [])] as string[]

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: selectedVariant.price || product.base_price,
      image: image?.url || '',
      quantity,
    })
    
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleWishlistToggle = async () => {
    if (!product) return
    
    if (isInWishlist) {
      await removeFromWishlist(product.id)
    } else {
      await addToWishlist({
        productId: product.id,
        name: product.name,
        price: selectedVariant?.price || product.base_price,
        image: image?.url || '',
        addedAt: new Date().toISOString(),
      })
    }
  }

  return (
    <div className="px-4 py-16 sm:px-10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        {/* Images */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-concrete/20 border-2 border-ink overflow-hidden">
            {image ? (
              <img
                src={image.url}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-sm text-ink/50">
                NO IMAGE
              </div>
            )}
            {selectedVariant?.stock === 0 && (
              <img
                src="/sold-out.png"
                alt="Out of Stock"
                className="absolute inset-0 w-[30%] h-[30%] object-contain z-10 m-auto"
              />
            )}
          </div>
          {product.product_images?.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {product.product_images.map((img: any) => (
                <div
                  key={img.id}
                  className="aspect-square bg-concrete/20 border border-ink overflow-hidden cursor-pointer hover:border-coral transition"
                >
                  <img src={img.url} alt={img.alt} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="font-mono text-[11px] text-ink/50 mb-2">
            SHOP
          </p>
          <h1 className="font-display text-4xl uppercase leading-none mb-4 sm:text-5xl">
            {product.name}
          </h1>

          <p className="font-mono text-2xl font-bold mb-6">
            ₦{Math.round(selectedVariant?.price || product.base_price).toLocaleString()}
          </p>

          <p className="text-ink/70 mb-8 text-sm">{product.description}</p>

          {/* Size Selection */}
          <div className="mb-6">
            <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Size</h3>
            <div className="flex flex-wrap gap-2">
              {sizes.map((size: string) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-4 py-2 border-2 font-mono text-sm transition ${
                    selectedSize === size
                      ? 'border-ink bg-ink text-paper'
                      : 'border-ink hover:border-coral'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="mb-6">
            <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Color</h3>
            <div className="flex flex-wrap gap-2">
              {colors.map((color: string) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-4 py-2 border-2 font-mono text-sm transition ${
                    selectedColor === color
                      ? 'border-ink bg-ink text-paper'
                      : 'border-ink hover:border-coral'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-ink font-mono text-lg hover:bg-ink hover:text-paper transition"
              >
                −
              </button>
              <span className="w-12 text-center font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity(Math.min(selectedVariant?.stock || 10, quantity + 1))}
                className="w-10 h-10 border-2 border-ink font-mono text-lg hover:bg-ink hover:text-paper transition"
              >
                +
              </button>
              {selectedVariant && (
                <span className="font-mono text-[11px] text-ink/50">
                  {selectedVariant.stock > 0
                    ? `${selectedVariant.stock} IN STOCK`
                    : 'OUT OF STOCK'}
                </span>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={!selectedVariant || selectedVariant.stock === 0}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide transition ${
                addedToCart
                  ? 'bg-acid border-acid text-ink'
                  : 'bg-ink text-paper hover:bg-coral hover:border-coral'
              } disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed`}
            >
              {addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {addedToCart ? 'ADDED!' : 'ADD TO CART'}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`px-4 py-4 border-2 transition ${
                isInWishlist
                  ? 'border-coral bg-coral text-paper'
                  : 'border-ink hover:border-coral'
              }`}
            >
              <Heart className={`h-5 w-5 ${isInWishlist ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Features */}
          <div className="border-t-2 border-ink pt-6 space-y-3">
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-coral">✓</span>
              <span>Premium quality materials</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-coral">✓</span>
              <span>Secure checkout</span>
            </div>
            <div className="flex items-center gap-2 text-sm font-mono">
              <span className="text-coral">✓</span>
              <span>Order tracking available</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
