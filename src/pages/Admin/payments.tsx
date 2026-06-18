import { Chip, IconButton, Tooltip, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import { ToastVariants, useToast } from 'src/@core/context/toastContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { PagePath } from 'src/constants/pagePathConstants'
import { FilterProps, TableHeaderStatCardProps } from 'src/lib/interfaces'
import Spinner from 'src/reusable_components/spinner'
import { TableTitleHeaderProps } from 'src/reusable_components/Table/TableTilteHeader'
import { useGetPaymentRecieptByPaymentIdMutation } from 'src/store/services/feesServices'
import { useLazyGetPaymentsListQuery } from 'src/store/services/listServices'
import { ChaarvyIconFontSize, ThemeColorEnum } from 'src/utils/enums'
import { printDocument } from 'src/utils/helpers'
import GetChaarvyIcons from 'src/utils/icons'

const Payments = () => {
  const { triggerToast } = useToast()
  const { openDrawer } = useSideDrawer()

  const [loadingPaymentId, setLoadingPaymentId] = useState<string>()

  const [fetchPaymentReciept] = useGetPaymentRecieptByPaymentIdMutation()

  const router = useRouter()

  const [fetchPaymentsList, { data: PaymentsList, isFetching: isFetchingPayments }] = useLazyGetPaymentsListQuery()

  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0, status_: '1' })

  const onSubmit = (params?: FilterProps) => {
    fetchPaymentsList(params)
  }

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
        <RenderFilterOptions
          onSubmit={onSubmit}
          fields={['search', 'dateRange', 'status']}
          statusOptions={statusOptions}
        />
      )
    })
  }

  useEffect(() => {
    fetchPaymentsList(filterProps)
      .unwrap()
      .catch(e => {
        triggerToast(e.data, { variant: ToastVariants.ERROR })
      })
  }, [filterProps])

  const handleRecieptDownload = async (payment_id: string) => {
    setLoadingPaymentId(payment_id)
    fetchPaymentReciept(payment_id)
      .unwrap()
      .then(pdfBlob => {
        if (!pdfBlob) return

        const url = globalThis.window.URL.createObjectURL(pdfBlob)
        printDocument(url)
      })
      .catch(() => {
        triggerToast('Failed to generate reciept', {
          variant: ToastVariants.ERROR
        })
      })
      .finally(() => setLoadingPaymentId(undefined))
  }

  const paymentStats: TableHeaderStatCardProps[] = [
    {
      value: PaymentsList?.counts?.total ?? 0,
      title: 'Total Transactions',
      color: ThemeColorEnum.Primary,
      icon: <GetChaarvyIcons iconName='Transfer' fontSize={ChaarvyIconFontSize.lg} />
    },
    {
      value: PaymentsList?.counts?.filtered ?? 0,
      title: 'Filtered Count',
      color: ThemeColorEnum.Warning,
      icon: <GetChaarvyIcons iconName='Abacus' fontSize={ChaarvyIconFontSize.lg} />
    },
    {
      value: PaymentsList?.counts?.amount ?? 0,
      color: ThemeColorEnum.Success,
      title: 'Amount Collected',
      icon: <GetChaarvyIcons iconName='CurrencyRupee' fontSize={ChaarvyIconFontSize.lg} />
    }
  ]

  const getUserTableHeader = () => {
    const props: TableTitleHeaderProps = {
      title: 'Payments',
      stats: paymentStats,
      showFilterIcon: true,
      buttonTitle: 'Collect Payment',
      onButtonClick: () => router.push('/StudentManagement/Payments/pendingPayments'),
      handleFilterButtonClick: onFilterButtonClick
    }

    return props
  }

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'sno',
      label: 'S#',
      render: (row, index) => <Typography>{(filterProps?.offset ?? 0) + index + 1}</Typography>
    },
    {
      id: 'admission_number',
      label: 'Admission number'
    },
    {
      id: 'student_name',
      label: 'Student Name'
    },
    {
      id: 'status',
      label: 'Status',
      render: row => (
        <Chip
          size='small'
          color={row.status == 1 ? 'success' : 'error'}
          label={row.status == 1 ? 'Success' : 'Failed'}
        />
      )
    },
    {
      id: 'amount',
      label: 'Amount'
    },
    {
      id: 'created_date',
      label: 'Payment Date'
    },
    {
      id: 'action',
      label: 'Action',
      render: row => (
        <>
          <Tooltip title='Payment Reciept' placement='top'>
            <IconButton disabled={!!loadingPaymentId} onClick={() => handleRecieptDownload(row.payment_id)}>
              {loadingPaymentId == row.payment_id ? (
                <Spinner size={20} />
              ) : (
                <GetChaarvyIcons iconName='FileDocument' color='success' fontSize='1.25rem' />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title='Payments' placement='top'>
            <IconButton onClick={() => router.push(`${PagePath.COLLECT_PAYMENT}?id=${row.admission_number}`)}>
              <GetChaarvyIcons iconName='BankTransferIn' color='info' fontSize='1.25rem' />
            </IconButton>
          </Tooltip>
        </>
      )
    }
  ]

  return (
    <ChaarvyTable
      tableTitleHeaderProps={getUserTableHeader()}
      tableDataProps={{
        columns,
        data: PaymentsList?.payments ?? [],
        getRowKey: each => each.payment_id,
        isLoading: isFetchingPayments
      }}
      paginationProps={{
        total: PaymentsList?.counts.filtered ?? 0,
        onChange: data => setFilterProps({ ...filterProps, ...data })
      }}
    />
  )
}

export default Payments
