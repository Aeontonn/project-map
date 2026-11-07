import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, Panel, ConnectionMode,
  type Connection, type OnConnectEnd, type OnNodeDrag, type XYPosition,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ProjectCard from '../projects/ProjectCard'
import ProjectDialog from '../projects/ProjectDialog'
import ZoneCard from '../zones/ZoneCard'
import ZoneDialog from '../zones/ZoneDialog'
import LinkLine from '../lines/LinkLine'
import LinkDialog from '../lines/LinkDialog'
import QuickJump from './QuickJump'
import { loadEdges, loadNodes, makeZone, saveEdges, saveNodes } from './storage'
import { fetchRepo } from '../projects/github'
import { cardsInZone } from '../zones/zones'
import type { LinkEdge, MapNode, ProjectData, ProjectNode, ZoneData, ZoneNode } from './types'

// Tells React Flow which component draws each node "type"
const nodeTypes = { project: ProjectCard, zone: ZoneCard }
// ...and which component draws each line ("edge") type
const edgeTypes = { link: LinkLine }

// Load the saved board ONCE when the app starts. Writing useNodesState(loadNodes())
// would call loadNodes() again on every re-render (React just ignores the result),
// and loadNodes has a side effect: it adds the starter zones the first time.
const initialNodes = loadNodes()
// Lines whose card no longer exists are dropped, so we never draw a line to nothing
const nodeIds = new Set(initialNodes.map((n) => n.id))
const initialEdges = loadEdges().filter((e) => nodeIds.has(e.source) && nodeIds.has(e.target))

