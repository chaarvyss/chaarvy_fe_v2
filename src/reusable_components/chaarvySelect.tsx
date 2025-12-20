import { Select, SelectProps } from '@mui/material'
import React from 'react'

// TODO: Under development

const ChaarvySelect = (props: SelectProps) => {
  return <Select {...props}>{props.children}</Select>
}

export default ChaarvySelect
