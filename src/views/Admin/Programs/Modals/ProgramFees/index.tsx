'use client'

import { Stack, Typography } from '@mui/material'
import { useMemo } from 'react'

import { Spinner } from 'src/components/Cards/dashboardCards'
import { ProgramFeesDetailsProps } from 'src/pages/Admin/programs'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import { useGetProgramFeesDetailsQuery } from 'src/store/services/feesServices'
import { useGetFeesTypesListQuery } from 'src/store/services/listServices'
import { useGetProgramFeesHeaderDataQuery } from 'src/store/services/programServices'

import FeesEditor from './feesEditor'

const ProgramFeesModal = ({ isOpen, onClose, selectedProgram }: ProgramFeesDetailsProps) => {
  const { data: feesTypes, isFetching: isFetchingFeesTypes } = useGetFeesTypesListQuery(undefined, {
    refetchOnMountOrArgChange: true
  })

  const { data: segmentData, isFetching: isFetchingSegmentData } = useGetProgramFeesHeaderDataQuery(
    selectedProgram?.program_id ?? '',
    {
      skip: !selectedProgram?.program_id
    }
  )

  const { data: feesData, isFetching: isFetchingFeesData } = useGetProgramFeesDetailsQuery(
    selectedProgram?.program_id ?? '',
    {
      skip: !selectedProgram?.program_id
    }
  )

  const showLoader = isFetchingFeesData || isFetchingFeesTypes || isFetchingSegmentData

  const isFetchingCompleted = feesData && segmentData && feesTypes

  const isLoading = useMemo(() => showLoader, [showLoader])

  return (
    <ChaarvyModal isOpen={isOpen} onClose={onClose} modalSize='col-11'>
      {isLoading ? (
        <Stack sx={{ height: '70vh', justifyContent: 'center', alignItems: 'center' }}>
          <Spinner />
        </Stack>
      ) : isFetchingCompleted ? (
        <FeesEditor
          program_id={selectedProgram?.program_id ?? ''}
          feesData={feesData}
          segmentData={segmentData}
          feesTypes={feesTypes}
        />
      ) : (
        <Typography>Waiting for data</Typography>
      )}
    </ChaarvyModal>
  )
}

export default ProgramFeesModal
