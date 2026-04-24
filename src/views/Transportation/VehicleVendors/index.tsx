import React, { useState } from 'react'

import { Box, Chip, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { FilterProps } from 'src/lib/interfaces'
import { ChaarvyTableColumn } from 'src/reusable_components/Table/ChaarvyDataTable'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'

import AddAndUpdateVehicleVendor from './addAndUpdateVehicleVendor'

const stats = [
  {
    value: 0,
    title: 'Total Vendors',
    color: 'success' as const,
    icon: <GetChaarvyIcons iconName='AccountBoxMultipleOutline' />
  },
  {
    value: 0,
    title: 'Active Vendors',
    color: 'info' as const,
    icon: <GetChaarvyIcons iconName='FilterCheckOutline' />
  }
]

const VehicleVendors = () => {
  const { openDrawer } = useSideDrawer()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })

  console.log(filterProps)

  const handleFilter = (params?: FilterProps) => {
    console.log('Filter params:', params)
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'Vendor',
      label: 'Vendor',
      freezable: true,
      defaultFrozen: true,
      hideable: false,
      render: () => (
        <Box display='flex' gap='1rem'>
          <Box>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem' }}>Vendor Name</Typography>
            <Typography variant='caption'>Contact Number</Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'status',
      label: 'Status',
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
    { id: 'contact_no_1', label: 'Phone' },
    {
      id: 'actions',
      label: '',
      width: '10px',
      hideable: false,
      render: () => (
        <IconButton size='small'>
          <GetChaarvyIcons iconName='Pencil' fontSize='1.25rem' />
        </IconButton>
      )
    }
  ]

  const handleAddVendor = () => {
    openDrawer({ title: 'Add Vendor', content: <AddAndUpdateVehicleVendor address_id={''} />, size: 'medium' })
  }

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Vendors',
        buttonTitle: 'Add Vendor',
        onButtonClick: () => handleAddVendor(),
        showFilterIcon: true,
        stats,
        handleFilterButtonClick: () =>
          openDrawer({
            title: 'Filters',
            content: (
              <RenderFilterOptions
                statusOptions={[{ label: 'Active', value: 'active' }]}
                onSubmit={handleFilter}
                fields={['search', 'status']}
              />
            )
          }),
        icon: <GetChaarvyIcons fontSize='1.25rem' iconName='FilePlus' />
      }}
      paginationProps={{
        total: 0,
        onChange: data => setFilterProps(prev => ({ ...prev, ...data }))
      }}
      tableDataProps={{
        columns,
        data: [],
        getRowKey: row => row.application_id,
        emptyMessage: 'No Vendors Found'
      }}
    />
  )
}

export default VehicleVendors
