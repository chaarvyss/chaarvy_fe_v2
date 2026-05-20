import React, { ReactNode, useRef } from 'react'

import { Box, Card } from '@muiElements'

interface DynamicHeightTableContainerProps {
  children: ReactNode
  pagination?: ReactNode
  headerRef?: React.RefObject<HTMLElement>
  header?: ReactNode
}

const DynamicHeightTableContainer = ({
  children,
  pagination,
  headerRef: externalHeaderRef,
  header
}: DynamicHeightTableContainerProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const internalHeaderRef = useRef<HTMLDivElement>(null)
  const paginationRef = useRef<HTMLDivElement>(null)

  return (
    <Box ref={wrapperRef} sx={{ display: 'flex', flexDirection: 'column' }}>
      {externalHeaderRef ? null : header ? <div ref={internalHeaderRef}>{header}</div> : null}

      <Card
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: '60vh'
        }}
      >
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </Card>

      {pagination && (
        <Box ref={paginationRef} sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {pagination}
        </Box>
      )}
    </Box>
  )
}

export default DynamicHeightTableContainer
