// APPLICATION DEPENDENCIES
import { useEffect, useState } from 'react'
import { useDispatch } from "react-redux"
import { setView, setMenuDisabled } from "../../../features/backofficeSlice"
import { apiFetch } from './../../../utils/api'

// COMPONENT DEPENDENCIES
import ViewContainer from '../../components/ui/ViewContainer'
import ViewTitle from '../../components/ui/ViewTitle'
import InputGroup from '../../components/ui/forms/InputGroup'
import DynamicScrollTable from '../../components/ui/table/DynamicScrollTable'
import { toast } from 'react-hot-toast'


// COMPOENT: ERROR LOGS
export default function ErrorLogs() {
    // REDUX
    const dispatch = useDispatch()

    // STATE
    const [logs, setLogs] = useState([])
    const [search, setSearch] = useState('')
    const [selectedLog, setSelectedLog] = useState(null)

    useEffect(() => {
        dispatch(setView("Error Logs"))
        dispatch(setMenuDisabled(false))

        //fetchLogs()
    }, []);

    // FETCH ERROR LOGS
    async function fetchLogs() {
        try {
            const data = await apiFetch(`/api/error_logs?search=${encodeURIComponent(search)}`)
            setLogs(data.logs || [])
        } 
        catch (err) {
            console.error("Failed to load error logs", err)
        }
    }
    
    // HANDLE SEARCH
    function handleSearch(e) {
        e.preventDefault()
        fetchLogs()
    }

    // TABLE CONFIGURATION
    const tableColumns = [
        { key: "code", label: "Error Code", width: "220px" },
        { key: "path", label: "PATH", width: "600px" },
        { key: "message", label: "Error Message", width: "200px" },
        { key: "stack", label: "Stack", width: "180px" },
        { key: "timestapm", label: "Time", width: "180px" },
        { key: "user_id", label: "User", width: "180px" },
    ]

    // RENDER JSX
    return (
        <ViewContainer>
            <ViewTitle title="Error Logs" subtitle="Search and review application errors." />
            <form onSubmit={handleSearch} className="mb-4">
                <InputGroup
                    label="Search Logs"
                    name="search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by code, path, or message"
                />
            </form>

            <div className="overflow-y-auto max-h-[500px] border border-gray-200 rounded-lg shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-100 text-xs uppercase">
                        <tr>
                            <th className="px-4 py-2">Code</th>
                            <th className="px-4 py-2">Path</th>
                            <th className="px-4 py-2">Message</th>
                            <th className="px-4 py-2">Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {logs.map(log => (
                            <tr key={log.id} className="cursor-pointer hover:bg-gray-50" onClick={() => setSelectedLog(log)}>
                                <td className="px-4 py-2 text-blue-600 font-medium">{log.code}</td>
                                <td className="px-4 py-2">{log.path}</td>
                                <td className="px-4 py-2 truncate max-w-[250px]">{log.message}</td>
                                <td className="px-4 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedLog && (
                <div className="mt-6 p-4 border border-gray-300 rounded-lg bg-white shadow">
                    <h2 className="text-lg font-semibold mb-2">Error Details</h2>
                    <p><strong>Code:</strong> {selectedLog.code}</p>
                    <p><strong>Path:</strong> {selectedLog.path}</p>
                    <p><strong>Message:</strong> {selectedLog.message}</p>
                    <p><strong>User ID:</strong> {selectedLog.user_id || 'N/A'}</p>
                    <p><strong>Timestamp:</strong> {new Date(selectedLog.timestamp).toLocaleString()}</p>
                    <pre className="mt-2 bg-gray-100 p-2 text-sm overflow-auto max-h-[300px]">
                        {selectedLog.stack || 'No stack trace available.'}
                    </pre>
                </div>
            )}
        </ViewContainer>
    );
}
