import { ShieldCheck } from 'lucide-react'
import type { ReactNode } from 'react'
import { ProjectLoader } from './ProjectLoader'
import { Sidebar, type ViewId } from './Sidebar'

interface Props {
  project: any
  selected: ViewId
  onSelect: (id: ViewId) => void
  onFiles: (files: FileList) => void
  children: ReactNode
  status: ReactNode
}

export function AppShell({ project, selected, onSelect, onFiles, children, status }: Props) {
  const metadata = project.metadata ?? {}
  return (
    <div className="app-shell">
      <Sidebar selected={selected} onSelect={onSelect} />
      <section className="workspace">
        <header className="topbar">
          <div className="title-block">
            <h1>{metadata.title || '未命名小说'}{project.__sourceKind === 'demo' && <span className="demo-badge">内置演示</span>}</h1>
            <p>{metadata.subtitle || metadata.genres?.join(' · ') || 'Novel Project'}</p>
          </div>
          <div className="topbar-actions">
            <span className="privacy-note"><ShieldCheck size={19} strokeWidth={1.6} />仅在此浏览器中读取</span>
            <ProjectLoader onFiles={onFiles} />
          </div>
        </header>
        <main className="content">{children}</main>
        <footer className="statusbar">{status}</footer>
      </section>
    </div>
  )
}
