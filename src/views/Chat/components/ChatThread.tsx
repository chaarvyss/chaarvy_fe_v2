import { Box, Typography, Button, Avatar, LinearProgress } from '@mui/material'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import PlusIcon from 'mdi-material-ui/Plus'
import React from 'react'

import { PermissionLabels } from 'src/constants/permissions'
import { isAuthorised } from 'src/lib/util/permissionCheck'

import { useChatContext } from '../context/ChatContext'

import ChatThreadHeader from './ChatThreadHeader'
import MessageComposer from './MessageComposer'
import MessageList from './MessageList'

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
          Select a conversation from the list or start a new chat with your classmates, teachers, or transport
          personnel.
        </Typography>
        {isAuthorised(PermissionLabels.chat.direct.create) && (
          <Button variant='contained' startIcon={<PlusIcon />} sx={{ mt: 2 }} onClick={() => setOpenNewChatDialog(true)}>
            Start New Chat
          </Button>
        )}
      </Box>
    )
  }

  return (
    <>
      <ChatThreadHeader />
      {(fetchingMessages || markingRead) && !loadingMessages && <LinearProgress sx={{ height: 3 }} />}
      <MessageList />
      {activeConversation.is_inactive ? (
        <Box
          sx={{
            p: 2,
            textAlign: 'center',
            bgcolor: 'background.default',
            borderTop: '1px solid',
            borderColor: 'divider'
          }}
        >
          <Typography variant='body2' color='text.secondary'>
            This user is deactivated or no longer active. You cannot send new messages.
          </Typography>
        </Box>
      ) : (
        <MessageComposer />
      )}
    </>
  )
}

export default ChatThread
