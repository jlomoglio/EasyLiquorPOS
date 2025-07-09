// src/backoffice/views/support/SubmitTicketForm.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ViewContainer from '../../components/ui/ViewContainer'
import ViewTitle from '../../components/ui/ViewTitle'
import TicketInputGroup from '../../components/support_tickets/TicketInputGroup'
import TicketButton from '../../components/support_tickets/TicketButton'
import devopsApiFetch from '../../../utils/devopsApiFetch'
import BackButton from '../../components/support_tickets/BackButton'

export default function SubmitTicketForm() {
	const [subject, setSubject] = useState('')
	const [message, setMessage] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const navigate = useNavigate()

	const userId = localStorage.getItem("userId")
    const tenantId = localStorage.getItem("tenantId")

	async function handleSubmit(e) {
        e.preventDefault()
		if (!subject.trim() || !message.trim()) return

		setSubmitting(true)

		try {
			const res = await devopsApiFetch('/api/devops_submit_ticket', {
				method: 'POST',
				body: {
					user_id: userId,
                    tenantId: tenantId,
					subject,
					message,
					timestamp: new Date().toISOString()
				}
			})

			if (res.success && res.ticket_id) {
				navigate(`../view_ticket_thread/${res.ticket_id}`)
			} 
            else {
				console.log('Failed to submit ticket')
			}
		} 
        catch (err) {
			console.error('Error submitting ticket:', err)
			alert('Something went wrong')
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<ViewContainer>
			<ViewTitle title="Submit a Support Ticket" subtitle="Tell us how we can help" />
            <BackButton onClick={() => navigate('../support')} label="Back to Support" />
			
            <form className="w-[400px] ml-[-20px]">
				<TicketInputGroup
					label="Subject"
					type="text"
					value={subject}
					onChange={setSubject}
					required
				/>

				<label className="text-sm ml-[22px] text-[1rem] font-[600]">Message</label>
				<textarea
					className="w-[360px] ml-[20px] mt-1 p-3 border border-gray-300 rounded text-sm 
                        focus:outline-none focus:ring focus:ring-blue-500 h-[250px] max-h-[250px]
                        min-h-[250px]"
					rows={6}
					placeholder="Describe your issue in detail..."
					value={message}
					onChange={(e) => setMessage(e.target.value)}
					required
				/>

				<div className="ml-[20px] mt-5">
					<TicketButton
						type="submit"
						label={submitting ? 'Submitting...' : 'Submit Ticket'}
						disabled={submitting}
                        onClick={handleSubmit}
					/>
				</div>
			</form>
		</ViewContainer>
	)
}