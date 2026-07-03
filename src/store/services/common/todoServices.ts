import { urlConstants } from 'src/constants/urlConstants'
import { HttpRequestMethods } from 'src/store'

import api from '../api'
import { CommonCacheTag } from '../cacheTag'

const todoServiceApi = api.injectEndpoints({
  endpoints: build => ({
    createUpdateTodo: build.mutation<string, Todo>({
      invalidatesTags: [CommonCacheTag.TODOS_LIST],
      query: body => {
        return {
          method: HttpRequestMethods.POST,
          url: urlConstants.common.todo.createUpdateTodoUrl,
          body
        }
      }
    }),

    getTodos: build.query<Todo[], void>({
      providesTags: [CommonCacheTag.TODOS_LIST],
      query: () => ({
        method: HttpRequestMethods.GET,
        url: urlConstants.common.todo.getTodosUrl
      })
    }),

    getTodoDetail: build.query<Todo, string>({
      query: todo_id => ({
        method: HttpRequestMethods.GET,
        url: urlConstants.common.todo.getTodoDetailUrl(todo_id)
      })
    }),
    updateTodoStatus: build.mutation<string, { todo_id: string; status: number }>({
      invalidatesTags: [CommonCacheTag.TODOS_LIST],
      query: ({ todo_id, status }) => ({
        method: HttpRequestMethods.GET,
        url: urlConstants.common.todo.updateTodoStatusUrl({ todo_id, status })
      })
    }),
    deleteTodo: build.mutation<string, string>({
      invalidatesTags: [CommonCacheTag.TODOS_LIST],
      query: todo_id => ({
        method: HttpRequestMethods.DELETE,
        url: urlConstants.common.todo.deleteTodo(todo_id)
      })
    })
  })
})

export const {
  useCreateUpdateTodoMutation,
  useGetTodosQuery,
  useGetTodoDetailQuery,
  useUpdateTodoStatusMutation,
  useDeleteTodoMutation
} = todoServiceApi
