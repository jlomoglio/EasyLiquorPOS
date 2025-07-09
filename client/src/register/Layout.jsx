import { Outlet } from 'react-router-dom'

export default function Layout() {
	return (
		<div className="flex w-full h-screen">
			<Outlet />
		</div>
	)
}