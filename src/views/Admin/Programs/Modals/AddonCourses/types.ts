import { AddonCourseDetails } from 'src/store/services/adminServices'

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
  seating_capacity: string
  addon_course_fees: string
}

export interface AddonCourseDetail {
  addon_course_id: string
  addon_course_name: string
}

export interface ProgramAddonCourseModalProps {
  isOpen: boolean
  onClose: () => void
  addon_course?: AddonCourseDetail
}

export interface AddOnCourseProps {
  program_id: string
  program_name: string
  program_segments: ProgramSegments[]
}

export interface CourseUpdatePayload {
  course_id?: string
  course_name: string
}

export interface AddonCourseChangeset {
  upsert: AddonCourseDetails[]
  removed: AddonCourseDetails[]
  course_update?: CourseUpdatePayload
}
