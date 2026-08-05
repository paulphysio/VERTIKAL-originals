'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useCartStore } from '@/lib/store/cart'
import { useWishlistStore } from '@/lib/store/wishlist'
import { ShoppingCart, Heart, Check } from 'lucide-react'

interface ProductImage {
  id: string
  url: string
  alt?: string
  is_primary?: boolean
}

interface ProductVariant {
  id: string
  size: string
  color: string
  price?: number
  stock: number
  image_url?: string
}

interface Product {
  id: string
  name: string
  slug: string
  description?: string
  base_price: number
  product_variants?: ProductVariant[]
  product_images?: ProductImage[]
}

export default function ProductDetailPage() {
  const params = useParams()
  const supabase = createClient()
  const addItem = useCartStore((state) => state.addItem)
  const addToWishlist = useWishlistStore((state) => state.addItem)
  const removeFromWishlist = useWishlistStore((state) => state.removeItem)
  const wishlistItems = useWishlistStore((state) => state.items)
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist)
  const fetchCart = useCartStore((state) => state.fetchCart)

  const [product, setProduct] = useState<Product | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [selectedSize, setSelectedSize] = useState<string>('')
  const [selectedColor, setSelectedColor] = useState<string>('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)

  const isInWishlist = product ? wishlistItems.some((item) => item.productId === product.id) : false

  useEffect(() => {
    fetchWishlist()
    fetchCart()
  }, [fetchWishlist, fetchCart])

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true)
      setNotFound(false)

      const { data, error } = await supabase
        .from('products')
        .select(`*, product_variants(*), product_images(*)`)
        .eq('slug', params.slug)
        .single()

      if (error || !data) {
        console.error('Error fetching product:', error)
        setNotFound(true)
        setLoading(false)
        return
      }

      setProduct(data)
      setSelectedImageIndex(0)

      if (data.product_variants?.[0]) {
        setSelectedVariant(data.product_variants[0])
        setSelectedSize(data.product_variants[0].size)
        setSelectedColor(data.product_variants[0].color)
      }
      setQuantity(1)
      setLoading(false)
    }

    if (params.slug) fetchProduct()
  }, [params.slug, supabase])

  useEffect(() => {
    if (product && selectedSize && selectedColor) {
      const variant = product.product_variants?.find(
        (v) => v.size === selectedSize && v.color === selectedColor
      )
      setSelectedVariant(variant || null)
      // Clamp quantity to new variant's stock, and reset to 1 if switching to a variant with no stock relation
      setQuantity((q) => Math.max(1, Math.min(q, variant?.stock || 1)))
    }
  }, [selectedSize, selectedColor, product])

  if (loading) {
    return (
      <div className="px-4 py-16 sm:px-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 animate-pulse">
          <div className="aspect-square bg-concrete/20 border-2 border-ink" />
          <div className="space-y-4">
            <div className="h-4 w-24 bg-concrete/30" />
            <div className="h-10 w-3/4 bg-concrete/30" />
            <div className="h-6 w-32 bg-concrete/30" />
            <div className="h-24 w-full bg-concrete/20" />
          </div>
        </div>
      </div>
    )
  }

  if (notFound || !product) {
    return (
      <div className="px-4 py-24 text-center">
        <p className="font-mono text-sm text-ink/50 mb-2">404</p>
        <h1 className="font-display text-3xl uppercase mb-2">Product not found</h1>
        <p className="text-ink/60 text-sm">
          This item may have been removed or the link is incorrect.
        </p>
      </div>
    )
  }

  const images = product.product_images || []
  const primaryIndex = images.findIndex((img) => img.is_primary)
  const fallbackIndex = primaryIndex >= 0 ? primaryIndex : 0
  const activeImage = images[selectedImageIndex] || images[fallbackIndex] || null
  const displayImageUrl = activeImage?.url || selectedVariant?.image_url || ''

  const sizes = [...new Set(product.product_variants?.map((v) => v.size) || [])]
  const colors = [...new Set(product.product_variants?.map((v) => v.color) || [])]

  const unitPrice = selectedVariant?.price ?? product.base_price
  const maxStock = selectedVariant?.stock ?? 0
  const outOfStock = !selectedVariant || maxStock === 0

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return

    addItem({
      variantId: selectedVariant.id,
      productId: product.id,
      name: product.name,
      size: selectedVariant.size,
      color: selectedVariant.color,
      price: unitPrice,
      image: displayImageUrl,
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
        price: unitPrice,
        image: displayImageUrl,
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
            {displayImageUrl ? (
              <img
                src={displayImageUrl}
                alt={activeImage?.alt || product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-mono text-sm text-ink/50">
                NO IMAGE
              </div>
            )}
            {outOfStock && (
              <img
                src="/sold-out.png"
                alt="Out of Stock"
                className="absolute inset-0 w-[30%] h-[30%] object-contain z-10 m-auto"
              />
            )}
          </div>

          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((img, index) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setSelectedImageIndex(index)}
                  aria-label={`View image ${index + 1}`}
                  aria-current={index === selectedImageIndex}
                  className={`aspect-square bg-concrete/20 overflow-hidden transition ${
                    index === selectedImageIndex
                      ? 'border-2 border-coral'
                      : 'border border-ink hover:border-coral'
                  }`}
                >
                  <img
                    src={img.url}
                    alt={img.alt || `${product.name} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <p className="font-mono text-[11px] text-ink/50 mb-2">SHOP</p>
          <h1 className="font-display text-4xl uppercase leading-none mb-4 sm:text-5xl">
            {product.name}
          </h1>

          <p className="font-mono text-2xl font-bold mb-6">
            ₦{Math.round(unitPrice).toLocaleString()}
          </p>

          {product.description && (
            <p className="text-ink/70 mb-8 text-sm">{product.description}</p>
          )}

          {/* Size Selection */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Size</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
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
          )}

          {/* Color Selection */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Color</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
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
          )}

          {/* Quantity */}
          <div className="mb-6">
            <h3 className="font-mono text-[11px] font-bold mb-3 uppercase">Quantity</h3>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                disabled={outOfStock}
                className="w-10 h-10 border-2 border-ink font-mono text-lg hover:bg-ink hover:text-paper transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                −
              </button>
              <span className="w-12 text-center font-mono">{quantity}</span>
              <button
                onClick={() => setQuantity((q) => Math.min(maxStock || 1, q + 1))}
                disabled={outOfStock}
                className="w-10 h-10 border-2 border-ink font-mono text-lg hover:bg-ink hover:text-paper transition disabled:opacity-30 disabled:cursor-not-allowed"
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
              disabled={outOfStock}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 border-2 border-ink font-mono text-sm font-bold uppercase tracking-wide transition ${
                addedToCart
                  ? 'bg-acid border-acid text-ink'
                  : 'bg-ink text-paper hover:bg-coral hover:border-coral'
              } disabled:bg-concrete disabled:border-concrete disabled:cursor-not-allowed`}
            >
              {addedToCart ? <Check className="h-5 w-5" /> : <ShoppingCart className="h-5 w-5" />}
              {addedToCart ? 'ADDED!' : outOfStock ? 'OUT OF STOCK' : 'ADD TO CART'}
            </button>
            <button
              onClick={handleWishlistToggle}
              aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
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