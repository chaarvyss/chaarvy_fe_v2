import { useEffect, useState } from 'react'

import { Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_TABLE_ITEMS_LIMIT } from 'src/constants/constants'
import { FilterProps, TableHeaderStatCardProps } from 'src/lib/interfaces'
import { useGetExpensesListQuery } from 'src/store/services/common/listServices'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import { useDebounce } from 'src/utils/hooks/useDebounce'
import GetChaarvyIcons from 'src/utils/icons'

import AddExpense from './addExpense'

const ExpensesList = () => {
  const { openDrawer } = useSideDrawer()
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const debouncedSearchText = useDebounce(searchText)
  const [filterProps, setFilterProps] = useState<FilterProps>({
    searchText: undefined,
    limit: DEFAULT_TABLE_ITEMS_LIMIT,
    offset: 0,
    status_: undefined,
    startDate: undefined,
    endDate: undefined
  })

  const { data: expensesResponse, isFetching: isFetchingExpenses } = useGetExpensesListQuery(filterProps)

  const onSubmit = (params?: FilterProps) => {
    if (params) {
      setFilterProps(params)
    }
  }

  useEffect(() => {
    setFilterProps(prev => ({
      ...prev,
      offset: 0,
      searchText: debouncedSearchText
    }))
  }, [debouncedSearchText])

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'id',
      label: 'S#',
      render: (row, index) => <Typography variant='body1'>{index + 1 + (filterProps?.offset ?? 0)}</Typography>
    },
    {
      id: 'benficery',
      label: 'Beneficiary name'
    },
    {
      id: 'amount',
      label: 'Amount'
    },
    {
      id: 'expense_date',
      label: 'Payment date'
    },
    {
      id: 'category',
      label: 'Expense category'
    },
    {
      id: 'benficery_type',
      label: 'Beneficiary type'
    },
    {
      id: 'payment_mode',
      label: 'Payment mode'
    }
  ]

  useEffect(() => {
    if (filterProps.offset == 0) {
      setExpensesData(expensesResponse?.expenses ?? [])
    } else {
      setExpensesData(prev => [...prev, ...(expensesResponse?.expenses ?? [])])
    }
  }, [expensesResponse?.expenses])

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: <RenderFilterOptions onSubmit={onSubmit} fields={['dateRange']} />
    })
  }

  const onAddExpenseButtonClick = () => {
    openDrawer({
      title: 'Add expense',
      content: <AddExpense />,
      size: 'large'
    })
  }

  const expensesStats: TableHeaderStatCardProps[] = [
    {
      value: expensesResponse?.amount_total ?? 0,
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
        onSearch: setSearchText,
        searchValue: searchText,
        buttonTitle: 'Add expense',
        iconName: 'Plus',
        onButtonClick: onAddExpenseButtonClick
      }}
      tableDataProps={{
        columns: columns,
        data: expensesData,
        getRowKey: row => row.id,
        isLoading: isFetchingExpenses,
        hasMore: expensesData.length > 0 && expensesData.length < (expensesResponse?.filtered ?? 0),
        emptyMessage: 'No expenses found',
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

export default ExpensesList
