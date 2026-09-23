import React from 'react'
import { Box, Typography, IconButton, Tooltip, Checkbox } from '@mui/material'
import ShareOutlineIcon from 'mdi-material-ui/ShareOutline'
import ReplyIcon from 'mdi-material-ui/Reply'
import ClockOutlineIcon from 'mdi-material-ui/ClockOutline'
import AlertCircleOutlineIcon from 'mdi-material-ui/AlertCircleOutline'
import CheckAllIcon from 'mdi-material-ui/CheckAll'
import CheckIcon from 'mdi-material-ui/Check'
import DotsVerticalIcon from 'mdi-material-ui/DotsVertical'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

import { useChatContext } from '../context/ChatContext'
import { MessageDetail } from 'src/store/services/chatServices'

interface MessageBubbleProps {
  msg: MessageDetail
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ msg }) => {
  const {
    isSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,
    activeConversation,
    handleResend,
    setAnchorEl,
    setSelectedMessageId
  } = useChatContext()

  const isMine = msg.is_mine
  const isDeleted = Boolean(msg.is_deleted)

  return (
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
          <Typography variant='caption' sx={{ mb: 0.03, ml: 0.5, fontWeight: 100, fontSize: '0.7rem' }}>
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
              <Typography variant='caption' fontWeight={600} display='flex' alignItems='center' gap={0.5}>
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
              <video controls src={msg.media_url} style={{ width: '100%', borderRadius: 8 }}>
                <track kind="captions" srcLang="en" label="English" />
              </video>
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
            <Typography variant='caption' sx={{ color: msg.is_mine ? 'white' : '', fontSize: '0.5rem', opacity: 0.8 }}>
              {dayjs(msg.created_at, 'DD-MM-YYYY HH:mm:ss').format('hh:mm A')}
              {msg.is_edited ? ' (edited)' : ''}
            </Typography>
            {isMine && !isDeleted && (
              <Box sx={{ ml: 0.5, display: 'flex' }}>
                {msg.status === 'sending' ? (
                  <ClockOutlineIcon sx={{ fontSize: 14, opacity: 0.6, color: msg.is_mine ? 'white' : '' }} />
                ) : msg.status === 'failed' ? (
                  <Tooltip title='Failed to send. Click to resend.'>
                    <IconButton size='small' onClick={() => handleResend(msg)} sx={{ p: 0 }}>
                      <AlertCircleOutlineIcon sx={{ fontSize: 14, color: msg.is_mine ? 'white' : 'error.main' }} />
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
  )
}

export default MessageBubble
