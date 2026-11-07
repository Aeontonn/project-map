import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { ZoneNode } from './types'

// A labelled area on the board. It's drawn underneath the project cards
// (see ZONE_Z), and cards whose middle is inside it move along when it's dragged.
export default function ZoneCard({ data, selected }: NodeProps<ZoneNode>) {
  return (
    <div
      className="zone"
      style={{
        background: data.color + '12', // last two hex digits = transparency (12 ≈ 7%)
        borderColor: data.color + (selected ? 'ff' : '66'),
      }}
    >
      <NodeResizer
        isVisible={selected}
        minWidth={240}
        minHeight={160}
        color={data.color}
        handleStyle={{ width: 12, height: 12, borderRadius: 3 }}
      />
      <div className="zone-label" style={{ color: data.color }}>{data.name}</div>
    </div>
  )
}
