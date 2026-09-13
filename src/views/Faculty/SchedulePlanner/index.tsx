import { Box, Card, Typography, ToggleButtonGroup, ToggleButton, IconButton } from '@mui/material'

import { ChaarvyButton } from 'src/reusable_components'
import CoverageProgressBar from 'src/reusable_components/CoverageProgressBar'
import GetChaarvyIcons, { ChaarvyIcon } from 'src/utils/icons'

import { CalendarGrid } from './components/CalendarGrid'
import { PlanScheduleDrawer } from './components/PlanScheduleDrawer'
import { UpdateScheduleDrawer } from './components/UpdateScheduleDrawer'
import { useSchedulePlanner } from './hooks/useSchedulePlanner'
import QuestionPaperGenerator from './QuestionPaperGenerator'

const SchedulePlanner = () => {
  const { calendar, schedules, coverage, generator, drawer, modal } = useSchedulePlanner()

  if (generator.showGenerator) {
    const generatorTopics = schedules.plannedSchedules.map(s => ({
      id: s.topic_id,
      title: s.topic_name,
      completed: !!s.completed,
      deadline: s.date ? new Date(s.date) : null
    }))

    return (
      <QuestionPaperGenerator
        classId={null}
        subjectId={null}
        topics={generatorTopics}
        onBack={() => generator.setShowGenerator(false)}
      />
    )
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1400, margin: '0 auto', animation: 'fadeIn 0.4s ease-in-out' }}>
      {/* Top Header: Coverage Bar & Action Buttons */}
      <Box display='flex' justifyContent='space-between' alignItems='center' mb={3} gap={3} flexWrap='wrap'>
        <Box flex={1} minWidth={280}>
          <CoverageProgressBar
            completed={coverage.completedCount}
            pending={coverage.pendingCount}
            overdue={coverage.overdueCount}
            total={coverage.totalCount}
          />
        </Box>
        <Box display='flex' gap={2}>
          <ChaarvyButton
            variant='contained'
            color='primary'
            onClick={() => drawer.openSlotModal()}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', height: 40, px: 3 }}
          >
            + Plan Schedule
          </ChaarvyButton>
          <ChaarvyButton
            variant='outlined'
            color='primary'
            disabled={schedules.plannedSchedules.length === 0}
            onClick={() => generator.setShowGenerator(true)}
            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', height: 40 }}
          >
            Generate Question Paper
          </ChaarvyButton>
        </Box>
      </Box>

      {/* Main Calendar Card (Full Width without on-screen side filters) */}
      <Card
        sx={{
          p: 3,
          borderRadius: 3,
          border: '1px solid rgba(0,0,0,0.05)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
          bgcolor: '#fff'
        }}
      >
        {/* Calendar Navigation & Mode Switcher */}
        <Box display='flex' justifyContent='space-between' alignItems='center' mb={3} flexWrap='wrap' gap={2}>
          <Typography variant='h5' fontWeight={700} color='text.primary'>
            {calendar.viewMode === 'month'
              ? calendar.currentDate.format('MMMM YYYY')
              : calendar.days.length > 0
                ? `${calendar.days[0].format('MMM D')} - ${calendar.days[calendar.days.length - 1].format('MMM D, YYYY')}`
                : ''}
          </Typography>

          <Box display='flex' alignItems='center' gap={2}>
            <ToggleButtonGroup
              value={calendar.viewMode}
              exclusive
              onChange={(e, val) => val && calendar.setViewMode(val)}
              size='small'
            >
              <ToggleButton value='week' sx={{ px: 2.5, textTransform: 'none', fontWeight: 600 }}>
                Week
              </ToggleButton>
              <ToggleButton value='month' sx={{ px: 2.5, textTransform: 'none', fontWeight: 600 }}>
                Month
              </ToggleButton>
            </ToggleButtonGroup>

            <Box display='flex' gap={1}>
              <IconButton
                onClick={calendar.handlePrev}
                size='small'
                sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}
              >
                <GetChaarvyIcons iconName={ChaarvyIcon.ChevronLeft} />
              </IconButton>
              <ChaarvyButton
                size='small'
                variant='outlined'
                onClick={calendar.handleToday}
                sx={{ borderRadius: 2, fontWeight: 600 }}
              >
                Today
              </ChaarvyButton>
              <IconButton
                onClick={calendar.handleNext}
                size='small'
                sx={{ border: '1px solid #e0e0e0', borderRadius: 2 }}
              >
                <GetChaarvyIcons iconName={ChaarvyIcon.ChevronRight} />
              </IconButton>
            </Box>
          </Box>
        </Box>

        {/* Calendar Grid Component */}
        <CalendarGrid
          viewMode={calendar.viewMode}
          currentDate={calendar.currentDate}
          days={calendar.days}
          plannedSchedules={schedules.plannedSchedules}
          periodSlots={calendar.periodSlots}
          onSelectEmptySlot={(date, periodId) => drawer.openSlotModal(date, periodId)}
          onSelectSchedule={schedule => modal.setSelectedScheduleForModal({ schedule })}
        />
      </Card>

      {/* Plan New Schedule Side Drawer (Program -> Segment -> Topics cascading) */}
      <PlanScheduleDrawer
        isOpen={!!drawer.slotModalState}
        onClose={drawer.closeSlotModal}
        slotModalState={drawer.slotModalState}
        setSlotModalField={drawer.setSlotModalField}
        programOptions={drawer.programOptions}
        segmentOptions={drawer.segmentOptions}
        subjectOptions={drawer.subjectOptions}
        mediumOptions={drawer.mediumOptions}
        topicOptions={drawer.topicOptions}
        topicSearchText={drawer.topicSearchText}
        setTopicSearchText={drawer.setTopicSearchText}
        isAutoFilledFromTimetable={drawer.isAutoFilledFromTimetable}
        sectionOptions={drawer.sectionOptions}
        periodSlots={drawer.periodSlots}
        isFetchingPeriodSlots={drawer.isFetchingPeriodTemplate}
        isFetchingProgramSegments={drawer.isFetchingProgramSegments}
        isFetchingSubjects={drawer.isFetchingSubjects}
        isFetchingTopics={drawer.isFetchingTopics}
        isFetchingMediums={drawer.isFetchingMediums}
        isFetchingSections={drawer.isFetchingSections}
        isSaving={schedules.isSavingSchedule}
        onSaveSchedule={schedules.handleSaveSchedule}
      />

      {/* Update Existing Schedule Side Drawer */}
      <UpdateScheduleDrawer
        isOpen={!!modal.selectedScheduleForModal}
        onClose={modal.closeScheduleModal}
        selectedScheduleForModal={modal.selectedScheduleForModal}
        periodSlots={calendar.periodSlots}
        onUpdateSchedule={schedules.handleUpdateSchedule}
        onRemoveSchedule={schedules.handleRemoveSchedule}
        onToggleComplete={schedules.handleToggleComplete}
      />

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </Box>
  )
}

export default SchedulePlanner
