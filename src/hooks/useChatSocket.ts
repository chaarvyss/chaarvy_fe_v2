import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useDispatch } from 'react-redux'

import { sessionStorageKeys } from 'src/lib/enums'
import { AppDispatch } from 'src/store'
import { chatServicesApi as api } from 'src/store/services/chatServices'

dayjs.extend(customParseFormat)
export const useChatSocket = (conversationId?: string) => {
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline')
  const socket = useRef<WebSocket | null>(null)
  const messageQueue = useRef<any[]>([])
  const dispatch = useDispatch<AppDispatch>()

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
            dispatch({
              type: 'chat/setUserOnlineStatus',
              payload: { userId: String(update.user_id), isOnline: update.status === 'online' }
            })
          } else if (update.event === 'presence:sync' && update.online_users) {
            dispatch({
              type: 'chat/setAllOnlineUsers',
              payload: update.online_users.map(String)
            })
          } else if (update.event === 'message:new') {
            const msg = update.message
            const convId = update.conversation_id
            const myId = sessionStorage.getItem('uid')

            // Format date for UI
            if (msg.created_at) {
              msg.created_at = dayjs(msg.created_at).format('DD-MM-YYYY HH:mm:ss')
            }
            msg.is_mine = String(msg.sender_id) === myId

            // Update messages list manually to avoid API call
            dispatch(
              api.util.updateQueryData('getConversationMessages', { conversationId: convId }, draft => {
                const exists = draft.find(m => m.message_id === msg.message_id)
                if (!exists) {
                  draft.push(msg)
                }
              })
            )

            // Update conversation list preview manually (optimistic)
            dispatch(
              api.util.updateQueryData('getConversations', {}, draft => {
                const conv = draft.find(c => c.conversation_id === convId)
                if (conv) {
                  conv.last_message_preview = msg.content || 'Attachment'
                  conv.last_message_at = msg.created_at
                  if (!msg.is_mine) {
                    conv.unread_count = (conv.unread_count || 0) + 1
                  }
                }
              })
            )

            // To ensure 100% accuracy of the unread badge (especially for parents with different cache keys),
            // if this is an incoming message from someone else, we trigger a background sync of the conversation list.
            if (!msg.is_mine) {
              dispatch(api.util.invalidateTags(['Conversations' as any]))
            }
          } else if (update.event === 'message:edit') {
            const convId = update.conversation_id
            dispatch(
              api.util.updateQueryData('getConversationMessages', { conversationId: convId }, draft => {
                const msg = draft.find(m => m.message_id === update.message_id)
                if (msg) {
                  msg.content = update.content
                  msg.is_edited = 1
                }
              })
            )
          } else {
            // For other events like message:deleted or read receipts, fallback to invalidation
            dispatch(api.util.invalidateTags(['Conversations' as any]))

            const convId = update.conversation_id || update.data?.conversation_id
            if (convId) {
              dispatch(api.util.invalidateTags([{ type: 'Messages' as any, id: convId }]))
            } else if (conversationId) {
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
