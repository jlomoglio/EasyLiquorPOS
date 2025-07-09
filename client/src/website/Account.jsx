import { useEffect, useState } from 'react'
import { apiFetch } from '../utils/api'
import InputGroup from './../backoffice/components/ui/forms/InputGroup'
import DisplayInputGroup from './components/DisplayInputGroup'

export default function Account() {
    const [store, setStore] = useState('')
    const [code, setCode] = useState('')
    const [codeVerified, setCodeVerified] = useState(false)
    const [year, setYear] = useState(new Date().getFullYear())

    useEffect(() => {
        async function fetchStore() {
            try {
                const data = await apiFetch('/api/store', {
                    headers: {
                        'x-tenant-id': localStorage.getItem('tenantId')
                    }
                })

                if (data.success) setStore(data.store)
            }
            catch (err) {
                console.error('Failed to load store data')
            }
        }
        fetchStore()
    }, [])


    function handleCode(_, value) {
        setCode(value)
        console.log("CODE:", value)
    }

    async function handleVerifyCode() {
        try {
            const data = await apiFetch(`/api/verify_software_code/${code}`, {
                headers: {
                    'x-tenant-id': localStorage.getItem('tenantId')
                }
            })

            console.log("data = ", data)

            if (data.success) {
                setCodeVerified(true)
                setCode('')
            }
        }
        catch (err) {
            console.error('Failed to load store data')
        }
    }

    if (!store) return

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-6">

                <div className="md:col-span-2 bg-white p-6 rounded shadow space-y-6">
                    <div className="text-left">
                        <h1 className="text-2xl font-bold">Account Details</h1>
                    </div>

                    <div className="text-left">
                        <h3 className="text-[1.1rem] font-bold">{store.store_name} #{store.store_number}</h3>
                        <p className="text-gray-600">Owner: {store.fname} {store.lname}</p>
                    </div>

                    <div className='flex gap-4'>
                        <div className="w-[600px] border-r border-r-[#ccc]">
                            <h2 className="text-lg font-semibold">Edit Store Details</h2>
                            <div className="flex-cols-2 ml-[-20px]">
                                <DisplayInputGroup readonly name="address" value={store.address} label="Address" />
                                <DisplayInputGroup readonly name="city" value={store.city} label="City" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="state" value={store.state} label="State" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="zip" value={store.zip} label="ZIP" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="phone" value={store.phone} label="Phone" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="email" value={store.email} label="Email" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="username" value={store.username} label="Username" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                                <DisplayInputGroup readonly name="password" value={store.password} label="Password" type="text" className="w-full px-4 py-2 border rounded bg-gray-100 user-select-none" />
                            </div>
                            {/* <button className="mt-2 bg-blue-600 text-white px-6 py-2 rounded">Save Changes</button> */}
                        </div>

                        <div className="pt-6 mt-[-20px] flex flex-col w-[400px]">
                            <h2 className="text-lg font-semibold">Download Software (Windows)</h2>
                            <p className='mb-0'>
                                Enter your software code to download your file.
                            </p>

                            <div className='flex flex-row ml-[-20px] mb-[15px]'>
                                <div className='w-[300px]'>
                                    <InputGroup
                                        type="text"
                                        name="code"
                                        value={code}
                                        label="Software Code"
                                        onChange={handleCode}
                                    />
                                </div>
                                <button
                                    className="bg-blue-600 text-white px-6 py-2 rounded h-[40px] mt-[55px] ml-[-10px]"
                                    onClick={handleVerifyCode}
                                >
                                    Submit
                                </button>
                            </div>

                            {codeVerified &&
                                (
                                    <>
                                    <p className='mb-4'>
                                        Your download is ready! After you have downloaded it, simply unzip the file and double click the file.
                                        Move the file to a new location on your computer.
                                    </p>

                                    <a href="http://localhost:5000/EasyLiquorPOS 2.5.0.zip" className="text-blue-600 underline">Click here to download EasyLiquor POS</a> 
                                    </>
                                )
                                
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}