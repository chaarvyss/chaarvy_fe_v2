import { useEffect, useMemo, useState } from 'react'

import { AddonCourseDetails } from 'src/store/services/adminServices'

import { AddOnCourseProps, AddonCourseChangeset, MediumFieldValues, ProgramNode, SegmentNode } from './types'
import { buildProgramNodes } from './utils'

interface UseAddonCourseModalOptions {
  isOpen: boolean
  course_id?: string
  course_name?: string
  data: AddOnCourseProps[]
  previousData: AddonCourseDetails[]
}

const getMediumPathByKey = (programNodes: ProgramNode[]) => {
  const map = new Map<string, { programId: string; segmentId: string; mediumId: string }>()
  programNodes.forEach(program => {
    program.segments.forEach(segment => {
      segment.mediums.forEach(medium => {
        map.set(medium.key, {
          programId: program.id,
          segmentId: segment.id,
          mediumId: medium.id
        })
      })
    })
  })

  return map
}

const getMediumKeyByComposite = (programNodes: ProgramNode[]) => {
  const map = new Map<string, string>()
  programNodes.forEach(program => {
    program.segments.forEach(segment => {
      segment.mediums.forEach(medium => {
        const compositeKey = `${program.id}::${segment.id}::${medium.id}`
        map.set(compositeKey, medium.key)
      })
    })
  })

  return map
}

const getExpandedSegments = ({
  prev,
  programNodes
}: {
  prev: Record<string, boolean>
  programNodes: ProgramNode[]
}) => {
  const next = { ...prev }

  for (const program of programNodes) {
    for (const segment of program.segments) {
      if (!(segment.key in next)) {
        next[segment.key] = false
      }
    }
  }

  return next
}

const getInvalidSegmentKeys = ({
  invalidSelectedMediumKeys,
  programNodes
}: {
  invalidSelectedMediumKeys: Set<string>
  programNodes: ProgramNode[]
}) => {
  const invalidKeys = new Set<string>()

  programNodes.forEach(program => {
    program.segments.forEach(segment => {
      if (segment.mediumKeys.some(mediumKey => invalidSelectedMediumKeys.has(mediumKey))) {
        invalidKeys.add(segment.key)
      }
    })
  })

  return invalidKeys
}

