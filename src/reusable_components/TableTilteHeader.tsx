import { Button, IconButton, Tooltip } from '@mui/material'
import { ReactElement } from 'react'

import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import GetChaarvyIcons from 'src/utils/icons'
import { Box, Grid, Card, Avatar, CardHeader, Typography, CardContent } from 'src/utils/muiElements'

export interface TableTitleHeaderProps {
  buttonTitle?: string
  buttonColor?: 'primary' | 'success' | 'error' | 'info'
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
    <Grid item xs={12} sm={3} key={index}>
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
  onButtonClick,
  isButtonDisabled,
  showFilterIcon,
  icon,
  handleFilterButtonClick
}: TableTitleHeaderProps) => {
  return (
    <Card sx={{ mb: 2 }}>
      <CardHeader
        title={title}
        titleTypographyProps={{
          sx: {
            mb: 0.5,
            lineHeight: '2rem !important',
            letterSpacing: '0.15px !important'
          }
        }}
        action={
          <Box display='flex'>
            {buttonTitle && (
              <>
                <Button
                  className={icon ? 'd-none d-md-block' : ''}
                  color={buttonColor ?? 'primary'}
                  variant='contained'
                  disabled={isButtonDisabled}
                  onClick={onButtonClick}
                >
                  <Box display='flex' gap={2}>
                    {icon}
                    <Typography color='white'>{buttonTitle}</Typography>
                  </Box>
                </Button>
                <Tooltip title={buttonTitle} placement='top'>
                  <IconButton disabled={isButtonDisabled} onClick={onButtonClick} className={icon ? 'd-md-none' : ''}>
                    {icon}
                  </IconButton>
                </Tooltip>
              </>
            )}
            {showFilterIcon && (
              <Tooltip title='Filter' placement='top'>
                <IconButton onClick={handleFilterButtonClick}>
                  <GetChaarvyIcons iconName='Filter' />
                </IconButton>
              </Tooltip>
            )}
          </Box>
        }
      />
      {stats && (
        <CardContent>
          <Grid container spacing={[5, 0]}>
            {renderStats(stats)}
          </Grid>
        </CardContent>
      )}
    </Card>
  )
}

export default TableTilteHeader
