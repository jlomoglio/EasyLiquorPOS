import { useState } from 'react'
import { Delete } from 'lucide-react'
import logo from '../../assets/EasyLiquor_POS_big_logo.png'

export default function LoginKeypad({ handleLogin }) {
    const logoImg = `
        w-[500px]
    `
    
  const [pin, setPin] = useState('')

  function handleKeyClick(value) {
    if (pin.length < 6) setPin(prev => prev + value)
  }

  function handleBackspace() {
    setPin(prev => prev.slice(0, -1))
  }

  function handleClear() {
    setPin('')
  }

  function handleSubmit() {
    handleLogin(pin)
  }

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-blue-500 px-4">
      {/* <h1 className="text-white text-6xl font-bold mb-6">EasyLiquor <span className="text-black font-[900] drop-shadow">POS</span></h1> */}
	  <img src={logo} alt="" className={logoImg} />

      <div className="w-full max-w-[400px]">
      <div className="h-[48px] mb-6 relative flex items-center justify-center">
        
            <div className="flex gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div
                    key={i}
                    className={`w-6 h-6 rounded-full ${
                        i < pin.length ? 'bg-white' : 'border border-white'
                    }`}
                    />
                ))}
            </div>
        
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleKeyClick(num.toString())}
              className="bg-white text-blue-600 font-bold text-2xl py-4 rounded shadow hover:bg-blue-100"
            >
              {num}
            </button>
          ))}

          <button
            onClick={handleClear}
            className="bg-white text-blue-600 font-medium text-lg py-4 rounded shadow hover:bg-blue-100"
          >
            Clear
          </button>

          <button
            onClick={() => handleKeyClick('0')}
            className="bg-white text-blue-600 font-bold text-2xl py-4 rounded shadow hover:bg-blue-100"
          >
            0
          </button>

          <button
            onClick={handleBackspace}
            className="bg-white text-blue-600 py-4 rounded shadow hover:bg-blue-100 flex justify-center items-center"
          >
            <Delete size={24} />
          </button>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-white text-blue-600 font-bold text-xl py-3 rounded mt-6 shadow hover:bg-blue-100"
        >
          Login
        </button>

        <p className="text-center text-xs text-white mt-10 opacity-70">
          Copyright © 2025 Conception Software. All rights reserved.
        </p>
      </div>
    </div>
  )
}
