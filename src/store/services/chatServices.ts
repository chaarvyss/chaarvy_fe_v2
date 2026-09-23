import api from './api'

export interface ContactCard {
  id: string
  name: string
  user_type: string
  role_name?: string
  category: string
  avatar_url?: string
  sub_text?: string
  program_name?: string
  section_name?: string
  medium_name?: string
  student_id?: string
}

export interface MessageDetail {
  message_id: string
  conversation_id: string
  sender_id: string
  sender_type: string
  sender_name?: string
  student_context_id?: string
  message_type: 'text' | 'image' | 'video' | 'file' | 'audio'
  content?: string
  media_url?: string
  media_meta?: any
  reply_to_message_id?: string
  forwarded_from_id?: string
  created_at: string
  is_edited: number
  is_deleted: number
  deleted_at?: string
  is_mine?: boolean
  status?: 'sending' | 'failed' | 'sent' | 'delivered' | 'read'
}

export interface ConversationDetail {
  conversation_id: string
  conversation_type: 'direct' | 'group' | 'channel' | 'broadcast'
  title: string
  description?: string
  avatar_url?: string
  other_user_id?: string
  unread_count: number
  last_message_preview?: string
  last_message_at?: string
  is_announcement_only: number
  student_context_id?: string
  is_inactive?: boolean
}

export interface KidSummary {
  student_id: string
  student_name: string
  admission_number?: string
  program_name?: string
  section_name?: string
  medium_name?: string
  relationship?: string
  is_primary?: number
}

export interface ParticipantDetail {
  user_id: string
  user_type: string
  role: string
  name: string
  avatar_url?: string
}

