import dynamic from 'next/dynamic'
import React, { useMemo } from 'react'

import { StudentData, useGetStudentEnrollmentCountDetailsQuery } from 'src/store/services/dashboardServices'

// Safely import ApexCharts strictly on the client side
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

const processTreemapData = (data: StudentData) => {
  const series: { name: string; data: any[] }[] = []

  Object.entries(data).forEach(([course, segments]) => {
    Object.entries(segments).forEach(([segment, mediums]) => {
      Object.entries(mediums).forEach(([medium, details]) => {
        // This will be the high-level group name (and will get its own color)
        const seriesName = `${course} (${segment} - ${medium})`
        const dataPoints: any[] = []

        Object.entries(details.section).forEach(([section, counts]) => {
          const boys = counts.Male || 0
          const girls = counts.Female || 0
          const total = boys + girls

          if (total > 0) {
            dataPoints.push({
              x: `Sec ${section}`, // The label shown inside the box (Short and clean!)
              y: total, // Determines the physical size of the box
              boys, // Custom data passed for the hover tooltip
              girls // Custom data passed for the hover tooltip
            })
          }
        })

        if (dataPoints.length > 0) {
          series.push({
            name: seriesName,
            data: dataPoints
          })
        }
      })
    })
  })

  return series
}

const StudentEnrollmentTreemap: React.FC = () => {
  const { data: studentData } = useGetStudentEnrollmentCountDetailsQuery()

  const chartSeries = useMemo(() => {
    if (!studentData) return []

    return processTreemapData(studentData)
  }, [studentData])

  const options: ApexCharts.ApexOptions = useMemo(() => {
    return {
      chart: {
        type: 'treemap',
        toolbar: { show: false },
        redrawOnParentResize: true,
        redrawOnWindowResize: true,
        animations: {
          enabled: true,
          dynamicAnimation: { speed: 400 }
        }
      },

      // Give each course group a distinct, modern color palette
      colors: ['#015799', '#005338', '#FEB019', '#FF4560', '#775DD0', '#0078af'],
      plotOptions: {
        treemap: {
          enableShades: true,
          shadeIntensity: 0.5,
          reverseNegativeShade: true,
          colorScale: {
            inverse: false
          }
        }
      },
      dataLabels: {
        enabled: true,
        style: {
          fontSize: '14px',
          fontWeight: 600
        },
        formatter: function (text: string, op: any) {
          return [text, op.value.toString()] as unknown as string
        }
      },

      // Custom Tooltip: Shows the full breakdown cleanly when the user hovers over a box
      tooltip: {
        custom: function ({ seriesIndex, dataPointIndex, w }) {
          const groupName = w.config.series[seriesIndex].name
          const data = w.config.series[seriesIndex].data[dataPointIndex]

          return `
            <div style="padding: 12px; background: #fff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 4px; font-family: inherit;">
              <div style="font-size: 12px; font-weight: bold; color: #333; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px;">
                ${groupName} - ${data.x}
              </div>
              <div style="font-size: 13px; margin-bottom: 4px;">
                <strong>Total Students:</strong> ${data.y}
              </div>
              <div style="font-size: 13px; color: #008FFB; margin-bottom: 2px;">
                <span style="display:inline-block; width: 10px; height: 10px; background:#008FFB; border-radius:50%; margin-right:4px;"></span>
                Boys: ${data.boys}
              </div>
              <div style="font-size: 13px; color: #FF4560;">
                <span style="display:inline-block; width: 10px; height: 10px; background:#FF4560; border-radius:50%; margin-right:4px;"></span>
                Girls: ${data.girls}
              </div>
            </div>
          `
        }
      },
      grid: {
        padding: { top: 0, right: 0, bottom: 0, left: 0 }
      }
    }
  }, [])

  if (chartSeries.length === 0) return null

  return (
    <div style={{ height: '100%', minHeight: 0, overflow: 'hidden' }}>
      <Chart options={options} series={chartSeries} type='treemap' width='100%' height='100%' />
    </div>
  )
}

export default StudentEnrollmentTreemap
