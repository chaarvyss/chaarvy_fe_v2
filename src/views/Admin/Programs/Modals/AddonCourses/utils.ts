import { AddOnCourseProps, ProgramNode } from './types'

export const toggleButtonSx = {
  mr: 0.5,
  width: 22,
  height: 22,
  border: '1px solid',
  borderColor: 'divider',
  borderRadius: '6px',
  fontSize: 13,
  fontWeight: 700
}

export const buildProgramNodes = (programs: AddOnCourseProps[]): ProgramNode[] => {
  return programs.map((program, programIndex) => {
    const programKey = `program-${program.program_id}-${programIndex}`

    const segments = program.program_segments.map((segment, segmentIndex) => {
      const segmentKey = `segment-${programKey}-${segment.segment_id}-${segmentIndex}`
      const mediums = segment.segment_mediums.map((medium, mediumIndex) => ({
        key: `medium-${segmentKey}-${medium.medium_id}-${mediumIndex}`,
        id: medium.medium_id,
        name: medium.medium_name
      }))

      return {
        key: segmentKey,
        id: segment.segment_id,
        name: segment.segment_name,
        mediumKeys: mediums.map(medium => medium.key),
        mediums
      }
    })

    const mediumKeys = segments.flatMap(segment => segment.mediumKeys)

    return {
      key: programKey,
      id: program.program_id,
      name: program.program_name,
      segmentKeys: segments.map(segment => segment.key),
      mediumKeys,
      segments
    }
  })
}
