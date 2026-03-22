import React from 'react'

import { ArrowUpDropCircleOutline } from '@mdiElements'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@muiElements'

import ChaarvyFlex from './ChaarvyFlex'

interface ChaarvyAccordianProps {
  children: React.ReactNode
  expandIcon?: React.ReactNode
  isExpanded?: boolean
  title: string
  onToggle?: () => void
  extraButton?: React.ReactNode
}

const ChaarvyAccordian = ({ children, expandIcon, isExpanded, title, extraButton }: ChaarvyAccordianProps) => {
  return (
    <Accordion {...(isExpanded !== undefined && { expanded: isExpanded })}>
      <AccordionSummary expandIcon={expandIcon ?? <ArrowUpDropCircleOutline />}>
        <ChaarvyFlex justifyContent='space-between' alignItems='center'>
          <Typography variant='h6'>{title}</Typography>
          {extraButton && <div>{extraButton}</div>}
        </ChaarvyFlex>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

export default ChaarvyAccordian
