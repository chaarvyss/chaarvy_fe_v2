import {
  AppBar,
  Button,
  Container,
  Grid,
  Card,
  CardContent,
  useTheme,
  Toolbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material'
import { Box, Typography } from '@mui/material'

// Icons from mdi-material-ui
import BusClock from 'mdi-material-ui/BusClock'
import CheckCircle from 'mdi-material-ui/CheckCircle'
import CloseCircleOutline from 'mdi-material-ui/CloseCircleOutline'
import FileDocumentOutline from 'mdi-material-ui/FileDocumentOutline'
import Finance from 'mdi-material-ui/Finance'
import MessageTextOutline from 'mdi-material-ui/MessageTextOutline'
import SchoolOutline from 'mdi-material-ui/SchoolOutline'
import ShieldCheckOutline from 'mdi-material-ui/ShieldCheckOutline'
import { useRouter } from 'next/router'
import React, { ReactNode, useState } from 'react'

import BlankLayout from 'src/@core/layouts/BlankLayout'

const features = [
  {
    title: 'Real-Time Communication',
    description:
      'Built-in instant messaging with presence indicators. Connect teachers, parents, and students instantly without relying on scattered WhatsApp groups.',
    details:
      'AcadPro replaces external communication tools. Using a proprietary WebSocket architecture, it allows staff to send broadcast messages to entire classrooms, while parents can securely direct-message teachers without sharing personal phone numbers. Read receipts, online presence, and message edits are fully supported.',
    icon: <MessageTextOutline sx={{ fontSize: 40 }} />
  },
  {
    title: 'Automated Workflows',
    description:
      'Stop wasting hours on paperwork. Our dynamic engine generates custom report cards, fee receipts, and ID cards in seconds.',
    details:
      'Our visual JSON-to-PDF Template Designer lets your administrative staff design gorgeous certificates, ID cards, and report cards with drag-and-drop ease. Once designed, the system can bulk-generate thousands of PDFs in a matter of seconds, fully populated with real-time student data.',
    icon: <FileDocumentOutline sx={{ fontSize: 40 }} />
  },
  {
    title: 'Live Transport Tracking',
    description:
      'Give parents ultimate peace of mind with real-time GPS bus tracking, route mapping, and automated arrival alerts directly on their devices.',
    details:
      'The Transport Module completely digitizes the commute. Drivers use a simplified interface to broadcast their GPS location. Parents receive automated push notifications when the bus is approaching their stop, significantly reducing wait times and anxious phone calls to the front desk.',
    icon: <BusClock sx={{ fontSize: 40 }} />
  },
  {
    title: 'Seamless Financial Control',
    description:
      'Automate invoicing, track pending dues, and accept online payments easily. Keep your cash flow healthy with zero manual errors.',
    details:
      'Stop chasing pending fees manually. AcadPro allows you to set up complex fee structures (installments, bus fees, library fines) and automatically triggers reminders to parents. Integration with online payment gateways means funds settle directly into the school’s account.',
    icon: <Finance sx={{ fontSize: 40 }} />
  },
  {
    title: 'Hybrid Learning (LMS)',
    description:
      'Host secure live video classes and on-demand recorded lectures. Ensure students never miss a lesson, regardless of physical location.',
    details:
      'AcadPro is built for modern hybrid education. Teachers can instantly spin up secure live video classrooms directly from their portal. Recorded lectures are adaptive-streamed to students, meaning they can learn flawlessly even on slower internet connections without buffering issues.',
    icon: <SchoolOutline sx={{ fontSize: 40 }} />
  },
  {
    title: 'Enterprise-Grade Security',
    description:
      'True multi-tenant data isolation and granular role-based access control. Ensure that staff, students, and parents only see what they should.',
    details:
      'Security is at the heart of AcadPro. We utilize strict Multi-Tenant DB isolation (via SQLAlchemy schemas) so data never bleeds between institutions. Granular Role-Based Access Control (RBAC) allows administrators to fine-tune exactly what each teacher, accountant, and parent is allowed to see and modify.',
    icon: <ShieldCheckOutline sx={{ fontSize: 40 }} />
  }
]

const AcadPro = () => {
  const router = useRouter()
  const theme = useTheme()

  // States
  const [selectedFeature, setSelectedFeature] = useState<any>(null)
  const [demoOpen, setDemoOpen] = useState(false)

  // Form States
  const [demoForm, setDemoForm] = useState({ name: '', contact: '', mode: 'phone', schoolName: '' })

  const handleBookDemoSubmit = () => {
    // TODO: Connect this to the FastAPI Backend endpoint to alert the Master/Sales Team
    console.log('Submitting Demo Request:', demoForm)
    alert('Thank you! Our team has been alerted and will contact you shortly.')
    setDemoOpen(false)
  }

  const isDemoFormValid = demoForm.name.trim() !== '' && demoForm.schoolName.trim() !== '' && demoForm.contact.trim() !== '';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation */}
      <AppBar position='sticky' elevation={0} sx={{ backgroundColor: 'white', borderBottom: '1px solid #e2e8f0' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box display='flex' alignItems='center' gap={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: theme.palette.primary.main,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'white',
                fontWeight: 'bold',
                fontSize: 20
              }}
            >
              A
            </Box>
            <Typography variant='h5' sx={{ fontWeight: 800, color: '#1e293b', letterSpacing: '-0.5px' }}>
              AcadPro
            </Typography>
          </Box>
          <Box display='flex' gap={2}>
            <Button
              variant='outlined'
              color='primary'
              onClick={() => router.push('/login')}
              sx={{ borderRadius: 8, px: 3 }}
            >
              Login
            </Button>
            <Button
              variant='contained'
              color='primary'
              onClick={() => setDemoOpen(true)}
              sx={{ borderRadius: 8, px: 3, boxShadow: 'none' }}
            >
              Book Demo
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box 
        sx={{ 
          pt: { xs: 8, md: 15 }, 
          pb: { xs: 8, md: 12 }, 
          px: 3, 
          textAlign: 'center',
          backgroundImage: 'url("/images/hero_bg.jpg")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(248, 250, 252, 0.65)',
            backdropFilter: 'blur(3px)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth='md' sx={{ position: 'relative', zIndex: 2 }}>
          <Typography
            variant='h2'
            sx={{
              fontWeight: 900,
              color: '#0f172a',
              mb: 3,
              letterSpacing: '-1px',
              fontSize: { xs: '2.5rem', md: '4rem' },
              lineHeight: 1.1
            }}
          >
            Run your entire campus <br />
            <Box component='span' sx={{ color: theme.palette.primary.main }}>
              without the chaos.
            </Box>
          </Typography>
          <Typography variant='h6' sx={{ color: '#64748b', mb: 6, fontWeight: 400, lineHeight: 1.6 }}>
            AcadPro is the next-generation Educational ERP that unifies Admissions, Live Classes, Finance, Real-time
            Chat, and Transportation into one blazingly fast platform.
          </Typography>
          <Button
            variant='contained'
            size='large'
            onClick={() => setDemoOpen(true)}
            sx={{
              borderRadius: 8,
              px: 5,
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 10px 25px -5px rgba(25, 118, 210, 0.4)'
            }}
          >
            Schedule a Demo Today
          </Button>
        </Container>
      </Box>

      {/* Features Section (Clickable) */}
      <Box sx={{ py: 10, backgroundColor: 'white' }}>
        <Container maxWidth='lg'>
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography variant='h3' sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              Everything you need. Nothing you don't.
            </Typography>
            <Typography variant='subtitle1' sx={{ color: '#64748b' }}>
              Click on any feature below to discover how it transforms your daily operations.
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card
                  onClick={() => setSelectedFeature(feature)}
                  elevation={0}
                  sx={{
                    height: '100%',
                    cursor: 'pointer',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: 4,
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-5px)',
                      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.05)',
                      borderColor: theme.palette.primary.main
                    }
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Box sx={{ mb: 2, color: theme.palette.primary.main }}>{feature.icon}</Box>
                    <Typography variant='h6' sx={{ fontWeight: 700, color: '#1e293b', mb: 1.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant='body2' sx={{ color: '#64748b', lineHeight: 1.6 }}>
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Advantages / Comparison Section */}
      <Box sx={{ py: 10, backgroundColor: '#f1f5f9' }}>
        <Container maxWidth='md'>
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant='h3' sx={{ fontWeight: 800, color: '#0f172a', mb: 2 }}>
              AcadPro vs Legacy ERPs
            </Typography>
            <Typography variant='subtitle1' sx={{ color: '#64748b' }}>
              Why the fastest growing institutions are switching to us.
            </Typography>
          </Box>
          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0' }}>
            <Table>
              <TableHead sx={{ backgroundColor: '#e2e8f0' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Capability</TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: theme.palette.primary.main }}>
                    AcadPro
                  </TableCell>
                  <TableCell sx={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#64748b' }}>
                    Legacy Systems
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[
                  {
                    name: 'UI / UX Speed',
                    our: 'Instant (Next.js SPA)',
                    ourIcon: true,
                    their: 'Slow, multi-page reloads',
                    theirIcon: false
                  },
                  {
                    name: 'Internal Communication',
                    our: 'Real-Time WebSockets',
                    ourIcon: true,
                    their: 'Basic Email / Slow SMS',
                    theirIcon: false
                  },
                  {
                    name: 'Document Generation',
                    our: 'Visual JSON-to-PDF Builder',
                    ourIcon: true,
                    their: 'Hardcoded by developers',
                    theirIcon: false
                  },
                  {
                    name: 'Academic Hierarchy',
                    our: 'Infinite (Stream > Segment)',
                    ourIcon: true,
                    their: 'Rigid (Standard/Section only)',
                    theirIcon: false
                  },
                  {
                    name: 'Data Architecture',
                    our: 'True Multi-Tenant Isolation',
                    ourIcon: true,
                    their: 'Shared Tables (High Risk)',
                    theirIcon: false
                  }
                ].map((row, i) => (
                  <TableRow key={i} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{row.name}</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: '#1e293b' }}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <CheckCircle sx={{ color: theme.palette.success.main, fontSize: 18 }} /> {row.our}
                      </Box>
                    </TableCell>
                    <TableCell sx={{ color: '#64748b' }}>
                      <Box display='flex' alignItems='center' gap={1}>
                        <CloseCircleOutline sx={{ color: theme.palette.error.main, fontSize: 18 }} /> {row.their}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Container>
      </Box>

      {/* Pricing Value Section */}
      <Box sx={{ py: 10, backgroundColor: 'white', textAlign: 'center' }}>
        <Container maxWidth='md'>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box
              sx={{
                backgroundColor: '#e0f2fe',
                color: '#0369a1',
                px: 2,
                py: 1,
                borderRadius: 2,
                fontWeight: 'bold',
                mb: 3
              }}
            >
              Advanced Tech. Accessible Pricing.
            </Box>
            <Typography variant='h3' sx={{ fontWeight: 800, color: '#0f172a', mb: 3 }}>
              Superior performance doesn't have to break the bank.
            </Typography>
            <Typography variant='h6' sx={{ color: '#64748b', mb: 2, lineHeight: 1.6, maxWidth: 700 }}>
              We aren't cheaper because we cut corners. AcadPro is vastly more cost-effective because our modern
              technology stack (Next.js, FastAPI, WebSockets) eliminates the massive server overhead and manual
              maintenance costs that legacy systems are forced to pass onto you.
            </Typography>
            <Typography variant='h6' sx={{ color: '#64748b', mb: 4, lineHeight: 1.6, maxWidth: 700 }}>
              Start with our incredibly lightweight base subscription, or upgrade to our <b>Enterprise Tier</b> for
              dedicated SLA support, white-labeling, and isolated database instances.
            </Typography>
            <Button
              variant='contained'
              size='large'
              onClick={() => setDemoOpen(true)}
              sx={{ borderRadius: 8, px: 5, py: 1.5, fontWeight: 'bold' }}
            >
              Get Your Custom Quote
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 6, backgroundColor: '#0f172a', color: '#94a3b8', textAlign: 'center' }}>
        <Typography variant='body2'>&copy; 2026 Chaarvy Software Solutions. All rights reserved.</Typography>
      </Box>

      {/* Feature Details Modal */}
      <Dialog 
        open={!!selectedFeature} 
        onClose={() => setSelectedFeature(null)} 
        maxWidth='sm' 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }
        }}
      >
        {selectedFeature && (
          <>
            <Box 
              sx={{ 
                background: `linear-gradient(135deg, ${theme.palette.primary.main}15 0%, ${theme.palette.primary.main}05 100%)`,
                px: 4, py: 3, borderBottom: '1px solid #e2e8f0' 
              }}
            >
              <Box display='flex' alignItems='center' gap={2.5}>
                <Box 
                  sx={{ 
                    color: theme.palette.primary.main, 
                    backgroundColor: 'white',
                    p: 1.5,
                    borderRadius: 3,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {selectedFeature.icon}
                </Box>
                <Typography variant='h5' sx={{ fontWeight: 800, color: '#0f172a' }}>
                  {selectedFeature.title}
                </Typography>
              </Box>
            </Box>
            <DialogContent sx={{ p: 4 }}>
              <Typography variant='body1' sx={{ color: '#1e293b', mb: 3, fontWeight: 600, fontSize: '1.1rem', lineHeight: 1.6 }}>
                {selectedFeature.description}
              </Typography>
              <Box sx={{ width: 40, height: 4, backgroundColor: theme.palette.primary.main, mb: 3, borderRadius: 2 }} />
              <Typography variant='body2' sx={{ color: '#475569', lineHeight: 1.8, fontSize: '0.95rem' }}>
                {selectedFeature.details}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 4, pt: 0, gap: 1 }}>
              <Button onClick={() => setSelectedFeature(null)} color="inherit" sx={{ borderRadius: 8, px: 3, fontWeight: 'bold' }}>
                Close
              </Button>
              <Button
                onClick={() => {
                  setSelectedFeature(null)
                  setDemoOpen(true)
                }}
                variant='contained'
                color='primary'
                sx={{ borderRadius: 8, px: 4, py: 1, fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(25, 118, 210, 0.3)' }}
              >
                See it in Action
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Book Demo Modal */}
      <Dialog open={demoOpen} onClose={() => setDemoOpen(false)} maxWidth='sm' fullWidth>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1.5rem', pb: 1 }}>Book a Live Demo</DialogTitle>
        <DialogContent>
          <Typography variant='body2' sx={{ color: '#64748b', mb: 3 }}>
            Fill out the form below and our product experts will contact you to schedule a personalized walkthrough of
            AcadPro.
          </Typography>
          <Box display='flex' flexDirection='column' gap={3} mt={1}>
            <TextField
              label='Your Name'
              fullWidth
              required
              value={demoForm.name}
              onChange={e => setDemoForm({ ...demoForm, name: e.target.value })}
            />
            <TextField
              label='Institution / School Name'
              fullWidth
              required
              value={demoForm.schoolName}
              onChange={e => setDemoForm({ ...demoForm, schoolName: e.target.value })}
            />
            <TextField
              label='Contact (Email or Phone)'
              fullWidth
              required
              value={demoForm.contact}
              onChange={e => setDemoForm({ ...demoForm, contact: e.target.value })}
            />
            <TextField
              select
              label='Preferred Mode of Communication'
              fullWidth
              required
              value={demoForm.mode}
              onChange={e => setDemoForm({ ...demoForm, mode: e.target.value })}
            >
              <MenuItem value='phone'>Phone Call</MenuItem>
              <MenuItem value='whatsapp'>WhatsApp</MenuItem>
              <MenuItem value='email'>Email</MenuItem>
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button onClick={() => setDemoOpen(false)} color='inherit' sx={{ borderRadius: 8 }}>
            Cancel
          </Button>
          <Button onClick={handleBookDemoSubmit} variant='contained' sx={{ borderRadius: 8, px: 4 }} disabled={!isDemoFormValid}>
            Submit Inquiry
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

AcadPro.getLayout = (page: ReactNode) => <BlankLayout>{page}</BlankLayout>

export default AcadPro
