import { NodeResizer, type NodeProps } from '@xyflow/react'
import type { ProjectNode } from './types'

// One project on the board. NodeResizer adds the drag handles for resizing.
export default function ProjectCard({ data, selected }: NodeProps<ProjectNode>) {
  return (
    <div className="card" style={{ borderColor: selected ? data.color : undefined }}>
      <NodeResizer
        isVisible={selected}
        minWidth={160}
        minHeight={120}
        color={data.color}
        handleStyle={{ width: 10, height: 10, borderRadius: 3 }}
      />

      <div className="card-thumb" style={{ background: data.color + '22' }}>
        {data.image ? (
          <img src={data.image} alt="" draggable={false} />
        ) : (
          <span style={{ color: data.color }}>{data.name.slice(0, 1).toUpperCase()}</span>
        )}
      </div>

      <div className="card-body">
        <div className="card-title">{data.name}</div>
        <span className={`status status-${data.status.toLowerCase()}`}>{data.status}</span>
        {data.links.length > 0 && (
          // "nodrag" tells React Flow that clicking here should NOT start dragging
          <div className="card-links nodrag">
            {data.links.map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer">
                {l.label} ↗
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
