import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Checkbox,
  FormControlLabel,
  Switch,
  Typography,
  Box,
  CircularProgress
} from '@mui/material'
import React, { useState } from 'react'

import {
  useGetChatContactsQuery,
  useAddConversationParticipantsMutation,
  useGetConversationParticipantsQuery
} from 'src/store/services/chatServices'

import { useChatContext } from '../context/ChatContext'

interface AddParticipantDialogProps {
  open: boolean
  onClose: () => void
}

const AddParticipantDialog: React.FC<AddParticipantDialogProps> = ({ open, onClose }) => {
  const { activeConversationId, activeStudentId } = useChatContext()
  const [search, setSearch] = useState('')
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set())
  const [shareHistory, setShareHistory] = useState(false)

  const { data: contacts, isLoading: contactsLoading } = useGetChatContactsQuery(
    { search, studentContextId: activeStudentId || undefined },
    { skip: !open }
  )

  const { data: existingParticipants } = useGetConversationParticipantsQuery(
    { conversationId: activeConversationId as string, studentContextId: activeStudentId || undefined },
    { skip: !open || !activeConversationId }
  )

  const availableContacts = React.useMemo(() => {
    if (!contacts) return []
    if (!existingParticipants) return contacts

    const existingIds = new Set(existingParticipants.map(p => p.user_id))

    return contacts.filter(c => !existingIds.has(c.id))
  }, [contacts, existingParticipants])

  const [addParticipants, { isLoading: isAdding }] = useAddConversationParticipantsMutation()

  const handleToggle = (contactId: string) => {
    const newSelected = new Set(selectedContacts)
    if (newSelected.has(contactId)) {
      newSelected.delete(contactId)
    } else {
      newSelected.add(contactId)
    }
    setSelectedContacts(newSelected)
  }

  const handleAdd = async () => {
    if (!activeConversationId || selectedContacts.size === 0) return

    const membersToAdd = Array.from(selectedContacts).map(id => {
      const contact = contacts?.find(c => c.id === id)

      return {
        user_id: id,
        user_type: contact?.user_type || 'staff',
        role: 'member'
      }
    })

    try {
      await addParticipants({
        conversationId: activeConversationId as string,
        members: membersToAdd,
        share_history: shareHistory
      }).unwrap()

      handleClose()
    } catch (error) {
      console.error('Failed to add participants:', error)
    }
  }

  const handleClose = () => {
    setSearch('')
    setSelectedContacts(new Set())
    setShareHistory(false)
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth='sm' fullWidth>
      <DialogTitle>Add Members</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
        <TextField
          size='small'
          placeholder='Search contacts...'
          value={search}
          onChange={e => setSearch(e.target.value)}
          fullWidth
        />

        <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, height: 300, overflow: 'auto' }}>
          {contactsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {availableContacts.map(contact => (
                <ListItem key={contact.id} button onClick={() => handleToggle(contact.id)}>
                  <Checkbox checked={selectedContacts.has(contact.id)} tabIndex={-1} disableRipple />
                  <ListItemAvatar>
                    <Avatar src={contact.avatar_url || undefined}>{contact.name[0]}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={contact.name}
                    secondary={contact.user_type === 'staff' ? 'Staff' : 'Student/Parent'}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </Box>

        <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
          <FormControlLabel
            control={<Switch checked={shareHistory} onChange={e => setShareHistory(e.target.checked)} />}
            label={
              <Box>
                <Typography variant='subtitle2'>Share chat history</Typography>
                <Typography variant='caption' color='text.secondary'>
                  Allow new members to see messages sent before they joined
                </Typography>
              </Box>
            }
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color='inherit'>
          Cancel
        </Button>
        <Button onClick={handleAdd} variant='contained' disabled={selectedContacts.size === 0 || isAdding}>
          {isAdding ? <CircularProgress size={24} /> : `Add (${selectedContacts.size})`}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddParticipantDialog
