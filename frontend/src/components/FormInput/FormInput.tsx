"use client"

import { usePathname } from "next/navigation"
import { useState } from "react"
import { inputMessageToReduxStore, selectMessage } from "@/features/messageSlice"
import { useAppDispatch, useAppSelector } from "@/hooks/useRTK"
import { InitialStateType } from "@/types/types"

const FormInput = () => {
  const dispatch = useAppDispatch()
  const messages: InitialStateType = useAppSelector(selectMessage)
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const pathname = usePathname()

  const clearChat = () => {
    dispatch(inputMessageToReduxStore({ pathname, clear: true }))
  }

  const sendMessage = async () => {
    setIsLoading(true)
    dispatch(inputMessageToReduxStore({
      pathname,
      message,
      isMan: true
    }))

    const chatHistory = messages[pathname] || []
    const formattedMessages = chatHistory.map((chat) => ({
      role: chat.isMan ? "user" : "assistant",
      content: chat.message
    }))

    const url = '/api/inference'
    const response = await fetch(`${url}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages: formattedMessages, message })
    })

    const { aiMessage } = await response.json()

    dispatch(inputMessageToReduxStore({
      pathname,
      message: aiMessage,
      isMan: false
    }))

    setMessage('')
    setIsLoading(false)
  }

  return (
    <div className="w-full justify-center items-center">
      <label htmlFor="chat" className="sr-only">
        Your Message
      </label>
      <div className="flex items-center px-3 py-2 rounded-lg bg-gray-50">
        <button
          onClick={clearChat}
          className="inline-flex justify-center p-2 text-red-600 rounded-full cursor-pointer hover:bg-red-100"
        >
          <svg
            className="w-5 h-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3 6h18v2H3V6zm2 3h14v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V9zm5 2v8h2v-8H8zm4 0v8h2v-8h-2z" />
          </svg>
          <span className="sr-only">Clear Chat</span>
        </button>
        <textarea
          id="chat"
          rows={3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="block mx-4 p-2.5 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Your Message ..."
        ></textarea>
        <button
          onClick={sendMessage}
          className="inline-flex justify-center p-2 text-blue-600 rounded-full cursor-pointer hover:bg-blue-100"
        >
          {
            !isLoading ? (
              <svg
                className="w-5 h-5 rotate-90 rtl:-rotate-90"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="currentColor"
                viewBox="0 0 18 20"
              >
                <path d="m17.914 18.594-8-18a1 1 0 0 0-1.828 0l-8 18a1 1 0 0 0 1.157 1.376L8 18.281V9a1 1 0 0 1 2 0v9.281l6.758 1.689a1 1 0 0 0 1.156-1.376Z" />
              </svg>
            ) : (
              <div className="flex justify-center" aria-label="読み込み中">
                <div className="animate-spin w-5 h-5 border-4 border-blue-500 rounded-full border-t-transparent"></div>
              </div>
            )
          }
          <span className="sr-only">Send Message</span>
        </button>
      </div>
    </div>
  )

}

export default FormInput