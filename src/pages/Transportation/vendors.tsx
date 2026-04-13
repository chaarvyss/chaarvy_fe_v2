import { useRouter } from 'next/router'
import React, { useState } from 'react'

import { Box, Chip, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { PagePath } from 'src/constants/pagePathConstants'
import { FilterProps } from 'src/lib/interfaces'
import { ChaarvyTableColumn } from 'src/reusable_components/ChaarvyDataTable'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'

// import { useLazyGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
const VehicleVendors = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()

  // const { setLoading } = useLoader()

  // const [fetchAdmissions, { data: admissionResponse, isLoading }] = useLazyGetAdmissionsListQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })

  // useEffect(() => {
  //   fetchAdmissions(filterProps)
  // }, [filterProps])

  // useEffect(() => {
  //   setLoading(isLoading)
  // }, [isLoading])

  const handleCreateAdmissionClick = () => {
    router.push(PagePath.CREATE_ADMISSION)
  }

  const handleFilteredAdmissions = (params?: FilterProps) => {
    console.log('Filter params:', params)

    // fetchAdmissions({ ...filterProps, ...params })
  }

  const onFilterButtonClick = () => {
    openDrawer(
      'Filters',
      <RenderFilterOptions
        statusOptions={[{ label: 'Active', value: 'active' }]}
        onSubmit={handleFilteredAdmissions}
        fields={['search', 'status']}
      />
    )
  }

  const admission_stats = [
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

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'Vendor',
      label: 'Vendor',
      freezable: true,
      defaultFrozen: true,
      hideable: false,
      render: () => (
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <Box sx={{ flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>Vendor Name</Typography>
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
        title: 'Vendors',

        // buttonTitle: 'New Admission',
        onButtonClick: handleCreateAdmissionClick,
        showFilterIcon: true,
        stats: admission_stats,
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
        getRowKey: row => row.application_id,
        emptyMessage: 'No Vendors Found'
      }}
    />
  )
}

export default VehicleVendors
