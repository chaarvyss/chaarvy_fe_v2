import React from 'react'

import ChaarvyPagination, { PaginationProps } from 'src/reusable_components/Pagination'
import ChaarvyDataTable, { ChaarvyDataTableProps } from 'src/reusable_components/Table/ChaarvyDataTable'
import DynamicHeightTableContainer from 'src/reusable_components/Table/DynamicHeightTableContainer'
import TableTilteHeader, { TableTitleHeaderProps } from 'src/reusable_components/Table/TableTilteHeader'

interface ChaarvyTableProps {
  tableTitleHeaderProps: TableTitleHeaderProps
  paginationProps?: PaginationProps
  tableDataProps: ChaarvyDataTableProps
}

const ChaarvyTable = ({ tableTitleHeaderProps, paginationProps, tableDataProps }: ChaarvyTableProps) => {
  return (
    <DynamicHeightTableContainer
      header={<TableTilteHeader {...tableTitleHeaderProps} />}
      pagination={paginationProps && <ChaarvyPagination {...paginationProps} />}
    >
      <ChaarvyDataTable {...tableDataProps} />
    </DynamicHeightTableContainer>
  )
}

export default ChaarvyTable
