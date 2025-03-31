import React from 'react'
import dynamic from 'next/dynamic'
import { StudentData, useGetStudentEnrollmentCountDetailsQuery } from 'src/store/services/dashboardServices'

const processStudentData = (data: StudentData) => {
  const categories: string[] = []
  const boysData: number[] = []
  const girlsData: number[] = []
  const totalData: { x: string; y: number }[] = []

  Object.entries(data).forEach(([course, segments]) => {
    Object.entries(segments).forEach(([segment, mediums]) => {
      Object.entries(mediums).forEach(([medium, details]) => {
        Object.entries(details.section).forEach(([section, counts]) => {
          const boys = counts.Male || 0
          const girls = counts.Female || 0
          const total = boys + girls

          const label = `${course} (${segment} - ${medium}) - Sec ${section}`

          categories.push(label)
          boysData.push(boys)
          girlsData.push(girls)
          totalData.push({ x: label, y: total })
        })
      })
    })
  })

  return {
    categories,
    series: [
      { name: 'Boys', data: boysData },
      { name: 'Girls', data: girlsData }
    ],
    totalData
  }
}

const StudentEnrollmentChart: React.FC = () => {
  const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

  const { data: studentData, isLoading } = useGetStudentEnrollmentCountDetailsQuery()

  if (studentData) {
    const { categories, series, totalData } = processStudentData(studentData)

    const options: ApexCharts.ApexOptions = {
      chart: { type: 'bar', stacked: false, toolbar: { show: false } },
      xaxis: { categories, labels: { rotate: -45 } },
      plotOptions: { bar: { horizontal: false, columnWidth: '50%' } },
      colors: ['#008FFB', '#FF4560'], // Boys: Blue, Girls: Red
      annotations: {
        points: totalData.map(({ x, y }) => ({
          x,
          y: 0,
          marker: { size: 0 },
          label: {
            text: y.toString(),
            position: 'bottom',
            style: { fontSize: '12px', fontWeight: 'bold', colors: ['#000'] }
          }
        }))
      }
    }

    return <Chart options={options} series={series} type='bar' height={400} />
  }
}

export default StudentEnrollmentChart
