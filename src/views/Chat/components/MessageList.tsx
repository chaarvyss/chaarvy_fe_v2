import React from 'react'
import { Box, Skeleton, Divider, Chip, Typography } from '@mui/material'

import { useChatContext } from '../context/ChatContext'
import MessageBubble from './MessageBubble'

const MessageList: React.FC = () => {
  const {
    messageContainerRef,
    handleScroll,
    loadingMessages,
    displayMessages,
    snapshotUnreadCount,
    firstUnreadMessageId,
    unreadDividerRef,
    messagesEndRef
  } = useChatContext()

  return (
    <Box
      ref={messageContainerRef}
      onScroll={handleScroll}
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
                width={150 + (item * 20)}
                height={60}
                sx={{ borderRadius: 2 }}
              />
            </Box>
          ))}
        </Box>
      ) : displayMessages && displayMessages.length > 0 ? (
        displayMessages.map((msg) => {
          // Show "New Messages" divider before the first unread message
          const showUnreadDivider = firstUnreadMessageId && msg.message_id === firstUnreadMessageId

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
              <MessageBubble msg={msg} />
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
  )
}

export default MessageList
