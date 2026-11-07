import { useState } from 'react'
import { Handle, NodeResizer, Position, useReactFlow, type NodeProps } from '@xyflow/react'
import type { ProjectNode } from '../board/types'
import { formatLastTouched } from './github'
import { firstImage, shrinkImage } from './images'

// One project on the board. NodeResizer adds the drag handles for resizing.
export default function ProjectCard({ id, data, selected }: NodeProps<ProjectNode>) {
  const { updateNodeData } = useReactFlow()
  const [dropping, setDropping] = useState(false) // true while a file is dragged over the card

  // Drop an image file from your computer onto the card to use it as the picture
  async function onDrop(e: React.DragEvent) {
    e.preventDefault() // stop the browser from opening the file itself
    setDropping(false)
    const file = firstImage(e.dataTransfer.files)
    if (file) updateNodeData(id, { image: await shrinkImage(file) })
  }

  return (
    <>
      {/* The four connection dots. They sit outside .card because .card cuts off
          anything poking over its edge (overflow: hidden). All four are "source"
          dots; connectionMode="loose" in App lets a line end on any of them too. */}
      {[Position.Top, Position.Right, Position.Bottom, Position.Left].map((p) => (
        <Handle key={p} id={p} type="source" position={p} />
      ))}
      <div
        className={dropping ? 'card dropping' : 'card'}
        style={{ borderColor: selected || dropping ? data.color : undefined }}
        // preventDefault on dragover is what tells the browser "you may drop here"
        onDragOver={(e) => { e.preventDefault(); setDropping(true) }}
        // dragleave also fires when moving onto the card's own title or picture,
        // so only clear the highlight when the pointer really left the card
        onDragLeave={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) setDropping(false)
        }}
        onDrop={onDrop}
      >
        <NodeResizer
          isVisible={selected}
          minWidth={160}
          minHeight={120}
          color={data.color}
          handleStyle={{ width: 10, height: 10, borderRadius: 3 }}
        />

        <div className="card-thumb" style={{ background: data.color + '22' }}>
          {dropping ? (
            <span className="drop-hint" style={{ color: data.color }}>Drop image</span>
          ) : data.image ? (
            <img src={data.image} alt="" draggable={false} />
          ) : (
            <span style={{ color: data.color }}>{data.name.slice(0, 1).toUpperCase()}</span>
          )}
        </div>

        <div className="card-body">
          <div className="card-title">{data.name}</div>
          <span className={`status status-${data.status.toLowerCase()}`}>{data.status}</span>
          {data.github?.pushedAt && (
            <div className="card-meta">
              {data.github.language && <span>{data.github.language} · </span>}
              last touched {formatLastTouched(data.github.pushedAt)}
            </div>
          )}
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
    </>
  )
}
