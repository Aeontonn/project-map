import { BaseEdge, getStraightPath, useInternalNode, type EdgeProps, type InternalNode } from '@xyflow/react'
import type { LinkEdge } from '../board/types'

// Middle point and size of a card on the board
function box(n: InternalNode) {
  const { x, y } = n.internals.positionAbsolute
  const w = n.measured.width ?? 0
  const h = n.measured.height ?? 0
  return { x: x + w / 2, y: y + h / 2, w, h }
}

// Where a straight line from a's middle towards b's middle leaves a's border.
// We walk from the middle in b's direction and stop at whichever edge we hit first
// (left/right or top/bottom), so the line always touches the card's outline.
function borderPoint(a: InternalNode, b: InternalNode) {
  const ca = box(a)
  const cb = box(b)
  const dx = cb.x - ca.x
  const dy = cb.y - ca.y
  if (dx === 0 && dy === 0) return ca
  const scale = Math.min(ca.w / 2 / Math.abs(dx), ca.h / 2 / Math.abs(dy))
  return { x: ca.x + dx * scale, y: ca.y + dy * scale }
}

// A "floating" line between two cards: it isn't stuck to the dot you dragged from,
// it always takes the shortest way between the two cards, even after you move them.
export default function LinkLine({ source, target, data, selected }: EdgeProps<LinkEdge>) {
  const s = useInternalNode(source)
  const t = useInternalNode(target)
  if (!s || !t) return null // a card is missing (e.g. not drawn yet)

  const a = borderPoint(s, t)
  const b = borderPoint(t, s)
  const [path, labelX, labelY] = getStraightPath({ sourceX: a.x, sourceY: a.y, targetX: b.x, targetY: b.y })

  return (
    <BaseEdge
      path={path}
      interactionWidth={24} // how wide the clickable area around the thin line is
      style={{ stroke: selected ? '#2c2c2a' : '#b4b2a9', strokeWidth: 2 }}
      label={data?.label || undefined}
      labelX={labelX}
      labelY={labelY}
      labelStyle={{ fontSize: 13, fill: '#5f5e5a' }}
      labelBgStyle={{ fill: '#f7f6f2' }}
      labelBgPadding={[6, 3]}
      labelBgBorderRadius={4}
    />
  )
}
