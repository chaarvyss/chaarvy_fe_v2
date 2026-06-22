import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  IconButton,
  Typography,
  Chip,
  Paper,
  Stack
} from '@mui/material'
import React, { useState } from 'react'

import GetChaarvyIcons from 'src/utils/icons'

// Note: You will need @mui/icons-material installed for these

// Define the priority types and their associated MUI theme colors
type Priority = 'High' | 'Medium' | 'Low'

interface Todo {
  id: number
  text: string
  priority: Priority
  completed: boolean
  dueDate: string
}

// Initial mock data tailored to your workflow
const initialTodos: Todo[] = [
  {
    id: 1,
    text: 'Review Devaansh Institute onboarding flow',
    priority: 'High',
    completed: false,
    dueDate: 'Today'
  },
  {
    id: 2,
    text: 'Finalize SOS feature mapping for TMS vendor',
    priority: 'High',
    completed: false,
    dueDate: 'Tomorrow'
  },
  {
    id: 3,
    text: 'Optimize Nifty crossover Python script',
    priority: 'Medium',
    completed: false,
    dueDate: 'Next Week'
  },
  {
    id: 4,
    text: 'Plan weekend surprise for wife',
    priority: 'High',
    completed: true,
    dueDate: 'Completed'
  },
  {
    id: 5,
    text: 'Check LM2596 module circuit diagrams',
    priority: 'Low',
    completed: false,
    dueDate: 'Whenever'
  },
  {
    id: 6,
    text: 'Review Devaansh Institute onboarding flow',
    priority: 'High',
    completed: false,
    dueDate: 'Today'
  },
  {
    id: 7,
    text: 'Finalize SOS feature mapping for TMS vendor',
    priority: 'High',
    completed: false,
    dueDate: 'Tomorrow'
  },
  {
    id: 8,
    text: 'Optimize Nifty crossover Python script',
    priority: 'Medium',
    completed: false,
    dueDate: 'Next Week'
  },
  {
    id: 9,
    text: 'Plan weekend surprise for wife',
    priority: 'High',
    completed: true,
    dueDate: 'Completed'
  }
]

// Helper to map priorities to specific colors
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
  const [todos, setTodos] = useState<Todo[]>(initialTodos)

  const handleToggle = (id: number) => {
    setTodos(todos.map(todo => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)))
  }

  const handleDelete = (id: number) => {
    setTodos(todos.filter(todo => todo.id !== id))
  }

  return (
    <Box sx={{ overflow: 'auto' }}>
      <List sx={{ width: '100%', p: 0, gap: 1.5, display: 'flex', flexDirection: 'column' }}>
        {todos.length == 0 ? (
          <Stack alignItems='center' justifyContent='center' sx={{ py: 8, px: 2, textAlign: 'center' }}>
            <Typography variant='body1' fontWeight='500' color='text.secondary'>
              No todos. No need to hurry!
            </Typography>
          </Stack>
        ) : (
          todos.map(todo => {
            const colors = getPriorityColor(todo.priority)

            return (
              <Paper
                key={todo.id}
                elevation={0}
                sx={{
                  border: '1px solid #e0e0e0',
                  borderLeft: `4px solid ${todo.completed ? '#e0e0e0' : colors.main}`,
                  borderRadius: 2,
                  transition: 'all 0.2s ease',
                  bgcolor: todo.completed ? '#f9f9f9' : '#ffffff',
                  opacity: todo.completed ? 0.7 : 1,
                  '&:hover': {
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    transform: 'translateY(-1px)'
                  }
                }}
              >
                <ListItem
                  secondaryAction={
                    <IconButton edge='end' aria-label='delete' onClick={() => handleDelete(todo.id)} size='small'>
                      <GetChaarvyIcons iconName='Delete' />
                    </IconButton>
                  }
                  disablePadding
                >
                  <ListItemIcon sx={{ minWidth: 48, pl: 1 }}>
                    <Checkbox
                      edge='start'
                      checked={todo.completed}
                      onChange={() => handleToggle(todo.id)}
                      sx={{
                        color: todo.completed ? '#bdbdbd' : colors.main,
                        '&.Mui-checked': {
                          color: '#bdbdbd'
                        }
                      }}
                    />
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography
                        variant='body1'
                        fontWeight='500'
                        sx={{
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? '#9e9e9e' : '#2c3e50'
                        }}
                      >
                        {todo.text}
                      </Typography>
                    }
                    secondary={
                      <Typography variant='caption' color='text.secondary'>
                        {todo.dueDate}
                      </Typography>
                    }
                    sx={{ my: 1.5 }}
                  />

                  {/* Priority Badge */}
                  <Box sx={{ pr: 2 }}>
                    <Chip
                      label={todo.priority}
                      size='small'
                      color={todo.completed ? 'default' : colors.label}
                      variant={todo.completed ? 'outlined' : 'filled'}
                      sx={{
                        height: 24,
                        fontSize: '0.7rem',
                        fontWeight: 'bold',
                        borderRadius: 1
                      }}
                    />
                  </Box>
                </ListItem>
              </Paper>
            )
          })
        )}
      </List>
    </Box>
  )
}
