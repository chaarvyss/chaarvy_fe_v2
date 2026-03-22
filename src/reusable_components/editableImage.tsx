import React from 'react'

type EditableImageProps = {
  src: string
  width: number
  height: number
  onUpload: (file: File) => void
}

const EditableImage: React.FC<EditableImageProps> = ({ src, width, height, onUpload }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null)
  const [hovered, setHovered] = React.useState(false)

  return (
    <div
      style={{
        position: 'relative',
        width,
        height
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={src}
        alt='Placed'
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          display: 'block'
        }}
      />

      {hovered && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span
            onClick={() => fileInputRef.current?.click()}
            style={{
              fontSize: '24px',
              color: '#fff',
              cursor: 'pointer'
            }}
            title='Upload image'
          >
            📷
          </span>
        </div>
      )}

      <input
        ref={fileInputRef}
        type='file'
        accept='image/*'
        style={{ display: 'none' }}
        onChange={e => {
          const file = e.target.files?.[0]
          if (file) {
            onUpload(file)
          }
        }}
      />
    </div>
  )
}

export default EditableImage
