import type { Product } from '@/api/types/product'

export type CartItem = {
  product: Product
  quantity: number
  selectedSize: string
}

export type Cart = {
  items: Array<CartItem>
  total: number
  itemCount: number
}

const CART_STORAGE_KEY = 'shoshop-cart'

// Get cart from localStorage
export function getCartFromStorage(): Cart {
  try {
    const cartData = localStorage.getItem(CART_STORAGE_KEY)
    if (!cartData) {
      return { items: [], total: 0, itemCount: 0 }
    }

    const cart = JSON.parse(cartData) as Cart
    return cart
  } catch (error) {
    console.error('Error reading cart from localStorage:', error)
    return { items: [], total: 0, itemCount: 0 }
  }
}

// Save cart to localStorage
export function saveCartToStorage(cart: Cart): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart))
  } catch (error) {
    console.error('Error saving cart to localStorage:', error)
  }
}

// Calculate cart totals
export function calculateCartTotals(items: Array<CartItem>): {
  total: number
  itemCount: number
} {
  const itemCount = items.reduce((count, item) => count + item.quantity, 0)
  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0,
  )
  const shipping = subtotal > 0 ? 10 : 0 // Free shipping over certain amount could be added
  const tax = subtotal * 0.1 // 10% tax
  const total = subtotal + shipping + tax

  return { total, itemCount }
}

// Check if we can add more of this item to cart
export function canAddToCart(
  cart: Cart,
  product: Product,
  selectedSize: string,
  quantityToAdd: number = 1,
): boolean {
  const existingItem = cart.items.find(
    (item) =>
      item.product.id === product.id && item.selectedSize === selectedSize,
  )

  const currentQuantity = existingItem ? existingItem.quantity : 0
  const newQuantity = currentQuantity + quantityToAdd

  return newQuantity <= product.count
}

// Get remaining stock for a product in cart
export function getRemainingStock(
  cart: Cart,
  product: Product,
  selectedSize: string,
): number {
  const existingItem = cart.items.find(
    (item) =>
      item.product.id === product.id && item.selectedSize === selectedSize,
  )

  const currentQuantity = existingItem ? existingItem.quantity : 0
  return Math.max(0, product.count - currentQuantity)
}

// Add item to cart (with inventory check)
export function addToCart(
  cart: Cart,
  product: Product,
  selectedSize: string = 'M',
): { cart: Cart; success: boolean; message?: string } {
  // Check if we can add this item
  if (!canAddToCart(cart, product, selectedSize)) {
    return {
      cart,
      success: false,
      message: 'Not enough items in stock',
    }
  }

  const existingItemIndex = cart.items.findIndex(
    (item) =>
      item.product.id === product.id && item.selectedSize === selectedSize,
  )

  let newItems: Array<CartItem>

  if (existingItemIndex >= 0) {
    // Item already exists, increase quantity
    newItems = cart.items.map((item, index) =>
      index === existingItemIndex
        ? { ...item, quantity: item.quantity + 1 }
        : item,
    )
  } else {
    // Add new item
    const newItem: CartItem = {
      product,
      quantity: 1,
      selectedSize,
    }
    newItems = [...cart.items, newItem]
  }

  const { total, itemCount } = calculateCartTotals(newItems)

  return {
    cart: {
      items: newItems,
      total,
      itemCount,
    },
    success: true,
  }
}

// Remove item from cart
export function removeFromCart(
  cart: Cart,
  productId: string,
  selectedSize: string,
): Cart {
  const newItems = cart.items.filter(
    (item) =>
      !(item.product.id === productId && item.selectedSize === selectedSize),
  )

  const { total, itemCount } = calculateCartTotals(newItems)

  return {
    items: newItems,
    total,
    itemCount,
  }
}

// Update item quantity (with inventory check)
export function updateCartItemQuantity(
  cart: Cart,
  productId: string,
  selectedSize: string,
  quantity: number,
): { cart: Cart; success: boolean; message?: string } {
  if (quantity <= 0) {
    return {
      cart: removeFromCart(cart, productId, selectedSize),
      success: true,
    }
  }

  // Find the product to check stock
  const existingItem = cart.items.find(
    (item) =>
      item.product.id === productId && item.selectedSize === selectedSize,
  )

  if (!existingItem) {
    return {
      cart,
      success: false,
      message: 'Item not found in cart',
    }
  }

  // Check if the new quantity exceeds available stock
  if (quantity > existingItem.product.count) {
    return {
      cart,
      success: false,
      message: `Only ${existingItem.product.count} items available in stock`,
    }
  }

  const newItems = cart.items.map((item) =>
    item.product.id === productId && item.selectedSize === selectedSize
      ? { ...item, quantity }
      : item,
  )

  const { total, itemCount } = calculateCartTotals(newItems)

  return {
    cart: {
      items: newItems,
      total,
      itemCount,
    },
    success: true,
  }
}

// Clear cart
export function clearCart(): Cart {
  return { items: [], total: 0, itemCount: 0 }
}
