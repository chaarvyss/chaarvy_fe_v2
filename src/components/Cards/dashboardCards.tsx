import { ClipLoader } from 'react-spinners'

import { Box, Card, Typography } from '@muiElements'
import PieChartCard from 'src/components/Charts/PieChartCard'
import ChaarvyDataTable, { ChaarvyDataTableProps } from 'src/reusable_components/Table/ChaarvyDataTable'

interface Card1Props {
  variant: 'detailInfo' | 'chart'
  isLoading: boolean
  values?: number[]
  labels?: string[]
  backgroundImage?: string
  cardTitle: string
  cardValue?: number
  details?: { key: string; value: string | number }[]
}

const Spinner = () => (
  <ClipLoader color={'#1976d2'} loading={true} size={50} aria-label='Loading Spinner' data-testid='loader' />
)

export const Card1 = ({
  backgroundImage,
  cardTitle,
  cardValue,
  details,
  variant,
  isLoading,
  values,
  labels
}: Card1Props) => {
  const getBackgroundValue = () => {
    if (!backgroundImage) return undefined

    const trimmed = backgroundImage.trim()
    const isGradient = /^(?:linear-gradient|radial-gradient|repeating-linear-gradient|conic-gradient)\(/i.test(trimmed)

    return isGradient ? trimmed.replace(/(['"])([a-zA-Z0-9#]+)\1/g, '$2') : `url('${trimmed}')`
  }

  return (
    <Card
      sx={{
        p: 3,
        cursor: 'pointer',
        width: {
          xs: '100%',
          sm: '48%',
          md: '31%',
          lg: '32%'
        },
        background: getBackgroundValue(),
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        color: '#fff',
        borderRadius: '1rem',
        boxShadow: 3,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      {variant === 'chart' && (
        <Box>
          <Typography variant='h5'>{cardTitle}</Typography>
          {isLoading ? <Spinner /> : <PieChartCard values={values ?? []} labels={labels ?? []} />}
        </Box>
      )}

      {variant == 'detailInfo' && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'start',
            justifyContent: 'space-between',
            p: 2
          }}
        >
          <Typography variant='h3'>
            {cardValue ?? '-'} <Typography variant='h6'>{cardTitle}</Typography>
          </Typography>
          {isLoading ? (
            <Spinner />
          ) : (
            <Box sx={{ display: 'flex', width: '60%', flexDirection: 'column', alignItems: 'start', gap: 1 }}>
              {(details ?? []).map(({ key, value }, index) => (
                <Box key={index}>
                  <Typography variant='subtitle2' color='text.secondary'>
                    {key} {value}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Card>
  )
}

interface DashboardTableProps extends ChaarvyDataTableProps {
  cardTitle: string
}

export const DashboardTable = ({ cardTitle, ...rest }: DashboardTableProps) => {
  return (
    <Card
      sx={{
        p: 3,
        cursor: 'pointer',
        width: {
          xs: '100%',
          sm: '98%',
          md: '63%',
          lg: '65%'
        },

        borderRadius: '1rem',
        boxShadow: 3,
        transition: 'transform 0.2s ease, box-shadow 0.2s ease'
      }}
    >
      <Typography variant='h5' sx={{ mb: 2 }}>
        {cardTitle}
      </Typography>

      <ChaarvyDataTable {...rest} />
    </Card>
  )
}
