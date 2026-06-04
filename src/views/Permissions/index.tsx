import {
  Card,
  CardContent,
  Typography,
  Checkbox,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material'
import { ArrowUpDropCircleOutline } from 'mdi-material-ui'
import { useState } from 'react'

import { PermissionLabels } from '../../constants/permissions'

import PermissionNode from './permissionNode'
import { extractAllPermissions, getFormattedName } from './utils'

const permissionsData = PermissionLabels

const RolePermissionsEditor = ({ initialSelected = [] }) => {
  const [selectedPerms, setSelectedPerms] = useState<string[]>(initialSelected)

  const handleToggle = (permissionsToToggle: string | string[], isChecked: boolean) => {
    setSelectedPerms(prev => {
      const updated = new Set(prev)

      if (typeof permissionsToToggle === 'string') {
        if (isChecked) updated.add(permissionsToToggle)
        else updated.delete(permissionsToToggle)
      } else if (Array.isArray(permissionsToToggle)) {
        permissionsToToggle.forEach(p => {
          if (isChecked) updated.add(p)
          else updated.delete(p)
        })
      }

      return Array.from(updated)
    })
  }

  return (
    <Card elevation={2} sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <CardContent>
        <Typography variant='h5' gutterBottom sx={{ fontWeight: 'bold' }}>
          Assign Role Permissions
        </Typography>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 3 }}>
          Select the modules and actions this role can access. Checking a category automatically grants access to all
          its sub-features.
        </Typography>

        {Object.entries(permissionsData).map(([topLevelKey, topLevelNode]) => {
          const allTopLevelPerms = extractAllPermissions(topLevelNode)
          const checkedCount = allTopLevelPerms.filter(p => selectedPerms.includes(p)).length

          const isAllChecked = checkedCount === allTopLevelPerms.length && allTopLevelPerms.length > 0
          const isIndeterminate = checkedCount > 0 && checkedCount < allTopLevelPerms.length

          // 2. Handle the Accordion checkbox toggle
          const handleAccordionToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
            handleToggle(allTopLevelPerms, e.target.checked)
          }

          return (
            <Accordion key={topLevelKey} disableGutters variant='outlined' sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ArrowUpDropCircleOutline />}>
                {/* 3. The Accordion Master Checkbox */}
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
      </CardContent>
    </Card>
  )
}

export default RolePermissionsEditor
