import { Button } from '@mui/material'

import { TableHeaderStatCardProps } from 'src/lib/interfaces'
import { Box, Grid, Card, Avatar, CardHeader, Typography, CardContent } from 'src/utils/muiElements'

export interface TableTitleHeaderProps {
  buttonTitle?: string
  onButtonClick?: () => void
  isButtonDisabled?: boolean
  title: string
  stats?: TableHeaderStatCardProps[]
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

const TableTilteHeader = ({ title, stats, buttonTitle, onButtonClick, isButtonDisabled }: TableTitleHeaderProps) => {
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
          buttonTitle && (
            <Button variant='contained' disabled={isButtonDisabled} onClick={onButtonClick}>
              {buttonTitle}
            </Button>
          )
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
