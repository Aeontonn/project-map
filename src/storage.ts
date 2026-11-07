import { ZONE_Z, type LinkEdge, type MapNode, type ProjectNode, type ZoneNode } from './types'

const KEY = 'project-map:nodes'
const EDGES_KEY = 'project-map:edges'
const ZONES_ADDED_KEY = 'project-map:starter-zones-added'

// Example projects shown the first time you open the app
const starter: ProjectNode[] = [
  {
    id: '1',
    type: 'project',
    position: { x: 0, y: 0 },
    style: { width: 240, height: 200 },
    data: {
      name: 'Project Map',
      image: '',
      status: 'Active',
      color: '#7F77DD',
      links: [{ label: 'GitHub', url: 'https://github.com/Aeontonn' }],
    },
  },
  {
    id: '2',
    type: 'project',
    position: { x: 320, y: 60 },
    style: { width: 200, height: 170 },
    data: {
      name: 'Tradebot',
      image: '',
      status: 'Paused',
      color: '#D85A30',
      links: [],
    },
  },
]

export function makeZone(name: string, color: string, x: number, y: number): ZoneNode {
  return {
    id: crypto.randomUUID(),
    type: 'zone',
    position: { x, y },
    style: { width: 520, height: 360 },
    zIndex: ZONE_Z,
    data: { name, color },
  }
}

// Adds the three starter zones ONCE, in a row below everything already on the
// board. A flag remembers it was done, so deleting them doesn't bring them back.
function withStarterZones(nodes: MapNode[]): MapNode[] {
  if (localStorage.getItem(ZONES_ADDED_KEY)) return nodes
  localStorage.setItem(ZONES_ADDED_KEY, '1')
  const left = Math.min(0, ...nodes.map((n) => n.position.x))
  const bottom = Math.max(0, ...nodes.map((n) => n.position.y + Number(n.height ?? n.style?.height ?? 200)))
  const y = bottom + 120
  const zones = [
    makeZone('Portfolio', '#7F77DD', left, y),
    makeZone('Side income', '#1D9E75', left + 580, y),
    makeZone('School and hobby', '#378ADD', left + 1160, y),
  ]
  return [...zones, ...nodes] // zones first, so they're drawn first (underneath)
}

export function loadNodes(): MapNode[] {
  let nodes: MapNode[]
  try {
    const raw = localStorage.getItem(KEY)
    nodes = raw ? JSON.parse(raw) : starter
  } catch {
    nodes = starter
  }
  try {
    return withStarterZones(nodes)
  } catch {
    return nodes
  }
}

// Writes to localStorage. Returns false if the browser refused (storage full, ~5 MB with images)
function write(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function saveNodes(nodes: MapNode[]): boolean {
  // Only keep what we need, not React Flow's internal stuff like "selected"
  const clean = nodes.map(({ id, type, position, style, width, height, zIndex, data }) => ({
    id, type, position, style, width, height, zIndex, data,
  }))
  return write(KEY, clean)
}

export function loadEdges(): LinkEdge[] {
  try {
    const raw = localStorage.getItem(EDGES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveEdges(edges: LinkEdge[]): boolean {
  return write(EDGES_KEY, edges.map(({ id, type, source, target, data }) => ({ id, type, source, target, data })))
}