export const chatServicesApi = api.injectEndpoints({
  endpoints: build => ({
    getChatContacts: build.query<
      ContactCard[],
      {
        search?: string
        studentContextId?: string
        program_id?: string
        segment_id?: string
        medium_id?: string
        section_id?: string
        admission_number?: string
      }
    >({
      query: ({ search, studentContextId, program_id, segment_id, medium_id, section_id, admission_number }) => ({
        url: '/common/chat/contacts',
        method: 'GET',
        params: { search, program_id, segment_id, medium_id, section_id, admission_number },
        headers: studentContextId ? { 'X-Active-Student-Id': studentContextId } : {}
      }),
      providesTags: ['Contacts' as any]
    }),

    getConversations: build.query<ConversationDetail[], { studentContextId?: string }>({
      query: ({ studentContextId }) => ({
        url: '/common/chat/conversations',
        method: 'GET',
        headers: studentContextId ? { 'X-Active-Student-Id': studentContextId } : {}
      }),
      providesTags: ['Conversations' as any]
    }),

    getConversationParticipants: build.query<
      ParticipantDetail[],
      { conversationId: string; studentContextId?: string }
    >({
      query: ({ conversationId, studentContextId }) => ({
        url: `/common/chat/conversations/${conversationId}/participants`,
        method: 'GET',
        headers: studentContextId ? { 'X-Active-Student-Id': studentContextId } : {}
      }),
      providesTags: (result, error, { conversationId }) => [
        { type: 'Conversations' as any, id: `${conversationId}-participants` }
      ]
    }),

    getConversationMessages: build.query<
      MessageDetail[],
      { conversationId: string; limit?: number; before_timestamp?: string }
    >({
      query: ({ conversationId, limit = 50, before_timestamp }) => ({
        url: `/common/chat/conversations/${conversationId}/messages`,
        method: 'GET',
        params: { limit, before_timestamp }
      }),
      providesTags: (result, error, { conversationId }) => [{ type: 'Messages' as any, id: conversationId }],

      // Only keep one cache entry per conversationId so we can append to it
      serializeQueryArgs: ({ queryArgs }) => {
        return queryArgs.conversationId
      },

      // Merge incoming paginated messages with the existing cached messages
      merge: (currentCache, newItems, { arg }) => {
        if (arg.before_timestamp) {
          // If we requested older messages (pagination), prepend them to the start of the cache (since older messages go at the top of the UI)
          currentCache.unshift(...newItems)
        } else {
          // If it's a fresh fetch (e.g. websocket invalidation or first load), replace the cache
          return newItems
        }
      },

      // Force refetch if before_timestamp changes (i.e. user scrolled up)
      forceRefetch({ currentArg, previousArg }) {
        return currentArg?.before_timestamp !== previousArg?.before_timestamp
      }
    }),

    addConversationParticipants: build.mutation<
      any,
      {
        conversationId: string
        members: { user_id: string; user_type: string; role: string }[]
        share_history?: boolean
      }
    >({
      query: ({ conversationId, members, share_history }) => ({
        url: `/common/chat/group/${conversationId}/members`,
        method: 'POST',
        body: { members, share_history }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversations' as any, id: `${conversationId}-participants` }
      ]
    }),

    removeConversationParticipant: build.mutation<
      any,
      {
        conversationId: string
        targetUserId: string
      }
    >({
      query: ({ conversationId, targetUserId }) => ({
        url: `/common/chat/group/${conversationId}/members/${targetUserId}`,
        method: 'DELETE'
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversations' as any, id: `${conversationId}-participants` }
      ]
    }),

    sendChatMessage: build.mutation<
      any,
      {
        conversationId: string
        content?: string
        message_type?: string
        media_url?: string
        media_meta?: any
        reply_to_message_id?: string
        student_context_id?: string
      }
    >({
      query: ({ conversationId, student_context_id, ...body }) => ({
        url: `/common/chat/conversations/${conversationId}/messages`,
        method: 'POST',
        headers: student_context_id ? { 'X-Active-Student-Id': student_context_id } : {},
        body: { ...body, conversation_id: conversationId }
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Messages' as any, id: conversationId },
        'Conversations' as any
      ]
    }),

    startDirectChat: build.mutation<
      { conversation_id: string },
      {
        target_id: string
        target_type?: string
        student_context_id?: string
      }
    >({
      query: ({ student_context_id, ...body }) => ({
        url: '/common/chat/direct',
        method: 'POST',
        headers: student_context_id ? { 'X-Active-Student-Id': student_context_id } : {},
        body
      }),
      invalidatesTags: ['Conversations' as any]
    }),

    createGroup: build.mutation<
      { conversation_id: string },
      {
        title: string
        description?: string
        avatar_url?: string
        is_announcement_only?: number
        member_ids?: Array<{ user_id: string; user_type: string; role?: string }>
      }
    >({
      query: body => ({
        url: '/common/chat/group',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Conversations' as any]
    }),

    createBroadcast: build.mutation<
      { conversation_id: string; message: string },
      {
        title: string
        content: string
        message_type?: 'text' | 'image' | 'video' | 'file'
        media_url?: string
        media_meta?: any
        program_id?: string
        segment_id?: string
        section_id?: string
        medium_id?: string
        target_roles?: string[]
        member_ids?: Array<{ user_id: string; user_type: string; role?: string }>
      }
    >({
      query: body => ({
        url: '/common/chat/broadcast',
        method: 'POST',
        body
      }),
      invalidatesTags: ['Conversations' as any]
    }),

    deleteChatMessage: build.mutation<
      { message: string },
      {
        messageId: string
        deleteFor: 'me' | 'everyone'
        conversationId: string
      }
    >({
      query: ({ messageId, deleteFor }) => ({
        url: `/common/chat/messages/${messageId}`,
        method: 'DELETE',
        body: { delete_for: deleteFor }
      }),
      async onQueryStarted({ messageId, conversationId, deleteFor }, { dispatch, queryFulfilled }) {
        const patchResult = dispatch(
          chatServicesApi.util.updateQueryData('getConversationMessages', { conversationId }, draft => {
            if (deleteFor === 'everyone') {
              const msg = draft.find(m => m.message_id === messageId)
              if (msg) {
                msg.is_deleted = 1
                msg.content = 'This message was deleted'
                msg.media_url = undefined
                msg.message_type = 'text'
              }
            } else {
              // Delete for me: remove from list entirely
              const index = draft.findIndex(m => m.message_id === messageId)
              if (index !== -1) draft.splice(index, 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: ['Conversations' as any]
    }),

    markConversationRead: build.mutation<any, { conversationId: string; last_read_message_id?: string }>({
      query: ({ conversationId, ...body }) => ({
        url: `/common/chat/conversations/${conversationId}/read`,
        method: 'POST',
        body: { ...body, conversation_id: conversationId }
      }),
      invalidatesTags: ['Conversations' as any]
    }),

    getMyKids: build.query<KidSummary[], void>({
      query: () => ({
        url: '/common/chat/portal/my-kids',
        method: 'GET'
      })
    })
  })
})

export const {
  useGetChatContactsQuery,
  useGetConversationsQuery,
  useGetConversationParticipantsQuery,
  useAddConversationParticipantsMutation,
  useRemoveConversationParticipantMutation,
  useGetConversationMessagesQuery,
  useSendChatMessageMutation,
  useStartDirectChatMutation,
  useCreateGroupMutation,
  useCreateBroadcastMutation,
  useDeleteChatMessageMutation,
  useMarkConversationReadMutation,
  useGetMyKidsQuery
} = chatServicesApi
