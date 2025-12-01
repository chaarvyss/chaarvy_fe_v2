import { useRouter } from 'next/router'
import React, { useEffect, useState } from 'react'

import { Box, Chip, Typography } from '@muiElements'
import { useLoader } from 'src/@core/context/loaderContext'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import { PagePath } from 'src/constants/pagePathConstants'
import { FilterProps } from 'src/lib/interfaces'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import ChaarvyDataTable, { ChaarvyTableColumn } from 'src/reusable_components/ChaarvyDataTable'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import DynamicHeightTableContainer from 'src/reusable_components/DynamicHeightTableContainer'
import ChaarvyPagination from 'src/reusable_components/Pagination'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useLazyGetAdmissionsListQuery } from 'src/store/services/admisissionsService'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'

const Admissions = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()
  const { setLoading } = useLoader()
  const [fetchAdmissions, { data: admissionResponse, isLoading }] = useLazyGetAdmissionsListQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })

  useEffect(() => {
    fetchAdmissions(filterProps)
  }, [filterProps])

  setLoading(isLoading)
  const handleCreateAdmissionClick = () => {
    router.push(PagePath.CREATE_ADMISSION)
  }

  const getKebabOptions = (application_id: string) => {
    return [
      {
        id: 'edit application',
        label: 'Edit Application',
        icon: <GetChaarvyIcons iconName='GreasePencil' />,
        onOptionClick: () => router.push(`${PagePath.CREATE_ADMISSION}?id=${application_id}`)
      }
    ]
  }

  const handleFilteredAdmissions = (params?: FilterProps) => {
    fetchAdmissions({ ...filterProps, ...params })
  }

  const onFilterButtonClick = () => {
    openDrawer(
      'Filters',
      <RenderFilterOptions onSubmit={handleFilteredAdmissions} fields={['search', 'program', 'sections']} />
    )
  }

  const admission_stats = [
    {
      value: admissionResponse?.counts?.total ?? 0,
      title: 'Total Admissions',
      color: 'success' as const,
      icon: <GetChaarvyIcons iconName='AccountBoxMultipleOutline' />
    },
    {
      value: admissionResponse?.counts?.filtered ?? 0,
      title: 'Filtered Admissions',
      color: 'info' as const,
      icon: <GetChaarvyIcons iconName='FilterCheckOutline' />
    }
  ]

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'student_name',
      label: 'Student Name',
      sticky: true,
      hideable: false, // Keep this always visible
      render: row => (
        <Box sx={{ alignItems: 'center', display: 'flex', flexDirection: 'row', gap: '1rem' }}>
          <ChaarvyAvatar src={row.photo_url} alt={row.student_name} />
          <Box sx={{ flexDirection: 'column' }}>
            <Typography sx={{ fontWeight: 500, fontSize: '0.875rem !important' }}>{row.student_name}</Typography>
            <Typography variant='caption'>{row.admission_number}</Typography>
          </Box>
        </Box>
      )
    },
    {
      id: 'father_name',
      label: 'Father Name',
      hideable: true,
      defaultHidden: true // Hidden by default, but user can show it
    },
    {
      id: 'dob',
      label: 'Date of Birth',
      hideable: true,
      defaultHidden: true // Hidden by default, but user can show it
    },
    {
      id: 'program_name',
      label: 'Program',
      hideable: true
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
      render: row => <DropDownMenu dropDownMenuOptions={getKebabOptions(row.application_id)} />
    }
  ]

  return (
    <DynamicHeightTableContainer
      header={
        <TableTilteHeader
          title='Admissions'
          buttonTitle='New Admission'
          onButtonClick={handleCreateAdmissionClick}
          showFilterIcon={true}
          stats={admission_stats}
          handleFilterButtonClick={onFilterButtonClick}
          icon={<GetChaarvyIcons iconName='FilePlus' />}
        />
      }
      pagination={
        <ChaarvyPagination
          total={admissionResponse?.counts?.filtered ?? 0}
          onChange={data => setFilterProps({ ...filterProps, ...data })}
        />
      }
    >
      <ChaarvyDataTable
        columns={columns}
        data={admissionResponse?.admissions ?? []}
        getRowKey={row => row.application_id}
        emptyMessage='No Admissions'
      />
    </DynamicHeightTableContainer>
  )
}

export default Admissions
