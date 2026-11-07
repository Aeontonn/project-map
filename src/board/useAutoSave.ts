import { useEffect, useState } from 'react'
import { saveEdges, saveNodes } from './storage'
import type { LinkEdge, MapNode } from './types'

// Saves the board to the browser every time something moves, resizes or changes.
// Returns true if the last save failed (storage full), so the app can show a warning
// instead of silently losing changes.
export function useAutoSave(nodes: MapNode[], edges: LinkEdge[]): boolean {
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    // Both are saved every time (not `a && b`), so a failure in one doesn't skip the other
    const nodesOk = saveNodes(nodes)
    const edgesOk = saveEdges(edges)
    // Fine here: we're reporting the result of writing to an outside system (localStorage)
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveFailed(!(nodesOk && edgesOk))
  }, [nodes, edges])
  return saveFailed
}
