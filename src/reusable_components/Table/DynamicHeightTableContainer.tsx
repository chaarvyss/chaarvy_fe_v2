import React, { ReactNode, useCallback, useEffect, useRef, useState } from 'react'

import { Box, Card } from '@muiElements'

const BOTTOM_PADDING = 16

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
  const [cardHeight, setCardHeight] = useState<number>(400)

  const recalculate = useCallback(() => {
    const wrapper = wrapperRef.current
    if (!wrapper) return

    const top = wrapper.getBoundingClientRect().top
    const viewportHeight = window.innerHeight

    const headerEl = externalHeaderRef?.current ?? internalHeaderRef.current
    const headerH = headerEl ? headerEl.getBoundingClientRect().height : 0

    const paginationH = paginationRef.current ? paginationRef.current.getBoundingClientRect().height + 16 : 0 // 16 = mt:2

    const available = viewportHeight - top - headerH - paginationH - BOTTOM_PADDING
    setCardHeight(Math.max(available, 220))
  }, [externalHeaderRef])

  useEffect(() => {
    recalculate()

    const observer = new ResizeObserver(recalculate)

    if (wrapperRef.current) observer.observe(wrapperRef.current)
    if (internalHeaderRef.current) observer.observe(internalHeaderRef.current)
    if (externalHeaderRef?.current) observer.observe(externalHeaderRef.current)

    window.addEventListener('resize', recalculate)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', recalculate)
    }
  }, [recalculate, pagination])

  return (
    <Box ref={wrapperRef} sx={{ display: 'flex', flexDirection: 'column' }}>
      {externalHeaderRef ? null : header ? <div ref={internalHeaderRef}>{header}</div> : null}

      <Card sx={{ display: 'flex', flexDirection: 'column', height: cardHeight, overflow: 'hidden' }}>
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
