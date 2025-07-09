// src/backoffice/views/support/SubmitSupportTicket.jsx
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from "react-redux"
import { useNavigate } from "react-router-dom"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"

import ViewContainer from '../../components/ui/ViewContainer'
import ViewTitle from './../../components/ui/ViewTitle'
import TicketInputGroup from '../../components/support_tickets/TicketInputGroup'
import TicketSelectGroup from '../../components/support_tickets/TicketSelectGroup'
import TicketResetButton from '../../components/support_tickets/TicketResetButton'
import TicketDynamicScrollTable from '../../components/support_tickets/TicketDynamicScrollTable'
import TicketButton from '../../components/support_tickets/TicketButton'
import devopsApiFetch from '../../../utils/devopsApiFetch'

const STATUS_OPTIONS = [
	{ name: 'all', label: 'All', value: '' },
	{ name: 'open', label: 'Open', value: 'open' },
	{ name: 'pending', label: 'Pending', value: 'pending' },
	{ name: 'closed', label: 'Closed', value: 'closed' }
]

export default function Support() {
	const [tickets, setTickets] = useState([])
	const [status, setStatus] = useState('')
	const [search, setSearch] = useState('')
	const navigate = useNavigate()
	const dispatch = useDispatch()

	const tenantId = localStorage.getItem('tenantId')
	const userId = localStorage.getItem('userId')

	useEffect(() => {
		dispatch(setView("Users")) 
		dispatch(setMenuDisabled(false))
	}, [])

	useEffect(() => {
		if (!tenantId || !userId) return

		devopsApiFetch(`/api/devops_get_user_tickets/${userId}`)
			.then(data => setTickets(data))
			.catch(err => console.error("❌ Failed to fetch user tickets:", err))
	}, [userId, tenantId])

	const filtered = tickets.filter(t => {
		return (
			(!status || t.status === status) &&
			(t.subject?.toLowerCase().includes(search.toLowerCase()) ||
			 t.created?.toLowerCase().includes(search.toLowerCase()))
		)
	})

	function handleAction(action, id) {
		navigate(`../view_ticket_thread/${id}`)
	}

	const columns = [
		{ key: 'subject', label: 'Subject', width: '400px' },
		{ key: 'status', label: 'Status', width: '150px' },
		{ key: 'created', label: 'Created', width: '200px' }
	]

	return (
		<ViewContainer>
			<ViewTitle title="My Support Tickets" subtitle="View or reply to previously submitted tickets" />
			<div className="flex flex-row mb-[10px]">
				<div className='w-[300px] ml-[-20px]'>
					<TicketSelectGroup
						label="Status"
						value={status}
						onChange={setStatus}
						options={STATUS_OPTIONS}
					/>
				</div>
				<div className='w-[500px] ml-[-30px] mt-[5px]'>
					<TicketInputGroup
						label="Search"
						type="text"
						value={search}
						placeholder="Search subject or date"
						onChange={setSearch}
					/>
				</div>
				<div className='w-[80px] mt-[60px] ml-[-10px]'>
					<TicketResetButton onClick={() => { setSearch(''); setStatus('') }} />
				</div>
				<div className="flex justify-end mb-3 mt-[55px] mr-[10px] absolute right-[0px]">
					<TicketButton label="Submit New Ticket" onClick={() => navigate('../submit_ticket')} />
				</div>
			</div>

			<TicketDynamicScrollTable
				columns={columns}
				data={filtered}
				actions={["view"]}
				onAction={handleAction}
			/>
		</ViewContainer>
	)
}
