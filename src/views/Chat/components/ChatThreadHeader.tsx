import { Box, Typography, IconButton, Avatar, Tooltip, Badge, Dialog, DialogTitle, DialogContent } from '@mui/material'
import Button from '@mui/material/Button'
import AccountPlusOutlineIcon from 'mdi-material-ui/AccountPlusOutline'
import ArrowLeftIcon from 'mdi-material-ui/ArrowLeft'
import BullhornOutlineIcon from 'mdi-material-ui/BullhornOutline'
import CheckAllIcon from 'mdi-material-ui/CheckAll'
import CloseIcon from 'mdi-material-ui/Close'
import DeleteOutlineIcon from 'mdi-material-ui/DeleteOutline'
import React from 'react'

import {
  useGetConversationParticipantsQuery,
  useRemoveConversationParticipantMutation
} from 'src/store/services/chatServices'

import { useChatContext } from '../context/ChatContext'

import AddParticipantDialog from './AddParticipantDialog'

const ChatThreadHeader: React.FC = () => {
  const {
    activeConversation,
    activeConversationId,
    setActiveConversationId,
    isSelectionMode,
    setIsSelectionMode,
    selectedMessageIds,
    setSelectedMessageIds,
    setOpenDeleteConfirm,
    onlineUsers,
    activeStudentId
  } = useChatContext()

  const [openUserDialog, setOpenUserDialog] = React.useState(false)

  const { data: participants, isLoading: participantsLoading } = useGetConversationParticipantsQuery(
    { conversationId: activeConversationId as string, studentContextId: activeStudentId || undefined },
    { skip: !openUserDialog || !activeConversationId || activeConversation?.conversation_type === 'direct' }
  )

  const [removeParticipant] = useRemoveConversationParticipantMutation()
  const [openAddParticipant, setOpenAddParticipant] = React.useState(false)

  const handleRemoveParticipant = async (userId: string) => {
    if (!activeConversationId) return
    try {
      await removeParticipant({ conversationId: activeConversationId as string, targetUserId: userId }).unwrap()
    } catch (error: any) {
      alert(error.data?.detail || 'Failed to remove participant')
    }
  }

  if (!activeConversation) return null

  const isOnline =
    activeConversation.conversation_type === 'direct' && activeConversation.other_user_id
      ? onlineUsers[activeConversation.other_user_id]
      : false

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
        <IconButton onClick={() => setActiveConversationId(null)} sx={{ display: { xs: 'flex', md: 'none' }, mr: -1 }}>
          <ArrowLeftIcon />
        </IconButton>
        <Box sx={{ cursor: 'pointer' }} onClick={() => setOpenUserDialog(true)}>
          <Badge
            overlap='circular'
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            variant='dot'
            invisible={activeConversation.conversation_type !== 'direct'}
            color={isOnline ? 'success' : 'warning'}
            sx={{
              '& .MuiBadge-badge': {
                boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                width: 10,
                height: 10,
                borderRadius: '50%'
              }
            }}
          >
            <Avatar src={activeConversation.avatar_url || undefined}>
              {activeConversation.conversation_type === 'channel' ? (
                <BullhornOutlineIcon />
              ) : (
                activeConversation.title[0]
              )}
            </Avatar>
          </Badge>
        </Box>
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

      {/* User Details Dialog */}
      <Dialog open={openUserDialog} onClose={() => setOpenUserDialog(false)} maxWidth='xs' fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          User Info
          <IconButton size='small' onClick={() => setOpenUserDialog(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pb: 4 }}>
          <Avatar src={activeConversation.avatar_url || undefined} sx={{ width: 100, height: 100, mb: 2, mt: 2 }}>
            {activeConversation.conversation_type === 'channel' ? (
              <BullhornOutlineIcon sx={{ fontSize: 40 }} />
            ) : (
              activeConversation.title[0]
            )}
          </Avatar>
          <Typography variant='h5' fontWeight={600} gutterBottom>
            {activeConversation.title}
          </Typography>
          <Typography variant='body1' color='text.secondary' sx={{ mb: 2 }}>
            {activeConversation.description ||
              (activeConversation.conversation_type === 'direct' ? 'Internal Direct Chat' : 'Campus Group')}
          </Typography>
          {activeConversation.conversation_type === 'direct' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  bgcolor: isOnline ? 'success.main' : 'warning.main'
                }}
              />
              <Typography variant='body2' fontWeight={600} color={isOnline ? 'success.main' : 'warning.main'}>
                {isOnline ? 'Online' : 'Offline'}
              </Typography>
            </Box>
          )}

          {activeConversation.conversation_type !== 'direct' && (
            <Box sx={{ width: '100%', mt: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5, px: 1 }}>
                <Typography variant='subtitle2' color='text.secondary'>
                  {participantsLoading ? 'Loading participants...' : `${participants?.length || 0} Participants`}
                </Typography>
                <Button size='small' startIcon={<AccountPlusOutlineIcon />} onClick={() => setOpenAddParticipant(true)}>
                  Add
                </Button>
              </Box>
              {participants?.map(pt => {
                const isPtOnline = onlineUsers[pt.user_id]

                return (
                  <Box
                    key={pt.user_id}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      p: 1,
                      borderRadius: 1,
                      '&:hover': { bgcolor: 'action.hover' }
                    }}
                  >
                    <Badge
                      overlap='circular'
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant='dot'
                      color={isPtOnline ? 'success' : 'warning'}
                      sx={{
                        '& .MuiBadge-badge': {
                          boxShadow: theme => `0 0 0 2px ${theme.palette.background.paper}`,
                          width: 10,
                          height: 10,
                          borderRadius: '50%'
                        }
                      }}
                    >
                      <Avatar src={pt.avatar_url || undefined} sx={{ width: 36, height: 36 }}>
                        {pt.name[0]}
                      </Avatar>
                    </Badge>
                    <Box sx={{ flex: 1, overflow: 'hidden' }}>
                      <Typography variant='body2' fontWeight={600} noWrap>
                        {pt.name}
                      </Typography>
                      <Typography variant='caption' color='text.secondary' noWrap sx={{ display: 'block' }}>
                        {pt.role.charAt(0).toUpperCase() + pt.role.slice(1)}
                      </Typography>
                    </Box>
                    <Tooltip title='Remove Member'>
                      <IconButton
                        size='small'
                        color='error'
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to remove ${pt.name}?`)) {
                            handleRemoveParticipant(pt.user_id)
                          }
                        }}
                      >
                        <DeleteOutlineIcon fontSize='small' />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>
      <AddParticipantDialog open={openAddParticipant} onClose={() => setOpenAddParticipant(false)} />
    </Box>
  )
}

export default ChatThreadHeader
