import { useState } from 'react'

function Tab({ file, active, onSelect, onRename, onDelete, canDelete }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(file.name)

  function commit() {
    setEditing(false)
    const name = draft.trim()
    if (name && name !== file.name) onRename(file.id, name)
    else setDraft(file.name)
  }

  return (
    <div
      className={`tab${active ? ' tab-active' : ''}`}
      onClick={() => onSelect(file.id)}
      onDoubleClick={() => {
        setDraft(file.name)
        setEditing(true)
      }}
      title={`${file.name} — double-click to rename`}
    >
      {editing ? (
        <input
          className="tab-rename"
          value={draft}
          autoFocus
          onChange={(e) => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') {
              setDraft(file.name)
              setEditing(false)
            }
          }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <span className="tab-name">
          {file.name}
          {file.gistId && <span className="tab-gist-dot" title="Saved to gist" />}
        </span>
      )}
      {canDelete && (
        <button
          className="tab-close"
          title="Close file"
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm(`Delete "${file.name}"? This cannot be undone.`)) {
              onDelete(file.id)
            }
          }}
        >
          ×
        </button>
      )}
    </div>
  )
}

export default function TabBar({ files, activeId, onSelect, onCreate, onRename, onDelete }) {
  return (
    <nav className="tabbar">
      {files.map((f) => (
        <Tab
          key={f.id}
          file={f}
          active={f.id === activeId}
          canDelete={files.length > 1}
          onSelect={onSelect}
          onRename={onRename}
          onDelete={onDelete}
        />
      ))}
      <button className="tab-add" title="New file" onClick={onCreate}>
        +
      </button>
    </nav>
  )
}
