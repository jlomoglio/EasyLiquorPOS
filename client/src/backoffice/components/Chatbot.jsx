import { useState, useRef, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { SendHorizonal, X } from "lucide-react";

export default function Chatbot({ chatbotOpen, setChatbotOpen }) {
    // STYLE
    const chatbotWrapper = `
        fixed bottom-[30px] right-7 flex flex-col items-end border 
        border-[#ccc] bg-white rounded-lg z-[1000] shadow-lg
    `

    const [messages, setMessages] = useState([
        { sender: "bot", text: "Hello! Ask me anything about your sales." }
    ]);
    const [input, setInput] = useState("");
    const chatEndRef = useRef(null);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    function sendMessage() {
        if (!input.trim()) return;

        const userMessage = { sender: "user", text: input };
        setMessages(prev => [...prev, userMessage]);
        setInput("");

        fetch("http://localhost:5000/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ query: input })
        })
            .then(res => res.json())
            .then(data => {
                const botMessage = { sender: "bot", text: data.response };
                setMessages(prev => [...prev, botMessage]);
            })
            .catch(() => {
                const errorMessage = { sender: "bot", text: "❌ Error processing request." };
                setMessages(prev => [...prev, errorMessage]);
            });
    }

    return (
        <div className={chatbotWrapper}>
            {chatbotOpen && (
                <>
                <div className="w-[480px] h-[40px] flex flex-row justify-end bg-[#ccc]">
                    <div className="w-[25px] h-[25px] p-[5px] text-black mr-[15px] mt-[4px] cursor-pointer" onClick={() => setChatbotOpen(false)}>
                        <X strokeWidth={3.5} />
                    </div>
                </div>
                <Card className="w-[480px] h-96 flex flex-col">
                    <CardContent className="flex-1 p-2 border border-l-0 border-r-0 border-b-0 border-t-[#ccc] mt-[0px]">
                        <div className="h-72 pr-2 overflow-y-scroll">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`mb-2 p-2 rounded-lg max-w-[80%] ${msg.sender === "user" ? "ml-auto bg-blue-500 text-white" : "mr-auto bg-gray-200 text-black"}`}>
                                    {msg.text}
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>
                    </CardContent>
                    <div className="p-1 flex gap-2 border border-l-0 border-r-0 border-b-0 border-t-[#ccc] h-[60px]">
                        <input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask AI..."
                            className="flex-1 pl-[10px] focus:outline-none"
                            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                        />
                        <div className="w-[80px] mt-[14px] mr-[-40px] cursor-pointer" onClick={sendMessage}>
                            <SendHorizonal />
                        </div>
                                
                    </div>
                </Card>
                </>
            )}
        </div>
    );
}
