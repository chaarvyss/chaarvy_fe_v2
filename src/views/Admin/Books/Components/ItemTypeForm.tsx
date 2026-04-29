import { FormControlLabel, Radio, RadioGroup } from '@mui/material'
import React, { useState } from 'react'

import { FormControl } from '@muiElements'
import { ItemType } from 'src/views/Admin/Books/add_books'

interface ItemTypeFormProps {
  defaultValue: ItemType
  onValueChange: (d: ItemType) => void
}

const ItemTypeForm = ({ defaultValue, onValueChange }: ItemTypeFormProps) => {
  const [value, setValue] = useState<ItemType>(defaultValue)
  const menuOptions = [
    {
      label: 'Specific',
      value: 'specific'
    },
    {
      label: 'Common',
      value: 'common'
    }
  ]

  const handleOnChange = (value: ItemType) => {
    setValue(value)
    onValueChange(value)
  }

  return (
    <FormControl>
      <RadioGroup
        row
        name='itemType'
        id='itemType'
        value={value as string}
        onChange={(_, val) => handleOnChange(val as ItemType)}
      >
        {menuOptions.map(each => (
          <FormControlLabel key={each.value} value={each.value} control={<Radio />} label={each.label} />
        ))}
      </RadioGroup>
    </FormControl>
  )
}

export default ItemTypeForm
