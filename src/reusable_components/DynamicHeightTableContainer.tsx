import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { Box, Paper, Card } from '@muiElements'

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
  maxHeight = 600,
  headerRef: externalHeaderRef,
  header
}: DynamicHeightTableContainerProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const internalHeaderRef = useRef<HTMLDivElement>(null)
  const [tableHeight, setTableHeight] = useState(maxHeight)

  useEffect(() => {
    const calculateHeight = () => {
      if (!containerRef.current) return

      const viewportHeight = window.innerHeight

      const headerEl = (externalHeaderRef && externalHeaderRef.current) || internalHeaderRef.current
      const headerRect = headerEl ? headerEl.getBoundingClientRect() : { bottom: 0 }
      const headerBottomPosition = headerRect.bottom

      const paginationHeight = 100
      const padding = 60
      const extraMargin = 40

      const availableHeight = viewportHeight - headerBottomPosition - paginationHeight - padding - extraMargin

      const computed = Math.max(availableHeight, 200)
      setTableHeight(Math.min(computed, maxHeight))
    }

    // Calculate on mount and when window resizes
    calculateHeight()
    window.addEventListener('resize', calculateHeight)

    return () => window.removeEventListener('resize', calculateHeight)
  }, [maxHeight, externalHeaderRef])

  return (
    <div>
      {/* render the header prop inside the container so it can be measured; fall back to hidden placeholder if not provided */}
      {/** If `header` is provided render it and attach the internal ref so we can measure it. */}
      {externalHeaderRef ? null : header ? (
        <div ref={internalHeaderRef}>{header}</div>
      ) : (
        <div ref={internalHeaderRef} style={{ display: 'none' }} />
      )}
      <Paper>
        <Card ref={containerRef} sx={{ display: 'flex', flexDirection: 'column', height: tableHeight }}>
          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>{children}</Box>
        </Card>
        {pagination && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>{pagination}</Box>
        )}
      </Paper>
    </div>
  )
}

export default DynamicHeightTableContainer
