import React from 'react'
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Avatar,
  Badge,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  CircularProgress,
  Tooltip
} from '@mui/material'
import MagnifyIcon from 'mdi-material-ui/Magnify'
import PlusIcon from 'mdi-material-ui/Plus'
import AccountMultiplePlusIcon from 'mdi-material-ui/AccountMultiplePlus'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

dayjs.extend(customParseFormat)

import { useChatContext } from '../context/ChatContext'

const ChatSidebar: React.FC = () => {
  const {
    activeConversationId,
    setActiveConversationId,
    searchQuery,
    setSearchQuery,
    sortedConversations,
    loadingConversations,
    setOpenNewChatDialog,
    setOpenNewGroupDialog
  } = useChatContext()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
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
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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
    </Box>
  )
}

export default ChatSidebar
