export interface SegmentMediums {
  medium_id: string
  medium_name: string
}

export interface ProgramSegments {
  segment_id: string
  segment_name: string
  segment_mediums: SegmentMediums[]
}

export interface ProgramNode {
  key: string
  id: string
  name: string
  segmentKeys: string[]
  mediumKeys: string[]
  segments: SegmentNode[]
}

export interface SegmentNode {
  key: string
  id: string
  name: string
  mediumKeys: string[]
  mediums: MediumNode[]
}

export interface MediumNode {
  key: string
  id: string
  name: string
}

export interface MediumFieldValues {
  capacity: string
  fees: string
}

export interface ProgramAddonCourseModalProps {
  isOpen: boolean
  onClose: () => void
  course_id?: string
  course_name?: string
}

export interface AddOnCourseProps {
  program_id: string
  program_name: string
  program_segments: ProgramSegments[]
}

export interface PreviousProgramAddonCourse {
  program_addon_course_id?: string
  course_id?: string
  course_name?: string
  program_id: string
  segment_id?: string
  medium_id: string
  capacity?: number
  fees?: number
}

export interface CourseUpdatePayload {
  course_id?: string
  course_name: string
}

export interface AddonCourseChangeset {
  upsert: PreviousProgramAddonCourse[]
  removed: string[]
  course_update?: CourseUpdatePayload
}
