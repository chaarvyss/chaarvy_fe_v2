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

  const uniqueBy = (items: any[], key: string) => {
    return Array.from(new Map(items.map(item => [item[key], item])).values())
  }

  /********************************
DERIVED DATA
*********************************/

  const availableSegments = useMemo(() => {
    const result = normalizedCopyData

      .filter(medium => mediums.includes(medium.medium_id))

      .flatMap(medium => medium.segments || [])

      .filter(Boolean)

    return uniqueBy(result, 'segment_id')
  }, [normalizedCopyData, mediums])

  const availableSections = useMemo(() => {
    const result = availableSegments

      .filter(segment => segments.includes(segment.segment_id))

      .flatMap(segment => segment.sections || [])

      .filter(Boolean)

    return uniqueBy(result, 'section_id')
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
      <Box display='flex' alignItems='center' width='100%' justifyContent='center' gap={1}>
        {displayName}

        <IconButton size='small' onClick={e => setAnchorEl(e.currentTarget)}>
          <ContentCopy fontSize='inherit' />
        </IconButton>
      </Box>

      <Popover open={Boolean(anchorEl)} anchorEl={anchorEl} onClose={reset}>
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
