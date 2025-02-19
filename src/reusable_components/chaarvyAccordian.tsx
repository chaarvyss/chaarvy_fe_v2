import React from 'react'

import { ArrowUpDropCircleOutline } from '@mdiElements'
import { Accordion, AccordionDetails, AccordionSummary, Typography } from '@muiElements'

interface ChaarvyAccordianProps {
  children: React.ReactNode
  expandIcon?: React.ReactNode
  isExpanded?: boolean
  title: string
}

const ChaarvyAccordian = ({ children, expandIcon, isExpanded, title }: ChaarvyAccordianProps) => {
  return (
    <Accordion {...(isExpanded !== undefined && { expanded: isExpanded })}>
      <AccordionSummary expandIcon={expandIcon ?? <ArrowUpDropCircleOutline />}>
        <Typography variant='h6'>{title}</Typography>
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  )
}

export default ChaarvyAccordian
