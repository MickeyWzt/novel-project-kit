import { LockKeyhole } from 'lucide-react'

export function ArcsView({ project }: { project: any }) {
  return <div className="document-view"><header className="view-heading"><h2>故事弧</h2><p>主干方向保持稳定，中间路径允许动态演化。</p></header><div className="large-list">
    {project.arcs.map((arc: any) => <article className="large-row" key={arc.id}>
      <div className="row-number">{String(Math.round(arc.progress)).padStart(2, '0')}</div>
      <div className="row-main"><div className="row-title"><h3>{arc.title}</h3>{arc.locked && <LockKeyhole size={16} aria-label="已锁定" />}</div><p>{arc.summary}</p><div className="wide-rail"><i style={{ width: `${arc.progress}%` }} /></div></div>
      <div className="row-meta"><strong>{arc.progress}%</strong><span>{arc.status}</span><small>上次推进：第 {arc.lastAdvancedChapter} 章</small></div>
    </article>)}
  </div></div>
}
