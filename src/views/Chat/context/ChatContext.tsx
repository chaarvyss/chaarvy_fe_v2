import React, { createContext, useContext, useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

import { useChatSocket } from 'src/hooks/useChatSocket'
import { RootState } from 'src/store'
import api from 'src/store/services/api'
import {
  useGetConversationsQuery,
  useGetConversationMessagesQuery,
  useSendChatMessageMutation,
  useGetChatContactsQuery,
  useStartDirectChatMutation,
  useCreateGroupMutation,
  useDeleteChatMessageMutation,
  useMarkConversationReadMutation,
  useGetMyKidsQuery,
  ContactCard,
  MessageDetail
} from 'src/store/services/chatServices'
import { useTheme, useMediaQuery } from '@mui/material'

interface ChatContextProps {
  // State
  activeConversationId: string | null
  setActiveConversationId: (id: string | null) => void
  activeStudentId: string | null
  setActiveStudentId: (id: string | null) => void
  searchQuery: string
  setSearchQuery: (q: string) => void
  messageText: string
  setMessageText: React.Dispatch<React.SetStateAction<string>>
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  filePreviewUrl: string | null
  setFilePreviewUrl: (url: string | null) => void
  uploading: boolean
  
  // New Feature States
  showEmojiPicker: boolean
  setShowEmojiPicker: (show: boolean) => void
  replyToMessage: any | null
  setReplyToMessage: (msg: any | null) => void
  editingMessageId: string | null
  setEditingMessageId: (id: string | null) => void
  forwardDialogMsgId: string | null
  setForwardDialogMsgId: (id: string | null) => void
  
  // Selection mode
  isSelectionMode: boolean
  setIsSelectionMode: (mode: boolean) => void
  selectedMessageIds: string[]
  setSelectedMessageIds: (ids: string[]) => void
  
  // Dialog states
  openNewChatDialog: boolean
  setOpenNewChatDialog: (open: boolean) => void
  openNewGroupDialog: boolean
  setOpenNewGroupDialog: (open: boolean) => void
  contactSearch: string
  setContactSearch: (search: string) => void
  groupTitle: string
  setGroupTitle: (title: string) => void
  groupDescription: string
  setGroupDescription: (desc: string) => void
  selectedMemberIds: string[]
  setSelectedMemberIds: (ids: string[]) => void
  
  // Message Action Menu
  anchorEl: HTMLElement | null
  setAnchorEl: (el: HTMLElement | null) => void
  selectedMessageId: string | null
  setSelectedMessageId: (id: string | null) => void
  openDeleteConfirm: boolean
  setOpenDeleteConfirm: (open: boolean) => void
  deleteMode: 'me' | 'everyone'
  setDeleteMode: (mode: 'me' | 'everyone') => void
  
  // Data
  myKids: any[]
  conversations: any[]
  sortedConversations: any[]
  activeConversation: any
  contacts: ContactCard[]
  onlineUsers: Record<string, boolean>
  displayMessages: MessageDetail[]
  loadingConversations: boolean
  loadingMessages: boolean
  fetchingMessages: boolean
  loadingContacts: boolean
  sendingMessage: boolean
  creatingGroup: boolean
  markingRead: boolean
  snapshotUnreadCount: number
  firstUnreadMessageId: string | null
  
  // Refs
  messagesEndRef: React.RefObject<HTMLDivElement>
  unreadDividerRef: React.RefObject<HTMLDivElement>
  fileInputRef: React.RefObject<HTMLInputElement>
  messageContainerRef: React.RefObject<HTMLDivElement>
  
  // Handlers
  handleSendMessage: () => Promise<void>
  handleResend: (msg: MessageDetail) => void
  handleForwardMessage: (targetConversationId: string) => void
  handleStartDirectChat: (contact: ContactCard) => Promise<void>
  handleCreateGroup: () => Promise<void>
  handleConfirmDelete: () => Promise<void>
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleScroll: (e: React.UIEvent<HTMLDivElement>) => void
}

const ChatContext = createContext<ChatContextProps | undefined>(undefined)

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [forwardDialogMsgId, setForwardDialogMsgId] = useState<string | null>(null)

  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])

  const { emitMessage } = useChatSocket()
  const dispatch = useDispatch()
  const onlineUsers = useSelector((state: RootState) => state.chat?.onlineUsers || {})

  const [openNewChatDialog, setOpenNewChatDialog] = useState(false)
  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deleteMode, setDeleteMode] = useState<'me' | 'everyone'>('me')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  const [snapshotUnreadCount, setSnapshotUnreadCount] = useState<number>(0)
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null)
  const prevConversationIdRef = useRef<string | null>(null)

  const [optimisticMessages, setOptimisticMessages] = useState<MessageDetail[]>([])
  const [beforeTimestamp, setBeforeTimestamp] = useState<string | undefined>()
  const previousScrollHeightRef = useRef<number>(0)

  useEffect(() => {
    setBeforeTimestamp(undefined)
  }, [activeConversationId])

  const { data: myKids } = useGetMyKidsQuery()
  const { data: conversations, isLoading: loadingConversations } = useGetConversationsQuery({
    studentContextId: activeStudentId || undefined
  })

  const { currentData: messages, isFetching: fetchingMessages } = useGetConversationMessagesQuery(
    { conversationId: activeConversationId || '', before_timestamp: beforeTimestamp },
    { skip: !activeConversationId }
  )

  const loadingMessages = fetchingMessages && !messages

  useEffect(() => {
    if (messages && messages.length > 0) {
      setOptimisticMessages(prev => {
        const newOptimistic = [...prev]
        for (const realMsg of messages) {
          const matchIdx = newOptimistic.findIndex(o => o.content === realMsg.content && o.status !== 'failed')
          if (matchIdx !== -1) {
            newOptimistic.splice(matchIdx, 1)
          }
        }
        return newOptimistic
      })
    }
  }, [messages])

  const displayMessages = useMemo(() => {
    if (!messages) return optimisticMessages
    return [...messages, ...optimisticMessages]
  }, [messages, optimisticMessages])

  const { data: contacts = [], isLoading: loadingContacts } = useGetChatContactsQuery({
    search: contactSearch,
    studentContextId: activeStudentId || undefined
  })

  const [, { isLoading: sendingMessage }] = useSendChatMessageMutation()
  const [startDirectChat] = useStartDirectChatMutation()
  const [createGroup, { isLoading: creatingGroup }] = useCreateGroupMutation()
  const [deleteMessage] = useDeleteChatMessageMutation()
  const [, { isLoading: markingRead }] = useMarkConversationReadMutation()

  useEffect(() => {
    if (myKids && myKids.length > 0 && !activeStudentId) {
      const primary = myKids.find(k => k.is_primary === 1) || myKids[0]
      setActiveStudentId(primary.student_id)
    }
  }, [myKids, activeStudentId])

  const sortedConversations = useMemo(() => {
    if (!conversations) return []
    return [...conversations].sort((a, b) => {
      const timeA = a.last_message_at ? dayjs(a.last_message_at, 'DD-MM-YYYY HH:mm:ss').valueOf() : 0
      const timeB = b.last_message_at ? dayjs(b.last_message_at, 'DD-MM-YYYY HH:mm:ss').valueOf() : 0
      return timeB - timeA
    })
  }, [conversations])

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  useEffect(() => {
    if (sortedConversations.length > 0 && !activeConversationId && !isMobile) {
      setActiveConversationId(sortedConversations[0].conversation_id)
    }
  }, [sortedConversations, activeConversationId, isMobile])

  useEffect(() => {
    if (activeConversationId && activeConversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = activeConversationId
      const conv = conversations?.find(c => c.conversation_id === activeConversationId)
      setSnapshotUnreadCount(conv?.unread_count ?? 0)
      setFirstUnreadMessageId(null)
    }
  }, [activeConversationId, conversations])

  useEffect(() => {
    if (messages && messages.length > 0 && snapshotUnreadCount > 0 && !firstUnreadMessageId) {
      const startIndex = Math.max(0, messages.length - snapshotUnreadCount)
      setFirstUnreadMessageId(messages[startIndex]?.message_id || null)
    }
  }, [messages, snapshotUnreadCount, firstUnreadMessageId])

  useEffect(() => {
    if (activeConversationId) {
      const timer = setTimeout(() => {
        const latestMsgId = messages && messages.length > 0 ? messages[messages.length - 1].message_id : null
        emitMessage({
          event: 'message:read',
          conversation_id: activeConversationId,
          last_read_message_id: latestMsgId
        })

        // Optimistically clear the unread count in both cache variants
        dispatch(
          api.util.updateQueryData('getConversations', {}, draft => {
            const conv = draft.find(c => c.conversation_id === activeConversationId)
            if (conv) conv.unread_count = 0
          })
        )
        if (activeStudentId) {
          dispatch(
            api.util.updateQueryData('getConversations', { studentContextId: activeStudentId }, draft => {
              const conv = draft.find(c => c.conversation_id === activeConversationId)
              if (conv) conv.unread_count = 0
            })
          )
        }
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [activeConversationId, messages, emitMessage, activeStudentId, dispatch])

  const handleScrollToPosition = useCallback(() => {
    if (beforeTimestamp && messageContainerRef.current) {
      const container = messageContainerRef.current
      const scrollDiff = container.scrollHeight - previousScrollHeightRef.current
      if (scrollDiff > 0 && container.scrollTop <= 1) {
        container.scrollTop = scrollDiff
      }
      return
    }

    if (snapshotUnreadCount > 0 && unreadDividerRef.current) {
      unreadDividerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [snapshotUnreadCount, beforeTimestamp])

  useEffect(() => {
    if (messages && messages.length > 0) {
      const timer = setTimeout(handleScrollToPosition, 100)
      return () => clearTimeout(timer)
    }
  }, [messages, handleScrollToPosition])

  const activeConversation = conversations?.find(c => c.conversation_id === activeConversationId)

  const handleSendMessage = async () => {
    if ((!messageText.trim() && !selectedFile) || !activeConversationId) return

    let mediaUrl: string | undefined = undefined
    let mediaType = 'text'
    let mediaMeta: any = null

    if (selectedFile) {
      setUploading(true)
      try {
        const formData = new FormData()
        formData.append('file', selectedFile)
        const clcode = localStorage.getItem('clcode') || ''
        const token = localStorage.getItem('authToken') || ''

        const response = await fetch(`/common/chat/upload?conversation_id=${activeConversationId}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            clcode: clcode
          },
          body: formData
        })

        if (response.ok) {
          const uploadRes = await response.json()
          mediaUrl = uploadRes.media_url
          mediaType = uploadRes.media_type
          mediaMeta = uploadRes.media_meta
        }
      } catch (err) {
        console.error('File upload failed', err)
      } finally {
        setUploading(false)
      }
    }

    if (editingMessageId) {
      emitMessage({
        event: 'message:edit',
        message_id: editingMessageId,
        content: messageText.trim()
      })
      setEditingMessageId(null)
    } else {
      const tempId = `temp-${Date.now()}`
      const newOptimisticMsg: MessageDetail = {
        message_id: tempId,
        conversation_id: activeConversationId,
        sender_id: sessionStorage.getItem('uid') || '',
        sender_type: 'staff',
        message_type: mediaType as any,
        content: messageText.trim() || undefined,
        media_url: mediaUrl,
        media_meta: mediaMeta,
        reply_to_message_id: replyToMessage?.message_id || undefined,
        created_at: dayjs().format('DD-MM-YYYY HH:mm:ss'),
        is_edited: 0,
        is_deleted: 0,
        is_mine: true,
        status: 'sending'
      }
      setOptimisticMessages(prev => [...prev, newOptimisticMsg])

      emitMessage({
        event: 'message:send',
        conversation_id: activeConversationId,
        content: messageText.trim() || undefined,
        message_type: mediaType,
        media_url: mediaUrl,
        media_meta: mediaMeta,
        reply_to_message_id: replyToMessage?.message_id || undefined,
        student_context_id: activeStudentId || undefined
      })
      setReplyToMessage(null)

      setTimeout(() => {
        setOptimisticMessages(prev => prev.map(m => (m.message_id === tempId ? { ...m, status: 'failed' } : m)))
      }, 10000)
    }

    setMessageText('')
    setSelectedFile(null)
    setFilePreviewUrl(null)
  }

  const handleResend = (msg: MessageDetail) => {
    setOptimisticMessages(prev => prev.filter(m => m.message_id !== msg.message_id))

    const tempId = `temp-${Date.now()}`
    const newOptimisticMsg: MessageDetail = {
      ...msg,
      message_id: tempId,
      status: 'sending',
      created_at: dayjs().format('DD-MM-YYYY HH:mm:ss')
    }
    setOptimisticMessages(prev => [...prev, newOptimisticMsg])

    emitMessage({
      event: 'message:send',
      conversation_id: activeConversationId,
      content: msg.content,
      message_type: msg.message_type,
      media_url: msg.media_url,
      media_meta: msg.media_meta,
      reply_to_message_id: msg.reply_to_message_id,
      student_context_id: activeStudentId || undefined
    })

    setTimeout(() => {
      setOptimisticMessages(prev => prev.map(m => (m.message_id === tempId ? { ...m, status: 'failed' } : m)))
    }, 10000)
  }

  const handleForwardMessage = (targetConversationId: string) => {
    const msg = messages?.find(m => m.message_id === forwardDialogMsgId)
    if (msg) {
      emitMessage({
        event: 'message:send',
        conversation_id: targetConversationId,
        content: msg.content,
        message_type: msg.message_type,
        media_url: msg.media_url,
        media_meta: msg.media_meta,
        forwarded_from_id: msg.sender_id,
        student_context_id: activeStudentId || undefined
      })
    }
    setForwardDialogMsgId(null)
  }

  const handleStartDirectChat = async (contact: ContactCard) => {
    try {
      const res = await startDirectChat({
        target_id: contact.id,
        target_type: contact.user_type,
        student_context_id: activeStudentId || undefined
      }).unwrap()

      setActiveConversationId(res.conversation_id)
      setOpenNewChatDialog(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleCreateGroup = async () => {
    if (!groupTitle.trim()) return
    try {
      const members = selectedMemberIds.map(uid => ({
        user_id: uid,
        user_type: 'staff',
        role: 'member'
      }))

      const res = await createGroup({
        title: groupTitle.trim(),
        description: groupDescription.trim() || undefined,
        member_ids: members
      }).unwrap()

      setActiveConversationId(res.conversation_id)
      setOpenNewGroupDialog(false)
      setGroupTitle('')
      setGroupDescription('')
      setSelectedMemberIds([])
    } catch (err) {
      console.error(err)
    }
  }

  const handleConfirmDelete = async () => {
    if (selectedMessageIds.length > 0 && activeConversationId) {
      for (const msgId of selectedMessageIds) {
        deleteMessage({
          messageId: msgId,
          deleteFor: deleteMode,
          conversationId: activeConversationId
        })
      }
      setSelectedMessageIds([])
      setIsSelectionMode(false)
      setOpenDeleteConfirm(false)
      return
    }

    if (!selectedMessageId || !activeConversationId) return
    await deleteMessage({
      messageId: selectedMessageId,
      deleteFor: deleteMode,
      conversationId: activeConversationId
    })
    setOpenDeleteConfirm(false)
    setAnchorEl(null)
    setSelectedMessageId(null)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setSelectedFile(file)
      if (file.type.startsWith('image/')) {
        setFilePreviewUrl(URL.createObjectURL(file))
      } else {
        setFilePreviewUrl(null)
      }
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollTop <= 1 && !fetchingMessages && messages && messages.length >= 50) {
      previousScrollHeightRef.current = target.scrollHeight
      const oldestMessage = messages[0]
      if (oldestMessage && oldestMessage.created_at) {
        setBeforeTimestamp(oldestMessage.created_at)
      }
    }
  }

  const value = {
    activeConversationId, setActiveConversationId,
    activeStudentId, setActiveStudentId,
    searchQuery, setSearchQuery,
    messageText, setMessageText,
    selectedFile, setSelectedFile,
    filePreviewUrl, setFilePreviewUrl,
    uploading,
    showEmojiPicker, setShowEmojiPicker,
    replyToMessage, setReplyToMessage,
    editingMessageId, setEditingMessageId,
    forwardDialogMsgId, setForwardDialogMsgId,
    isSelectionMode, setIsSelectionMode,
    selectedMessageIds, setSelectedMessageIds,
    openNewChatDialog, setOpenNewChatDialog,
    openNewGroupDialog, setOpenNewGroupDialog,
    contactSearch, setContactSearch,
    groupTitle, setGroupTitle,
    groupDescription, setGroupDescription,
    selectedMemberIds, setSelectedMemberIds,
    anchorEl, setAnchorEl,
    selectedMessageId, setSelectedMessageId,
    openDeleteConfirm, setOpenDeleteConfirm,
    deleteMode, setDeleteMode,
    myKids: myKids || [],
    conversations: conversations || [],
    sortedConversations,
    activeConversation,
    contacts,
    onlineUsers,
    displayMessages,
    loadingConversations,
    loadingMessages,
    fetchingMessages,
    loadingContacts,
    sendingMessage,
    creatingGroup,
    markingRead,
    snapshotUnreadCount,
    firstUnreadMessageId,
    messagesEndRef,
    unreadDividerRef,
    fileInputRef,
    messageContainerRef,
    handleSendMessage,
    handleResend,
    handleForwardMessage,
    handleStartDirectChat,
    handleCreateGroup,
    handleConfirmDelete,
    handleFileChange,
    handleScroll
  }

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  )
}

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
