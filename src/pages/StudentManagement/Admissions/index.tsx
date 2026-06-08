import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'

import { Box, Chip, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_PAGINATION_PROPS, DEFAULT_TABLE_ITEMS_LIMIT } from 'src/constants/constants'
import { PagePath } from 'src/constants/pagePathConstants'
import { FilterProps } from 'src/lib/interfaces'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import {
  Admissions,
  useGetProcessingFeesPendingEnrollmentsQuery,
  useLazyGetAdmissionsListQuery
} from 'src/store/services/admisissionsService'
import { useGetApplicationFeesPaymentMutation } from 'src/store/services/feesServices'
import { statusColors } from 'src/utils/constants'
import GetChaarvyIcons from 'src/utils/icons'

const AdmissionsList = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()
  const [fetchAdmissions, { data: admissionResponse, isFetching: isFetchingAdmissions }] =
    useLazyGetAdmissionsListQuery()
  const [filterProps, setFilterProps] = useState<FilterProps>(DEFAULT_PAGINATION_PROPS)

  const [createPayment, { isLoading: isCreatingPaymentLink }] = useGetApplicationFeesPaymentMutation()
  const { data: processingFeesPendingEnrollments } = useGetProcessingFeesPendingEnrollmentsQuery()

  const [admissionList, setAdmissionsList] = useState<Admissions[]>([])

  useEffect(() => {
    if (admissionResponse?.admissions) {
      setAdmissionsList(prev => {
        if (filterProps.offset === 0) {
          return admissionResponse.admissions
        }

        const existingIds = new Set(prev.map(item => item.admission_number))
        const newAdmissions = admissionResponse.admissions.filter(item => !existingIds.has(item.admission_number))

        return [...prev, ...newAdmissions]
      })
    }
  }, [admissionResponse?.admissions, filterProps.offset])

  useEffect(() => {
    fetchAdmissions(filterProps)
  }, [filterProps])

  const handleCreateAdmissionClick = () => {
    router.push(PagePath.CREATE_ADMISSION)
  }

  const handleCreatePayment = async () => {
    try {
      if (!processingFeesPendingEnrollments || processingFeesPendingEnrollments.length === 0) {
        return
      }
      const response = await createPayment({
        student_course_enrollment_id: processingFeesPendingEnrollments,
        email: '',
        source: 'app'
      }).unwrap()
      router.push(response.short_url)
    } catch (error) {
      console.error('Error creating payment:', error)
    }
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
    setAdmissionsList([])
    setFilterProps(prev => ({
      ...prev,
      ...params,
      offset: 0
    }))
  }

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions
          onSubmit={handleFilteredAdmissions}
          fields={['search', 'program', 'sections']}
          defaultValues={filterProps}
          resetFilters={() => setFilterProps(DEFAULT_PAGINATION_PROPS)}
        />
      )
    })
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
      id: 'segment_name',
      label: 'Class',
      hideable: true
    },

    {
      id: 'section_name',
      label: 'Section',
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
      hideable: true,
      defaultHidden: true
    },
    {
      id: 'actions',
      label: 'Actions',
      width: '10px',
      hideable: false, // Keep actions always visible
      render: row => <DropDownMenu dropDownMenuOptions={getKebabOptions(row.student_id)} />
    }
  ]

  const showLoader = useMemo(() => {
    return isFetchingAdmissions || processingFeesPendingEnrollments === undefined
  }, [isFetchingAdmissions, processingFeesPendingEnrollments])

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Admissions',
        buttonTitle: 'New Admission',
        onButtonClick: handleCreateAdmissionClick,
        showFilterIcon: true,
        stats: admission_stats,
        handleFilterButtonClick: onFilterButtonClick,
        iconName: 'FilePlus',
        optionalButtonColor: 'warning',
        optionalButtonText:
          (processingFeesPendingEnrollments?.length ?? 0) > 0
            ? isCreatingPaymentLink
              ? 'Generating Payment Link...'
              : 'Pay processing fees'
            : undefined,
        onOptionalButtonClick: handleCreatePayment
      }}
      tableDataProps={{
        columns,
        data: admissionList,
        getRowKey: row => row.application_id,
        emptyMessage: 'No Admissions',
        isLoading: showLoader,
        hasMore: admissionList.length > 0 && admissionList.length < (admissionResponse?.counts?.filtered ?? 0),
        onLoadMore: () =>
          setFilterProps(prev => ({
            ...prev,
            offset: (prev?.offset ?? 0) + (prev?.limit ?? DEFAULT_TABLE_ITEMS_LIMIT)
          }))
      }}
    />
  )
}

export default AdmissionsList
