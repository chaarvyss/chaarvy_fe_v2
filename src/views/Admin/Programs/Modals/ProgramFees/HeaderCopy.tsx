import { Box, Button, Checkbox, FormControlLabel, Popover, Typography } from '@mui/material'
import { useMemo, useState } from 'react'

interface Props {
  displayName: string
  type: 'medium' | 'segment' | 'section'
  meta: any
  onCopy: (data: any) => void
  copyOptions?: any[]
  copyData?: any
}

const HeaderCopy = ({ displayName, type, meta, onCopy, copyOptions = [], copyData = [] }: Props) => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const [selected, setSelected] = useState<string[]>([])
  const [step, setStep] = useState(1)

  const [mediums, setMediums] = useState<string[]>([])

  const [segments, setSegments] = useState<string[]>([])

  const [sections, setSections] = useState<string[]>([])

  /********************************
NORMALIZE
*********************************/

  const normalizedCopyData = useMemo(() => {
    if (Array.isArray(copyData)) {
      return copyData.filter(Boolean)
    }

    if (copyData && Array.isArray(copyData.mediumMap)) {
      return copyData.mediumMap
    }

    return []
  }, [copyData])

  /********************************
HELPERS
*********************************/

  const reset = () => {
    setAnchorEl(null)

    setSelected([])

    setStep(1)

    setMediums([])
    setSegments([])
    setSections([])
  }

  const toggleValue = (setter: any, id: string) => {
    setter((prev: string[]) => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  /********************************
DERIVED DATA
*********************************/

  const availableSegments = useMemo(() => {
    const segmentMap = new Map()

    normalizedCopyData
      .filter(medium => mediums.includes(medium.medium_id))
      .forEach((medium: any) => {
        ;(medium.segments || []).forEach((segment: any) => {
          if (!segmentMap.has(segment.segment_id)) {
            segmentMap.set(segment.segment_id, {
              ...segment,
              sections: [...(segment.sections || [])]
            })
          } else {
            const existing = segmentMap.get(segment.segment_id)

            existing.sections = Array.from(
              new Map(
                [...existing.sections, ...(segment.sections || [])].map((section: any) => [section.section_id, section])
              ).values()
            )
          }
        })
      })

    return Array.from(segmentMap.values()).sort((a: any, b: any) => a.sequence - b.sequence)
  }, [normalizedCopyData, mediums])

  const availableSections = useMemo(() => {
    const sectionMap = new Map()

    availableSegments
      .filter(segment => segments.includes(segment.segment_id))
      .forEach(segment => {
        ;(segment.sections || []).forEach((section: any) => {
          if (!sectionMap.has(section.section_id)) {
            sectionMap.set(section.section_id, section)
          }
        })
      })

    return Array.from(sectionMap.values()).sort((a: any, b: any) => a.sequence - b.sequence)
  }, [availableSegments, segments])

  /********************************
COMMON UI
*********************************/

  const CheckboxList = ({ items, selected, setter, valueKey, labelKey }: any) => (
    <>
      {items.map((item: any) => (
        <FormControlLabel
          key={item[valueKey]}
          control={
            <Checkbox
              checked={selected.includes(item[valueKey])}
              onChange={() => {
                toggleValue(
                  setter,

                  item[valueKey]
                )
              }}
            />
          }
          label={item[labelKey]}
        />
      ))}
    </>
  )

  const ActionButtons = ({ back, next, nextLabel = 'Next', disabled = false }: any) => (
    <Box mt={2} display='flex' gap={1}>
      {back && (
        <Button fullWidth variant='outlined' onClick={back}>
          Back
        </Button>
      )}

      <Button fullWidth variant='contained' disabled={disabled} onClick={next}>
        {nextLabel}
      </Button>
    </Box>
  )

  return (
    <>
      <Box display='flex' alignItems='center' width='100%' justifyContent='center' gap={0.5}>
        <Box
          onClick={e => setAnchorEl(e.currentTarget)}
          sx={{
            cursor: 'pointer',
            px: 1,
            py: 0.5,
            borderRadius: 2,

            '&:hover': {
              background: '#f5f5f5'
            }
          }}
        >
          {displayName}
        </Box>
      </Box>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={reset}
        disableRestoreFocus
        slotProps={{
          paper: {
            className: 'copy-popover',
            sx: {
              borderRadius: 3,
              boxShadow: 4,
              background: '#FAFAFA',
              border: '1px solid #E0E0E0'
            }
          }
        }}
      >
        <Box p={2} width={300}>
          {type === 'medium' && (
            <>
              <CheckboxList
                items={copyOptions}
                selected={selected}
                setter={setSelected}
                valueKey='id'
                labelKey='label'
              />

              <ActionButtons
                disabled={!selected.length}
                next={() => {
                  onCopy({
                    type,

                    source: meta,

                    targets: selected
                  })

                  reset()
                }}
                nextLabel='Copy'
              />
            </>
          )}

          {(type === 'segment' || type === 'section') && (
            <>
              {step === 1 && (
                <>
                  <Typography mb={1}>Select Mediums</Typography>

                  <CheckboxList
                    items={normalizedCopyData}
                    selected={mediums}
                    setter={setMediums}
                    valueKey='medium_id'
                    labelKey='medium_name'
                  />

                  <ActionButtons disabled={!mediums.length} next={() => setStep(2)} />
                </>
              )}

              {step === 2 && (
                <>
                  <Typography mb={1}>Select Segments</Typography>

                  <CheckboxList
                    items={availableSegments}
                    selected={segments}
                    setter={setSegments}
                    valueKey='segment_id'
                    labelKey='segment_name'
                  />

                  <ActionButtons
                    back={() => setStep(1)}
                    disabled={!segments.length}
                    next={() => {
                      if (type === 'segment') {
                        onCopy({
                          type,

                          source: meta,

                          targets: {
                            mediums,
                            segments
                          }
                        })

                        reset()
                      } else {
                        setStep(3)
                      }
                    }}
                    nextLabel={type === 'segment' ? 'Copy' : 'Next'}
                  />
                </>
              )}

              {type === 'section' && step === 3 && (
                <>
                  <Typography mb={1}>Select Sections</Typography>

                  <CheckboxList
                    items={availableSections}
                    selected={sections}
                    setter={setSections}
                    valueKey='section_id'
                    labelKey='section_name'
                  />

                  <ActionButtons
                    back={() => setStep(2)}
                    disabled={!sections.length}
                    next={() => {
                      onCopy({
                        type,

                        source: meta,

                        targets: {
                          mediums,
                          segments,
                          sections
                        }
                      })

                      reset()
                    }}
                    nextLabel='Copy'
                  />
                </>
              )}
            </>
          )}
        </Box>
      </Popover>
    </>
  )
}

export default HeaderCopy
