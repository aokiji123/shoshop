import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useOrders } from '@/api/queries/useOrder'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const Route = createFileRoute('/orders')({
  component: RouteComponent,
})

function RouteComponent() {
  const { data: orders, isLoading } = useOrders()
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleRow = (orderId: string) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!orders || orders.length === 0) {
    return <div>No orders found</div>
  }

  return (
    <div>
      <div className="container mx-auto p-4 min-h-[90vh]">
        <h1 className="text-2xl font-bold mb-4">Orders</h1>
        <div className="border border-gray-200 rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Telegram Tag</TableHead>
                <TableHead>Total Price</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Products Count</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <>
                  <TableRow
                    key={order.id}
                    className="cursor-pointer"
                    onClick={() => toggleRow(order.id)}
                  >
                    <TableCell>
                      {expandedRows.has(order.id) ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.tgTag}</TableCell>
                    <TableCell>${order.price.toFixed(2)}</TableCell>
                    <TableCell>{order.userId}</TableCell>
                    <TableCell>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{order.orderProducts.length}</TableCell>
                  </TableRow>
                  {expandedRows.has(order.id) && (
                    <TableRow key={`${order.id}-details`}>
                      <TableCell></TableCell>
                      <TableCell colSpan={6}>
                        <div className="py-2 pl-4 border-l-2 border-muted">
                          <h4 className="font-semibold mb-2 text-sm">
                            Order Products:
                          </h4>
                          <div className="space-y-2">
                            {order.orderProducts.map((product, index) => (
                              <div
                                key={`${order.id}-${product.productId}-${index}`}
                                className="flex justify-between items-center p-2 bg-muted/30 rounded"
                              >
                                <div>
                                  <div className="font-medium text-sm">
                                    {product.productName}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    Product ID: {product.productId}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium text-sm">
                                    {product.quantity} × $
                                    {product.priceAtTime.toFixed(2)}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    = $
                                    {(
                                      product.quantity * product.priceAtTime
                                    ).toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
