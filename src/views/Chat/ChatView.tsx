import React from 'react'
import { Box, Card, Grid, Typography, FormControl, Select, MenuItem } from '@mui/material'
import AccountSchoolIcon from 'mdi-material-ui/AccountSchool'

import { ChatProvider, useChatContext } from './context/ChatContext'
import ChatSidebar from './components/ChatSidebar'
import ChatThread from './components/ChatThread'
import ChatDialogs from './components/ChatDialogs'

const ChatViewLayout: React.FC = () => {
  const { myKids, activeStudentId, setActiveStudentId, activeConversationId } = useChatContext()

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
            <Select
              value={activeStudentId || ''}
              onChange={e => setActiveStudentId(e.target.value as string)}
            >
              {myKids.map((k: any) => (
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
          <ChatSidebar />
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
          <ChatThread />
        </Grid>
      </Grid>

      <ChatDialogs />
    </Card>
  )
}

const ChatView: React.FC = () => {
  return (
    <ChatProvider>
      <ChatViewLayout />
    </ChatProvider>
  )
}

export default ChatView
