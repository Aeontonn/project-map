import type { MapNode, ZoneNode } from '../board/types'

// Width and height of a node on the board. React Flow fills in `measured` once it
// has drawn the node; before that we fall back to the size we gave it.
function size(n: MapNode) {
  return {
    w: n.measured?.width ?? Number(n.width ?? n.style?.width ?? 0),
    h: n.measured?.height ?? Number(n.height ?? n.style?.height ?? 0),
  }
}

// The project cards that count as "in" a zone: the ones whose MIDDLE point is
// inside the zone's rectangle. Using the middle means a card hanging halfway
// over the edge belongs to whichever side most of it is on.
export function cardsInZone(zone: ZoneNode, nodes: MapNode[]): MapNode[] {
  const z = size(zone)
  return nodes.filter((n) => {
    if (n.type !== 'project') return false
    const { w, h } = size(n)
    const cx = n.position.x + w / 2
    const cy = n.position.y + h / 2
    return (
      cx >= zone.position.x && cx <= zone.position.x + z.w &&
      cy >= zone.position.y && cy <= zone.position.y + z.h
    )
  })
}
