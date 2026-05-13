import React, { useMemo, useState, useEffect } from 'react'

import { Typography } from '@muiElements'
import { ProgramFeesDetailsProps } from 'src/pages/Admin/programs/program_fees_modal'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import ChaarvyFlex from 'src/reusable_components/chaarvyFlex'
import ChaarvyModal from 'src/reusable_components/chaarvyModal'
import ChaarvyDataTable, {
  ChaarvyTableColumn,
  EditedDataTableOnSubmitPayload
} from 'src/reusable_components/Table/ChaarvyDataTable'
import { useGetFeesTypesListQuery } from 'src/store/services/listServices'

const ProgramFeesModal = ({ selectedProgram, isOpen, onClose }: ProgramFeesDetailsProps) => {
  const {
    data: feesTypesList,
    isFetching: isFeesTypesFetching,
    isSuccess: fetchedFeesTypes
  } = useGetFeesTypesListQuery()
  const [selectedMedium, setSelectedMedium] = useState<string>()

  const handleSubmitClick = (data: EditedDataTableOnSubmitPayload) => {
    const { created, updated, deleted } = data
    console.log(created, updated, deleted)
  }

  const mediumSegmentsData = [
    {
      medium_id: 'med-1',
      medium_name: 'English',
      segments: [
        {
          segment_id: 'seg-1',
          segment_name: 'Nursary'
        },
        {
          segment_id: 'seg-2',
          segment_name: 'UKG'
        }
      ]
    },
    {
      medium_id: 'med-2',
      medium_name: 'Telugu',
      segments: [
        {
          segment_id: 'seg-1',
          segment_name: 'Nursary'
        },
        {
          segment_id: 'seg-3',
          segment_name: 'LKG'
        }
      ]
    }
  ]

  useEffect(() => {
    if (selectedMedium) return
    if (mediumSegmentsData) {
      setSelectedMedium(mediumSegmentsData[0].medium_id)
    }
  }, [mediumSegmentsData])

  const getSegmentsForSelectedMedium = useMemo(() => {
    return mediumSegmentsData.find(each => each.medium_id === selectedMedium)?.segments ?? []
  }, [selectedMedium, mediumSegmentsData])

  const columns: ChaarvyTableColumn[] = useMemo(() => {
    const segmentColumns: ChaarvyTableColumn[] =
      getSegmentsForSelectedMedium.map(segment => ({
        id: `sgid__${segment.segment_id}`,
        label: segment.segment_name,
        editable: true,
        inputType: 'number',
        width: 100
      })) ?? []

    return [
      {
        id: 'sno',
        label: '#',
        width: 30,
        render: (_, index) => <Typography variant='body2'>{index + 1}</Typography>
      },
      {
        id: 'fees_type_id',
        label: 'Fees Type',
        editable: true,
        inputType: 'select',
        uniqueOptionsOnly: true,
        options: (feesTypesList ?? []).map(feesType => ({ value: feesType.fees_type_id, label: feesType.fees_type })),
        width: 250
      },
      ...segmentColumns
    ]
  }, [feesTypesList, getSegmentsForSelectedMedium])

  const defaultEntryData = useMemo(() => {
    const segment_ids = getSegmentsForSelectedMedium.map(segment => segment.segment_id)

    return feesTypesList?.map(each => ({
      fees_type_id: each.fees_type_id,
      program_id: selectedProgram?.program_id,
      medium_id: selectedMedium,
      ...Object.fromEntries(segment_ids.map(segmentId => [`sgid__${segmentId}`, 0]))
    }))
  }, [feesTypesList])

  const isLoading = isFeesTypesFetching

  const showDefaultSetButton = fetchedFeesTypes

  const handleSelectedMedium = (medium_id: string) => {
    setSelectedMedium(medium_id)
  }

  const data = [
    {
      program_segment_medium_fees_id: 'test',
      fees_type_id: 'd2f3a9d9-f3e0-4697-9b1f-50003ea295c0',
      program_id: selectedProgram?.program_id,
      medium_id: selectedMedium,
      'sgid__seg-1': 50,
      'sgid__seg-2': 90
    }
  ]

  return (
    <ChaarvyModal isOpen={isOpen} onClose={onClose} title='Program Fees' modalSize='col-12 col-md-10 col-xl-8'>
      <>
        <ChaarvyFlex className={{ gap: 2, justifyContent: 'end', marginX: 4 }}>
          {(mediumSegmentsData ?? []).map(each => (
            <ChaarvyButton
              size='small'
              variant={selectedMedium === each.medium_id ? 'contained' : 'outlined'}
              onClick={() => handleSelectedMedium(each.medium_id)}
            >
              {each.medium_name}
            </ChaarvyButton>
          ))}
        </ChaarvyFlex>
        <ChaarvyDataTable
          showColumnToggle={false}
          editable
          columns={columns}
          data={data}
          defaultEntryData={defaultEntryData}
          getRowKey={(row, index) => `${row?.program_id}_${row.medium_id}_${index}`}
          onSubmit={handleSubmitClick}
          isLoading={isLoading}
          loadingText='Fetching books...'
          isSubmitting={false}
          emptyMessage={
            isLoading
              ? 'No books found for the selected Program, Segment and Medium.'
              : 'Please select Program, Segment and Medium to view the books.'
          }
          showDefaultEntryButton={showDefaultSetButton}
        />
        {/* <BulkProcessStatusModal
          isOpen={isBulkProcessStatusModalOpen}
          onClose={() => {
            setIsBulkProcessStatusModalOpen(false)
            setProcessStats([])
          }}
          isProcessing={isUpdatingProgramBooksData}
          stats={processStats}
        /> */}
      </>
    </ChaarvyModal>
  )
}

export default ProgramFeesModal
