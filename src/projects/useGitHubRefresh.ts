import { useEffect, useRef, type Dispatch, type SetStateAction } from 'react'
import { fetchRepo } from './github'
import type { MapNode } from '../board/types'

// Once per app load, re-fetch GitHub info for every linked card so "last touched"
// stays current. The ref stops React's dev mode from running this twice.
export function useGitHubRefresh(nodes: MapNode[], setNodes: Dispatch<SetStateAction<MapNode[]>>) {
  const refreshed = useRef(false)
  useEffect(() => {
    if (refreshed.current) return
    refreshed.current = true
    for (const node of nodes) {
      if (node.type !== 'project') continue // zones have no GitHub info
      const repo = node.data.github?.repo
      if (!repo) continue
      fetchRepo(repo)
        .then((github) =>
          setNodes((ns) => ns.map((n) =>
            n.id === node.id && n.type === 'project' ? { ...n, data: { ...n.data, github } } : n,
          )),
        )
        .catch((err) => console.warn(`Could not refresh ${repo}:`, err.message)) // keep old info
    }
  }, [nodes, setNodes])
}
