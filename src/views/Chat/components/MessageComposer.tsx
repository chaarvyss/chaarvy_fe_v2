import { Box, Typography, TextField, IconButton, CircularProgress, Chip } from '@mui/material'
import EmojiPicker from 'emoji-picker-react'
import CloseIcon from 'mdi-material-ui/Close'
import EmoticonOutlineIcon from 'mdi-material-ui/EmoticonOutline'
import PaperclipIcon from 'mdi-material-ui/Paperclip'
import PencilOutlineIcon from 'mdi-material-ui/PencilOutline'
import ReplyIcon from 'mdi-material-ui/Reply'
import SendIcon from 'mdi-material-ui/Send'
import React from 'react'

import { useChatContext } from '../context/ChatContext'

const MessageComposer: React.FC = () => {
  const {
    messageText,
    setMessageText,
    selectedFile,
    setSelectedFile,
    filePreviewUrl,
    setFilePreviewUrl,
    uploading,
    showEmojiPicker,
    setShowEmojiPicker,
    replyToMessage,
    setReplyToMessage,
    editingMessageId,
    setEditingMessageId,
    fileInputRef,
    sendingMessage,
    handleSendMessage,
    handleFileChange
  } = useChatContext()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column' }}>
      {/* Attachment Preview */}
      {selectedFile && (
        <Box
          sx={{
            px: 2,
            py: 1,
            bgcolor: 'background.default',
            borderTop: 1,
            borderColor: 'divider',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          {filePreviewUrl ? (
            <Box
              component='img'
              src={filePreviewUrl}
              sx={{ width: 48, height: 48, borderRadius: 1, objectFit: 'cover' }}
            />
          ) : (
            <Chip label={selectedFile.name} size='small' />
          )}
          <Typography variant='caption' sx={{ flex: 1 }}>
            {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)
          </Typography>
          <IconButton
            size='small'
            onClick={() => {
              setSelectedFile(null)
              setFilePreviewUrl(null)
            }}
          >
            <CloseIcon fontSize='small' />
          </IconButton>
        </Box>
      )}

      {/* Bottom Input Field */}
      <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', gap: 1 }}>
        {/* Reply / Edit Indicator */}
        {(replyToMessage || editingMessageId) && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              p: 1,
              bgcolor: 'action.hover',
              borderRadius: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {editingMessageId ? (
                <PencilOutlineIcon fontSize='small' color='primary' />
              ) : (
                <ReplyIcon fontSize='small' color='primary' />
              )}
              <Typography variant='caption'>
                {editingMessageId
                  ? 'Editing Message'
                  : `Replying to: "${
                      replyToMessage?.content
                        ? replyToMessage.content.substring(0, 30) + (replyToMessage.content.length > 30 ? '...' : '')
                        : 'Attachment'
                    }"`}
              </Typography>
            </Box>
            <IconButton
              size='small'
              onClick={() => {
                setReplyToMessage(null)
                setEditingMessageId(null)
                setMessageText('')
              }}
            >
              <CloseIcon fontSize='small' />
            </IconButton>
          </Box>
        )}

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative' }}>
          <input
            type='file'
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept='image/*,video/*,.pdf,.doc,.docx'
            onChange={handleFileChange}
          />
          <IconButton color='primary' onClick={() => setShowEmojiPicker(!showEmojiPicker)} disabled={uploading}>
            <EmoticonOutlineIcon />
          </IconButton>

          {showEmojiPicker && (
            <Box sx={{ position: 'absolute', bottom: '100%', left: 0, zIndex: 10 }}>
              <EmojiPicker
                onEmojiClick={e => {
                  setMessageText(prev => prev + e.emoji)
                  setShowEmojiPicker(false)
                }}
              />
            </Box>
          )}

          <IconButton color='primary' onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            <PaperclipIcon />
          </IconButton>

          <TextField
            fullWidth
            size='small'
            placeholder='Type a message...'
            value={messageText}
            onChange={e => setMessageText(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={uploading || sendingMessage}
          />

          <IconButton
            color='primary'
            onClick={handleSendMessage}
            disabled={(!messageText.trim() && !selectedFile) || uploading || sendingMessage}
          >
            {uploading || sendingMessage ? <CircularProgress size={20} /> : <SendIcon />}
          </IconButton>
        </Box>
      </Box>
    </Box>
  )
}

export default MessageComposer
