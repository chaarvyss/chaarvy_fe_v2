import React, { useEffect, useState } from 'react'

import { Box, Card, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@muiElements'
import { TableHeaders } from 'src/lib/interfaces'
import { FeesTypesResponse } from 'src/lib/types'
import DropDownMenu from 'src/reusable_components/dropDownMenu'
import TableTilteHeader from 'src/reusable_components/TableTilteHeader'
import { useLazyGetFeesTypesListQuery } from 'src/store/services/listServices'

import CreateOrUpdateFeesTypeModal from './createFeesModal'
import { useLoader } from 'src/@core/context/loaderContext'

const TOP_LEVEL_ID = 'fees-type-list'

const FeesTypes = () => {
  const [fetchFeesTypes, { data: getFeesTypes, isLoading }] = useLazyGetFeesTypesListQuery()
  const [isFeesTypeModalOpen, setIsFeesTypeModalOpen] = useState<boolean>(false)
  const [selectedFeesType, setSelectedFeesType] = useState<FeesTypesResponse>()

  const { setLoading } = useLoader()

  setLoading(isLoading)
  useEffect(() => {
    fetchFeesTypes()
  }, [])

  const handleOnModalClose = () => {
    setSelectedFeesType(undefined)
    setIsFeesTypeModalOpen(false)
  }

  const handleAddFees = () => {
    setIsFeesTypeModalOpen(true)
  }

  const handleKebabOptionClick = (feesType: FeesTypesResponse, option: 'Edit') => {
    setSelectedFeesType(feesType)
    switch (option) {
      case 'Edit':
        setIsFeesTypeModalOpen(true)
        break
    }
  }

  const getKebabOptions = (eachFeesType: FeesTypesResponse) => {
    return [
      {
        id: eachFeesType.fees_type_id,
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(eachFeesType, 'Edit')
      }
    ]
  }

  const headers: TableHeaders[] = [{ label: 'S#' }, { label: 'Fees type' }, { label: 'Action', width: '100px' }]

  return (
    <>
      <TableTilteHeader title='Fees types' buttonTitle='Add Fees Type' onButtonClick={handleAddFees} />
      <Card>
        {(getFeesTypes ?? []).length > 0 ? (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  {headers.map(each => (
                    <TableCell key={`${TOP_LEVEL_ID}__${each.label}`} style={each.width ? { width: each.width } : {}}>
                      {each.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {(getFeesTypes ?? []).map((eachFeesType: FeesTypesResponse, index) => (
                  <TableRow key={eachFeesType.fees_type_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{eachFeesType?.fees_type}</TableCell>

                    <TableCell>
                      <DropDownMenu dropDownMenuOptions={getKebabOptions(eachFeesType)} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <Typography>No Fees types Available</Typography>
          </Box>
        )}
      </Card>
      <CreateOrUpdateFeesTypeModal
        isOpen={isFeesTypeModalOpen}
        selectedFeesType={selectedFeesType}
        onClose={handleOnModalClose}
      />
    </>
  )
}

export default FeesTypes
