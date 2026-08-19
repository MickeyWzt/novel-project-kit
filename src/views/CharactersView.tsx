import { useState } from 'react'
import { LockKeyhole } from 'lucide-react'
import { roleLabel } from './OverviewView'

export function CharactersView({ project }: { project: any }) {
  const [selected, setSelected] = useState(project.characters[0]?.id)
  const character = project.characters.find((item: any) => item.id === selected) ?? project.characters[0]
  if (!character) return <div className="empty-view">项目中还没有人物档案。</div>
  return (
    <div className="split-view">
      <aside className="index-panel">
        <div className="view-heading"><h2>人物</h2><p>{project.characters.length} 份人物档案</p></div>
        {project.characters.map((item: any) => <button key={item.id} className={item.id === character.id ? 'index-row is-selected' : 'index-row'} onClick={() => setSelected(item.id)}>
          <span className="initial">{item.name.slice(0, 1)}</span><div><strong>{item.name}</strong><small>{roleLabel(item.role)} · {project.locations.find((location: any) => location.id === item.status?.location)?.name}</small></div>
        </button>)}
      </aside>
      <article className="detail-panel">
        <header className="detail-header"><div><p>{roleLabel(character.role)}</p><h2>{character.name}</h2></div>{character.canon?.lockedFields?.length > 0 && <span><LockKeyhole size={16} />部分 Canon 已锁定</span>}</header>
        <p className="lead">{character.summary}</p>
        <div className="detail-columns">
          <section><h3>当前状态</h3><dl className="fact-list"><div><dt>位置</dt><dd>{project.locations.find((item: any) => item.id === character.status?.location)?.name ?? character.status?.location}</dd></div><div><dt>身体</dt><dd>{character.status?.condition}</dd></div><div><dt>情绪</dt><dd>{character.status?.emotion}</dd></div></dl></section>
          <section><h3>性格与目标</h3><p>{character.traits?.join('、') || '—'}</p><ul>{character.goals?.map((goal: string) => <li key={goal}>{goal}</li>)}</ul></section>
          <section><h3>已知信息</h3><ul>{character.knowledge?.map((item: string) => <li key={item}>{item}</li>)}</ul></section>
          <section><h3>人物关系</h3>{character.relationships?.map((relation: any) => <div className="relationship" key={relation.characterId}><strong>{project.characters.find((item: any) => item.id === relation.characterId)?.name ?? relation.characterId}</strong><span>{relation.type}</span><p>{relation.note}</p></div>)}</section>
        </div>
      </article>
    </div>
  )
}
