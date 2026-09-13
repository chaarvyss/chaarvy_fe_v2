import { useRouter } from 'next/router'
import { useEffect, useMemo, useState } from 'react'
import DatePicker from 'react-datepicker'

import { Box, Card, Typography, Grid, Divider } from '@muiElements' // Ensure Grid, Button, Divider are exported from your elements index
import { PagePath } from 'src/constants/pagePathConstants'
import { ChaarvyButton, LoadingSpinner } from 'src/reusable_components'
import ChaarvyAvatar from 'src/reusable_components/chaarvyAvatar'
import ChaarvySelect from 'src/reusable_components/chaarvySelect'
import {
  useFinalizeAttendenceMutation,
  useGetAttendenceByLogIdQuery,
  useGetCurrentClassDetailsQuery,
  useGetStudentsListQuery,
  useRecordStudentAttendenceMutation
} from 'src/store/services/attendenceServices'
import { useGetProgramsListQuery } from 'src/store/services/listServices'
import { useGetProgramSegmentMediumsListByProgramIdQuery } from 'src/store/services/programServices'

import AttendenceCompletionProgress from './AttendenceCompletionProgress'

interface StudentSelectionState {
  program: string | null
  segment: string | null
  medium: string | null
  section: string | null
}

const defaultState: StudentSelectionState = {
  program: null,
  segment: null,
  medium: null,
  section: null
}

