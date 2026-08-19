import { useState } from 'react'

import { Chip } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import GreenDonut from 'src/components/Charts/GreenDonut'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_PAGINATION_PROPS } from 'src/constants/constants'
import { useGetStudentAttendenceLogsQuery } from 'src/store/services/attendenceServices'

const AttendenceLog = () => {
  const [filterProps, setFilterProps] = useState(DEFAULT_PAGINATION_PROPS)

  const { openDrawer } = useSideDrawer() // Assuming you have a custom hook for side drawer state

  const { data: attendenceLogs, isFetching: fetchingLogs } = useGetStudentAttendenceLogsQuery(filterProps)

  const columns: ChaarvyTableColumn<any>[] = [
    {
      id: 'date',
      label: 'Date'
    },
    {
      id: 'period',
      label: 'Period'
    },
    {
      id: 'program',
      label: 'Program'
    },
    {
      id: 'segment',
      label: 'Segment'
    },
    {
      id: 'medium',
      label: 'Medium'
    },
    {
      id: 'section',
      label: 'Section'
    },
    {
      id: 'status',
      label: 'Status',
      render: (row: any) => (
        <Chip size='small' color={row.status ? 'success' : 'warning'} label={row.status ? 'Saved' : 'Draft'} />
      )
    },
    {
      id: 'user',
      label: 'Recorded By'
    },
    {
      id: 'actions',
      label: 'Attendance %',
      render: (row: any) => <GreenDonut value={row.attendance_percentage ?? 0} size={35} />
    }
  ]

  const handleFilteredAttendence = (params?: FilterProps) => {
    setFilterProps(prev => ({
      ...prev,
      ...params,
      offset: 0
    }))
  }

  const handleFilterButtonClick = () => {
    openDrawer({
      title: 'Filter',
      content: (
        <RenderFilterOptions
          onSubmit={handleFilteredAttendence}
          fields={['program', 'segment', 'medium', 'sections', 'dateRange']}
          defaultValues={filterProps}
          resetFilters={() => setFilterProps(DEFAULT_PAGINATION_PROPS)}
        />
      ),
      size: 'small'
    })
  }

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Attendance Log',
        showFilterIcon: true,
        handleFilterButtonClick: handleFilterButtonClick
      }}
      tableDataProps={{
        columns: columns,
        data: attendenceLogs?.logs ?? [],
        getRowKey: (row: any, index: number) => index,
        onRowClick: (row: any) => {
          console.log('Row clicked:', row)
        },
        emptyMessage: 'No data available',
        hover: true,
        showColumnToggle: true,
        isLoading: fetchingLogs,
        loadingText: 'Loading...',
        shouldHideActions: false,
        hasMore: false,
        onLoadMore: () => {
          alert('Load more clicked')
        }
      }}
    />
  )
}

export default AttendenceLog
