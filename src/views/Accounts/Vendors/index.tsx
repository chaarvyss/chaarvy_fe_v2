import { useMemo, useState } from 'react'

import { Box, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { useGetVendorsListQuery } from 'src/store/services/common/listServices'
import { useDebounce } from 'src/utils/hooks/useDebounce'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import AddVendor from './AddVendor'

const VendorsList = () => {
  const { openDrawer } = useSideDrawer()

  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 20, offset: 0 })
  const searchProps = useDebounce(filterProps, 500)

  const { data: vendorsList, isFetching: isLoadingVendors } = useGetVendorsListQuery(searchProps)

  const handleAddEditVendor = (vendorId?: string) => {
    openDrawer({
      title: vendorId ? 'Edit Vendor' : 'Add Vendor',
      content: <AddVendor vendorId={vendorId} />,
      size: 'medium'
    })
  }

  const columns: ChaarvyTableColumn[] = useMemo(
    () => [
      {
        id: 's.no',
        label: '#',
        hideable: false,
        render: (row, index) => (
          <Typography variant='body1'>
            {(filterProps?.limit ?? 0) * (filterProps?.offset ?? 0) + (index + 1)}
          </Typography>
        )
      },
      {
        id: 'vendor_name',
        label: 'Vendor Name',
        render: row => (
          <Box>
            <Typography variant='body1'>{row.vendor_name}</Typography>
            <Typography variant='caption' color='textSecondary'>
              {row.email}
            </Typography>
          </Box>
        )
      },
      {
        id: 'vendor_firm_name',
        label: 'Vendor Firm Name'
      },
      {
        id: 'contact_number',
        label: 'Contact Number'
      },
      {
        id: '',
        label: 'Actions',
        render: row => (
          <IconButton
            onClick={() => {
              handleAddEditVendor(row.vendor_id)
            }}
          >
            <GetChaarvyIcons iconName={ChaarvyIcon.Pencil} fontSize='1.25rem' color='primary' />
          </IconButton>
        )
      }
    ],
    [filterProps]
  )

  const onAddVendorClick = () => {
    handleAddEditVendor()
  }

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Vendors',
        buttonTitle: 'Add vendor',
        onButtonClick: onAddVendorClick,
        iconName: 'FilePlus',
        searchValue: filterProps?.searchText ?? '',
        onSearch: value => setFilterProps({ ...filterProps, searchText: value })
      }}
      tableDataProps={{
        columns,
        data: vendorsList?.vendors ?? [], // Use the vendors data here
        getRowKey: row => row.vendor_id,
        emptyMessage: 'No Vendors available',
        isLoading: isLoadingVendors,
        onLoadMore: () => setFilterProps({ ...filterProps, offset: (filterProps?.offset ?? 0) + 20 })
      }}
    />
  )
}

export default VendorsList
