import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow, ReactFlowProvider, Background, Controls, MiniMap,
  useNodesState, useReactFlow, Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import ProjectCard from './ProjectCard'
import ProjectDialog from './ProjectDialog'
import QuickJump from './QuickJump'
import { loadNodes, saveNodes } from './storage'
import { fetchRepo } from './github'
import type { ProjectData, ProjectNode } from './types'

// Tells React Flow: nodes with type "project" are drawn with ProjectCard
const nodeTypes = { project: ProjectCard }

function Board() {
  const [nodes, setNodes, onNodesChange] = useNodesState<ProjectNode>(loadNodes())
  const [editing, setEditing] = useState<ProjectNode | 'new' | null>(null)
  const [jumpOpen, setJumpOpen] = useState(false)
  const { fitView, screenToFlowPosition } = useReactFlow()

  // Save to the browser every time something moves, resizes or changes.
  // If storage is full, show a warning instead of silently losing changes.
  const [saveFailed, setSaveFailed] = useState(false)
  // Fine here: we're reporting the result of writing to an outside system (localStorage)
  // oxlint-disable-next-line react/set-state-in-effect
  useEffect(() => setSaveFailed(!saveNodes(nodes)), [nodes])

  // Once per app load, re-fetch GitHub info for every linked card so "last touched"
  // stays current. The ref stops React's dev mode from running this twice.
  const refreshed = useRef(false)
  useEffect(() => {
    if (refreshed.current) return
    refreshed.current = true
    for (const node of nodes) {
      const repo = node.data.github?.repo
      if (!repo) continue
      fetchRepo(repo)
        .then((github) =>
          setNodes((ns) => ns.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, github } } : n))),
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

  // Ctrl+K (or Cmd+K on Mac) opens the jump box
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setJumpOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Fly the camera to one project and select it
  const jumpTo = useCallback((id: string) => {
    setJumpOpen(false)
    setNodes((ns) => ns.map((n) => ({ ...n, selected: n.id === id })))
    fitView({ nodes: [{ id }], duration: 600, padding: 0.6, maxZoom: 1.5 })
  }, [fitView, setNodes])

  function saveProject(data: ProjectData) {
    if (editing === 'new') {
      // Put the new card in the middle of what you're currently looking at
      const center = screenToFlowPosition({ x: window.innerWidth / 2, y: window.innerHeight / 2 })
      const node: ProjectNode = {
        id: crypto.randomUUID(),
        type: 'project',
        position: { x: center.x - 110, y: center.y - 90 },
        style: { width: 220, height: 180 },
        data,
      }
      setNodes((ns) => [...ns, node])
    } else if (editing) {
      setNodes((ns) => ns.map((n) => (n.id === editing.id ? { ...n, data } : n)))
    }
    setEditing(null)
  }

  function deleteProject() {
    if (editing && editing !== 'new') {
      setNodes((ns) => ns.filter((n) => n.id !== editing.id))
    }
    setEditing(null)
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ReactFlow
        nodes={nodes}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onNodeDoubleClick={(_, node) => setEditing(node)}
        fitView
        minZoom={0.1}
        maxZoom={3}
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} />
        <Controls />
        <MiniMap pannable zoomable nodeColor={(n) => (n.data as ProjectData).color} />
        <Panel position="top-left" className="toolbar">
          <strong>Project Map</strong>
          <button className="primary" onClick={() => setEditing('new')}>+ New project</button>
          <button onClick={() => setJumpOpen(true)}>Jump to… <kbd>Ctrl K</kbd></button>
          <button onClick={() => fitView({ duration: 500 })}>Show all</button>
        </Panel>
        {saveFailed && (
          <Panel position="top-center" className="warning">
            Browser storage is full, so your latest changes are NOT saved. Remove some uploaded images to free up space.
          </Panel>
        )}
        <Panel position="bottom-center" className="hint">
          Drag cards anywhere · click a card to resize it · double-click to edit · drop an image on a card
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
