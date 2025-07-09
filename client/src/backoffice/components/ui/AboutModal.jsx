import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react";

export default function AboutModal({ isOpen, onClose }) {
    return (
      <Dialog open={isOpen} onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          {/* ✅ This is the clickable container, put ID here */}
          <DialogPanel id="about-modal" className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg border border-gray-300">
            <DialogTitle className="text-lg font-semibold text-gray-800 mb-2">
              About EasyLiquor POS
            </DialogTitle>
            <div className="text-sm text-gray-600 mb-4">
              Your all-in-one solution for liquor store management.
            </div>
            <div className="text-sm text-gray-700">
              <p><strong>Version:</strong> v2.0 Beta</p>
              <p><strong>Build:</strong> April 2025</p>
              <p><strong>Developed by:</strong> Joe & Team</p>
            </div>
            <button
              onClick={onClose}
              className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Close
            </button>
          </DialogPanel>
        </div>
      </Dialog>
    )
  }
  
