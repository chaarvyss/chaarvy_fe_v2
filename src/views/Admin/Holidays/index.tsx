import { Box, Card, Typography, IconButton, Chip, Tooltip } from '@mui/material'
import dayjs from 'dayjs'
import React, { useMemo, useState } from 'react'

import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import { ChaarvyButton } from 'src/reusable_components'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { HolidayItem, useCreateUpdateHolidayMutation, useGetHolidaysQuery } from 'src/store/services/adminServices'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import AddUpdateHolidayModal from './AddUpdateHolidayModal'

export const HolidaysView = () => {
  const { triggerToast } = useToast()

  const currentYearNumber = dayjs().year()
  const [selectedYear, setSelectedYear] = useState<number>(currentYearNumber)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal States
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false)
  const [holidayToEdit, setHolidayToEdit] = useState<HolidayItem | null>(null)
  const [holidayToDelete, setHolidayToDelete] = useState<HolidayItem | null>(null)

  // Query Holidays for the selected year
  const start_date = `${selectedYear}-01-01`
  const end_date = `${selectedYear}-12-31`

  const { data: holidaysData, isFetching: isFetchingHolidays } = useGetHolidaysQuery({
    start_date,
    end_date
  })

  const [createUpdateHoliday, { isLoading: isDeleting }] = useCreateUpdateHolidayMutation()

  // Sorted and filtered holidays
  const filteredHolidays = useMemo(() => {
    const list = holidaysData ? [...holidaysData] : []

    // Sort chronologically by date
    list.sort((a, b) => dayjs(a.date).diff(dayjs(b.date)))

    if (!searchQuery.trim()) return list

    const q = searchQuery.toLowerCase().trim()

    return list.filter(
      h =>
        h.holiday_name?.toLowerCase().includes(q) ||
        dayjs(h.date).format('MMMM D, YYYY').toLowerCase().includes(q) ||
        dayjs(h.date).format('dddd').toLowerCase().includes(q)
    )
  }, [holidaysData, searchQuery])

  // Stats for ChaarvyTable header
  const stats: TableHeaderStatCardProps[] = useMemo(() => {
    const list = holidaysData || []
    const today = dayjs().startOf('day')

    const total = list.length
    const upcoming = list.filter(h => dayjs(h.date).isAfter(today) || dayjs(h.date).isSame(today, 'day')).length
    const past = total - upcoming

    return [
      {
        title: 'Total Holidays',
        value: total,
        color: 'primary',
        icon: <GetChaarvyIcons iconName={ChaarvyIcon.CalendarMonthOutline} color='primary' />
      },
      {
        title: 'Upcoming Holidays',
        value: upcoming,
        color: 'success',
        icon: <GetChaarvyIcons iconName={ChaarvyIcon.CalendarClockOutline} color='success' />
      },
      {
        title: 'Past Holidays',
        value: past,
        color: 'info',
        icon: <GetChaarvyIcons iconName={ChaarvyIcon.CalendarCheckOutline} color='info' />
      }
    ]
  }, [holidaysData])

  // Year options: past 2 years, current year, next 2 years
  const yearOptions = useMemo(() => {
    const years: number[] = []
    for (let y = currentYearNumber - 2; y <= currentYearNumber + 2; y++) {
      years.push(y)
    }

    return years
  }, [currentYearNumber])

  // Handlers
  const handleOpenAdd = () => {
    setHolidayToEdit(null)
    setIsAddEditModalOpen(true)
  }

  const handleOpenEdit = (holiday: HolidayItem) => {
    setHolidayToEdit(holiday)
    setIsAddEditModalOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!holidayToDelete?.id) return

    try {
      await createUpdateHoliday({
        details: [],
        deleted_ids: [holidayToDelete.id]
      }).unwrap()

      triggerToast('Holiday deleted successfully', { variant: ToastVariants.SUCCESS })
      setHolidayToDelete(null)
    } catch (err: any) {
      triggerToast(err?.data?.message || err?.data || 'Failed to delete holiday', {
        variant: ToastVariants.ERROR
      })
    }
  }

  // ChaarvyTable Columns
  const columns: ChaarvyTableColumn<HolidayItem>[] = [
    {
      id: 'sno',
      label: 'S#',
      width: '60px',
      render: (row, index) => (
        <Typography variant='body2' fontWeight={600} color='text.secondary'>
          {index + 1}
        </Typography>
      )
    },
    {
      id: 'holiday_name',
      label: 'Holiday Name',
      render: row => (
        <Typography variant='body2' fontWeight={600} color='text.primary'>
          {row.holiday_name}
        </Typography>
      )
    },
    {
      id: 'date',
      label: 'Date',
      render: row => (
        <Typography variant='body2' color='text.secondary'>
          {dayjs(row.date).format('MMMM D, YYYY')}
        </Typography>
      )
    },
    {
      id: 'day_of_week',
      label: 'Day of Week',
      render: row => (
        <Chip
          label={dayjs(row.date).format('dddd')}
          size='small'
          variant='outlined'
          sx={{ fontSize: '0.75rem', fontWeight: 500 }}
        />
      )
    },
    {
      id: 'status',
      label: 'Status',
      render: row => {
        const holidayDate = dayjs(row.date)
        const isToday = holidayDate.isSame(dayjs(), 'day')
        const isPast = holidayDate.isBefore(dayjs(), 'day')

        if (isToday) {
          return <Chip label='Today' size='small' color='primary' sx={{ fontWeight: 600, fontSize: '0.75rem' }} />
        }
        if (isPast) {
          return (
            <Chip
              label='Past'
              size='small'
              sx={{ bgcolor: '#f1f5f9', color: '#64748b', fontSize: '0.75rem', fontWeight: 500 }}
            />
          )
        }

        return (
          <Chip
            label='Upcoming'
            size='small'
            sx={{ bgcolor: '#dbeafe', color: '#1d4ed8', fontSize: '0.75rem', fontWeight: 600 }}
          />
        )
      }
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '100px',
      render: row => (
        <Box display='flex' gap={0.5}>
          <Tooltip title='Edit Holiday'>
            <IconButton
              size='small'
              onClick={() => handleOpenEdit(row)}
              sx={{
                color: 'primary.main',
                '&:hover': { bgcolor: 'primary.light', color: 'primary.dark' }
              }}
            >
              <GetChaarvyIcons iconName={ChaarvyIcon.Pencil} fontSize='1.25rem' />
            </IconButton>
          </Tooltip>
          <Tooltip title='Delete Holiday'>
            <IconButton
              size='small'
              onClick={() => setHolidayToDelete(row)}
              sx={{
                color: 'error.main',
                '&:hover': { bgcolor: 'error.light', color: 'error.dark' }
              }}
            >
              <GetChaarvyIcons iconName={ChaarvyIcon.DeleteOutline} fontSize='1.25rem' />
            </IconButton>
          </Tooltip>
        </Box>
      )
    }
  ]

  return (
    <Box display='flex' flexDirection='column' gap={2.5}>
      {/* Year Selector Filter Bar */}
      <Card
        sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}
      >
        <Box display='flex' alignItems='center' gap={1.5} flexWrap='wrap'>
          <Typography variant='subtitle2' fontWeight={700} color='text.primary'>
            Calendar Year:
          </Typography>
          <Box display='flex' gap={1} flexWrap='wrap'>
            {yearOptions.map(y => (
              <Chip
                key={y}
                label={y}
                clickable
                color={y === selectedYear ? 'primary' : 'default'}
                variant={y === selectedYear ? 'filled' : 'outlined'}
                onClick={() => setSelectedYear(y)}
                sx={{ fontWeight: y === selectedYear ? 700 : 500 }}
              />
            ))}
          </Box>
        </Box>
        <Typography variant='caption' color='text.secondary'>
          Showing holidays configured for <strong>{selectedYear}</strong>
        </Typography>
      </Card>

      {/* ChaarvyTable Component */}
      <ChaarvyTable
        tableTitleHeaderProps={{
          title: `Holidays (${selectedYear})`,
          buttonTitle: 'Add Holiday',
          iconName: ChaarvyIcon.Plus,
          onButtonClick: handleOpenAdd,
          onSearch: text => setSearchQuery(text),
          searchValue: searchQuery,
          stats
        }}
        tableDataProps={{
          columns,
          data: filteredHolidays,
          getRowKey: (row, index) => row.id || `holiday-${index}`,
          isLoading: isFetchingHolidays,
          emptyMessage: searchQuery
            ? 'No holidays match your search'
            : `No holidays configured for ${selectedYear}. Click "Add Holiday" to create one.`
        }}
      />

      {/* Add / Edit Holiday Modal */}
      <AddUpdateHolidayModal
        isOpen={isAddEditModalOpen}
        onClose={() => {
          setIsAddEditModalOpen(false)
          setHolidayToEdit(null)
        }}
        holidayToEdit={holidayToEdit}
      />

      {/* Delete Confirmation Modal */}
      <ChaarvyModal
        isOpen={Boolean(holidayToDelete)}
        onClose={() => setHolidayToDelete(null)}
        modalSize='col-11 col-sm-8 col-md-5 col-lg-4'
        title='Delete Holiday'
        footer={
          <Box display='flex' justifyContent='flex-end' gap={1.5} width='100%' p={1}>
            <ChaarvyButton variant='outlined' color='secondary' onClick={() => setHolidayToDelete(null)} size='small'>
              Cancel
            </ChaarvyButton>
            <ChaarvyButton
              variant='contained'
              color='error'
              loading={isDeleting}
              onClick={handleDeleteConfirm}
              size='small'
              sx={{ px: 3 }}
            >
              Delete
            </ChaarvyButton>
          </Box>
        }
      >
        <Box p={2}>
          <Typography variant='body1' mb={1}>
            Are you sure you want to delete the holiday <strong>"{holidayToDelete?.holiday_name}"</strong>?
          </Typography>
          <Typography variant='caption' color='text.secondary'>
            Scheduled for {holidayToDelete?.date ? dayjs(holidayToDelete.date).format('MMMM D, YYYY') : ''}. This action
            cannot be undone.
          </Typography>
        </Box>
      </ChaarvyModal>
    </Box>
  )
}

export default HolidaysView
