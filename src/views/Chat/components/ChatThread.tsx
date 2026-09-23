import React from 'react'
import { Box, Typography, Button, Avatar, LinearProgress } from '@mui/material'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import PlusIcon from 'mdi-material-ui/Plus'

import { useChatContext } from '../context/ChatContext'
import ChatThreadHeader from './ChatThreadHeader'
import MessageList from './MessageList'
import MessageComposer from './MessageComposer'

const ChatThread: React.FC = () => {
  const { activeConversation, setOpenNewChatDialog, fetchingMessages, markingRead, loadingMessages } = useChatContext()

  if (!activeConversation) {
    return (
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
          Select a conversation from the list or start a new chat with your classmates, teachers, or transport personnel.
        </Typography>
        <Button variant='contained' startIcon={<PlusIcon />} sx={{ mt: 2 }} onClick={() => setOpenNewChatDialog(true)}>
          Start New Chat
        </Button>
      </Box>
    )
  }

  return (
    <>
      <ChatThreadHeader />
      {(fetchingMessages || markingRead) && !loadingMessages && <LinearProgress sx={{ height: 3 }} />}
      <MessageList />
      <MessageComposer />
    </>
  )
}

export default ChatThread
