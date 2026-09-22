import {
  Box,
  Card,
  Grid,
  Typography,
  TextField,
  IconButton,
  Button,
  Avatar,
  Badge,
  Chip,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Menu,
  MenuItem,
  FormControl,
  Select,
  InputLabel,
  Tooltip,
  Alert,
  Divider,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Checkbox,
  Skeleton
} from '@mui/material'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import EmojiPicker from 'emoji-picker-react'
import AccountMultiplePlusIcon from 'mdi-material-ui/AccountMultiplePlus'
import AccountSchoolIcon from 'mdi-material-ui/AccountSchool'
import AlertCircleOutlineIcon from 'mdi-material-ui/AlertCircleOutline'
import ArrowLeftIcon from 'mdi-material-ui/ArrowLeft'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import CheckIcon from 'mdi-material-ui/Check'
import CheckAllIcon from 'mdi-material-ui/CheckAll'
import ClockOutlineIcon from 'mdi-material-ui/ClockOutline'
import CloseIcon from 'mdi-material-ui/Close'
import DeleteOutlineIcon from 'mdi-material-ui/DeleteOutline'
import DotsVerticalIcon from 'mdi-material-ui/DotsVertical'
import EmoticonOutlineIcon from 'mdi-material-ui/EmoticonOutline'
import MagnifyIcon from 'mdi-material-ui/Magnify'
import PaperclipIcon from 'mdi-material-ui/Paperclip'
import PencilOutlineIcon from 'mdi-material-ui/PencilOutline'
import PlusIcon from 'mdi-material-ui/Plus'
import ReplyIcon from 'mdi-material-ui/Reply'
import SendIcon from 'mdi-material-ui/Send'
import ShareOutlineIcon from 'mdi-material-ui/ShareOutline'
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useSelector } from 'react-redux'

import { useChatSocket } from 'src/hooks/useChatSocket'
import { RootState } from 'src/store'
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

dayjs.extend(customParseFormat)

