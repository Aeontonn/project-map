import { useRef, useState } from 'react'
import { COLORS, STATUSES, type ProjectData } from '../board/types'
import { fetchRepo, parseRepo } from './github'
import { firstImage, shrinkImage } from './images'

type Props = {
  initial?: ProjectData
  onSave: (data: ProjectData) => void
  onDelete?: () => void
  onClose: () => void
}

const empty: ProjectData = { name: '', image: '', status: 'Idea', color: COLORS[0], links: [] }

// Popup form for adding or editing a project
export default function ProjectDialog({ initial, onSave, onDelete, onClose }: Props) {
  const [data, setData] = useState<ProjectData>(initial ?? empty)
  const [error, setError] = useState('')
  const [repoInput, setRepoInput] = useState(initial?.github?.repo ?? '')
  const [repoStatus, setRepoStatus] = useState<{ loading?: boolean; error?: string }>({})

  const fileInput = useRef<HTMLInputElement>(null) // the hidden "choose file" input

  const set = <K extends keyof ProjectData>(key: K, value: ProjectData[K]) =>
    setData((d) => ({ ...d, [key]: value }))

  // Shared by the upload button and Ctrl+V: shrink the image and put it on the card
  async function applyImageFile(file: File | null) {
    if (file) set('image', await shrinkImage(file))
  }

  // Ctrl+V anywhere in the form: if the clipboard holds an image (e.g. from
  // Win+Shift+S), use it. Pasting normal text into a box still works as usual.
  function onPaste(e: React.ClipboardEvent) {
    const file = firstImage(e.clipboardData.files)
    if (!file) return
    e.preventDefault()
    applyImageFile(file)
  }

  const uploaded = data.image.startsWith('data:') // an uploaded image, not a web link

  const setLink = (i: number, field: 'label' | 'url', value: string) =>
    set('links', data.links.map((l, j) => (j === i ? { ...l, [field]: value } : l)))

  async function fillFromGitHub() {
    const repo = parseRepo(repoInput)
    if (!repo) return setRepoStatus({ error: 'Use a link like https://github.com/owner/repo' })
    setRepoStatus({ loading: true })
    try {
      const info = await fetchRepo(repo)
      const url = `https://github.com/${info.repo}`
      setRepoInput(info.repo)
      setData((d) => ({
        ...d,
        github: info,
        name: d.name.trim() ? d.name : info.repo.split('/')[1], // your own name wins
        links: d.links.some((l) => l.url.includes('github.com'))
          ? d.links
          : [{ label: 'GitHub', url }, ...d.links],
      }))
      setError('')
      setRepoStatus({})
    } catch (err) {
      setRepoStatus({ error: (err as Error).message })
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!data.name.trim()) return setError('Give the project a name')
    // Empty repo box = unlink from GitHub. A repo typed but not fetched yet is kept
    // with blank info, and the refresh on next app load fills it in.
    const repo = parseRepo(repoInput)
    const github = !repo
      ? undefined
      : data.github?.repo === repo
        ? data.github
        : { repo, description: '', language: '', pushedAt: '' }
    // Drop empty link rows before saving
    onSave({ ...data, github, links: data.links.filter((l) => l.url.trim()) })
  }

  return (
    <div className="overlay" onMouseDown={onClose}>
      <form className="dialog" onSubmit={submit} onPaste={onPaste} onMouseDown={(e) => e.stopPropagation()}>
        <h2>{initial ? 'Edit project' : 'New project'}</h2>

        <label>GitHub repo (optional)</label>
        <div className="repo-row">
          <input
            value={repoInput}
            onChange={(e) => { setRepoInput(e.target.value); setRepoStatus({}) }}
            // Enter here fetches instead of submitting the whole form
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fillFromGitHub() } }}
            placeholder="https://github.com/owner/repo"
          />
          <button type="button" onClick={fillFromGitHub} disabled={repoStatus.loading || !repoInput.trim()}>
            {repoStatus.loading ? 'Loading…' : 'Fill from GitHub'}
          </button>
        </div>
        {repoStatus.error && <div className="error">{repoStatus.error}</div>}
        {data.github?.description && <div className="repo-desc">{data.github.description}</div>}

        <label>Name</label>
        <input
          autoFocus
          value={data.name}
          onChange={(e) => { set('name', e.target.value); setError('') }}
          placeholder="Street Photo Scorer"
        />
        {error && <div className="error">{error}</div>}

        <label>Image (optional): upload, paste with Ctrl+V, or a link</label>
        <div className="repo-row">
          {uploaded ? (
            // Don't show the huge data-URL text, show the picture instead
            <img className="image-preview" src={data.image} alt="" />
          ) : (
            <input value={data.image} onChange={(e) => set('image', e.target.value)} placeholder="https://..." />
          )}
          <button type="button" onClick={() => fileInput.current?.click()}>Upload…</button>
          {data.image && <button type="button" onClick={() => set('image', '')}>Remove</button>}
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => { applyImageFile(firstImage(e.target.files)); e.target.value = '' }}
          />
        </div>

        <label>Status</label>
        <select value={data.status} onChange={(e) => set('status', e.target.value as ProjectData['status'])}>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>

        <label>Color</label>
        <div className="colors">
          {COLORS.map((c) => (
            <button
              type="button"
              key={c}
              className={c === data.color ? 'swatch active' : 'swatch'}
              style={{ background: c }}
              onClick={() => set('color', c)}
              aria-label={c}
            />
          ))}
        </div>

        <label>Links</label>
        {data.links.map((l, i) => (
          <div className="link-row" key={i}>
            <input value={l.label} onChange={(e) => setLink(i, 'label', e.target.value)} placeholder="GitHub" />
            <input value={l.url} onChange={(e) => setLink(i, 'url', e.target.value)} placeholder="https://github.com/..." />
            <button type="button" onClick={() => set('links', data.links.filter((_, j) => j !== i))}>✕</button>
          </div>
        ))}
        <button type="button" onClick={() => set('links', [...data.links, { label: '', url: '' }])}>
          + Add link
        </button>

        <div className="dialog-actions">
          {onDelete && <button type="button" className="danger" onClick={onDelete}>Delete</button>}
          <span style={{ flex: 1 }} />
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary">Save</button>
        </div>
      </form>
    </div>
  )
}
