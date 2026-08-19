import ReactMarkdown from 'react-markdown'
import { LockKeyhole } from 'lucide-react'

export function WorldView({ project }: { project: any }) {
  return <div className="document-view"><header className="view-heading"><h2>世界观</h2><p>地点、规则与 Story Bible 共同构成当前世界的官方事实。</p></header><div className="world-layout"><section><h3 className="subheading">地点</h3>{project.locations.map((location: any) => <article className="world-row" key={location.id}><div><strong>{location.name}</strong><span>{location.type}</span></div><p>{location.summary}</p>{location.locked && <LockKeyhole size={15} />}</article>)}</section><section><h3 className="subheading">世界规则</h3>{project.rules.map((rule: any) => <article className="world-row" key={rule.id}><div><strong>{rule.title}</strong></div><p>{rule.description}</p>{rule.locked && <LockKeyhole size={15} />}</article>)}</section><article className="bible-panel"><ReactMarkdown>{project.bible}</ReactMarkdown></article></div></div>
}
