import { Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@muiElements'
import React, { useState } from 'react'
import { TableHeaders } from 'src/lib/interfaces'
import { Fees, FeesDetails, Program } from 'src/lib/types'
import ChaarvyAccordian from 'src/reusable_components/chaarvyAccordian'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import DropDownMenu from 'src/reusable_components/dropDownMenu'

interface ProgramFeesDetailsProps {
  selectedProgram?: Program
  isOpen: boolean
  onClose: () => void
}

const feesDetails: FeesDetails[] = [
  {
    segment: 'Year-1',
    segment_id: 'seg_id',
    fees: [
      {
        segment_id: 'seg_id',
        fees_type: 'Tution Fees',
        fees_type_id: 'id of book',
        fees: 1290
      }
    ]
  },
  {
    segment: 'Year-1',
    segment_id: 'seg_id',
    fees: [
      {
        segment_id: 'seg_id',
        fees_type: 'Tution Fees',
        fees_type_id: 'id of book',
        fees: 1290
      },
      {
        segment_id: 'seg_id',
        fees_type: 'Tution Fees',
        fees_type_id: 'id of book',
        fees: 1290
      },
      {
        segment_id: 'seg_id',
        fees_type: 'Tution Fees',
        fees_type_id: 'id of book',
        fees: 1290
      },
      {
        segment_id: 'seg_id',
        fees_type: 'Tution Fees',
        fees_type_id: 'id of book',
        fees: 1290
      }
    ]
  }
]

interface CRUDFees {
  segment_id: string
  fees_type: string
  fees?: number
}

const ProgramFeesModal = ({ selectedProgram, isOpen, onClose }: ProgramFeesDetailsProps) => {
  const [selectedFees, setSelectedFees] = useState<Fees>()

  const [feesDetail, setFeesDetail] = useState<CRUDFees>({
    segment_id: '',
    fees_type: '',
    fees: undefined
  })

  const headers: TableHeaders[] = [
    { label: 's#' },
    { label: 'Fees Type' },
    { label: 'Fees' },
    { label: 'Actions', width: '100px' }
  ]

  const handleKebabOptionClick = (feeDetail: Fees, option: 'Edit') => {
    setSelectedFees(feeDetail)
    switch (option) {
      case 'Edit':
        setFeesDetail(({ segment_id, fees_type, fees }) => ({ segment_id, fees_type, fees }))
        break
    }
  }

  const getKebabOptions = (feesDetail: Fees) => {
    //  edit fees
    return [
      {
        id: feesDetail.fees_type_id,
        label: 'Edit',
        onOptionClick: () => handleKebabOptionClick(feesDetail, 'Edit')
      }
    ]
  }

  return (
    <ChaarvyModal size='80%' isOpen={isOpen} onClose={onClose} title={`${selectedProgram?.program_name} Fees Details`}>
      <>
        {feesDetails.map(eachSegment => (
          <ChaarvyAccordian title={eachSegment.segment}>
            {eachSegment?.fees.length > 0 ? (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        {headers.map(each => (
                          <TableCell style={each.width ? { width: each.width } : {}}>{each.label}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {eachSegment.fees.map((feesDetail, index) => (
                        <TableRow>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>{feesDetail.fees_type}</TableCell>
                          <TableCell>{feesDetail.fees}</TableCell>
                          <TableCell>
                            <DropDownMenu dropDownMenuOptions={getKebabOptions(feesDetail)} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                <Button onClick={() => {}}>Add Fees Type</Button>
              </>
            ) : (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Button onClick={() => {}}>Add Fees Details</Button>
              </Box>
            )}
          </ChaarvyAccordian>
        ))}
      </>
    </ChaarvyModal>
  )
}

export default ProgramFeesModal
