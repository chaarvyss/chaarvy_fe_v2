import React from 'react'
import {
  Menu,
  MenuItem,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Badge,
  Avatar,
  Chip,
  Alert
} from '@mui/material'
import ReplyIcon from 'mdi-material-ui/Reply'
import PencilOutlineIcon from 'mdi-material-ui/PencilOutline'
import ShareOutlineIcon from 'mdi-material-ui/ShareOutline'
import DeleteOutlineIcon from 'mdi-material-ui/DeleteOutline'
import MagnifyIcon from 'mdi-material-ui/Magnify'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'

import { useChatContext } from '../context/ChatContext'

const ChatDialogs: React.FC = () => {
  const {
    anchorEl,
    setAnchorEl,
    selectedMessageId,
    setReplyToMessage,
    setEditingMessageId,
    setMessageText,
    setForwardDialogMsgId,
    deleteMode,
    setDeleteMode,
    openDeleteConfirm,
    setOpenDeleteConfirm,
    handleConfirmDelete,
    openNewChatDialog,
    setOpenNewChatDialog,
    contactSearch,
    setContactSearch,
    loadingContacts,
    contacts,
    onlineUsers,
    handleStartDirectChat,
    openNewGroupDialog,
    setOpenNewGroupDialog,
    groupTitle,
    setGroupTitle,
    groupDescription,
    setGroupDescription,
    selectedMemberIds,
    setSelectedMemberIds,
    handleCreateGroup,
    creatingGroup,
    forwardDialogMsgId,
    sortedConversations,
    handleForwardMessage,
    displayMessages
  } = useChatContext()

  return (
    <>
      {/* Message Options Menu */}
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem
          onClick={() => {
            const msg = displayMessages?.find(m => m.message_id === selectedMessageId)
            if (msg) {
              setReplyToMessage(msg)
            }
            setAnchorEl(null)
          }}
        >
          <ReplyIcon fontSize='small' sx={{ mr: 1 }} /> Reply
        </MenuItem>

        {displayMessages?.find(m => m.message_id === selectedMessageId)?.is_mine && (
          <MenuItem
            onClick={() => {
              const msg = displayMessages?.find(m => m.message_id === selectedMessageId)
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
        {displayMessages?.find(m => m.message_id === selectedMessageId)?.is_mine && (
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
                <ListItemButton onClick={() => handleForwardMessage(c.conversation_id)} sx={{ borderRadius: 1, mb: 0.5 }}>
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
    </>
  )
}

export default ChatDialogs
