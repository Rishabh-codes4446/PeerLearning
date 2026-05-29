import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000')

export default function ChatBox({ bookingId, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const token = localStorage.getItem('token')
  const bottomRef = useRef(null)

  useEffect(() => {
    socket.emit('join', currentUserId)
    fetchMessages()

    socket.on('new-message', (msg) => {
      setMessages(prev => [...prev, msg])
    })

    return () => socket.off('new-message')
  }, [bookingId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`http://localhost:8000/api/messages/${bookingId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setMessages(res.data)
    } catch (err) {
      console.error(err)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    try {
      await axios.post('http://localhost:8000/api/messages', {
        bookingId, content: text
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setText('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="border rounded-xl overflow-hidden bg-white">
      <div className="bg-blue-600 px-4 py-3">
        <p className="text-white text-sm font-medium">Session Chat</p>
      </div>
      <div className="h-64 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-gray-400 text-xs text-center mt-8">No messages yet. Say hello!</p>
        )}
        {messages.map(m => (
          <div key={m.id}
            className={`flex ${m.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-3 py-2 rounded-xl text-sm
              ${m.senderId === currentUserId
                ? 'bg-blue-600 text-white rounded-br-none'
                : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
              {m.content}
              <p className={`text-xs mt-1 ${m.senderId === currentUserId ? 'text-blue-200' : 'text-gray-400'}`}>
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={sendMessage} className="border-t p-3 flex gap-2">
        <input
          className="flex-1 border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Type a message..."
          value={text} onChange={e => setText(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          Send
        </button>
      </form>
    </div>
  )
}