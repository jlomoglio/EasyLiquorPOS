// components/TermsModal.jsx
import { Fragment } from 'react'
import { Dialog, DialogPanel, DialogTitle } from '@headlessui/react'

export default function TermsModal({ onClose }) {
	return (

		<Dialog as="div" open={true} onClose={onClose} className="fixed inset-0 z-[1000] overflow-y-auto">
			<div className="flex min-h-screen items-center justify-center px-4 text-center">
				<div className="fixed inset-0 bg-black/70"></div>
				<DialogPanel className="relative z-[1001] inline-block w-[800px] p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
					<DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900">
						Terms and Conditions
					</DialogTitle>
					<div className="mt-4 space-y-4 text-sm text-gray-700 max-h-[60vh] overflow-y-auto pr-2">
						<p>
							By registering for and using EasyLiquor POS, you agree to the following terms and conditions. These terms are subject to change at any time without notice.
						</p>
						<ul className="list-disc list-inside space-y-2">
							<li>You are responsible for ensuring all information entered is accurate and belongs to your business.</li>
							<li>Subscription is billed monthly. You are responsible for maintaining a valid payment method.</li>
							<li>We do not offer refunds once billing has occurred. Cancel anytime before your next billing cycle.</li>
							<li>You agree not to reverse engineer, copy, or redistribute any portion of the software.</li>
							<li>We reserve the right to suspend accounts that violate these terms or misuse the system.</li>
							<li>Your data is yours. If you cancel, you may request a copy of your records before deletion.</li>
							<li>System uptime is important to us, but we do not guarantee uninterrupted service.</li>
							<li>Support is provided via email or your account dashboard. Priority support is available with higher-tier plans.</li>
						</ul>
						<p>
							If you have any questions or concerns about these terms, please 
							<a className='text-blue-800 mx-1' href='mailto: support@easyliquorpos.com'>
								contact support
							</a> 
							before registering.
						</p>
					</div>
					<div className="mt-6 text-right">
						<button onClick={onClose} className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
							Close
						</button>
					</div>
				</DialogPanel>
			</div>
		</Dialog>
	)
}
