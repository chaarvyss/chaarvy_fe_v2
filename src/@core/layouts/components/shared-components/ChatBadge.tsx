// ** React Imports

// ** MUI Imports
import Badge from '@mui/material/Badge'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import MessageOutline from 'mdi-material-ui/MessageOutline'
import { useRouter } from 'next/router'
import { useMemo } from 'react'

// ** Store Hook
import { useChatSocket } from 'src/hooks/useChatSocket'
import { useGetConversationsQuery } from 'src/store/services/chatServices'

const ChatBadge = () => {
  const router = useRouter()

  // Real-time WebSocket listener that triggers RTK query cache invalidation globally
  useChatSocket()

  const { data: conversations } = useGetConversationsQuery({}, { refetchOnMountOrArgChange: true })

  const totalUnread = useMemo(() => {
    if (!conversations?.length) return 0

    return conversations.reduce((sum, conv) => sum + (conv.unread_count || 0), 0)
  }, [conversations])

  const handleClick = () => {
    router.push('/chat')
  }

  return (
    <Tooltip title='Internal Chat'>
      <IconButton color='inherit' onClick={handleClick} aria-label='internal chat' id='chat-badge-button'>
        <Badge
          badgeContent={totalUnread}
          color='error'
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              fontSize: '0.65rem',
              minWidth: 18,
              height: 18,
              fontWeight: 600
            }
          }}
        >
          <MessageOutline />
        </Badge>
      </IconButton>
    </Tooltip>
  )
}

export default ChatBadge
