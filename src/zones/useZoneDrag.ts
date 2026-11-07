import { useRef, type Dispatch, type SetStateAction } from 'react'
import type { OnNodeDrag, XYPosition } from '@xyflow/react'
import { cardsInZone } from './zones'
import type { MapNode } from '../board/types'

// Moving a zone moves the cards inside it. When the drag starts we note which
// cards are inside and where they were; while dragging, each one is shifted by
// the same distance the zone has moved so far.
// Returns the three drag handlers to hand to <ReactFlow>.
export function useZoneDrag(nodes: MapNode[], setNodes: Dispatch<SetStateAction<MapNode[]>>) {
  const drag = useRef<{ start: XYPosition; members: { id: string; position: XYPosition }[] } | null>(null)

  // OnNodeDrag is React Flow's type for these handlers (works for mouse and touch)
  const onNodeDragStart: OnNodeDrag<MapNode> = (_, node) => {
    if (node.type !== 'zone') return
    const members = cardsInZone(node, nodes)
      .filter((n) => !n.selected) // selected cards are already moved by React Flow itself
      .map((n) => ({ id: n.id, position: n.position }))
    drag.current = { start: node.position, members }
  }

  const onNodeDrag: OnNodeDrag<MapNode> = (_, node) => {
    const d = drag.current
    if (!d || node.type !== 'zone') return
    const dx = node.position.x - d.start.x
    const dy = node.position.y - d.start.y
    setNodes((ns) => ns.map((n) => {
      const m = d.members.find((m) => m.id === n.id)
      return m ? { ...n, position: { x: m.position.x + dx, y: m.position.y + dy } } : n
    }))
  }

  const onNodeDragStop = () => { drag.current = null }

  return { onNodeDragStart, onNodeDrag, onNodeDragStop }
}