const StudentAttendence = () => {
  const current_user = sessionStorage.getItem('uid')

  const router = useRouter()
  const { log_id: queryLogId } = router.query
  const urlLogId = typeof queryLogId === 'string' ? queryLogId : null

  const [lastSavedTime, setLastSavedTime] = useState<Date>()
  const [isFinalized, setIsFinalized] = useState<number>(0)
  const [studentSelection, setStudentSelection] = useState<StudentSelectionState>(defaultState)
  const [attendenceData, setAttendenceData] = useState<StudentAttendenceState[]>([])
  const [currentPeriodSlotId, setCurrentPeriodSlotId] = useState<string>()
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]) // Current date in YYYY-MM-DD format
  const [attendanceLogId, setAttendanceLogId] = useState<string | null>(null)

  const getSafeDate = (d: string) => {
    let dateStr = d
    if (typeof d === 'string') {
      let parts: string[] = []
      if (d.includes('-')) parts = d.split('-')
      else if (d.includes('/')) parts = d.split('/')

      if (parts.length === 3) {
        if (parts[2].length === 4) {
          dateStr = `${parts[2]}-${parts[1]}-${parts[0]}`
        } else if (parts[0].length === 4) {
          dateStr = `${parts[0]}-${parts[1]}-${parts[2]}`
        }
      }
    }
    const dateObj = new Date(dateStr)

    return isNaN(dateObj.getTime()) ? new Date() : dateObj
  }

  useEffect(() => {
    if (router.isReady && urlLogId) {
      setAttendanceLogId(urlLogId)
    }
  }, [router.isReady, urlLogId])

  const { data: programsList } = useGetProgramsListQuery(true)
  const { data: currentClassDetails } = useGetCurrentClassDetailsQuery(undefined, {
    skip: !router.isReady || !!urlLogId
  })

  const [saveAttendanceMutation] = useRecordStudentAttendenceMutation()
  const [finalizeAttendence] = useFinalizeAttendenceMutation()

  const { data: segmentMediumResponse } = useGetProgramSegmentMediumsListByProgramIdQuery(
    { program_id: studentSelection.program || '', only_active: true },
    { skip: !studentSelection.program }
  )
  const { data: studentsListResponse, isFetching: isFetchingStudents } = useGetStudentsListQuery(
    {
      program_id: studentSelection.program || '',
      segment_id: studentSelection.segment || '',
      medium_id: studentSelection.medium || '',
      section_id: studentSelection.section || '',
      need_photo: true
    },
    {
      skip:
        !studentSelection.program || !studentSelection.segment || !studentSelection.medium || !studentSelection.section
    }
  )

  const { data: attendenceByLogIdResponse } = useGetAttendenceByLogIdQuery(attendanceLogId || '', {
    skip: !attendanceLogId
  })

  useEffect(() => {
    if (attendenceByLogIdResponse) {
      const { attendance, is_final, class_details, period_slot_id, date } = attendenceByLogIdResponse
      setAttendenceData(attendance)
      setIsFinalized(is_final)
      if (class_details) {
        setStudentSelection({
          program: class_details.program_id,
          segment: class_details.segment_id,
          medium: class_details.medium_id,
          section: class_details.section_id
        })
      }
      if (period_slot_id) setCurrentPeriodSlotId(period_slot_id)
      if (date) {
        const validDateObj = getSafeDate(date)
        setCurrentDate(validDateObj.toISOString().split('T')[0])
      }
    }
  }, [attendenceByLogIdResponse])

  useEffect(() => {
    if (currentClassDetails) {
      const { class_details, current_period_id, log_id } = currentClassDetails
      setCurrentPeriodSlotId(current_period_id)
      setAttendanceLogId(log_id || null)
      if (class_details) {
        setStudentSelection({
          program: class_details.program_id,
          segment: class_details.segment_id,
          medium: class_details.medium_id,
          section: class_details.section_id
        })
      }
    }
  }, [currentClassDetails])

  const saveAttendance = () => {
    if (Object.values(studentSelection).some(value => value === null)) {
      console.error('Please select all required fields before saving attendance.')

      return
    }

    if (!currentPeriodSlotId) {
      console.error('Current period slot ID is not available.')

      return
    }
    const attendancePayload: RecordStudentAttendenceRequest = {
      program_id: studentSelection.program || '',
      segment_id: studentSelection.segment || '',
      medium_id: studentSelection.medium || '',
      section_id: studentSelection.section || '',
      period_slot_id: currentPeriodSlotId,
      date: currentDate,
      attendance_records: attendenceData
    }

    saveAttendanceMutation(attendancePayload)
      .unwrap()
      .then(response => {
        console.log('Attendance saved successfully:', response)
        setLastSavedTime(new Date())
      })
      .catch(error => {
        console.error('Error saving attendance:', error)
      })
  }

  useEffect(() => {
    if (studentsListResponse) {
      setAttendenceData(prevData => {
        return studentsListResponse.map(student => {
          const existing = prevData.find(p => p.student_course_enrollment_id === student.student_course_enrollment_id)

          return (
            existing || {
              student_course_enrollment_id: student.student_course_enrollment_id,
              status: 2
            }
          )
        })
      })
    }
  }, [studentsListResponse])

  const segmentOptions = useMemo(
    () =>
      Array.from(
        new Map(
          segmentMediumResponse?.map(item => [item.segment_id, { label: item.segment_name, value: item.segment_id }])
        ).values()
      ),
    [segmentMediumResponse]
  )

  const mediumOptions = useMemo(() => {
    const selectedSegmentId = studentSelection.segment
    if (!selectedSegmentId) return []

    const filteredData = segmentMediumResponse?.filter(item => item.segment_id === selectedSegmentId)

    return Array.from(
      new Map(filteredData?.map(item => [item.medium_id, { label: item.medium_name, value: item.medium_id }])).values()
    )
  }, [studentSelection.segment, segmentMediumResponse])

  const sectionOptions = useMemo(() => {
    const selectedSegmentId = studentSelection.segment
    if (!selectedSegmentId) return []

    const filteredData = segmentMediumResponse?.filter(
      item => item.segment_id === selectedSegmentId && item.medium_id === studentSelection.medium
    )

    return Array.from(
      new Map(
        filteredData?.map(item => [item.section_id, { label: item.section_name, value: item.section_id }])
      ).values()
    )
  }, [studentSelection.segment, studentSelection.medium, segmentMediumResponse])

  const studentSelectConfig = useMemo(
    () => [
      {
        label: 'Program',
        placeholder: 'Select Program',
        value: studentSelection.program,
        name: 'program',

        // Reset downstream selections when Program changes
        onChange: (e: any) =>
          setStudentSelection({ program: e.target.value, segment: null, medium: null, section: null }),
        options:
          programsList?.map(program => ({
            label: program.program_name,
            value: program.program_id
          })) || []
      },
      {
        label: 'Segment',
        placeholder: 'Select Segment',
        value: studentSelection.segment,
        name: 'segment',

        // Reset downstream selections when Segment changes
        onChange: (e: any) =>
          setStudentSelection({ ...studentSelection, segment: e.target.value, medium: null, section: null }),
        options: segmentOptions
      },
      {
        label: 'Medium',
        placeholder: 'Select Medium',
        value: studentSelection.medium,
        name: 'medium',

        // Reset downstream selections when Medium changes
        onChange: (e: any) => setStudentSelection({ ...studentSelection, medium: e.target.value, section: null }),
        options: mediumOptions
      },
      {
        label: 'Section',
        placeholder: 'Select Section',
        value: studentSelection.section,
        name: 'section',
        onChange: (e: any) => setStudentSelection({ ...studentSelection, section: e.target.value }),
        options: sectionOptions
      }
    ],
    [studentSelection, programsList, segmentOptions, mediumOptions, sectionOptions]
  )

  const isSelectionComplete = Boolean(
    studentSelection.program && studentSelection.segment && studentSelection.medium && studentSelection.section
  )

  const onCardClick = (enroll_id: string) => {
    if (!isFinalized)
      setAttendenceData(prevData =>
        prevData.map(item =>
          item.student_course_enrollment_id === enroll_id ? { ...item, status: item.status === 1 ? 0 : 1 } : item
        )
      )
  }

  const getBgColor = (enroll_id: string) => {
    const status = attendenceData.find(item => item.student_course_enrollment_id === enroll_id)?.status

    switch (status) {
      case 0:
        return 'linear-gradient(to top,  #ffedec 5%, #ffc2b8 95%)' // Red for absent
      case 1:
        return 'linear-gradient(to top,  #e1fee8 5%, #caffc6 95%)' // Green for present
      default:
        return 'white'
    }
  }

  const finalizeAttendance = () => {
    if (!!attendanceLogId)
      finalizeAttendence(attendanceLogId)
        .unwrap()
        .then(() => {
          window.location.href = PagePath.ATTENDENCE_LOG
        })
  }

  return (
    <>
      <Card sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
        {/* Header Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: { sm: 'row' },
            gap: 2,
            mb: 2,
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' }
          }}
        >
          <Typography variant='h6' fontWeight={600} color='text.primary'>
            Attendance
          </Typography>
          <Box
            id='attendance-date-picker'
            sx={{ display: 'flex', flexDirection: 'column', alignItems: { xs: 'flex-start', sm: 'flex-end' } }}
          >
            <Box>
              <DatePicker
                selected={getSafeDate(currentDate)}
                popperPlacement='bottom-end'
                onChange={(date: Date | null) => {
                  if (date) setCurrentDate(date.toISOString().split('T')[0])
                }}
                portalId='attendance-date-picker'
                customInput={
                  <Typography
                    onClick={() => console.log(currentDate)}
                    variant='body2'
                    color='text.secondary'
                    fontWeight={500}
                    sx={{ cursor: 'pointer' }}
                  >
                    {getSafeDate(currentDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </Typography>
                }
              />
            </Box>
            <Typography variant='body2' color='text.secondary'>
              Period:{' '}
              {attendenceByLogIdResponse?.period_name ??
                new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Filters Section (Responsive Grid) */}
        <Grid container spacing={2}>
          {studentSelectConfig.map(config => (
            <Grid item xs={12} sm={6} md={3} key={config.name}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                <ChaarvySelect
                  options={config.options}
                  placeholder={config.placeholder}
                  value={config.value || ''}
                  onChange={config.onChange}
                  label={config.label}
                  sx={{ width: '100%' }}
                />
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Actions Section */}
        <Box sx={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end', gap: 2, mt: 4 }}>
          <ChaarvyButton
            variant='contained'
            size='small'
            color='primary'
            disabled={!isSelectionComplete || isFinalized === 1}
            onClick={saveAttendance}
          >
            Save
          </ChaarvyButton>
          <ChaarvyButton
            variant='contained'
            size='small'
            color='success'
            disabled={
              !isSelectionComplete || isFinalized === 1 || attendenceByLogIdResponse?.created_by !== current_user
            }
            onClick={finalizeAttendance}
          >
            Finalize
          </ChaarvyButton>
        </Box>
        {lastSavedTime && (
          <Typography variant='caption' color='text.secondary' sx={{ mt: 1 }}>
            Last saved at: {lastSavedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        )}
      </Card>
      {isFetchingStudents && <LoadingSpinner />}
      {!isFetchingStudents && studentsListResponse && (
        <Box sx={{ mt: 4 }}>
          {studentsListResponse.length > 0 ? (
            <Card sx={{ p: 3, boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant='h6' fontWeight={600} color='text.primary' sx={{ mb: 2 }}>
                  Students List
                </Typography>
                <AttendenceCompletionProgress studentsListResponse={attendenceData} />
              </Box>
              <Grid container spacing={2} sx={{ mb: 2 }}>
                {studentsListResponse.map(student => (
                  <Grid item xs={6} md={3} key={student.student_course_enrollment_id}>
                    <Card
                      key={student.student_course_enrollment_id}
                      onClick={() => onCardClick(student.student_course_enrollment_id)}
                      sx={{
                        mb: 1,
                        p: 1,
                        pt: 5,
                        cursor: 'pointer',
                        backgroundImage: getBgColor(student.student_course_enrollment_id)
                      }}
                    >
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <ChaarvyAvatar
                          src={student.image_url || '/default-profile.png'}
                          alt={student.student_name}
                          sx={{ height: '100px', width: '100px' }}
                        />
                        <Typography variant='body1' color='text.primary'>
                          {student.student_name}
                        </Typography>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Card>
          ) : (
            <Typography variant='body1' color='text.secondary'>
              No students found for the selected criteria.
            </Typography>
          )}
        </Box>
      )}
    </>
  )
}

export default StudentAttendence