const ChatView: React.FC = () => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)
  const [activeStudentId, setActiveStudentId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [messageText, setMessageText] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)

  // New Feature States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [replyToMessage, setReplyToMessage] = useState<any | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [forwardDialogMsgId, setForwardDialogMsgId] = useState<string | null>(null)

  // Selection mode
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState<string[]>([])

  // Hooks
  const { emitMessage } = useChatSocket()
  const onlineUsers = useSelector((state: RootState) => state.chat?.onlineUsers)

  // Dialog states
  const [openNewChatDialog, setOpenNewChatDialog] = useState(false)
  const [openNewGroupDialog, setOpenNewGroupDialog] = useState(false)
  const [contactSearch, setContactSearch] = useState('')
  const [groupTitle, setGroupTitle] = useState('')
  const [groupDescription, setGroupDescription] = useState('')
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])

  // Message Action Menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false)
  const [deleteMode, setDeleteMode] = useState<'me' | 'everyone'>('me')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const unreadDividerRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const messageContainerRef = useRef<HTMLDivElement>(null)

  // Track unread count at the moment conversation was opened (before markRead resets it)
  const [snapshotUnreadCount, setSnapshotUnreadCount] = useState<number>(0)
  const prevConversationIdRef = useRef<string | null>(null)

  const [optimisticMessages, setOptimisticMessages] = useState<MessageDetail[]>([])

  // Pagination for infinite scroll
  const [beforeTimestamp, setBeforeTimestamp] = useState<string | undefined>()
  const previousScrollHeightRef = useRef<number>(0)

  // Reset pagination when switching conversations
  useEffect(() => {
    setBeforeTimestamp(undefined)
  }, [activeConversationId])

  // RTK Queries
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

  const { data: contacts, isLoading: loadingContacts } = useGetChatContactsQuery({
    search: contactSearch,
    studentContextId: activeStudentId || undefined
  })

  // Mutations
  const [, { isLoading: sendingMessage }] = useSendChatMessageMutation()
  const [startDirectChat] = useStartDirectChatMutation()
  const [createGroup, { isLoading: creatingGroup }] = useCreateGroupMutation()
  const [deleteMessage] = useDeleteChatMessageMutation()
  const [, { isLoading: markingRead }] = useMarkConversationReadMutation()

  // Initialize active kid if parent
  useEffect(() => {
    if (myKids && myKids.length > 0 && !activeStudentId) {
      const primary = myKids.find(k => k.is_primary === 1) || myKids[0]
      setActiveStudentId(primary.student_id)
    }
  }, [myKids, activeStudentId])

  // Sort conversations by last_message_at (most recent first)
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

  // Select first conversation by default (from sorted list)
  useEffect(() => {
    if (sortedConversations.length > 0 && !activeConversationId && !isMobile) {
      setActiveConversationId(sortedConversations[0].conversation_id)
    }
  }, [sortedConversations, activeConversationId, isMobile])

  // Snapshot unread count before marking as read
  useEffect(() => {
    if (activeConversationId && activeConversationId !== prevConversationIdRef.current) {
      prevConversationIdRef.current = activeConversationId
      const conv = conversations?.find(c => c.conversation_id === activeConversationId)
      setSnapshotUnreadCount(conv?.unread_count ?? 0)
    }
  }, [activeConversationId, conversations])

  // Mark as read when opening conversation (delayed slightly so snapshot captures first)
  useEffect(() => {
    if (activeConversationId) {
      const timer = setTimeout(() => {
        const latestMsgId = messages && messages.length > 0 ? messages[messages.length - 1].message_id : null
        emitMessage({
          event: 'message:read',
          conversation_id: activeConversationId,
          last_read_message_id: latestMsgId
        })
      }, 300)

      return () => clearTimeout(timer)
    }
  }, [activeConversationId, messages, emitMessage])

  // Smart scroll: to unread divider if unread messages exist, otherwise to bottom
  const handleScrollToPosition = useCallback(() => {
    // If we're loading older messages (beforeTimestamp is set), we want to preserve scroll position
    // instead of jumping to the bottom/divider.
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
      // Small delay to ensure DOM has rendered the divider
      const timer = setTimeout(handleScrollToPosition, 100)

      return () => clearTimeout(timer)
    }
  }, [messages, handleScrollToPosition])

  const activeConversation = conversations?.find(c => c.conversation_id === activeConversationId)

  // Send message handler
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

  // Direct chat initiation
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

  // Create group handler
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

  // Soft Delete Handler
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

  // File selection
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

  return (
    <Card sx={{ height: 'calc(100vh - 160px)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Top Banner with Multi-Kid Switcher if Parent */}
      {myKids && myKids.length > 0 && (
        <Box
          sx={{
            p: 2,
            bgcolor: 'background.default',
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountSchoolIcon color='primary' />
            <Typography variant='subtitle1' fontWeight={600}>
              Parent Portal Active Child:
            </Typography>
          </Box>
          <FormControl size='small' sx={{ minWidth: 260 }}>
            <InputLabel id='child-select-label'>Select Child</InputLabel>
            <Select
              labelId='child-select-label'
              value={activeStudentId || ''}
              label='Select Child'
              onChange={e => setActiveStudentId(e.target.value)}
            >
              {myKids.map(k => (
                <MenuItem key={k.student_id} value={k.student_id}>
                  {k.student_name} ({k.section_name || 'Class'})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      )}

      <Grid container sx={{ flex: 1, height: '100%', overflow: 'hidden' }}>
        {/* LEFT SIDEBAR: Conversations & Search */}
        <Grid
          item
          xs={12}
          md={4}
          lg={3.5}
          sx={{
            display: { xs: activeConversationId ? 'none' : 'flex', md: 'flex' },
            flexDirection: 'column',
            height: '100%',
            borderRight: 1,
            borderColor: 'divider'
          }}
        >
          {/* Header & Actions */}
          <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant='h6' fontWeight={700}>
                Campus Chat
              </Typography>
              <Box>
                <Tooltip title='Create Group'>
                  <IconButton size='small' onClick={() => setOpenNewGroupDialog(true)} sx={{ mr: 0.5 }}>
                    <AccountMultiplePlusIcon fontSize='small' />
                  </IconButton>
                </Tooltip>
                <Tooltip title='Start Chat'>
                  <IconButton size='small' color='primary' onClick={() => setOpenNewChatDialog(true)}>
                    <PlusIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
            <TextField
              fullWidth
              size='small'
              placeholder='Search conversations...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: <MagnifyIcon fontSize='small' sx={{ mr: 1, color: 'text.secondary' }} />
              }}
            />
          </Box>

          {/* Conversation List */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loadingConversations ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : sortedConversations.length > 0 ? (
              <List disablePadding>
                {(() => {
                  const dms = sortedConversations.filter(
                    c => c.conversation_type === 'direct' && c.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  const groups = sortedConversations.filter(
                    c => c.conversation_type !== 'direct' && c.title.toLowerCase().includes(searchQuery.toLowerCase())
                  )

                  return (
                    <>
                      {dms.length > 0 && (
                        <>
                          <Typography
                            variant='caption'
                            sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'text.secondary' }}
                          >
                            Direct Messages
                          </Typography>
                          {dms.map(conv => {
                            const isSelected = conv.conversation_id === activeConversationId

                            return (
                              <ListItem
                                key={conv.conversation_id}
                                disablePadding
                                sx={{
                                  bgcolor: isSelected ? 'action.selected' : 'inherit',
                                  borderLeft: isSelected ? 4 : 0,
                                  borderColor: 'primary.main'
                                }}
                              >
                                <ListItemButton
                                  onClick={() => setActiveConversationId(conv.conversation_id)}
                                  sx={{ py: 1.5 }}
                                >
                                  <ListItemAvatar>
                                    <Badge badgeContent={conv.unread_count} color='error'>
                                      <Avatar src={conv.avatar_url || undefined}>
                                        {conv.conversation_type === 'channel' ? <BullhornOutlineIcon /> : conv.title[0]}
                                      </Avatar>
                                    </Badge>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                      >
                                        <Typography
                                          variant='subtitle2'
                                          noWrap
                                          sx={{ fontWeight: conv.unread_count > 0 ? 700 : 500 }}
                                        >
                                          {conv.title}
                                        </Typography>
                                        <Typography
                                          variant='caption'
                                          sx={{ color: 'text.secondary', minWidth: 60, textAlign: 'right' }}
                                        >
                                          {conv.last_message_at
                                            ? dayjs(conv.last_message_at, 'DD-MM-YYYY HH:mm:ss').format('MMM D')
                                            : ''}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        variant='body2'
                                        color='text.secondary'
                                        noWrap
                                        sx={{ fontWeight: conv.unread_count > 0 ? 600 : 400 }}
                                      >
                                        {conv.last_message_preview || 'No messages yet'}
                                      </Typography>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                            )
                          })}
                        </>
                      )}

                      {groups.length > 0 && (
                        <>
                          <Typography
                            variant='caption'
                            sx={{ px: 2, py: 1, display: 'block', fontWeight: 'bold', color: 'text.secondary' }}
                          >
                            Groups & Channels
                          </Typography>
                          {groups.map(conv => {
                            const isSelected = conv.conversation_id === activeConversationId

                            return (
                              <ListItem
                                key={conv.conversation_id}
                                disablePadding
                                sx={{
                                  bgcolor: isSelected ? 'action.selected' : 'inherit',
                                  borderLeft: isSelected ? 4 : 0,
                                  borderColor: 'primary.main'
                                }}
                              >
                                <ListItemButton
                                  onClick={() => setActiveConversationId(conv.conversation_id)}
                                  sx={{ py: 1.5 }}
                                >
                                  <ListItemAvatar>
                                    <Badge badgeContent={conv.unread_count} color='error'>
                                      <Avatar src={conv.avatar_url || undefined}>
                                        {conv.conversation_type === 'channel' ? <BullhornOutlineIcon /> : conv.title[0]}
                                      </Avatar>
                                    </Badge>
                                  </ListItemAvatar>
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                      >
                                        <Typography
                                          variant='subtitle2'
                                          noWrap
                                          sx={{ fontWeight: conv.unread_count > 0 ? 700 : 500 }}
                                        >
                                          {conv.title}
                                        </Typography>
                                        <Typography
                                          variant='caption'
                                          sx={{ color: 'text.secondary', minWidth: 60, textAlign: 'right' }}
                                        >
                                          {conv.last_message_at
                                            ? dayjs(conv.last_message_at, 'DD-MM-YYYY HH:mm:ss').format('MMM D')
                                            : ''}
                                        </Typography>
                                      </Box>
                                    }
                                    secondary={
                                      <Typography
                                        variant='body2'
                                        color='text.secondary'
                                        noWrap
                                        sx={{ fontWeight: conv.unread_count > 0 ? 600 : 400 }}
                                      >
                                        {conv.last_message_preview || 'No messages yet'}
                                      </Typography>
                                    }
                                  />
                                </ListItemButton>
                              </ListItem>
                            )
                          })}
                        </>
                      )}
                    </>
                  )
                })()}
              </List>
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant='body2' color='text.secondary'>
                  No conversations found. Click '+' to start chatting!
                </Typography>
              </Box>
            )}
          </Box>
        </Grid>

        {/* RIGHT SIDE: Active Chat Thread */}
        <Grid
          item
          xs={12}
          md={8}
          lg={8.5}
          sx={{
            display: { xs: activeConversationId ? 'flex' : 'none', md: 'flex' },
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {activeConversation ? (
            <>
              {/* Chat Thread Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: 1,
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <IconButton
                    onClick={() => setActiveConversationId(null)}
                    sx={{ display: { xs: 'flex', md: 'none' }, mr: -1 }}
                  >
                    <ArrowLeftIcon />
                  </IconButton>
                  <Avatar src={activeConversation.avatar_url || undefined}>
                    {activeConversation.conversation_type === 'channel' ? (
                      <BullhornOutlineIcon />
                    ) : (
                      activeConversation.title[0]
                    )}
                  </Avatar>
                  <Box>
                    <Typography variant='subtitle1' fontWeight={700}>
                      {activeConversation.title}
                    </Typography>
                    <Typography variant='caption' color='text.secondary'>
                      {activeConversation.description ||
                        (activeConversation.conversation_type === 'direct' ? 'Internal Direct Chat' : 'Campus Group')}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {isSelectionMode ? (
                    <>
                      <Typography variant='body2'>{selectedMessageIds.length} Selected</Typography>
                      <IconButton
                        color='error'
                        onClick={() => setOpenDeleteConfirm(true)}
                        disabled={selectedMessageIds.length === 0}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                      <IconButton
                        onClick={() => {
                          setIsSelectionMode(false)
                          setSelectedMessageIds([])
                        }}
                      >
                        <CloseIcon />
                      </IconButton>
                    </>
                  ) : (
                    <Tooltip title='Select Messages'>
                      <IconButton onClick={() => setIsSelectionMode(true)}>
                        <CheckAllIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </Box>

              {/* Background API Fetching Loader */}
              {(fetchingMessages || markingRead) && !loadingMessages && <LinearProgress sx={{ height: 3 }} />}

              {/* Messages Body */}
              <Box
                ref={messageContainerRef}
                onScroll={(e: React.UIEvent<HTMLDivElement>) => {
                  const target = e.currentTarget

                  // Trigger fetch if scrolled to top, not currently fetching, and we have at least 50 messages (likely more to fetch)
                  if (target.scrollTop <= 1 && !fetchingMessages && messages && messages.length >= 50) {
                    previousScrollHeightRef.current = target.scrollHeight
                    const oldestMessage = messages[0]
                    if (oldestMessage && oldestMessage.created_at) {
                      setBeforeTimestamp(oldestMessage.created_at)
                    }
                  }
                }}
                sx={{ flex: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 1.5 }}
              >
                {loadingMessages ? (
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}
                  >
                    {[1, 2, 3, 4, 5].map(item => (
                      <Box
                        key={item}
                        sx={{ display: 'flex', alignSelf: item % 2 === 0 ? 'flex-end' : 'flex-start', maxWidth: '70%' }}
                      >
                        <Skeleton
                          variant='rectangular'
                          width={Math.floor(Math.random() * 100) + 150}
                          height={60}
                          sx={{ borderRadius: 2 }}
                        />
                      </Box>
                    ))}
                  </Box>
                ) : displayMessages && displayMessages.length > 0 ? (
                  displayMessages.map((msg, index) => {
                    const isMine = msg.is_mine
                    const isDeleted = Boolean(msg.is_deleted)

                    // Show "New Messages" divider before the first unread message
                    const unreadStartIndex = displayMessages.length - snapshotUnreadCount
                    const showUnreadDivider = snapshotUnreadCount > 0 && index === unreadStartIndex

                    return (
                      <React.Fragment key={msg.message_id}>
                        {showUnreadDivider && (
                          <Box ref={unreadDividerRef} sx={{ my: 1 }}>
                            <Divider
                              sx={{
                                '&::before, &::after': {
                                  borderColor: 'error.light'
                                }
                              }}
                            >
                              <Chip
                                label={`${snapshotUnreadCount} New Message${snapshotUnreadCount > 1 ? 's' : ''}`}
                                size='small'
                                color='error'
                                variant='outlined'
                                sx={{ fontSize: '0.72rem', fontWeight: 600, height: 22 }}
                              />
                            </Divider>
                          </Box>
                        )}
                        <Box
                          sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            alignSelf: isMine ? 'flex-end' : 'flex-start',
                            maxWidth: '90%',
                            gap: 1
                          }}
                        >
                          {isSelectionMode && !isDeleted && (
                            <Checkbox
                              checked={selectedMessageIds.includes(msg.message_id)}
                              onChange={e => {
                                if (e.target.checked) setSelectedMessageIds([...selectedMessageIds, msg.message_id])
                                else setSelectedMessageIds(selectedMessageIds.filter(id => id !== msg.message_id))
                              }}
                              sx={{ order: isMine ? 2 : 0, p: 0.5 }}
                            />
                          )}
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isMine ? 'flex-end' : 'flex-start',
                              flex: 1,
                              order: 1
                            }}
                          >
                            {!isMine && activeConversation?.conversation_type !== 'direct' && (
                              <Typography
                                variant='caption'
                                sx={{ mb: 0.03, ml: 0.5, fontWeight: 100, fontSize: '0.7rem' }}
                              >
                                {msg.sender_name || 'Member'}
                              </Typography>
                            )}
                            <Box
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: isDeleted ? 'action.hover' : isMine ? 'primary.main' : 'background.paper',
                                color: isDeleted ? 'text.secondary' : isMine ? 'primary.contrastText' : 'text.primary',
                                boxShadow: 1,
                                position: 'relative',
                                fontStyle: isDeleted ? 'italic' : 'normal'
                              }}
                            >
                              {/* Forwarded Indicator */}
                              {msg.forwarded_from_id && (
                                <Typography
                                  variant='caption'
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 0.5,
                                    color: isMine ? 'white' : '',
                                    fontStyle: 'italic',
                                    opacity: 0.8,
                                    mb: 0.5
                                  }}
                                >
                                  <ShareOutlineIcon sx={{ fontSize: 12 }} /> Forwarded
                                </Typography>
                              )}

                              {/* Reply Indicator */}
                              {msg.reply_to_message_id && (
                                <Box
                                  sx={{
                                    p: 1,
                                    mb: 1,
                                    bgcolor: 'background.paper',
                                    borderRadius: 1,
                                    borderLeft: 3,
                                    borderColor: 'primary.main',
                                    opacity: 0.85
                                  }}
                                >
                                  <Typography
                                    variant='caption'
                                    fontWeight={600}
                                    display='flex'
                                    alignItems='center'
                                    gap={0.5}
                                  >
                                    <ReplyIcon sx={{ fontSize: 14 }} /> Replied
                                  </Typography>
                                </Box>
                              )}
                              {/* Image Attachment */}
                              {!isDeleted && msg.message_type === 'image' && msg.media_url && (
                                <Box
                                  component='img'
                                  src={msg.media_url}
                                  alt='Attachment'
                                  sx={{
                                    maxWidth: 300,
                                    maxHeight: 220,
                                    borderRadius: 1.5,
                                    mb: 1,
                                    display: 'block',
                                    objectFit: 'cover'
                                  }}
                                />
                              )}

                              {/* Video Attachment */}
                              {!isDeleted && msg.message_type === 'video' && msg.media_url && (
                                <Box sx={{ maxWidth: 340, mb: 1 }}>
                                  <video controls src={msg.media_url} style={{ width: '100%', borderRadius: 8 }} />
                                </Box>
                              )}

                              {/* Message Content */}
                              {msg.content && (
                                <Typography
                                  variant='body2'
                                  sx={{
                                    color: msg.is_mine ? 'white' : '',
                                    whiteSpace: 'pre-wrap',
                                    wordBreak: 'break-word'
                                  }}
                                >
                                  {msg.content}
                                </Typography>
                              )}

                              {/* Timestamp & Soft Delete Button */}
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'flex-end',
                                  gap: 0.5,
                                  mt: 0.5
                                }}
                              >
                                <Typography
                                  variant='caption'
                                  sx={{ color: msg.is_mine ? 'white' : '', fontSize: '0.5rem', opacity: 0.8 }}
                                >
                                  {dayjs(msg.created_at, 'DD-MM-YYYY HH:mm:ss').format('hh:mm A')}
                                  {msg.is_edited ? ' (edited)' : ''}
                                </Typography>
                                {isMine && !isDeleted && (
                                  <Box sx={{ ml: 0.5, display: 'flex' }}>
                                    {/* Just a mockup logic for ticks. Adjust to match actual status from backend. */}
                                    {msg.status === 'sending' ? (
                                      <ClockOutlineIcon
                                        sx={{ fontSize: 14, opacity: 0.6, color: msg.is_mine ? 'white' : '' }}
                                      />
                                    ) : msg.status === 'failed' ? (
                                      <Tooltip title='Failed to send. Click to resend.'>
                                        <IconButton size='small' onClick={() => handleResend(msg)} sx={{ p: 0 }}>
                                          <AlertCircleOutlineIcon
                                            sx={{ fontSize: 14, color: msg.is_mine ? 'white' : 'error.main' }}
                                          />
                                        </IconButton>
                                      </Tooltip>
                                    ) : msg.status === 'read' ? (
                                      <CheckAllIcon sx={{ fontSize: 14, color: '#34B7F1' }} />
                                    ) : msg.status === 'delivered' ? (
                                      <CheckAllIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                                    ) : (
                                      <CheckIcon sx={{ fontSize: 14, opacity: 0.8 }} />
                                    )}
                                  </Box>
                                )}
                                {!isDeleted && (
                                  <IconButton
                                    size='small'
                                    onClick={e => {
                                      setAnchorEl(e.currentTarget)
                                      setSelectedMessageId(msg.message_id)
                                    }}
                                    sx={{ p: 0.2, ml: 0.5, color: 'inherit', opacity: 0.7 }}
                                  >
                                    <DotsVerticalIcon sx={{ fontSize: 14 }} />
                                  </IconButton>
                                )}
                              </Box>
                            </Box>
                          </Box>
                        </Box>
                      </React.Fragment>
                    )
                  })
                ) : (
                  <Box sx={{ my: 'auto', textAlign: 'center' }}>
                    <Typography variant='body2' color='text.secondary'>
                      No messages yet. Say hello! 👋
                    </Typography>
                  </Box>
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Attachment Preview */}
              {selectedFile && (
                <Box
                  sx={{
                    px: 2,
                    py: 1,
                    bgcolor: 'background.default',
                    borderTop: 1,
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1
                  }}
                >
                  {filePreviewUrl ? (
                    <Box
                      component='img'
                      src={filePreviewUrl}
                      sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
                    />
                  ) : (
                    <Chip label={selectedFile.name} size='small' />
                  )}
                  <Typography variant='caption' sx={{ flex: 1 }}>
                    {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
                  </Typography>
                  <IconButton
                    size='small'
                    onClick={() => {
                      setSelectedFile(null)
                      setFilePreviewUrl(null)
                    }}
                  >
                    <CloseIcon fontSize='small' />
                  </IconButton>
                </Box>
              )}

              {/* Bottom Input Field */}
              <Box
                sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}
              >
                {/* Reply / Edit Indicator */}
                {(replyToMessage || editingMessageId) && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      p: 1,
                      bgcolor: 'action.hover',
                      borderRadius: 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {editingMessageId ? (
                        <PencilOutlineIcon fontSize='small' color='primary' />
                      ) : (
                        <ReplyIcon fontSize='small' color='primary' />
                      )}
                      <Typography variant='caption'>
                        {editingMessageId
                          ? 'Editing Message'
                          : `Replying to: "${replyToMessage?.content ? replyToMessage.content.substring(0, 30) + (replyToMessage.content.length > 30 ? '...' : '') : 'Attachment'}"`}
                      </Typography>
                    </Box>
                    <IconButton
                      size='small'
                      onClick={() => {
                        setReplyToMessage(null)
                        setEditingMessageId(null)
                        setMessageText('')
                      }}
                    >
                      <CloseIcon fontSize='small' />
                    </IconButton>
                  </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
                  <input
                    type='file'
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    accept='image/*,video/*,.pdf,.doc,.docx'
                    onChange={handleFileChange}
                  />
                  <IconButton color='primary' onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={uploading}>
                    <EmoticonOutlineIcon />
                  </IconButton>

                  {showEmojiPicker && (
                    <Box sx={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 10 }}>
                      <EmojiPicker
                        onEmojiClick={e => {
                          setMessageText(prev => prev + e.emoji)
                          setShowEmojiPicker(false)
                        }}
                      />
                    </Box>
                  )}

                  <IconButton color='primary' onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                    <PaperclipIcon />
                  </IconButton>

                  <TextField
                    fullWidth
                    size='small'
                    placeholder='Type a message...'
                    value={messageText}
                    onChange={e => setMessageText(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    disabled={uploading || sendingMessage}
                  />

                  <IconButton
                    color='primary'
                    onClick={handleSendMessage}
                    disabled={(!messageText.trim() && !selectedFile) || uploading || sendingMessage}
                  >
                    {uploading || sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
                  </IconButton>
                </Box>
              </Box>
            </>
          ) : (
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                p: 4,
                textAlign: 'center'
              }}
            >
              <Avatar sx={{ width: 72, height: 72, mb: 2, bgcolor: 'primary.light' }}>
                <BullhornOutlineIcon sx={{ fontSize: 36, color: 'primary.main' }} />
              </Avatar>
              <Typography variant='h6' fontWeight={700} gutterBottom>
                Welcome to Campus Internal Chat
              </Typography>
              <Typography variant='body2' color='text.secondary' sx={{ maxWidth: 400 }}>
                Select a conversation from the list or start a new chat with your classmates, teachers, or transport
                personnel.
              </Typography>
              <Button
                variant='contained'
                startIcon={<PlusIcon />}
                sx={{ mt: 2 }}
                onClick={() => setOpenNewChatDialog(true)}
              >
                Start New Chat
              </Button>
            </Box>
          )}
        </Grid>
      </Grid>

      {/* Message Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            const msg = messages?.find(m => m.message_id === selectedMessageId)
            if (msg) {
              setReplyToMessage(msg)
            }
            setAnchorEl(null)
          }}
        >
          <ReplyIcon fontSize='small' sx={{ mr: 1 }} /> Reply
        </MenuItem>

        {messages?.find(m => m.message_id === selectedMessageId)?.is_mine && (
          <MenuItem
            onClick={() => {
              const msg = messages?.find(m => m.message_id === selectedMessageId)
              if (msg && msg.is_mine) {
                setEditingMessageId(msg.message_id)
                setMessageText(msg.content || '')
              }
              setAnchorEl(null)
            }}
          >
            <PencilOutlineIcon fontSize='small' sx={{ mr: 1 }} /> Edit
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            setForwardDialogMsgId(selectedMessageId)
            setAnchorEl(null)
          }}
        >
          <ShareOutlineIcon fontSize='small' sx={{ mr: 1 }} /> Forward
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={() => {
            setDeleteMode('me')
            setOpenDeleteConfirm(true)
          }}
        >
          <DeleteOutlineIcon fontSize='small' sx={{ mr: 1 }} />
          Delete for me
        </MenuItem>
        {messages?.find(m => m.message_id === selectedMessageId)?.is_mine && (
          <MenuItem
            onClick={() => {
              setDeleteMode('everyone')
              setOpenDeleteConfirm(true)
            }}
            sx={{ color: 'error.main' }}
          >
            <DeleteOutlineIcon fontSize='small' sx={{ mr: 1 }} />
            Delete for everyone
          </MenuItem>
        )}
      </Menu>

      {/* Delete Confirmation Modal */}
      <Dialog open={openDeleteConfirm} onClose={() => setOpenDeleteConfirm(false)}>
        <DialogTitle>Delete Message?</DialogTitle>
        <DialogContent>
          <Typography variant='body2'>
            {deleteMode === 'everyone'
              ? 'This message will be deleted for all participants in this conversation. The message text will be masked to "This message was deleted".'
              : 'This message will be hidden from your view only.'}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteConfirm(false)}>Cancel</Button>
          <Button variant='contained' color='error' onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW CHAT MODAL: Permitted Contacts Directory */}
      <Dialog open={openNewChatDialog} onClose={() => setOpenNewChatDialog(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Start Direct Chat</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size='small'
            placeholder='Search by name or category...'
            value={contactSearch}
            onChange={e => setContactSearch(e.target.value)}
            sx={{ my: 1.5 }}
            InputProps={{
              startAdornment: <MagnifyIcon fontSize='small' sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
          {loadingContacts ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : contacts && contacts.length > 0 ? (
            <List>
              {contacts.map(c => (
                <ListItem key={c.id} disablePadding>
                  <ListItemButton onClick={() => handleStartDirectChat(c)} sx={{ borderRadius: 1, mb: 0.5 }}>
                    <ListItemAvatar>
                      <Badge
                        variant='dot'
                        color='success'
                        invisible={!onlineUsers?.[c.id]}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        overlap='circular'
                      >
                        <Avatar src={c.avatar_url || undefined}>{c.name[0]}</Avatar>
                      </Badge>
                    </ListItemAvatar>
                    <ListItemText
                      primary={c.name}
                      secondary={
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 0.5 }}>
                          <Chip
                            size='small'
                            label={c.category}
                            variant='outlined'
                            sx={{ height: 20, fontSize: '0.7rem' }}
                          />
                          {c.sub_text && (
                            <Typography variant='caption' color='text.secondary'>
                              {c.sub_text}
                            </Typography>
                          )}
                        </Box>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          ) : (
            <Alert severity='info' sx={{ mt: 1 }}>
              No contacts available based on your class/section and communication permissions.
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewChatDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE GROUP MODAL */}
      <Dialog open={openNewGroupDialog} onClose={() => setOpenNewGroupDialog(false)} fullWidth maxWidth='sm'>
        <DialogTitle>Create Chat Group</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            size='small'
            label='Group Title'
            value={groupTitle}
            onChange={e => setGroupTitle(e.target.value)}
            sx={{ mt: 1.5, mb: 2 }}
          />
          <TextField
            fullWidth
            size='small'
            label='Description (Optional)'
            value={groupDescription}
            onChange={e => setGroupDescription(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Typography variant='subtitle2' sx={{ mb: 1, fontWeight: 600 }}>
            Select Members:
          </Typography>
          <Box sx={{ maxHeight: 240, overflowY: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
            <List dense disablePadding>
              {contacts?.map(c => {
                const isSelected = selectedMemberIds.includes(c.id)

                return (
                  <ListItem key={c.id} disablePadding>
                    <ListItemButton
                      onClick={() => {
                        if (isSelected) {
                          setSelectedMemberIds(selectedMemberIds.filter(id => id !== c.id))
                        } else {
                          setSelectedMemberIds([...selectedMemberIds, c.id])
                        }
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar sx={{ width: 28, height: 28 }}>{c.name[0]}</Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={c.name} secondary={c.category} />
                      {isSelected && <Chip size='small' color='primary' label='Selected' sx={{ height: 20 }} />}
                    </ListItemButton>
                  </ListItem>
                )
              })}
            </List>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenNewGroupDialog(false)}>Cancel</Button>
          <Button variant='contained' onClick={handleCreateGroup} disabled={!groupTitle.trim() || creatingGroup}>
            {creatingGroup ? 'Creating...' : 'Create Group'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* FORWARD MODAL */}
      <Dialog open={!!forwardDialogMsgId} onClose={() => setForwardDialogMsgId(null)} fullWidth maxWidth='sm'>
        <DialogTitle>Forward Message To...</DialogTitle>
        <DialogContent>
          <List>
            {sortedConversations.map(c => (
              <ListItem key={c.conversation_id} disablePadding>
                <ListItemButton
                  onClick={() => handleForwardMessage(c.conversation_id)}
                  sx={{ borderRadius: 1, mb: 0.5 }}
                >
                  <ListItemAvatar>
                    <Avatar src={c.avatar_url || undefined}>
                      {c.conversation_type === 'channel' ? <BullhornOutlineIcon /> : c.title[0]}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={c.title} secondary={c.conversation_type} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForwardDialogMsgId(null)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Card>
  )
}

export default ChatView
