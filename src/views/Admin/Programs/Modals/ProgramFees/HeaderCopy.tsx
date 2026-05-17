import { Box, Button, Checkbox, FormControlLabel, IconButton, Popover, Typography } from '@mui/material'
import { ContentCopy } from 'mdi-material-ui'
import { useMemo, useState } from 'react'

interface Props {
  displayName: string
  type: 'medium' | 'segment' | 'section'
  meta: any
  onCopy: (data: any) => void
  copyOptions?: any[]
  copyData?: any
}

export default function HeaderCopy({ displayName, type, meta, onCopy, copyOptions = [], copyData = [] }: Props) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)

  const [selected, setSelected] = useState<string[]>([])

  const [step, setStep] = useState(1)

  const [mediums, setMediums] = useState<string[]>([])

  const [segments, setSegments] = useState<string[]>([])

  const [sections, setSections] = useState<string[]>([])

  const normalizedCopyData = useMemo(() => {
    if (Array.isArray(copyData)) {
      return copyData.filter(Boolean)
    }

    if (copyData && typeof copyData === 'object') {
      if (Array.isArray(copyData.mediumMap)) {
        return copyData.mediumMap
      }

      if (copyData.medium_id) {
        return [copyData]
      }
    }

    return []
  }, [copyData])

  const reset = () => {
    setAnchorEl(null)

    setSelected([])

    setStep(1)

    setMediums([])

    setSegments([])

    setSections([])
  }

  /****************************************
SEGMENTS
*****************************************/

  const availableSegments = useMemo(() => {
    if (type !== 'section') {
      return []
    }

    const result = normalizedCopyData

      .filter((medium: any) => mediums.includes(medium.medium_id))

      .flatMap((medium: any) => medium.segments || [])

      .filter(x => x)

    return Array.from(new Map(result.map((item: any) => [item.segment_id, item])).values())
  }, [normalizedCopyData, mediums, type])

  const segmentWizardSegments = useMemo(() => {
    if (type !== 'segment') {
      return []
    }

    const result = normalizedCopyData

      .filter((medium: any) => mediums.includes(medium.medium_id))

      .flatMap((medium: any) => medium?.segments || [])

      .filter(Boolean)

    return Array.from(new Map(result.map((item: any) => [item.segment_id, item])).values())
  }, [normalizedCopyData, mediums, type])

  /****************************************
SECTIONS
*****************************************/

  const availableSections = useMemo(() => {
    if (type !== 'section') {
      return []
    }

    const result = availableSegments

      .filter((segment: any) => segments.includes(segment.segment_id))

      .flatMap((segment: any) => segment?.sections || [])

      .filter(Boolean)

    return Array.from(new Map(result.map((item: any) => [item.section_id, item])).values())
  }, [availableSegments, segments, type])

  const toggleValue = (value: string[], setter: any, id: string) => {
    setter(prev => (prev.includes(id) ? prev.filter((x: string) => x !== id) : [...prev, id]))
  }

  /****************************************
SIMPLE COPY
*****************************************/

  const renderSimpleCopy = () => (
    <>
      {copyOptions.map((item: any) => (
        <FormControlLabel
          key={item.id}
          control={
            <Checkbox
              checked={selected.includes(item.id)}
              onChange={() => {
                toggleValue(selected, setSelected, item.id)
              }}
            />
          }
          label={item.label}
        />
      ))}

      <Button
        fullWidth
        variant='contained'
        disabled={!selected.length}
        onClick={() => {
          onCopy({
            type,

            source: meta,

            targets: selected
          })

          reset()
        }}
      >
        Copy
      </Button>
    </>
  )

  return (
    <>
      <Box display='flex' alignItems='center' justifyContent='center' gap={1}>
        {displayName}

        <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
          <ContentCopy fontSize='inherit' />
        </IconButton>
      </Box>

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={reset}>
        <Box p={2} width={300}>
          {type === 'medium' && renderSimpleCopy()}

          {type === 'segment' && (
            <>
              {step === 1 && (
                <>
                  <Typography mb={1}>Select Mediums</Typography>

                  {normalizedCopyData.map((item: any) => (
                    <FormControlLabel
                      key={item.medium_id}
                      control={
                        <Checkbox
                          checked={mediums.includes(item.medium_id)}
                          onChange={() => {
                            toggleValue(mediums, setMediums, item.medium_id)
                          }}
                        />
                      }
                      label={item.medium_name}
                    />
                  ))}

                  <Button fullWidth variant='contained' disabled={!mediums.length} onClick={() => setStep(2)}>
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Typography mb={1}>Select Segments</Typography>

                  {segmentWizardSegments.map((item: any) => (
                    <FormControlLabel
                      key={item.segment_id}
                      control={
                        <Checkbox
                          checked={segments.includes(item.segment_id)}
                          onChange={() => {
                            toggleValue(segments, setSegments, item.segment_id)
                          }}
                        />
                      }
                      label={item.segment_name}
                    />
                  ))}

                  <Box mt={2} display='flex' gap={1}>
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        setStep(1)
                      }}
                    >
                      Back
                    </Button>

                    <Button
                      fullWidth
                      variant='contained'
                      disabled={!segments.length}
                      onClick={() => {
                        onCopy({
                          type,
                          source: meta,
                          targets: {
                            mediums,
                            segments
                          }
                        })

                        reset()
                      }}
                    >
                      Copy
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}

          {type === 'section' && (
            <>
              {step === 1 && (
                <>
                  <Typography mb={1}>Select Mediums</Typography>

                  {normalizedCopyData
                    .filter((item: any) => item.medium_name)
                    .map((item: any) => (
                      <FormControlLabel
                        key={item.medium_id}
                        control={
                          <Checkbox
                            checked={mediums.includes(item.medium_id)}
                            onChange={() => toggleValue(mediums, setMediums, item.medium_id)}
                          />
                        }
                        label={item.medium_name}
                      />
                    ))}

                  <Button fullWidth variant='contained' disabled={!mediums.length} onClick={() => setStep(2)}>
                    Next
                  </Button>
                </>
              )}

              {step === 2 && (
                <>
                  <Typography mb={1}>Select Segments</Typography>

                  {availableSegments.map((item: any) => (
                    <FormControlLabel
                      key={item.segment_id}
                      control={
                        <Checkbox
                          checked={segments.includes(item.segment_id)}
                          onChange={() => {
                            toggleValue(segments, setSegments, item.segment_id)
                          }}
                        />
                      }
                      label={item.segment_name}
                    />
                  ))}

                  <Box mt={2} display='flex' gap={1}>
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        setStep(1)
                      }}
                    >
                      Back
                    </Button>

                    <Button
                      fullWidth
                      variant='contained'
                      disabled={!segments.length}
                      onClick={() => {
                        setStep(3)
                      }}
                    >
                      Next
                    </Button>
                  </Box>
                </>
              )}

              {step === 3 && (
                <>
                  <Typography mb={1}>Select Sections</Typography>

                  {availableSections.map((item: any) => (
                    <FormControlLabel
                      key={item.section_id}
                      control={
                        <Checkbox
                          checked={sections.includes(item.section_id)}
                          onChange={() => {
                            toggleValue(sections, setSections, item.section_id)
                          }}
                        />
                      }
                      label={item.section_name}
                    />
                  ))}

                  <Box mt={2} display='flex' gap={1}>
                    <Button
                      fullWidth
                      variant='outlined'
                      onClick={() => {
                        setStep(2)
                      }}
                    >
                      Back
                    </Button>

                    <Button
                      fullWidth
                      variant='contained'
                      disabled={!sections.length}
                      onClick={() => {
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
                    >
                      Copy
                    </Button>
                  </Box>
                </>
              )}
            </>
          )}
        </Box>
      </Popover>
    </>
  )
}
