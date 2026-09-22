import { LoadingButton } from '@mui/lab'
import { Avatar, Box, Card, CardContent, CardHeader, Chip, Stack, Typography, useTheme } from '@mui/material'

import GetChaarvyIcons, { GetChaarvyIconsProps } from 'src/utils/icons'

export interface TemplateDownloadCardProps {
  title: string
  subheader?: string
  description: string
  iconName: GetChaarvyIconsProps['iconName']
  iconBgColor?: string
  iconColor?: string
  cleanChipLabel?: string
  cleanDescription?: string
  cleanButtonLabel?: string
  cleanButtonColor?: 'primary' | 'warning' | 'info' | 'success'
  isCleanLoading?: boolean
  onDownloadClean: () => void
  exportChipLabel?: string
  exportDescription?: string
  exportButtonLabel?: string
  exportButtonColor?: 'primary' | 'warning' | 'info' | 'success'
  isExportLoading?: boolean
  onDownloadExport: () => void
}

export const TemplateDownloadCard = ({
  title,
  subheader,
  description,
  iconName,
  iconBgColor,
  iconColor,
  cleanChipLabel = 'New Admissions',
  cleanDescription = 'Zero sample data. Blank sheets ready for fresh admissions.',
  cleanButtonLabel = 'Download (.xlsx)',
  cleanButtonColor = 'primary',
  isCleanLoading = false,
  onDownloadClean,
  exportChipLabel = 'Mass Update',
  exportDescription = 'Pre-populated with all current active records for mass editing.',
  exportButtonLabel = 'Export Data (.xlsx)',
  exportButtonColor = 'info',
  isExportLoading = false,
  onDownloadExport
}: TemplateDownloadCardProps) => {
  const theme = useTheme()

  return (
    <Card
      variant='outlined'
      sx={{
        borderRadius: 2,
        borderColor: theme.palette.divider,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}
    >
      <CardHeader
        avatar={
          <Avatar
            variant='rounded'
            sx={{
              bgcolor: iconBgColor || `${theme.palette.primary.main}18`,
              color: iconColor || theme.palette.primary.main,
              width: 48,
              height: 48
            }}
          >
            <GetChaarvyIcons iconName={iconName} fontSize='1.75rem' />
          </Avatar>
        }
        title={
          <Typography variant='subtitle1' fontWeight={600}>
            {title}
          </Typography>
        }
        subheader={
          subheader ? (
            <Typography variant='caption' color='text.secondary'>
              {subheader}
            </Typography>
          ) : undefined
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Typography variant='body2' color='text.secondary' sx={{ mb: 2.5 }}>
          {description}
        </Typography>

        <Stack spacing={2}>
          {/* Clean Template Option Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' fontWeight={600}>
                  Clean Template
                </Typography>
                <Chip label={cleanChipLabel} size='small' color={cleanButtonColor} variant='outlined' />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {cleanDescription}
              </Typography>
            </Box>

            <LoadingButton
              variant='contained'
              size='small'
              color={cleanButtonColor}
              loading={isCleanLoading}
              onClick={onDownloadClean}
              startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
              sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
            >
              {cleanButtonLabel}
            </LoadingButton>
          </Box>

          {/* Mass Update / Active Data Export Option Box */}
          <Box
            sx={{
              p: 2,
              borderRadius: 1.5,
              border: `1px solid ${theme.palette.divider}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5
            }}
          >
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant='body2' fontWeight={600}>
                  Active Data Export
                </Typography>
                <Chip label={exportChipLabel} size='small' color={exportButtonColor} variant='outlined' />
              </Box>
              <Typography variant='caption' color='text.secondary'>
                {exportDescription}
              </Typography>
            </Box>

            <LoadingButton
              variant='outlined'
              size='small'
              color={exportButtonColor}
              loading={isExportLoading}
              onClick={onDownloadExport}
              startIcon={<GetChaarvyIcons iconName='Download' fontSize='1.25rem' />}
              sx={{ textTransform: 'none', borderRadius: 1.5, px: 2 }}
            >
              {exportButtonLabel}
            </LoadingButton>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  )
}

export default TemplateDownloadCard
