import { useEffect, useState, useRef } from 'react'
import axios from 'axios'
import { io } from 'socket.io-client'

const socket = io('http://localhost:8000')

export default function ChatBox({ bookingId, currentUserId }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
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
    if (!text.trim() || sending) return
    setSending(true)
    try {
      await axios.post('http://localhost:8000/api/messages',
        { bookingId, content: text },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setText('')
    } catch (err) {
      console.error(err)
    } finally {
      setSending(false)
    }
  }

  // Group messages by date
  const grouped = messages.reduce((acc, msg) => {
    const day = new Date(msg.createdAt).toDateString()
    if (!acc[day]) acc[day] = []
    acc[day].push(msg)
    return acc
  }, {})

  const formatDate = (dateStr) => {
    const d = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)
    if (d.toDateString() === today.toDateString()) return 'Today'
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }

  return (
    <div className="flex flex-col h-full bg-[#f0f2f5]">

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-white rounded-2xl px-6 py-4 shadow-sm text-center max-w-xs">
              <p className="text-2xl mb-2">👋</p>
              <p className="text-gray-600 text-sm font-medium">No messages yet</p>
              <p className="text-gray-400 text-xs mt-1">Say hello to get started!</p>
            </div>
          </div>
        )}

        {Object.entries(grouped).map(([day, msgs]) => (
          <div key={day}>
            {/* Date separator */}
            <div className="flex items-center justify-center my-4">
              <span className="bg-white text-gray-400 text-[10px] font-medium px-3 py-1 rounded-full shadow-sm">
                {formatDate(day)}
              </span>
            </div>

            {msgs.map((m, i) => {
              const isMe = m.senderId === currentUserId
              const showTail = i === msgs.length - 1 ||
                msgs[i + 1]?.senderId !== m.senderId

              return (
                <div key={m.id}
                  className={`flex mb-1 ${isMe ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[70%] px-3 py-2 shadow-sm text-sm
                    ${isMe
                      ? `bg-[#2563EB] text-white ${showTail ? 'rounded-2xl rounded-br-sm' : 'rounded-2xl'}`
                      : `bg-white text-gray-800 ${showTail ? 'rounded-2xl rounded-bl-sm' : 'rounded-2xl'}`
                    }`}>
                    <p className="leading-relaxed break-words">{m.content}</p>
                    <p className={`text-[10px] mt-1 text-right
                      ${isMe ? 'text-blue-200' : 'text-gray-400'}`}>
                      {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="bg-white border-t border-gray-100 px-4 py-3">
        <form onSubmit={sendMessage} className="flex items-center gap-3">
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2.5 flex items-center">
            <input
              className="flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder-gray-400"
              placeholder="Type a message..."
              value={text}
              onChange={e => setText(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-[#2563EB] rounded-full flex items-center justify-center flex-shrink-0 hover:bg-blue-700 transition disabled:opacity-50"
          >
            <svg className="w-4 h-4 text-white translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.269 20.876L5.999 12zm0 0h7.5" />
            </svg>
          </button>
        </form>
      </div>

    </div>
  )
}