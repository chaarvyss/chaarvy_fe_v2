import { useState } from 'react'

import { Chip, IconButton, Typography } from '@muiElements'
import { useSideDrawer } from 'src/@core/context/sideDrawerContext'
import RenderFilterOptions from 'src/common/filters'
import ChaarvyTable from 'src/components/Tables/ChaarvyTable'
import { DEFAULT_PAGINATION_PROPS } from 'src/constants/constants'
import { useUpdateSubjectStatusMutation } from 'src/store/services/adminServices'
import { useGetSubjectsListQuery } from 'src/store/services/listServices'
import { useDebounce } from 'src/utils/hooks/useDebounce'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import AddUpdateSubject from './AddUpdateSubject'

const Subjects = () => {
  const { openDrawer } = useSideDrawer()

  const [filterProps, setFilterProps] = useState<FilterProps>({ limit: 100, offset: 0, status_: '1' })

  const filterP = useDebounce(filterProps, 500)

  const { data: subjectsList, isFetching: isFetchingSubjects } = useGetSubjectsListQuery(filterP)

  const [updateSubjectStatus] = useUpdateSubjectStatusMutation()

  const columns: ChaarvyTableColumn[] = [
    {
      id: 'sno',
      label: 'S#',
      render: (row, index) => <Typography>{(filterProps?.offset ?? 0) + index + 1}</Typography>
    },
    {
      id: 'subject_name',
      label: 'Subject Name'
    },
    {
      id: 'status',
      label: 'Status',
      render: row => (
        <Chip
          sx={{
            cursor: 'pointer'
          }}
          onClick={() => {
            updateSubjectStatus(row.subject_id)
          }}
          size='small'
          color={row.status == 1 ? 'success' : 'error'}
          label={row.status == 1 ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      id: '',
      label: 'Actions',
      render: row => (
        <IconButton
          onClick={() => {
            openDrawer({
              title: 'Update Subject',
              content: <AddUpdateSubject subject_id={row.subject_id} subject_name={row.subject_name} />
            })
          }}
        >
          <GetChaarvyIcons iconName={ChaarvyIcon.Pencil} fontSize='1.25rem' color='primary' />
        </IconButton>
      )
    }
  ]

  const handleFilteredAdmissions = (params?: FilterProps) => {
    setFilterProps(prev => ({
      ...prev,
      ...params,
      offset: 0
    }))
  }

  const onFilterButtonClick = () => {
    openDrawer({
      title: 'Filters',
      content: (
        <RenderFilterOptions
          onSubmit={handleFilteredAdmissions}
          statusOptions={[
            { label: 'Active', value: '1' },
            { label: 'Inactive', value: '0' }
          ]}
          fields={['status']}
          defaultValues={filterProps}
          resetFilters={() => setFilterProps(DEFAULT_PAGINATION_PROPS)}
        />
      )
    })
  }

  return (
    <ChaarvyTable
      tableTitleHeaderProps={{
        title: 'Subjects',
        searchValue: filterProps?.searchText ?? '',
        onSearch: searchText => setFilterProps({ ...filterProps, searchText, offset: 0 }),
        showFilterIcon: true,
        handleFilterButtonClick: onFilterButtonClick,
        buttonTitle: 'Add Subject',
        onButtonClick: () => {
          openDrawer({
            title: 'Add Subject',
            content: <AddUpdateSubject />
          })
        }
      }}
      tableDataProps={{
        columns,
        data: subjectsList ?? [],
        getRowKey: each => each.subject_id,
        isLoading: isFetchingSubjects
      }}
    />
  )
}

export default Subjects
