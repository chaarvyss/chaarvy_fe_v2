import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_PAGINATION_PROPS, DEFAULT_TABLE_ITEMS_LIMIT } from 'src/constants/constants'
import { PagePath } from 'src/constants/pagePathConstants'
import { PermissionLabels } from 'src/constants/permissions'
import { isAuthorised } from 'src/lib/util/permissionCheck'
import { useGetReferrelSummaryQuery } from 'src/store/services/adminServices'
import GetChaarvyIcons from 'src/utils/icons'

const ReferrelsList = () => {
  const router = useRouter()
  if (!isAuthorised(PermissionLabels.nav.referrels)) {
    router.replace(PagePath.UNAUTHORIZED)
  }

  const { openDrawer } = useSideDrawer()
  const [filterProps, setFilterProps] = useState<FilterProps>(DEFAULT_PAGINATION_PROPS)
  const { data: referralSummary, isFetching: isFetchingAdmissions } = useGetReferrelSummaryQuery(filterProps)

  const handleFilteredAdmissions = (params?: FilterProps) => {
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
          fields={['referred_by', 'dateRange']}
          defaultValues={filterProps}
          resetFilters={() => setFilterProps(DEFAULT_PAGINATION_PROPS)}
        />
      )
    })
  }

  const admission_stats = [
    {
      value: referralSummary?.reduce((acc, valu) => acc + valu.total_admissions, 0) ?? 0,
      title: 'Total Admissions',
      color: 'success' as const,
      icon: <GetChaarvyIcons iconName='AccountBoxMultipleOutline' />
    },
    {
      value: referralSummary?.reduce((acc, valu) => acc + valu.total_fees, 0) ?? 0,
      title: 'Total Fees',
      color: 'info' as const,
      icon: <GetChaarvyIcons iconName='FilterCheckOutline' />
    }
  ]

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'sno',
      label: 'S#',
      render: (row, index) => <Typography>{index + 1}</Typography>
    },
    {
      id: 'referred_by',
      label: 'Referee Name'
    },
    {
      id: 'total_admissions',
      label: 'Total admissions'
    },
    {
      id: 'total_fees',
      label: 'Committed Admission fees'
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Admission referral summary',
        showFilterIcon: true,
        stats: admission_stats,
        handleFilterButtonClick: onFilterButtonClick
      }}
      tableDataProps={{
        columns,
        data: referralSummary ?? [],
        getRowKey: row => row.application_id,
        emptyMessage: 'No Admissions',
        isLoading: isFetchingAdmissions,
        onLoadMore: () =>
          setFilterProps(prev => ({
            ...prev,
            offset: (prev?.offset ?? 0) + (prev?.limit ?? DEFAULT_TABLE_ITEMS_LIMIT)
          }))
      }}
    />
  )
}

export default ReferrelsList
