import { Checkbox, FormControlLabel, Typography } from '@mui/material'
import { useMemo } from 'react'

import { Box } from '@muiElements'

import { extractAllPermissions, getFormattedName } from './utils'

const PermissionNode = ({
  label,
  node,
  selectedPerms,
  onToggle
}: {
  label: string
  node: any
  selectedPerms: string[]
  onToggle: (permissionsToToggle: string | string[], isChecked: boolean, isSingle: boolean) => void
}) => {
  const isLeaf = typeof node === 'string'

  const allChildPerms = useMemo(() => {
    return isLeaf ? [] : extractAllPermissions(node)
  }, [node, isLeaf])

  if (isLeaf) {
    const isChecked = selectedPerms.includes(node)

    return (
      <Box sx={{ ml: 3, mt: 0.5 }}>
        <FormControlLabel
          control={<Checkbox checked={isChecked} onChange={e => onToggle(node, e.target.checked, true)} size='small' />}
          label={<Typography variant='body2'>{label}</Typography>}
        />
      </Box>
    )
  }

  const checkedChildCount = allChildPerms.filter(p => selectedPerms.includes(p)).length

  const isAllChecked = checkedChildCount === allChildPerms.length && allChildPerms.length > 0
  const isIndeterminate = checkedChildCount > 0 && checkedChildCount < allChildPerms.length

  const handleParentToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(allChildPerms, e.target.checked, false)
  }

  return (
    <Box sx={{ ml: 3, mt: 1 }}>
      <FormControlLabel
        control={
          <Checkbox
            checked={isAllChecked}
            indeterminate={isIndeterminate}
            onChange={handleParentToggle}
            size='small'
            color='primary'
          />
        }
        label={
          <Typography variant='subtitle2' sx={{ fontWeight: 600, textTransform: 'capitalize' }}>
            {label}
          </Typography>
        }
      />

      <Box sx={{ borderLeft: '1px solid #e0e0e0', ml: 1.5, pl: 1 }}>
        {Object.entries(node).map(([childKey, childValue]) => (
          <PermissionNode
            key={childKey}
            label={getFormattedName(childKey)}
            node={childValue}
            selectedPerms={selectedPerms}
            onToggle={onToggle}
          />
        ))}
      </Box>
    </Box>
  )
}

export default PermissionNode
