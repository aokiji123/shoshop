import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useCurrentUser, useLogout } from '@/api/queries/useAuth'
import { useDeleteUser, useUpdateUser } from '@/api/queries/useUser'
import { useOrdersByUserId } from '@/api/queries/useOrder'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { requireAuth } from '@/lib/auth'
import { EditProfileModal } from '@/components/modals/EditProfileModal'
import { DeleteAccountModal } from '@/components/modals/DeleteAccountModal'

export const Route = createFileRoute('/profile')({
  beforeLoad: () => {
    requireAuth()
  },
  component: RouteComponent,
})

function RouteComponent() {
  const navigate = useNavigate()
  const { data: user, isLoading, error, isFetching } = useCurrentUser()
  const { mutate: logout, isPending: isLoggingOut } = useLogout()
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser()
  const { mutate: deleteUser, isPending: isDeleting } = useDeleteUser()
  const { data: orders, isLoading: isOrdersLoading } = useOrdersByUserId(
    user?.id || '',
  )

  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
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

  function handleLogout() {
    logout(undefined, {
      onSuccess: () => {
        navigate({ to: '/login', search: { message: undefined } })
      },
    })
  }

  function handleUpdateUser(userData: {
    name: string
    email: string
    tgTag: string
    imageFile?: File
  }) {
    updateUser(userData, {
      onSuccess: (data) => {
        if (data.success) {
          setIsEditModalOpen(false)
        }
      },
    })
  }

  function handleDeleteAccount() {
    deleteUser(undefined, {
      onSuccess: (data) => {
        if (data.success) {
          navigate({ to: '/login', search: { message: undefined } })
        }
      },
    })
  }

  if (isLoading || isFetching) {
    return (
      <div className="flex items-center justify-center h-[90vh]">
        <div className="w-12 h-12 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!user || error) {
    return null
  }

  return (
    <div>
      <div className="flex flex-col gap-8 p-4 md:p-6 lg:p-8 min-h-[90vh]">
        <div className="flex flex-col gap-4 items-center justify-center">
          {user.isAdmin && <p className="text-xl px-2 py-1">Admin</p>}
          <div className="relative flex items-center justify-center">
            <img
              src={
                user.image
                  ? `http://localhost:5077/${user.image}`
                  : 'https://placehold.co/200x200'
              }
              className="rounded-full w-[200px] h-[200px]"
              alt="Profile"
            />
          </div>
          <div className="flex flex-col gap-2 text-center">
            <p className="text-2xl font-bold">{user.name}</p>
            <p className="text-lg">{user.email}</p>
            <p className="text-lg">{user.tgTag}</p>
          </div>
          <div className="w-[300px] flex flex-col gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              Edit user
            </button>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="bg-black w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 disabled:opacity-50 rounded-md"
            >
              {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>
            <button
              onClick={() => setIsDeleteModalOpen(true)}
              className="bg-red-500 w-full text-white text-2xl px-4 py-2 cursor-pointer hover:scale-105 transition-all duration-300 rounded-md"
            >
              Delete account
            </button>
          </div>
        </div>

        <div className="flex flex-col">
          <h2 className="text-2xl font-bold mb-4">Orders History</h2>
          <div className="min-h-[200px] border border-gray-200 rounded-lg overflow-scroll">
            {isOrdersLoading ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-t-black border-gray-300 rounded-full animate-spin"></div>
              </div>
            ) : !orders || orders.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No orders found</p>
              </div>
            ) : (
              <div className="h-full overflow-scroll">
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-8"></TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Total Price</TableHead>
                      <TableHead>Products Count</TableHead>
                      <TableHead>Created At</TableHead>
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
                          <TableCell className="font-medium">
                            {order.id}
                          </TableCell>
                          <TableCell>${order.price.toFixed(2)}</TableCell>
                          <TableCell>{order.orderProducts.length}</TableCell>
                          <TableCell>
                            {new Date(order.createdAt).toLocaleString()}
                          </TableCell>
                        </TableRow>
                        {expandedRows.has(order.id) && (
                          <TableRow key={`${order.id}-details`}>
                            <TableCell></TableCell>
                            <TableCell colSpan={4}>
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
                                            product.quantity *
                                            product.priceAtTime
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
            )}
          </div>
        </div>
      </div>

      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleUpdateUser}
        isUpdating={isUpdating}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onDelete={handleDeleteAccount}
        isDeleting={isDeleting}
      />
    </div>
  )
}
