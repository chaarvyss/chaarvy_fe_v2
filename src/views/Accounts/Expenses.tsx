import { useEffect, useState } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_TABLE_ITEMS_LIMIT } from 'src/constants/constants'
import { FilterProps, TableHeaderStatCardProps } from 'src/lib/interfaces'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import GetChaarvyIcons from 'src/utils/icons'

const Expenses = () => {
  const { openDrawer } = useSideDrawer()

  const [expensesData, setExpensesData] = useState<any[]>([])

  const expesnsesResponse = {
    filtered: 2
  }

  const [filterProps, setFilterProps] = useState<FilterProps>({
    searchText: undefined,
    limit: DEFAULT_TABLE_ITEMS_LIMIT,
    offset: 0,
    status_: undefined,
    startDate: undefined,
    endDate: undefined
  })

  const onSubmit = (params?: FilterProps) => {
    console.log('Filter params submitted:', params)
  }

  const columns = [
    {
      id: 'id',
      label: 'ID'
    },
    {
      id: 'benficiary',
      label: 'Beneficiary'
    },
    {
      id: 'amount',
      label: 'Amount'
    }
  ]

  const data = [
    {
      id: 1,
      benficiary: 'John Doe',
      amount: '$100'
    },
    {
      id: 2,
      benficiary: 'Jane Smith',
      amount: '$200'
    }
  ]

  useEffect(() => {
    setExpensesData(data)
  }, [filterProps])

  const statusOptions = [
    {
      label: 'Successful',
      value: '1'
    },
    {
      label: 'Failed',
      value: '0'
    }
  ]

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions onSubmit={onSubmit} fields={['dateRange', 'status']} statusOptions={statusOptions} />
      )
    })
  }

  const expensesStats: TableHeaderStatCardProps[] = [
    {
      value: 0,
      title: 'Total Expenses',
      color: ThemeColorEnum.Primary,
      icon: <GetChaarvyIcons iconName='Transfer' fontSize={ChaarvyIconFontSize.lg} />
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Expenses',
        stats: expensesStats,
        showFilterIcon: true,
        handleFilterButtonClick: onFilterButtonClick,
        onSearch: (searchText: string) => {
          setExpensesData([]) // Clear existing data when a new search is initiated
          setFilterProps(prev => ({
            ...prev,
            searchText: searchText,
            offset: 0
          }))
        },
        searchValue: filterProps.searchText
      }}
      tableDataProps={{
        columns: columns,
        data: expensesData,
        getRowKey: row => row.id,
        hasMore: expensesData.length > 0 && expensesData.length < (expesnsesResponse?.filtered ?? 0),
        onLoadMore: () => () => {
          setFilterProps(prev => ({
            ...prev,
            offset: (prev?.offset ?? 0) + (prev?.limit ?? DEFAULT_TABLE_ITEMS_LIMIT)
          }))
        }
      }}
    />
  )
}

export default Expenses
