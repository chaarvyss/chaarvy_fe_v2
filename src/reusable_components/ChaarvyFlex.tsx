interface ChaarvyFlexProps {
  children: React.ReactNode
  flexDirection?: 'row' | 'column'
  justifyContent?: 'start' | 'center' | 'end' | 'space-between' | 'space-around'
  alignItems?: 'start' | 'center' | 'end' | 'stretch'
  marginTop?: number
  marginBottom?: number
  padding?: number
  gap?: string
}

const ChaarvyFlex = ({
  children,
  flexDirection = 'row',
  justifyContent = 'start',
  alignItems = 'stretch',
  marginTop = 0,
  marginBottom = 0,
  padding = 0,
  gap = '8px'
}: ChaarvyFlexProps) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection,
        justifyContent,
        alignItems,
        marginTop,
        marginBottom,
        padding,
        gap
      }}
    >
      {children}
    </div>
  )
}

export default ChaarvyFlex
