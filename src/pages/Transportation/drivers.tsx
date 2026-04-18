import React, { useState } from 'react'

import { Box, Chip, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { FilterProps } from 'src/lib/interfaces'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'

// import { useLazyGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
const Drivers = () => {
  const { openDrawer } = useSideDrawer()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })
  const handleCreateDriverClick = () => {
    alert('Open create driver form in drawer')
  }

  const handleFilteredDrivers = (params?: FilterProps) => {
    console.log('Filter params:', params)
  }

  const onFilterButtonClick = () => {
    openDrawer(
      'Filters',
      <RenderFilterOptions
        statusOptions={[{ label: 'Active', value: 'active' }]}
        onSubmit={handleFilteredDrivers}
        fields={['search', 'status']}
      />
    )
  }

  const driver_stats = [
    {
      value: 0,
      title: 'Total Drivers',
      color: 'success' as const,
      icon: <GetChaarvyIcons iconName='AccountBoxMultipleOutline' />
    },
    {
      value: 0,
      title: 'Active Drivers',
      color: 'info' as const,
      icon: <GetChaarvyIcons iconName='FilterCheckOutline' />
    }
  ]

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'Driver',
      label: 'Driver',
      freezable: true,
      defaultFrozen: true,
      hideable: false,
      render: () => (
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <Box sx={{ flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>Driver Name</Typography>
            <Typography variant='caption'>Contact Number</Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
      hideable: true,
      render: () => (
        <Chip
          label='Active'
          color={statusColors.active}
          sx={{
            height: 24,
            fontSize: '0.75rem',
            textTransform: 'capitalize',
            '& .MuiChip-label': { fontWeight: 500 }
          }}
        />
      )
    },
    {
      id: 'contact_no_1',
      label: 'Phone',
      hideable: true
    },
    {
      id: 'actions',
      label: '',
      width: '10px',
      hideable: false, // Keep actions always visible
      render: () => (
        <Box>
          <IconButton size='small'>
            <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' />
          </IconButton>
        </Box>
      )
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Drivers',

        // buttonTitle: 'New Admission',
        onButtonClick: handleCreateDriverClick,
        showFilterIcon: true,
        stats: driver_stats,
        handleFilterButtonClick: onFilterButtonClick,
        icon: <GetChaarvyIcons iconName='FilePlus' />
      }}
      paginationProps={{
        total: 0,
        onChange: data => setFilterProps({ ...filterProps, ...data })
      }}
      tableDataProps={{
        columns,
        data: [],
        getRowKey: row => row.driver_id,
        emptyMessage: 'No Drivers Found'
      }}
    />
  )
}

export default Drivers
