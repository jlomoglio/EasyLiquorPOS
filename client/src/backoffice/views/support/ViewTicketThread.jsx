// src/backoffice/views/support/ViewTicketThread.jsx
import { useParams, useNavigate } from 'react-router-dom'
import { useState, useEffect, useRef } from 'react'
import devopsApiFetch from '../../../utils/devopsApiFetch'

import ViewContainer from '../../components/ui/ViewContainer'
import ViewTitle from '../../components/ui/ViewTitle'
import TicketButton from '../../components/support_tickets/TicketButton'
import TicketSelectGroup from '../../components/support_tickets/TicketSelectGroup'
import BackButton from './../../components/support_tickets/BackButton';

export default function ViewTicketThread() {
	const { id } = useParams()
	const navigate = useNavigate()
	const [ticket, setTicket] = useState(null)
	const [messages, setMessages] = useState([])
	const [reply, setReply] = useState('')
	const bottomRef = useRef(null)

	useEffect(() => {
        if (!id) return
        loadTicket()
    }, [id])
    
    async function loadTicket() {
        try {
            const res = await devopsApiFetch(`/api/devops_get_ticket_thread/${id}`)
            setTicket({
                id: res.id,
                subject: res.subject,
                status: res.status
            })
            setMessages(res.messages || [])
        } catch (err) {
            console.error("❌ Failed to load ticket thread:", err)
        }
    }

	async function handleSend() {
        if (!reply.trim()) return
    
        try {
            await devopsApiFetch(`/api/devops_reply_ticket`, {
                method: 'POST',
                body: {
                    ticket_id: id,
                    sender: 'admin',
                    message: reply,
                    timestamp: new Date().toISOString()
                }
            })
    
            // 🔄 Automatically mark ticket as "pending" after admin reply
            await devopsApiFetch(`/api/devops_update_ticket_status/${id}`, {
                method: 'PUT',
                body: { status: 'open' }
            })
            setTicket(prev => ({ ...prev, status: 'pending' }))
    
            setMessages(prev => ([...prev, {
                id: Date.now(),
                sender: 'admin',
                message: reply,
                timestamp: new Date().toISOString()
            }]))
            setReply('')
            setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
        } catch (err) {
            console.error("❌ Failed to send message:", err)
        }
    }

	if (!ticket) return null

	return (
		<ViewContainer>
            <ViewTitle title={`Ticket #${ticket.id}`} subtitle={ticket.subject} />
			<div className="flex justify-between items-center mb-4 mt-3 w-[800px]">
				<BackButton onClick={() => navigate('../support')} label="Back to Support" />
                <span className={`text-xs font-semibold px-2 py-1 rounded ${ticket.status === 'closed' ? 'bg-red-200 text-red-800' : 'bg-green-200 text-green-800'}`}>
					{ticket.status.toUpperCase()}
				</span>
			</div>

			<div className="bg-white rounded shadow-sm p-4 h-[400px] overflow-y-auto border border-gray-200 w-[800px]">
				{messages.map(msg => (
					<div
						key={msg.id}
						className={`mb-4 ${msg.sender === 'admin' ? 'text-right' : 'text-left'}`}
					>
						<div className={`inline-block px-4 py-2 rounded-md max-w-[80%] text-sm ${
							msg.sender === 'admin' ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-800'
						}`}>
							{msg.message}
						</div>
						<div className="text-xs text-gray-400 mt-1">
							{msg.timestamp}
						</div>
					</div>
				))}
				<div ref={bottomRef} />
			</div>

            {ticket.status !== 'closed' && (
                <div className="mt-4 flex gap-4 w-[800px]">
                    <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        placeholder="Type your reply..."
                        className="flex-1 max-h-[150px] min-h-[150px] px-4 py-2 border border-[#ccc] 
                            rounded text-sm focus:outline-none focus:ring focus:ring-blue-400"
                        rows={6}
                    />
                    <TicketButton label="Send" onClick={handleSend} />
                </div>
            )}
		</ViewContainer>
	)
}