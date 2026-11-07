import { useCallback, useState } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useEdgesState, useReactFlow, Panel, ConnectionMode,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ProjectCard from '../projects/ProjectCard'
import ProjectDialog from '../projects/ProjectDialog'
import ZoneCard from '../zones/ZoneCard'
import ZoneDialog from '../zones/ZoneDialog'
import LinkLine from '../lines/LinkLine'
import LinkDialog from '../lines/LinkDialog'
import QuickJump from './QuickJump'
import { loadEdges, loadNodes, makeZone } from './storage'
import { useAutoSave } from './useAutoSave'
import { useBlockFileDrop, useShortcuts } from './useWindowEvents'
import { useGitHubRefresh } from '../projects/useGitHubRefresh'
import { useZoneDrag } from '../zones/useZoneDrag'
import { useConnect } from '../lines/useConnect'
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
  const { fitView, screenToFlowPosition } = useReactFlow()

  // Which popup is open. 'new' = adding one, a node/edge = editing that one.
  const [editing, setEditing] = useState<ProjectNode | 'new' | null>(null)
  const [editingZone, setEditingZone] = useState<ZoneNode | 'new' | null>(null)
  const [editingLink, setEditingLink] = useState<LinkEdge | null>(null)
  const [jumpOpen, setJumpOpen] = useState(false)

  // Each of these hooks does one job; see their files for how
  const saveFailed = useAutoSave(nodes, edges)
  useGitHubRefresh(nodes, setNodes)
  useBlockFileDrop()
  const zoneDrag = useZoneDrag(nodes, setNodes)
  const { onConnect, onConnectEnd } = useConnect(setEdges)
  useShortcuts({
    onJump: useCallback(() => setJumpOpen(true), []),
    onDeleteLines: useCallback(() => setEdges((es) => es.filter((e) => !e.selected)), [setEdges]),
  })

  // Fly the camera to one project and select it
  const jumpTo = useCallback((id: string) => {
    setJumpOpen(false)
    setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })))
    fitView({ nodes: [{ id }], duration: 600, padding: 0.6, maxZoom: 1.5 })
  }, [fitView, setNodes])

  // Middle of what you're currently looking at, in board coordinates
  const viewCenter = () => screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })

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

  function saveLink(label: string) {
    if (editingLink) setEdges((es) => es.map((e) => (e.id === editingLink.id ? { ...e, data: { label } } : e)))
    setEditingLink(null)
  }

  function deleteLink() {
    if (editingLink) setEdges((es) => es.filter((e) => e.id !== editingLink.id))
    setEditingLink(null)
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
        {...zoneDrag}
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
