import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { parseNovelProject } from '../core/project.js'
import { validateNovelProject } from '../core/validator.js'
import { AppShell } from './components/AppShell'
import type { ViewId } from './components/Sidebar'
import { readDrop, readFileList } from './lib/browser-files'
import { loadDemoFiles } from './lib/demo'
import { ArcsView } from './views/ArcsView'
import { ChaptersView } from './views/ChaptersView'
import { CharactersView } from './views/CharactersView'
import { ForeshadowingView } from './views/ForeshadowingView'
import { OverviewView } from './views/OverviewView'
import { TimelineView } from './views/TimelineView'
import { WorldView } from './views/WorldView'

const views: Record<ViewId, React.ComponentType<{ project: any }>> = {
  overview: OverviewView,
  chapters: ChaptersView,
  characters: CharactersView,
  arcs: ArcsView,
  timeline: TimelineView,
  foreshadowing: ForeshadowingView,
  world: WorldView,
}

export default function App() {
  const [project, setProject] = useState<any>(null)
  const [issues, setIssues] = useState<any[]>([])
  const [selected, setSelected] = useState<ViewId>('overview')
  const [loading, setLoading] = useState(true)
  const [dragging, setDragging] = useState(false)
  const [source, setSource] = useState('内置示例')
  const [showIssues, setShowIssues] = useState(false)
  const [fatal, setFatal] = useState('')

  const acceptFiles = useCallback((files: Record<string, string>, nextSource: string) => {
    const parsed = parseNovelProject(files)
    const nextIssues = validateNovelProject(parsed)
    setProject({ ...parsed, __sourceKind: nextSource === '内置示例' ? 'demo' : 'local' })
    setIssues(nextIssues)
    setSource(nextSource)
    setSelected('overview')
    setShowIssues(nextIssues.length > 0)
    setFatal('')
  }, [])

  useEffect(() => {
    loadDemoFiles().then((files) => acceptFiles(files, '内置示例')).catch((error) => setFatal(error.message)).finally(() => setLoading(false))
  }, [acceptFiles])

  const onFileList = async (files: FileList) => {
    setLoading(true)
    try { acceptFiles(await readFileList(files), '本地文件夹') }
    catch (error) { setFatal(error instanceof Error ? error.message : '项目读取失败') }
    finally { setLoading(false) }
  }

  const onDrop = async (event: React.DragEvent) => {
    event.preventDefault()
    setDragging(false)
    setLoading(true)
    try { acceptFiles(await readDrop(event.nativeEvent), '拖入的本地项目') }
    catch (error) { setFatal(error instanceof Error ? error.message : '项目读取失败') }
    finally { setLoading(false) }
  }

  if (loading || !project) return <div className="loading-screen"><div className="loading-mark">章法</div><p>{fatal || '正在整理小说档案…'}</p>{fatal && <button onClick={() => location.reload()}><RotateCcw size={17} />重新加载</button>}</div>

  const CurrentView = views[selected]
  const errors = issues.filter((issue) => issue.severity === 'error')
  const warnings = issues.filter((issue) => issue.severity === 'warning')
  return (
    <div className={dragging ? 'drop-root is-dragging' : 'drop-root'} onDragOver={(event) => { event.preventDefault(); setDragging(true) }} onDragLeave={(event) => { if (event.currentTarget === event.target) setDragging(false) }} onDrop={onDrop}>
      <AppShell project={project} selected={selected} onSelect={setSelected} onFiles={onFileList} status={<>
        <button className="validation-button" onClick={() => setShowIssues((value) => !value)}>{errors.length ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />} {errors.length ? `${errors.length} 个格式错误` : '格式有效'}{warnings.length ? ` · ${warnings.length} 个警告` : ''}</button>
        <span>{source} · 数据未离开此浏览器</span>
      </>}>
        <CurrentView project={project} />
      </AppShell>
      {showIssues && <aside className="issue-drawer"><header><h2>项目诊断</h2><button onClick={() => setShowIssues(false)}>关闭</button></header>{issues.length === 0 ? <p>没有发现格式问题。</p> : issues.map((issue, index) => <article key={`${issue.path}-${issue.code}-${index}`}><strong>{issue.severity === 'error' ? '错误' : '警告'} · {issue.code}</strong><code>{issue.path}</code><p>{issue.message}</p></article>)}</aside>}
      {dragging && <div className="drop-overlay"><strong>把小说项目放在这里</strong><span>文件只在浏览器中读取</span></div>}
    </div>
  )
}
