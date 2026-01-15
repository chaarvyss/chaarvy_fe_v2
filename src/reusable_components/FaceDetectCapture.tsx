import { useEffect, useRef, useState } from 'react'

import { IconButton } from '@muiElements'
import GetChaarvyIcons from 'src/utils/icons'

export default function FaceDetectCapture() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const detectorRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const rafRef = useRef<number>()

  const [isCameraOn, setIsCameraOn] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [zoom, setZoom] = useState(1)

  const waitForFaceDetection = () =>
    new Promise<void>((resolve, reject) => {
      const timeout = Date.now() + 5000

      const check = () => {
        if ((window as any).FaceDetection) resolve()
        else if (Date.now() > timeout) reject('FaceDetection not loaded')
        else requestAnimationFrame(check)
      }

      check()
    })

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false
      })

      streamRef.current = stream
      setIsCameraOn(true)

      await new Promise(requestAnimationFrame)

      const video = videoRef.current!
      video.srcObject = stream
      await video.play()

      // 2️⃣ Wait for MediaPipe
      await waitForFaceDetection()
      const FaceDetection = (window as any).FaceDetection

      const detector = new FaceDetection({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`
      })

      detector.setOptions({
        model: 'short',
        minDetectionConfidence: 0.5
      })

      detector.onResults((results: any) => {
        const detections = results.detections || []
        setFaceCount(detections.length)
      })

      detectorRef.current = detector

      const loop = async () => {
        if (!videoRef.current || !detectorRef.current) return
        await detectorRef.current.send({ image: videoRef.current })
        rafRef.current = requestAnimationFrame(loop)
      }

      loop()
    } catch (err) {
      console.error(err)
      alert('Camera access or face detection failed')
    }
  }

  const stopCamera = () => {
    rafRef.current && cancelAnimationFrame(rafRef.current)

    detectorRef.current?.close()
    detectorRef.current = null

    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null

    setIsCameraOn(false)
    setFaceCount(0)
    setZoom(1)
  }

  useEffect(() => {
    return () => stopCamera()
  }, [])

  const captureImage = () => {
    if (!videoRef.current) return

    const video = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight

    const ctx = canvas.getContext('2d')!
    ctx.drawImage(video, 0, 0)

    const dataUrl = canvas.toDataURL('image/png')
    console.log('Captured image:', dataUrl)
    alert('Image captured (check console)')
  }

  const iconBtn: React.CSSProperties = {
    width: 44,
    height: 44,
    borderRadius: '50%',
    background: 'rgba(0,0,0,0.6)',
    color: '#fff',
    border: 'none',
    fontSize: 18
  }

  return isCameraOn ? (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: '#000',
        zIndex: 9999
      }}
    >
      {/* VIDEO */}
      <video
        ref={videoRef}
        playsInline
        muted
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `scale(${zoom})`,
          transition: 'transform 0.2s ease'
        }}
      />

      {/* FACE BOXES */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none'
        }}
      />

      {/* TOP BAR */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          padding: 12,
          display: 'flex',
          justifyContent: 'space-between',
          color: '#fff',
          background: 'linear-gradient(to bottom, rgba(0,0,0,.6), transparent)'
        }}
      >
        <button onClick={stopCamera} style={iconBtn}>
          ✕
        </button>
        <div>Faces: {faceCount}</div>
      </div>

      {/* BOTTOM BAR */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: 20,
          display: 'flex',
          justifyContent: 'space-around',
          background: 'linear-gradient(to top, rgba(0,0,0,.6), transparent)'
        }}
      >
        <button onClick={() => setZoom(z => Math.max(1, z - 0.2))} style={iconBtn}>
          −
        </button>

        <button
          disabled={faceCount !== 1}
          onClick={captureImage}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            border: '4px solid white',
            background: faceCount === 1 ? 'red' : '#555'
          }}
        />

        <button onClick={() => setZoom(z => Math.min(3, z + 0.2))} style={iconBtn}>
          +
        </button>
      </div>
    </div>
  ) : (
    <IconButton
      size='small'
      aria-label='settings'
      onClick={startCamera}
      className='card-more-options'
      sx={{ color: 'text.secondary' }}
    >
      <GetChaarvyIcons iconName='Camera' color='primary' />
    </IconButton>
  )
}
