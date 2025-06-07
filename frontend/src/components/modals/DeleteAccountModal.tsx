import { MdClose } from 'react-icons/md'

type DeleteAccountModalProps = {
  isOpen: boolean
  onClose: () => void
  onDelete: () => void
  isDeleting: boolean
}

export function DeleteAccountModal({
  isOpen,
  onClose,
  onDelete,
  isDeleting,
}: DeleteAccountModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/30 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 w-full max-w-md rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-red-600">Delete Account</h2>
          <button
            onClick={onClose}
            className="transition-all duration-200 hover:scale-110 p-1 cursor-pointer rounded-md"
          >
            <MdClose />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-700 mb-2">
            Are you sure you want to delete your account?
          </p>
          <p className="text-sm text-red-600">
            This action cannot be undone. All your data will be permanently
            deleted.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-black hover:scale-105 transition-all duration-300 cursor-pointer rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-500 text-white hover:scale-105 transition-all duration-300 disabled:opacity-50 cursor-pointer rounded-md"
          >
            {isDeleting ? 'Deleting...' : 'Delete Account'}
          </button>
        </div>
      </div>
    </div>
  )
}
