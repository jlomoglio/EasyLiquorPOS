// components/TermsModal.jsx
import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function SignupSuccessModal({ onClose }) {
	return (

		<Dialog as="div" open={true} onClose={onClose} className="fixed inset-0 z-[1000] overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center px-4 text-center">
				<div className="fixed inset-0 bg-black/70"></div>
				<DialogPanel className="relative z-[1001] inline-block w-[440px] p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
					<DialogTitle as="h3" className="text-lg text-center font-medium leading-6 text-gray-900">
						Your account was successfuly created
					</DialogTitle>
					<div className="mt-4 space-y-4 text-sm text-gray-700 text-center max-h-[60vh] overflow-y-auto pr-2">
						<p>
							You will receive an email with a link to download the software.
						</p>
					</div>
					<div className="mt-6 text-center">
						<button onClick={onClose} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
							Close
						</button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	)
}
