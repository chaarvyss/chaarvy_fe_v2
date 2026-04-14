import { useMemo } from 'react'

import { Box } from '@muiElements'
import PieChartCard from 'src/components/Charts/PieChartCard'
import { useGetStudentsCountQuery } from 'src/store/services/dashboardServices'

const Population = () => {
  const { data: studentsCount, isLoading } = useGetStudentsCountQuery()

  const studentData = useMemo(() => {
    if (!studentsCount) return []

    return Object.values(studentsCount) ?? []
  }, [studentsCount])

  if (!studentsCount) {
    return (
      <Box>
        <p>loading</p>
      </Box>
    )
  }

  return <PieChartCard isLoading={isLoading} values={studentData} labels={['Male', 'Female']} />
}

export default Population
