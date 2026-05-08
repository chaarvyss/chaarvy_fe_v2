import React, { ReactNode, useEffect, useRef, useState } from 'react'

import { Box, Card } from '@muiElements'

interface DynamicHeightTableContainerProps {
  children: ReactNode
  pagination?: ReactNode
  maxHeight?: number
  headerRef?: React.RefObject<HTMLElement>
  header?: ReactNode
}

const DynamicHeightTableContainer = ({
  children,
  pagination,
  maxHeight = screen.availHeight,
  headerRef: externalHeaderRef,
  header
}: DynamicHeightTableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const internalHeaderRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(maxHeight)

  const headerHeight = (document.getElementById('table-title-header')?.offsetHeight || 0) + 20
  const viewportHeight = window.outerHeight
  const paginationHeight = document.getElementById('pagination-container')?.offsetHeight || 0

  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return

      const availableHeight = viewportHeight - headerHeight - 250 // buffer for padding, margins, etc.
      // if (pagination) {
      //   availableHeight -= paginationHeight
      // }

      const computed = Math.max(availableHeight, 200)
      setTableHeight(Math.min(computed, maxHeight))
    }

    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => window.removeEventListener('resize', calculateHeight)
  }, [maxHeight, externalHeaderRef, paginationHeight, headerHeight, pagination])

  return (
    <div>
      {externalHeaderRef ? null : header ? (
        <div ref={internalHeaderRef}>{header}</div>
      ) : (
        <div ref={internalHeaderRef} style={{ display: 'none' }} />
      )}

      <Card ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: tableHeight }}>
        <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</Box>
      </Card>

      {pagination && (
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{pagination}</Box>
      )}
    </div>
  )
}

export default DynamicHeightTableContainer
