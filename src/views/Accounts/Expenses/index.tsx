import { useEffect, useState } from 'react'

import { IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_TABLE_ITEMS_LIMIT } from 'src/constants/constants'
import { FilterProps, TableHeaderStatCardProps } from 'src/lib/interfaces'
import { useGetExpensesListQuery } from 'src/store/services/common/listServices'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import { useDebounce } from 'src/utils/hooks/useDebounce'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import AddExpense from './addExpense'
import { isAuthorised } from 'src/lib/util/permissionCheck'
import { PermissionLabels } from 'src/constants/permissions'
import { PagePath } from 'src/constants/pagePathConstants'
import { useRouter } from 'next/navigation'

const ExpensesList = () => {
  const router = useRouter()
  const { openDrawer } = useSideDrawer()
  const [expensesData, setExpensesData] = useState<any[]>([])
  const [searchText, setSearchText] = useState<string>('')
  const [selectedExpenseId, setSelectedSectionId] = useState<string>()
  const debouncedSearchText = useDebounce(searchText)
  const [filterProps, setFilterProps] = useState<FilterProps>({
    searchText: undefined,
    limit: DEFAULT_TABLE_ITEMS_LIMIT,
    offset: 0,
    status_: undefined,
    startDate: undefined,
    endDate: undefined
  })

  if (!isAuthorised(PermissionLabels.expenses.view.list)) router.replace(PagePath.UNAUTHORIZED)

  const { data: expensesResponse, isFetching: isFetchingExpenses } = useGetExpensesListQuery(filterProps)

  useEffect(() => {
    setFilterProps(prev => ({
      ...prev,
      offset: 0,
      searchText: debouncedSearchText
    }))
  }, [debouncedSearchText])

  useEffect(() => {
    if (filterProps.offset == 0) {
      setExpensesData(expensesResponse?.expenses ?? [])
    } else {
      setExpensesData(prev => [...prev, ...(expensesResponse?.expenses ?? [])])
    }
  }, [expensesResponse?.expenses])

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'id',
      label: 'S#',
      render: (row, index) => <Typography variant='body1'>{index + 1 + (filterProps?.offset ?? 0)}</Typography>
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
      id: 'benficery',
      label: 'Beneficiary name'
    },
    {
      id: 'benficery_type',
      label: 'Beneficiary type'
    },
    {
      id: 'amount',
      label: 'Amount'
    },
    {
      id: 'payment_mode',
      label: 'Payment mode'
    },
    ...(isAuthorised(PermissionLabels.expenses.edit)
      ? [
          {
            id: 'actions',
            label: 'Actions',
            width: '40px',
            render: row => (
              <IconButton
                onClick={() => {
                  setSelectedSectionId(row.expense_id)
                }}
              >
                <GetChaarvyIcons color='info' iconName={ChaarvyIcon.Pencil} fontSize='1.25rem' />
              </IconButton>
            )
          }
        ]
      : [])
  ]

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions
          onSubmit={onSubmit}
          fields={[
            'dateRange',
            { fieldType: 'benficery_types', isMultiselect: true },
            { fieldType: 'payment_modes', isMultiselect: true },
            { fieldType: 'expense_category_types', isMultiselect: true }
          ]}
        />
      )
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

  const onAddExpenseButtonClick = () => {
    openDrawer({
      title: selectedExpenseId ? 'Update expense' : 'Add expense',
      content: <AddExpense expenseId={selectedExpenseId} onSuccess={() => setSelectedSectionId(undefined)} />,
      size: 'large'
    })
  }

  const onSubmit = (params?: FilterProps) => {
    if (params) {
      setFilterProps(params)
    }
  }

  useEffect(() => {
    if (selectedExpenseId) {
      onAddExpenseButtonClick()
    }
  }, [selectedExpenseId])

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Expenses',
        stats: expensesStats,
        showFilterIcon: true,
        handleFilterButtonClick: onFilterButtonClick,
        // onSearch: setSearchText,
        // searchValue: searchText,
        buttonTitle: isAuthorised(PermissionLabels.expenses.add) ? 'Add expense' : undefined,
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
