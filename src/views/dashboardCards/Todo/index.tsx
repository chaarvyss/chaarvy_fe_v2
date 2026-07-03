import {
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Typography,
  Chip,
  Paper,
  Stack,
  IconButton,
  Button,
  CircularProgress
} from '@mui/material'
import { useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import { LoadingSpinner } from 'src/reusable_components'
import {
  useDeleteTodoMutation,
  useGetTodosQuery,
  useUpdateTodoStatusMutation
} from 'src/store/services/common/todoServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import CreateUpdateTodo from './newTodo'

const getPriorityColor = (priority: Priority) => {
  switch (priority) {
    case 'High':
      return { main: '#ef5350', bg: '#ffebee', label: 'error' as const } // Red
    case 'Medium':
      return { main: '#ff9800', bg: '#fff3e0', label: 'warning' as const } // Orange
    case 'Low':
      return { main: '#4caf50', bg: '#e8f5e9', label: 'success' as const } // Green
    default:
      return { main: '#9e9e9e', bg: '#f5f5f5', label: 'default' as const }
  }
}

export default function DashboardTodoList() {
  const [isCreateTodoOpen, setIsCreateTodoOpen] = useState(false)
  const [selectedTodoId, setSelectedTodoId] = useState<string>()

  const { triggerToast } = useToast()

  const { data: todos, isFetching } = useGetTodosQuery()

  const [deleteTodo, { isLoading: isDeleting }] = useDeleteTodoMutation()
  const [updateTodoStatus, { isLoading: isUpdating }] = useUpdateTodoStatusMutation()

  const handleToggle = (id: string, status: number) => {
    setSelectedTodoId(id)
    updateTodoStatus({ todo_id: id, status: status === 0 ? 1 : 0 })
      .unwrap()
      .then(() => {
        setSelectedTodoId(undefined)
      })
      .catch(() => {
        setSelectedTodoId(undefined)
        triggerToast('Failed to update todo status. Please try again.', {
          variant: ToastVariants.ERROR
        })
      })
  }

  const handleDelete = (id: string) => {
    setSelectedTodoId(id)
    deleteTodo(id)
      .unwrap()
      .then(() => {
        setSelectedTodoId(undefined)
      })
      .catch(() => {
        setSelectedTodoId(undefined)
        triggerToast('Failed to delete todo. Please try again.', {
          variant: ToastVariants.ERROR
        })
      })
  }

  if (isFetching) return <LoadingSpinner loadingText='Loading todos...' />

  const handleOnTodoClick = (todo_id: string) => {
    setSelectedTodoId(todo_id)
    setIsCreateTodoOpen(true)
  }

  const handleOnCreateTodoClick = () => {
    setSelectedTodoId(undefined)
    setIsCreateTodoOpen(false)
  }

  return (
    <>
      {isCreateTodoOpen && (
        <CreateUpdateTodo isOpen={isCreateTodoOpen} todo_id={selectedTodoId} onClose={handleOnCreateTodoClick} />
      )}
      <Stack
        alignItems='flex-end'
        justifyContent='flex-end'
        direction='row'
        sx={{ mb: 1, position: 'sticky', top: 0, zIndex: 99, bgcolor: 'background.paper' }}
      >
        <Button
          variant='contained'
          size='small'
          disabled={(todos ?? []).length >= 10}
          sx={{ alignSelf: 'flex-end', mb: 1, textTransform: 'none', fontWeight: 500 }}
          onClick={() => setIsCreateTodoOpen(true)}
        >
          New
        </Button>
      </Stack>
      <List sx={{ width: '100%', p: 0, gap: 1.5, display: 'flex', flexDirection: 'column', cursor: 'pointer' }}>
        {todos?.length == 0 ? (
          <Stack alignItems='center' justifyContent='center' sx={{ py: 8, px: 2, textAlign: 'center' }}>
            <Typography variant='body1' fontWeight='500' color='text.secondary'>
              No todos. No need to hurry!
            </Typography>
          </Stack>
        ) : (
          todos?.map(todo => {
            const colors = getPriorityColor(todo.priority)

            return (
              <Paper
                key={todo.todo_id}
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderLeft: `4px solid ${todo.status === 1 ? '#e0e0e0' : colors.main}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  bgcolor: todo.status === 1 ? '#f9f9f9' : '#ffffff',
                  opacity: todo.status === 1 ? 0.7 : 1,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <ListItem>
                  <ListItemIcon sx={{ minWidth: 48, pl: 1 }}>
                    {isUpdating && selectedTodoId === todo.todo_id ? (
                      <CircularProgress size={20} color='primary' />
                    ) : (
                      <Checkbox
                        edge='start'
                        checked={todo.status === 1}
                        onChange={() => handleToggle(todo.todo_id ?? '', todo.status ?? 1)}
                        sx={{
                          color: todo.status === 1 ? '#bdbdbd' : colors.main,
                          '&.Mui-checked': {
                            color: '#bdbdbd'
                          }
                        }}
                      />
                    )}
                  </ListItemIcon>

                  <ListItemText
                    onClick={() => handleOnTodoClick(todo.todo_id ?? '')}
                    primary={
                      <Typography
                        variant='body1'
                        fontWeight='500'
                        sx={{
                          textDecoration: todo.status === 1 ? 'line-through' : 'none',
                          color: todo.status === 1 ? '#9e9e9e' : '#2c3e50'
                        }}
                      >
                        {todo.title}
                      </Typography>
                    }
                    secondary={
                      <Stack direction='column' spacing={0.25}>
                        <Typography variant='caption' color='text.secondary'>
                          {todo.description}
                        </Typography>
                        <Typography variant='caption' color='success.main' sx={{ fontStyle: 'italic' }}>
                          {todo.due_date}
                        </Typography>
                      </Stack>
                    }
                    sx={{ my: 1.5 }}
                  />

                  {/* Priority Badge */}
                  <Stack direction='row' alignItems='center' spacing={1} sx={{ mr: 1 }}>
                    <Chip
                      label={todo.priority}
                      size='small'
                      color={todo.status === 1 ? 'default' : colors.label}
                      variant={todo.status === 1 ? 'outlined' : 'filled'}
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        borderRadius: 1
                      }}
                    />
                    <IconButton
                      edge='end'
                      aria-label='delete'
                      onClick={() => handleDelete(todo.todo_id ?? '')}
                      size='small'
                    >
                      {isDeleting && selectedTodoId === todo.todo_id ? (
                        <CircularProgress size={20} color='error' />
                      ) : (
                        <GetChaarvyIcons color='error' iconName={ChaarvyIcon.TrashCanOutline} fontSize='1.25rem' />
                      )}
                    </IconButton>
                  </Stack>
                </ListItem>
              </Paper>
            )
          })
        )}
      </List>
    </>
  )
}
