import React, { useState, useEffect, useRef } from 'react'
import Map, { Marker, NavigationControl, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'

// 1. Types & Interfaces
interface VehicleData {
  route: number[][]
  stops: {
    id: number
    lng: number
    lat: number
    time: string
  }[]
}

interface TransportMapProps {
  vehicleIds: string[]
  fleetData: {
    [key: string]: VehicleData
  }
}

interface LiveVehicle {
  id: string
  lat: number
  lng: number
  heading: number
}

const MultiVehicleTracker = ({ vehicleIds, fleetData }: TransportMapProps) => {
  // 2. State Management
  const [vehicles, setVehicles] = useState<{ [key: string]: LiveVehicle }>({})
  const [lastSeen, setLastSeen] = useState<{ [key: string]: number }>({})
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline'>('offline')

  const socket = useRef<WebSocket | null>(null)

  useEffect(() => {
    let reconnectTimer: NodeJS.Timeout
    let lockReconnect = false
    let retryCount = 0

    const connect = () => {
      if (lockReconnect) return
      lockReconnect = true

      console.log(`Connecting to WS (Attempt ${retryCount + 1})...`)

      const socketUrl = `${process.env.NEXT_PUBLIC_WS_URL}/fleet?ids=${vehicleIds.join(',')}`
      socket.current = new WebSocket(socketUrl)

      socket.current.onopen = () => {
        setConnectionStatus('online')
        retryCount = 0
        lockReconnect = false
      }

      socket.current.onmessage = event => {
        const update = JSON.parse(event.data)
        setVehicles(prev => ({ ...prev, [update.id]: update }))
        setLastSeen(prev => ({ ...prev, [update.id]: Date.now() }))
      }

      socket.current.onclose = () => {
        setConnectionStatus('offline')
        lockReconnect = false

        const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)
        console.log(`Connection lost. Retrying in ${delay / 1000}s...`)

        reconnectTimer = setTimeout(() => {
          retryCount++
          connect()
        }, delay)
      }

      socket.current.onerror = () => {
        socket.current?.close() // Force close to trigger the onclose retry logic
      }
    }

    connect()

    return () => {
      socket.current?.close()
      clearTimeout(reconnectTimer)
    }
  }, [vehicleIds])

  return (
    <div style={{ position: 'relative', width: '100%', height: '600px', borderRadius: '12px', overflow: 'hidden' }}>
      <div
        style={{
          position: 'absolute',
          top: 15,
          left: 15,
          zIndex: 10,
          background: 'white',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <div
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: connectionStatus === 'online' ? '#22c55e' : '#ef4444'
          }}
        />
        {connectionStatus === 'online' ? 'SERVER LIVE' : 'CONNECTING...'}
      </div>

      <Map
        initialViewState={{ longitude: 83.2185, latitude: 17.6868, zoom: 12 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle='https://tiles.openfreemap.org/styles/liberty'
      >
        <NavigationControl position='top-right' />

        {vehicleIds.map(id => {
          const busInfo = fleetData[id]
          if (!busInfo) return null

          return (
            <React.Fragment key={`fleet-group-${id}`}>
              <Source
                id={`route-${id}`}
                type='geojson'
                data={{
                  type: 'Feature',
                  properties: {},
                  geometry: { type: 'LineString', coordinates: busInfo.route }
                }}
              >
                <Layer
                  id={`layer-${id}`}
                  type='line'
                  paint={{
                    'line-color': id === 'V101' ? '#2563eb' : '#db2777',
                    'line-width': 5,
                    'line-opacity': 0.4
                  }}
                />
              </Source>

              {busInfo.stops.map(stop => (
                <Marker key={`stop-${stop.id}`} longitude={stop.lng} latitude={stop.lat}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ background: 'white', padding: '2px 4px', borderRadius: '4px', fontSize: '9px' }}>
                      {stop.time}
                    </div>
                    <span>📍</span>
                  </div>
                </Marker>
              ))}
            </React.Fragment>
          )
        })}

        {/* --- LIVE MOVING VEHICLES --- */}
        {Object.values(vehicles).map(v => {
          // Check if we haven't heard from this bus in 30 seconds
          const isDisconnected = !lastSeen[v.id] || Date.now() - lastSeen[v.id] > 30000

          return (
            <Marker key={`live-${v.id}`} longitude={v.lng} latitude={v.lat} anchor='center'>
              <div
                style={{
                  textAlign: 'center',
                  opacity: isDisconnected ? 0.5 : 1,
                  transition: 'all 5000ms linear' // SMOOTH MOVEMENT
                }}
              >
                <div
                  style={{
                    background: isDisconnected ? '#666' : '#22c55e',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    marginBottom: '2px',

                    // This keeps label upright while bus rotates
                    transform: `rotate(-${v.heading || 0}deg)`
                  }}
                >
                  {v.id} {isDisconnected ? 'OFFLINE' : 'LIVE'}
                </div>
                <div style={{ transform: `rotate(${v.heading || 0}deg)`, fontSize: '32px' }}>🚌</div>
              </div>
            </Marker>
          )
        })}
      </Map>
    </div>
  )
}

export default MultiVehicleTracker
