import React from 'react'
import { Box, Typography, IconButton, Avatar, Tooltip } from '@mui/material'
import ArrowLeftIcon from 'mdi-material-ui/ArrowLeft'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import CheckAllIcon from 'mdi-material-ui/CheckAll'
import DeleteOutlineIcon from 'mdi-material-ui/DeleteOutline'
import CloseIcon from 'mdi-material-ui/Close'

import { useChatContext } from '../context/ChatContext'

const ChatThreadHeader: React.FC = () => {
  const {
    activeConversation,
    setActiveConversationId,
    isSelectionMode,
    setIsSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setOpenDeleteConfirm
  } = useChatContext()

  if (!activeConversation) return null

  return (
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
  )
}

export default ChatThreadHeader