export const useAddonCourseModal = ({
  isOpen,
  course_id,
  course_name,
  data,
  previousData
}: UseAddonCourseModalOptions) => {
  const programNodes = useMemo(() => buildProgramNodes(data), [data])

  const [selectedMediumKeys, setSelectedMediumKeys] = useState<Set<string>>(new Set())
  const [expandedPrograms, setExpandedPrograms] = useState<Record<string, boolean>>({})
  const [expandedSegments, setExpandedSegments] = useState<Record<string, boolean>>({})
  const [mediumFieldValues, setMediumFieldValues] = useState<Record<string, MediumFieldValues>>({})
  const [editableCourseName, setEditableCourseName] = useState(course_name ?? '')

  useEffect(() => {
    setEditableCourseName(course_name ?? '')
  }, [course_name])

  const previousDataMap = useMemo(() => {
    const map = new Map<string, AddonCourseDetails>()

    previousData.forEach(item => {
      if (!item.segment_id) return

      const compositeKey = `${item.program_id}::${item.segment_id}::${item.medium_id}`
      map.set(compositeKey, item)
    })

    return map
  }, [previousData])

  const mediumPathByKey = useMemo(() => {
    return getMediumPathByKey(programNodes)
  }, [programNodes])

  const mediumKeyByComposite = useMemo(() => {
    return getMediumKeyByComposite(programNodes)
  }, [programNodes])

  // Initialize expand state when nodes load
  useEffect(() => {
    setExpandedPrograms(prev => {
      const next = { ...prev }
      programNodes.forEach(program => {
        if (typeof next[program.key] === 'undefined') {
          next[program.key] = false
        }
      })

      return next
    })

    setExpandedSegments(prev => getExpandedSegments({ prev, programNodes }))
  }, [programNodes])

  const resetModalState = () => {
    setSelectedMediumKeys(new Set())
    setMediumFieldValues({})
    setEditableCourseName(course_name ?? '')

    const initialPrograms: Record<string, boolean> = {}
    const initialSegments: Record<string, boolean> = {}

    programNodes.forEach(program => {
      initialPrograms[program.key] = false
      program.segments.forEach(segment => {
        initialSegments[segment.key] = false
      })
    })

    setExpandedPrograms(initialPrograms)
    setExpandedSegments(initialSegments)
  }

  // Prefill from previousData when modal opens, or clear when it closes
  useEffect(() => {
    if (!isOpen) {
      resetModalState()

      return
    }

    const selectedKeys = new Set<string>()
    const values: Record<string, MediumFieldValues> = {}

    previousData.forEach(item => {
      if (!item.segment_id) return

      const compositeKey = `${item.program_id}::${item.segment_id}::${item.medium_id}`
      const mediumKey = mediumKeyByComposite.get(compositeKey)

      if (!mediumKey) return

      selectedKeys.add(mediumKey)
      values[mediumKey] = {
        seating_capacity: item.seating_capacity?.toString() ?? '',
        addon_course_fees: item.addon_course_fees?.toString() ?? ''
      }
    })

    setSelectedMediumKeys(selectedKeys)
    setMediumFieldValues(values)
  }, [isOpen, mediumKeyByComposite, previousData, course_name, programNodes])

  const preparedApiPayload = useMemo<AddonCourseChangeset>(() => {
    const upsert: AddonCourseDetails[] = []

    // Collect entries that are new or have changed values
    selectedMediumKeys.forEach(mediumKey => {
      const path = mediumPathByKey.get(mediumKey)
      if (!path) return

      const compositeKey = `${path.programId}::${path.segmentId}::${path.mediumId}`
      const existing = previousDataMap.get(compositeKey)

      const fields = mediumFieldValues[mediumKey] ?? { seating_capacity: '', addon_course_fees: '' }
      const parsedseating_capacity = Number(fields.seating_capacity)
      const parsedaddon_course_fees = Number(fields.addon_course_fees)
      const seating_capacity = Number.isFinite(parsedseating_capacity) ? Math.max(parsedseating_capacity, 0) : 0
      const addon_course_fees = Number.isFinite(parsedaddon_course_fees) ? Math.max(parsedaddon_course_fees, 0) : 0

      // Skip if values are unchanged from previousData
      if (existing?.seating_capacity === seating_capacity && existing?.addon_course_fees === addon_course_fees) return

      upsert.push({
        ...(existing?.program_addon_course_id ? { program_addon_course_id: existing.program_addon_course_id } : {}),
        addon_course_id: course_id ?? existing?.addon_course_id,
        program_id: path.programId,
        segment_id: path.segmentId,
        medium_id: path.mediumId,
        seating_capacity,
        addon_course_fees
      })
    })

    // Collect previously saved entries that have been unchecked (removed)
    const removed: AddonCourseDetails[] = []
    previousDataMap.forEach((item, compositeKey) => {
      const mediumKey = mediumKeyByComposite.get(compositeKey)
      if (mediumKey && !selectedMediumKeys.has(mediumKey) && item.program_addon_course_id) {
        removed.push(item)
      }
    })

    const baseCourseName = (course_name ?? '').trim()
    const nextCourseName = editableCourseName.trim()
    const course_update =
      nextCourseName !== '' && nextCourseName !== baseCourseName
        ? {
            course_id,
            course_name: nextCourseName
          }
        : undefined

    return { upsert, removed, course_update }
  }, [
    course_id,
    course_name,
    editableCourseName,
    mediumFieldValues,
    mediumKeyByComposite,
    mediumPathByKey,
    previousDataMap,
    selectedMediumKeys
  ])

  const invalidSelectedMediumKeys = useMemo(() => {
    const invalidKeys = new Set<string>()

    selectedMediumKeys.forEach(mediumKey => {
      const fields = mediumFieldValues[mediumKey]
      const seating_capacity = Number(fields?.seating_capacity)
      const addon_course_fees = Number(fields?.addon_course_fees)

      const isInvalid =
        fields?.seating_capacity?.trim() === '' ||
        fields?.addon_course_fees?.trim() === '' ||
        !Number.isFinite(seating_capacity) ||
        !Number.isFinite(addon_course_fees) ||
        seating_capacity < 0 ||
        addon_course_fees < 0

      if (isInvalid) {
        invalidKeys.add(mediumKey)
      }
    })

    return invalidKeys
  }, [mediumFieldValues, selectedMediumKeys])

  const invalidSegmentKeys = useMemo(() => {
    return getInvalidSegmentKeys({
      invalidSelectedMediumKeys,
      programNodes
    })
  }, [invalidSelectedMediumKeys, programNodes])

  const invalidProgramKeys = useMemo(() => {
    const invalidKeys = new Set<string>()

    programNodes.forEach(program => {
      if (program.mediumKeys.some(mediumKey => invalidSelectedMediumKeys.has(mediumKey))) {
        invalidKeys.add(program.key)
      }
    })

    return invalidKeys
  }, [invalidSelectedMediumKeys, programNodes])

  const canSave = useMemo(() => {
    const hasValidCourseName = editableCourseName.trim() !== ''
    const hasSelectionChanges = preparedApiPayload.upsert.length > 0 || preparedApiPayload.removed.length > 0
    const hasCourseNameChange = Boolean(preparedApiPayload.course_update)

    return hasValidCourseName && invalidSelectedMediumKeys.size === 0 && (hasSelectionChanges || hasCourseNameChange)
  }, [editableCourseName, invalidSelectedMediumKeys.size, preparedApiPayload])

  const getSelectionState = (keys: string[]) => {
    if (!keys.length) return { checked: false, indeterminate: false }

    const selectedCount = keys.filter(key => selectedMediumKeys.has(key)).length

    return {
      checked: selectedCount === keys.length,
      indeterminate: selectedCount > 0 && selectedCount < keys.length
    }
  }

  const toggleProgram = (program: ProgramNode, isChecked: boolean) => {
    if (isChecked) {
      setExpandedPrograms(prev => ({ ...prev, [program.key]: true }))

      setExpandedSegments(prev => {
        const next = { ...prev }
        program.segmentKeys.forEach(segmentKey => {
          next[segmentKey] = true
        })

        return next
      })
    }

    setSelectedMediumKeys(prev => {
      const next = new Set(prev)
      program.mediumKeys.forEach(mediumKey => {
        if (isChecked) {
          next.add(mediumKey)
        } else {
          next.delete(mediumKey)
        }
      })

      return next
    })
  }

  const toggleProgramExpanded = (programKey: string) => {
    setExpandedPrograms(prev => ({ ...prev, [programKey]: !prev[programKey] }))
  }

  const toggleSegment = (segment: SegmentNode, isChecked: boolean) => {
    if (isChecked) {
      setExpandedSegments(prev => ({ ...prev, [segment.key]: true }))
    }

    setSelectedMediumKeys(prev => {
      const next = new Set(prev)
      segment.mediumKeys.forEach(mediumKey => {
        if (isChecked) {
          next.add(mediumKey)
        } else {
          next.delete(mediumKey)
        }
      })

      return next
    })
  }

  const toggleSegmentExpanded = (segmentKey: string) => {
    setExpandedSegments(prev => ({ ...prev, [segmentKey]: !prev[segmentKey] }))
  }

  const toggleMedium = (mediumKey: string, isChecked: boolean) => {
    setSelectedMediumKeys(prev => {
      const next = new Set(prev)
      if (isChecked) {
        next.add(mediumKey)
      } else {
        next.delete(mediumKey)
      }

      return next
    })
  }

  const handleFieldChange = (mediumKey: string, field: keyof MediumFieldValues, value: string) => {
    if (value !== '') {
      const parsed = Number(value)
      if (!Number.isFinite(parsed) || parsed < 0) return
    }

    setMediumFieldValues(prev => ({
      ...prev,
      [mediumKey]: { ...(prev[mediumKey] ?? { seating_capacity: '', addon_course_fees: '' }), [field]: value }
    }))
  }

  const handleCourseNameChange = (value: string) => {
    setEditableCourseName(value)
  }

  return {
    programNodes,
    selectedMediumKeys,
    expandedPrograms,
    expandedSegments,
    mediumFieldValues,
    editableCourseName,
    preparedApiPayload,
    canSave,
    invalidSelectedMediumKeys,
    invalidSegmentKeys,
    invalidProgramKeys,
    getSelectionState,
    toggleProgram,
    toggleProgramExpanded,
    toggleSegment,
    toggleSegmentExpanded,
    toggleMedium,
    handleFieldChange,
    handleCourseNameChange,
    resetModalState
  }
}
