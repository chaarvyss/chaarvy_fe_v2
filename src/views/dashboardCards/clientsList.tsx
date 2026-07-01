import React from 'react'

import { Typography } from '@muiElements'
import { DashboardTable } from 'src/components/Cards/dashboardCards'
import { useGetDashClientStatsQuery } from 'src/store/services/MasterServices/dashboardServices'
import { useDebounce } from 'src/utils/hooks/useDebounce'

interface ClientsListProps {
  searchText?: string
}

const ClientsList = ({ searchText }: ClientsListProps) => {
  const filterProps = {
    limit: 20,
    offset: 0
  }

  const debouncedSearchText = useDebounce(searchText)

  const { data: clientStatData, isFetching: isFetchingData } = useGetDashClientStatsQuery({
    ...filterProps,
    ...(debouncedSearchText ? { searchText: debouncedSearchText } : {})
  })

  const columns = [
    {
      id: 'sno',
      label: 'S#',
      width: '50px',
      render: (row: DashClientsResponse, index: number) => <Typography>{index + 1}</Typography>
    },
    {
      id: 'clcode',
      label: 'Client code',
      width: '100px'
    },

    {
      id: 'activeStudents',
      label: 'Active Students'
    },
    {
      id: 'paid',
      label: 'Paid Students'
    },
    {
      id: 'pending',
      label: 'Pending Students'
    },
    {
      id: 'collected',
      label: 'Amount Credited'
    },
    {
      id: 'target',
      label: 'Target'
    }
  ]

  const props = {
    columns,
    data: clientStatData ?? [],
    isLoading: isFetchingData,
    getRowKey: (row: DashClientsResponse) => row.clcode
  }

  return <DashboardTable {...props} />
}

export default ClientsList
