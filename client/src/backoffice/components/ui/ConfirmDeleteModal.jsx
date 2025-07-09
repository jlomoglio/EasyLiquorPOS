import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { TriangleAlert } from 'lucide-react'

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Warning!",
  message = "Are you sure you want to delete this item?",
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  icon = true,
}) {

  if (!isOpen) return null

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-[1000]" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300" leave="ease-in duration-200"
          enterFrom="opacity-0" enterTo="opacity-100"
          leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-6">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" leave="ease-in duration-200"
              enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-xl transform overflow-hidden rounded-xl bg-white text-left align-middle shadow-xl transition-all">
                <div className="bg-red-600 px-6 py-4 rounded-t-xl flex items-center gap-4">
                  {icon && (
                    <TriangleAlert className="h-8 w-8 text-white" />
                  )}
                  <DialogTitle
                    as="h3"
                    className="text-xl font-semibold leading-6 text-white"
                  >
                    {title}
                  </DialogTitle>
                </div>
                <div className="bg-white px-6 py-6">
                  <p className="text-gray-700 text-md text-center">{message}</p>
                  <div className="mt-8 flex justify-center gap-4">
                    <button
                      type="button"
                      className="w-[140px] h-[40px] rounded-full border border-gray-300 text-gray-700 font-medium shadow-sm hover:bg-gray-100 cursor-pointer"
                      onClick={onClose}
                    >
                      {cancelLabel}
                    </button>
                    <button
                      type="button"
                      className="w-[140px] h-[40px] rounded-full bg-red-600 text-white font-semibold shadow-md hover:bg-red-700 cursor-pointer"
                      onClick={onConfirm}
                    >
                      {confirmLabel}
                    </button>
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
