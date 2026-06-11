import { LoadingButton } from '@mui/lab'
import {
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  Box
} from '@mui/material'
import { ArrowUpDropCircleOutline } from 'mdi-material-ui'
import { useState } from 'react'

import { PermissionLabels } from '../../constants/permissions'

import PermissionNode from './permissionNode'
import { extractAllPermissions, getFormattedName } from './utils'

const permissionsData = PermissionLabels

interface PermissionEditorProps {
  initialSelected: string[]
  isSubmitting: boolean
  onSubmit: (selectedPerms: string[]) => void
}

const PermissionsEditor = ({ initialSelected, onSubmit, isSubmitting }: PermissionEditorProps) => {
  const [selectedPerms, setSelectedPerms] = useState<string[]>(initialSelected)

  const handleToggle = (permissionsToToggle: string | string[], isChecked: boolean) => {
    setSelectedPerms(prev => {
      const updated = new Set(prev)
      const toToggleArray = Array.isArray(permissionsToToggle) ? permissionsToToggle : [permissionsToToggle]

      toToggleArray.forEach(p => {
        if (isChecked) {
          updated.add(p)
        } else {
          updated.delete(p)
          const navEntries = Object.entries(PermissionLabels.nav) as [string, string][]
          const matchingNavEntry = navEntries.find(([, value]) => value === p)
          if (matchingNavEntry) {
            const correspondingTopLevelKey = matchingNavEntry[0]
            const subNode = PermissionLabels[correspondingTopLevelKey as keyof typeof PermissionLabels]
            if (subNode) {
              const allChildPerms = extractAllPermissions(subNode)
              allChildPerms.forEach(childPerm => updated.delete(childPerm))
            }
          }
        }
      })

      return Array.from(updated)
    })
  }

  return (
    <Box>
      <CardContent>
        {Object.entries(permissionsData).map(([topLevelKey, topLevelNode]) => {
          if (topLevelKey !== 'nav') {
            const navPermissionString = PermissionLabels.nav[topLevelKey as keyof typeof PermissionLabels.nav] as
              | string
              | undefined

            if (!navPermissionString || !selectedPerms.includes(navPermissionString)) {
              return null
            }
          }

          const allTopLevelPerms = extractAllPermissions(topLevelNode)
          const checkedCount = allTopLevelPerms.filter(p => selectedPerms.includes(p)).length

          const isAllChecked = checkedCount === allTopLevelPerms.length && allTopLevelPerms.length > 0
          const isIndeterminate = checkedCount > 0 && checkedCount < allTopLevelPerms.length

          const handleAccordionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
            handleToggle(allTopLevelPerms, e.target.checked)
          }

          return (
            <Accordion key={topLevelKey} disableGutters variant='outlined' sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ArrowUpDropCircleOutline />}>
                <FormControlLabel
                  onClick={e => e.stopPropagation()} // Prevents accordion from opening/closing when clicking checkbox
                  onFocus={e => e.stopPropagation()}
                  control={
                    <Checkbox
                      checked={isAllChecked}
                      indeterminate={isIndeterminate}
                      onChange={handleAccordionToggle}
                      color='primary'
                    />
                  }
                  label={<Typography sx={{ fontWeight: 'bold' }}>{getFormattedName(topLevelKey)}</Typography>}
                />
              </AccordionSummary>
              <AccordionDetails sx={{ backgroundColor: '#fafafa', borderTop: '1px solid #e0e0e0' }}>
                <Grid container spacing={2}>
                  {Object.entries(topLevelNode).map(([subKey, subNode]) => (
                    <Grid item xs={12} sm={6} md={4} key={subKey}>
                      <PermissionNode
                        label={getFormattedName(subKey)}
                        node={subNode as any} // Cast safely since we know the structure
                        selectedPerms={selectedPerms}
                        onToggle={handleToggle}
                      />
                    </Grid>
                  ))}
                </Grid>
              </AccordionDetails>
            </Accordion>
          )
        })}
        <Box display='flex' justifyContent='end'>
          <LoadingButton
            loading={isSubmitting}
            variant='contained'
            size='small'
            onClick={() => onSubmit(selectedPerms)}
          >
            Submit
          </LoadingButton>
        </Box>
      </CardContent>
    </Box>
  )
}

export default PermissionsEditor
