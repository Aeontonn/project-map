import { useCallback, type Dispatch, type SetStateAction } from 'react'
import type { Connection, OnConnectEnd } from '@xyflow/react'
import type { LinkEdge } from '../board/types'

// Drawing lines between cards. Returns the two handlers to hand to <ReactFlow>.
export function useConnect(setEdges: Dispatch<SetStateAction<LinkEdge[]>>) {
  // Add a line between two cards, unless it would join a card to itself or
  // the two are already connected (in either direction, since lines have no arrow)
  const connect = useCallback((source: string, target: string) => {
    if (source === target) return
    setEdges((es) => {
      const exists = es.some((e) =>
        (e.source === source && e.target === target) || (e.source === target && e.target === source))
      return exists ? es : [...es, { id: crypto.randomUUID(), type: 'link', source, target, data: { label: '' } }]
    })
  }, [setEdges])

  // Dropped exactly on another card's dot: React Flow calls this
  const onConnect = (c: Connection) => connect(c.source, c.target)

  // Dropped anywhere else: if the pointer is over a card, connect to that card.
  // This is what lets you drop on the middle of a card instead of hitting a tiny dot.
  const onConnectEnd: OnConnectEnd = (event, state) => {
    if (state.isValid || !state.fromNode) return // onConnect already handled it
    const point = 'changedTouches' in event ? event.changedTouches[0] : event
    const card = document.elementFromPoint(point.clientX, point.clientY)?.closest('.react-flow__node-project')
    const id = card?.getAttribute('data-id')
    if (id) connect(state.fromNode.id, id)
  }

  return { onConnect, onConnectEnd }
}