function Board() {
  const [nodes, setNodes, onNodesChange] = useNodesState<MapNode>(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState<LinkEdge>(initialEdges)
  const [editingLink, setEditingLink] = useState<LinkEdge | null>(null)
  const [editing, setEditing] = useState<ProjectNode | 'new' | null>(null)
  const [editingZone, setEditingZone] = useState<ZoneNode | 'new' | null>(null)
  const [jumpOpen, setJumpOpen] = useState(false)
  const { fitView, screenToFlowPosition } = useReactFlow()

  // Save to the browser every time something moves, resizes or changes.
  // If storage is full, show a warning instead of silently losing changes.
  const [saveFailed, setSaveFailed] = useState(false)
  useEffect(() => {
    // Both are saved every time (not `a && b`), so a failure in one doesn't skip the other
    const nodesOk = saveNodes(nodes)
    const edgesOk = saveEdges(edges)
    // Fine here: we're reporting the result of writing to an outside system (localStorage)
    // oxlint-disable-next-line react/set-state-in-effect
    setSaveFailed(!(nodesOk && edgesOk))
  }, [nodes, edges])

  // Once per app load, re-fetch GitHub info for every linked card so "last touched"
  // stays current. The ref stops React's dev mode from running this twice.
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

  // If you miss a card when dropping an image, the browser would normally open the
  // file and replace the whole app. Cancelling these two events everywhere stops that.
  useEffect(() => {
    const block = (e: DragEvent) => e.preventDefault()
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  // Ctrl+K (or Cmd+K on Mac) opens the jump box.
  // Delete/Backspace removes a selected LINE. Cards are never deleted by a key
  // (only from their dialog), so a stray key press can't wipe out a project.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setJumpOpen(true)
      }
      const typing = (e.target as HTMLElement).closest('input, textarea')
      if ((e.key === 'Delete' || e.key === 'Backspace') && !typing) {
        setEdges((es) => es.filter((edge) => !edge.selected))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [setEdges])

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

  function saveLink(label: string) {
    if (editingLink) {
      setEdges((es) => es.map((e) => (e.id === editingLink.id ? { ...e, data: { label } } : e)))
    }
    setEditingLink(null)
  }

  function deleteLink() {
    if (editingLink) setEdges((es) => es.filter((e) => e.id !== editingLink.id))
    setEditingLink(null)
  }

  // Fly the camera to one project and select it
  const jumpTo = useCallback((id: string) => {
    setJumpOpen(false)
    setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })))
    fitView({ nodes: [{ id }], duration: 600, padding: 0.6, maxZoom: 1.5 })
  }, [fitView, setNodes])

  // Moving a zone moves the cards inside it. When the drag starts we note which
  // cards are inside and where they were; while dragging, each one is shifted by
  // the same distance the zone has moved so far.
  const zoneDrag = useRef<{ start: XYPosition; members: { id: string; position: XYPosition }[] } | null>(null)

  // OnNodeDrag is React Flow's type for these handlers (works for mouse and touch)
  const onNodeDragStart: OnNodeDrag<MapNode> = (_, node) => {
    if (node.type !== 'zone') return
    const members = cardsInZone(node, nodes)
      .filter((n) => !n.selected) // selected cards are already moved by React Flow itself
      .map((n) => ({ id: n.id, position: n.position }))
    zoneDrag.current = { start: node.position, members }
  }

  const onNodeDrag: OnNodeDrag<MapNode> = (_, node) => {
    const drag = zoneDrag.current
    if (!drag || node.type !== 'zone') return
    const dx = node.position.x - drag.start.x
    const dy = node.position.y - drag.start.y
    setNodes((ns) => ns.map((n) => {
      const m = drag.members.find((m) => m.id === n.id)
      return m ? { ...n, position: { x: m.position.x + dx, y: m.position.y + dy } } : n
    }))
  }

  // Middle of what you're currently looking at, in board coordinates
  const viewCenter = () => screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

  function saveZone(data: ZoneData) {
    if (editingZone === 'new') {
      const c = viewCenter()
      // Zones go at the START of the list so they're drawn first, underneath the cards
      setNodes((ns) => [makeZone(data.name, data.color, c.x - 260, c.y - 180), ...ns])
    } else if (editingZone) {
      setNodes((ns) => ns.map((n) => (n.id === editingZone.id && n.type === 'zone' ? { ...n, data } : n)))
    }
    setEditingZone(null)
  }

  function deleteZone() {
    // Only the zone is removed; its cards stay where they are
    if (editingZone && editingZone !== 'new') setNodes((ns) => ns.filter((n) => n.id !== editingZone.id))
    setEditingZone(null)
  }

  function saveProject(data: ProjectData) {
    if (editing === 'new') {
      // Put the new card in the middle of what you're currently looking at
      const center = viewCenter()
      const node: ProjectNode = {
        id: crypto.randomUUID(),
        type: 'project',
        position: { x: center.x - 110, y: center.y - 90 },
        style: { width: 220, height: 180 },
        data,
      }
      setNodes((ns) => [...ns, node])
    } else if (editing) {
      setNodes((ns) => ns.map((n) => (n.id === editing.id && n.type === 'project' ? { ...n, data } : n)))
    }
    setEditing(null)
  }

  function deleteProject() {
    if (editing && editing !== 'new') {
      const id = editing.id
      setNodes((ns) => ns.filter((n) => n.id !== id))
      setEdges((es) => es.filter((e) => e.source !== id && e.target !== id)) // its lines go too
    }
    setEditing(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        edges={edges}
        edgeTypes={edgeTypes}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectEnd={onConnectEnd}
        connectionMode={ConnectionMode.Loose}
        connectionLineStyle={{ stroke: '#888780', strokeWidth: 2, strokeDasharray: '6 4' }}
        onEdgeDoubleClick={(_, edge) => setEditingLink(edge)}
        onNodeDoubleClick={(_, node) => (node.type === 'zone' ? setEditingZone(node) : setEditing(node))}
        onNodeDragStart={onNodeDragStart}
        onNodeDrag={onNodeDrag}
        onNodeDragStop={() => { zoneDrag.current = null }}
        fitView
        minZoom={0.1}
        maxZoom={3}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
        <Controls />
        {/* Zones are shown faint on the minimap so the cards stand out */}
        <MiniMap pannable zoomable nodeColor={(n) => {
          const node = n as MapNode
          return node.type === 'zone' ? node.data.color + '40' : node.data.color
        }} />
        <Panel position="top-left" className="toolbar">
          <strong>Project Map</strong>
          <button className="primary" onClick={() => setEditing('new')}>+ New project</button>
          <button onClick={() => setEditingZone('new')}>+ Zone</button>
          <button onClick={() => setJumpOpen(true)}>Jump to… <kbd>Ctrl K</kbd></button>
          <button onClick={() => fitView({ duration: 500 })}>Show all</button>
        </Panel>
        {saveFailed && (
          <Panel position="top-center" className="warning">
            Browser storage is full, so your latest changes are NOT saved. Remove some uploaded images to free up space.
          </Panel>
        )}
        <Panel position="bottom-center" className="hint">
          Drag cards anywhere · double-click to edit · drag a card's edge dot onto another card to connect · double-click a line to label it
        </Panel>
      </ReactFlow>

      {editing && (
        <ProjectDialog
          initial={editing === 'new' ? undefined : editing.data}
          onSave={saveProject}
          onDelete={editing === 'new' ? undefined : deleteProject}
          onClose={() => setEditing(null)}
        />
      )}
      {editingZone && (
        <ZoneDialog
          initial={editingZone === 'new' ? undefined : editingZone.data}
          onSave={saveZone}
          onDelete={editingZone === 'new' ? undefined : deleteZone}
          onClose={() => setEditingZone(null)}
        />
      )}
      {editingLink && (
        <LinkDialog
          initial={editingLink.data?.label ?? ''}
          onSave={saveLink}
          onDelete={deleteLink}
          onClose={() => setEditingLink(null)}
        />
      )}
      {jumpOpen && <QuickJump nodes={nodes} onPick={jumpTo} onClose={() => setJumpOpen(false)} />}
    </div>
  )
}

// useReactFlow only works inside a ReactFlowProvider, so we wrap the board
export default function App() {
  return (
    <ReactFlowProvider>
      <Board />
    </ReactFlowProvider>
  )
}
