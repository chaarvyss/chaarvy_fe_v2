import { IconButton, Tooltip } from '@mui/material'
import { ReactElement, useEffect, useRef, useState } from 'react'

import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import ChaarvyButton from 'src/reusable_components/ChaarvyButton'
import GetChaarvyIcons from 'src/utils/icons'
import { Box, Grid, Card, Avatar, CardHeader, Typography, CardContent } from 'src/utils/muiElements'

export interface TableTitleHeaderProps {
  buttonTitle?: string
  buttonColor?: 'primary' | 'success' | 'error' | 'info'
  buttonFillType?: 'solid' | 'gradient'
  onButtonClick?: () => void
  isButtonDisabled?: boolean
  title: string
  stats?: TableHeaderStatCardProps[]
  showFilterIcon?: boolean
  icon?: ReactElement
  handleFilterButtonClick?: () => void
}

const renderStats = (statData: TableHeaderStatCardProps[]) => {
  return statData.map((item: TableHeaderStatCardProps, index: number) => (
    <Grid item xs={12} sm={3} key={index} data-stat-item>
      <Box key={index} sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          variant='rounded'
          sx={{
            mr: 3,
            width: 44,
            height: 44,
            boxShadow: 3,
            color: 'common.white',
            backgroundColor: `${item.color}.main`
          }}
        >
          {item.icon}
        </Avatar>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography variant='caption'>{item.title}</Typography>
          <Typography variant='h6'>{item.value}</Typography>
        </Box>
      </Box>
    </Grid>
  ))
}

const TableTilteHeader = ({
  title,
  stats,
  buttonTitle,
  buttonColor,
  buttonFillType,
  onButtonClick,
  isButtonDisabled,
  showFilterIcon,
  icon,
  handleFilterButtonClick
}: TableTitleHeaderProps) => {
  const titleRef = useRef<HTMLElement | null>(null)
  const [isTruncated, setIsTruncated] = useState(false)
  const statsContainerRef = useRef<HTMLDivElement | null>(null)
  const [maxStatsHeight, setMaxStatsHeight] = useState<number | undefined>(undefined)

  useEffect(() => {
    const el = titleRef.current
    const check = () => {
      if (!el) return
      setIsTruncated(el.scrollWidth > el.clientWidth)
    }

    check()
    window.addEventListener('resize', check)

    return () => window.removeEventListener('resize', check)
  }, [title])

  useEffect(() => {
    // Measure first-row height of stats using data-stat-item nodes and clamp to two rows
    const container = statsContainerRef.current
    if (!container) {
      setMaxStatsHeight(undefined)

      return
    }

    const items = Array.from(container.querySelectorAll('[data-stat-item]')) as HTMLElement[]
    if (items.length === 0) {
      setMaxStatsHeight(undefined)

      return
    }

    // Determine the top position of the first row and compute its max height
    const firstTop = items[0].getBoundingClientRect().top
    let firstRowMaxHeight = 0
    items.forEach(it => {
      const rect = it.getBoundingClientRect()
      if (Math.abs(rect.top - firstTop) < 1) {
        firstRowMaxHeight = Math.max(firstRowMaxHeight, rect.height)
      }
    })

    if (firstRowMaxHeight <= 0) {
      setMaxStatsHeight(undefined)

      return
    }

    setMaxStatsHeight(Math.round(firstRowMaxHeight * 2))

    const onResize = () => {
      // recompute on resize
      const items2 = Array.from(container.querySelectorAll('[data-stat-item]')) as HTMLElement[]
      if (items2.length === 0) {
        setMaxStatsHeight(undefined)

        return
      }
      const firstTop2 = items2[0].getBoundingClientRect().top
      let firstRowMaxHeight2 = 0
      items2.forEach(it => {
        const rect = it.getBoundingClientRect()
        if (Math.abs(rect.top - firstTop2) < 1) {
          firstRowMaxHeight2 = Math.max(firstRowMaxHeight2, rect.height)
        }
      })
      if (firstRowMaxHeight2 > 0) setMaxStatsHeight(Math.round(firstRowMaxHeight2 * 2))
    }

    window.addEventListener('resize', onResize)

    return () => window.removeEventListener('resize', onResize)
  }, [stats])

  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={
          <Tooltip title={isTruncated ? title : ''} placement='top'>
            <Typography
              ref={elem => {
                // @ts-ignore assign element
                titleRef.current = elem
              }}
              sx={{
                maxWidth: isTruncated ? '45%' : '50%',
                mb: 0.5,
                lineHeight: '2rem !important',
                letterSpacing: '0.15px !important',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                cursor: isTruncated ? 'pointer' : 'default'
              }}
            >
              {title}
            </Typography>
          </Tooltip>
        }
        action={
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {buttonTitle && (
              <>
                <ChaarvyButton
                  className={icon ? 'd-none d-md-block' : ''}
                  fillType={buttonFillType ?? 'gradient'}
                  color={buttonColor ?? 'primary'}
                  disabled={isButtonDisabled}
                  onClick={onButtonClick}
                  size='small'
                  leftIcon={icon}
                  label={buttonTitle}
                />
                <Tooltip title={buttonTitle} placement='top'>
                  <IconButton
                    color={buttonColor ?? 'primary'}
                    disabled={isButtonDisabled}
                    onClick={onButtonClick}
                    className={icon ? 'd-md-none' : ''}
                  >
                    {icon}
                  </IconButton>
                </Tooltip>
              </>
            )}
            {showFilterIcon && (
              <Tooltip title='Filter' placement='top'>
                <IconButton onClick={handleFilterButtonClick} color={buttonColor ?? 'secondary'}>
                  <GetChaarvyIcons iconName='Filter' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      {stats && (
        <CardContent sx={{ maxHeight: maxStatsHeight ? `${maxStatsHeight}px` : undefined, overflowY: 'auto' }}>
          <Grid container spacing={[5, 0]} ref={statsContainerRef}>
            {renderStats(stats)}
          </Grid>
        </CardContent>
      )}
    </Card>
  )
}

export default TableTilteHeader
