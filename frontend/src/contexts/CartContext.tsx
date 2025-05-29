import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { Product } from '@/api/types/product'
import type { Cart } from '@/lib/cart'
import {
  addToCart as addToCartUtil,
  canAddToCart,
  clearCart as clearCartUtil,
  getCartFromStorage,
  getRemainingStock,
  removeFromCart as removeFromCartUtil,
  saveCartToStorage,
  updateCartItemQuantity as updateCartItemQuantityUtil,
} from '@/lib/cart'

type CartContextType = {
  cart: Cart
  addToCart: (
    product: Product,
    selectedSize?: string,
    onError?: (message: string) => void,
  ) => boolean
  removeFromCart: (productId: string, selectedSize: string) => void
  updateQuantity: (
    productId: string,
    selectedSize: string,
    quantity: number,
    onError?: (message: string) => void,
  ) => boolean
  clearCart: () => void
  canAddToCart: (product: Product, selectedSize: string) => boolean
  getRemainingStock: (product: Product, selectedSize: string) => number
  isLoading: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

type CartProviderProps = {
  children: ReactNode
}

export function CartProvider({ children }: CartProviderProps) {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0, itemCount: 0 })
  const [isLoading, setIsLoading] = useState(true)

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = getCartFromStorage()
    setCart(storedCart)
    setIsLoading(false)
  }, [])

  // Listen for storage changes (when cart is cleared externally)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'shoshop-cart' && e.newValue === null) {
        // Cart was cleared externally (e.g., on logout)
        setCart({ items: [], total: 0, itemCount: 0 })
      }
    }

    // Listen for custom cart clear event (for same-tab clearing)
    const handleCartClear = () => {
      setCart({ items: [], total: 0, itemCount: 0 })
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('cart-clear', handleCartClear)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('cart-clear', handleCartClear)
    }
  }, [])

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    if (!isLoading) {
      saveCartToStorage(cart)
    }
  }, [cart, isLoading])

  const addToCart = (
    product: Product,
    selectedSize: string = 'M',
    onError?: (message: string) => void,
  ): boolean => {
    const result = addToCartUtil(cart, product, selectedSize)

    if (result.success) {
      setCart(result.cart)
      return true
    } else {
      if (onError && result.message) {
        onError(result.message)
      }
      return false
    }
  }

  const removeFromCart = (productId: string, selectedSize: string) => {
    setCart((currentCart) =>
      removeFromCartUtil(currentCart, productId, selectedSize),
    )
  }

  const updateQuantity = (
    productId: string,
    selectedSize: string,
    quantity: number,
    onError?: (message: string) => void,
  ): boolean => {
    const result = updateCartItemQuantityUtil(
      cart,
      productId,
      selectedSize,
      quantity,
    )

    if (result.success) {
      setCart(result.cart)
      return true
    } else {
      if (onError && result.message) {
        onError(result.message)
      }
      return false
    }
  }

  const clearCart = () => {
    setCart(clearCartUtil())
  }

  const checkCanAddToCart = (
    product: Product,
    selectedSize: string,
  ): boolean => {
    return canAddToCart(cart, product, selectedSize)
  }

  const getRemaining = (product: Product, selectedSize: string): number => {
    return getRemainingStock(cart, product, selectedSize)
  }

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    canAddToCart: checkCanAddToCart,
    getRemainingStock: getRemaining,
    isLoading,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
