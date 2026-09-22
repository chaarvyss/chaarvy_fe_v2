import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { sessionStorageKeys } from 'src/lib/enums'
import api from 'src/store/services/api'

export const useChatSocket = (conversationId?: string) => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline')
  const socket = useRef<WebSocket | null>(null)
  const messageQueue = useRef<any[]>([])
  const dispatch = useDispatch()

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout
    let lockReconnect = false
    let retryCount = 0

    const token = sessionStorage.getItem(sessionStorageKeys.accessToken) || localStorage.getItem('authToken')
    const clcode = sessionStorage.getItem(sessionStorageKeys.clientCode) || localStorage.getItem('clcode')

    if (!token || !clcode) return

    const connect = () => {
      if (lockReconnect) return
      lockReconnect = true

      const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/^http/, 'ws') || 'ws://127.0.0.1:8004'
      const socketUrl = `${baseUrl}/common/chat/ws?token=${token}&clcode=${clcode}`

      socket.current = new WebSocket(socketUrl)

      let pingInterval: NodeJS.Timeout

      socket.current.onopen = () => {
        setConnectionStatus('online')
        retryCount = 0
        lockReconnect = false

        // Broadcast presence
        socket?.current?.send(JSON.stringify({ event: 'presence:online' }))

        // Flush message queue
        while (messageQueue.current.length > 0) {
          const payload = messageQueue.current.shift()
          socket?.current?.send(JSON.stringify(payload))
        }

        // Start heartbeat ping to keep connection alive in aggressive browsers (like Edge)
        pingInterval = setInterval(() => {
          if (socket.current?.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify({ event: 'ping' }))
          }
        }, 25000)
      }

      socket.current.onmessage = event => {
        try {
          const update = JSON.parse(event.data)

          if (update.event === 'presence:update' && update.user_id) {
            // Update Redux state dynamically for online users
            dispatch({
              type: 'chat/setUserOnlineStatus',
              payload: { userId: update.user_id, isOnline: update.status === 'online' }
            })
          } else {
            // Any other incoming event should invalidate the conversations list to update unread counts and latest messages
            dispatch(api.util.invalidateTags(['Conversations' as any]))

            const convId = update.conversation_id || update.data?.conversation_id

            // If we receive a message for a specific conversation, invalidate that conversation's messages
            if (convId) {
              dispatch(api.util.invalidateTags([{ type: 'Messages' as any, id: convId }]))
            } else if (conversationId) {
              // Fallback: invalidate the currently active conversation just in case
              dispatch(api.util.invalidateTags([{ type: 'Messages' as any, id: conversationId }]))
            }
          }
        } catch (error) {
          console.error('Error parsing chat websocket message', error)
        }
      }

      socket.current.onclose = () => {
        setConnectionStatus('offline')
        lockReconnect = false
        clearInterval(pingInterval)

        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        reconnectTimer = setTimeout(() => {
          retryCount++
          connect()
        }, delay)
      }

      socket.current.onerror = () => {
        socket.current?.close() // Force close to trigger onclose logic
      }
    }

    connect()

    // Force sync when tab regains focus (handles edge cases where browser slept the tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        dispatch(api.util.invalidateTags(['Conversations' as any]))
        if (socket.current?.readyState !== WebSocket.OPEN) {
          connect()
        }
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      clearTimeout(reconnectTimer)
      if (socket.current) {
        // Prevent reconnect loop on unmount
        socket.current.onclose = null
        socket.current.close()
      }
    }
  }, [dispatch, conversationId])

  const emitMessage = useCallback((payload: any) => {
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify(payload))
    } else {
      console.warn('WebSocket is not connected or not ready. Queuing payload.', payload)
      messageQueue.current.push(payload)
    }
  }, [])

  return { connectionStatus, emitMessage }
}
