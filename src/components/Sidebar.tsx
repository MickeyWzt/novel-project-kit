import { BookOpenText, Bookmark, Clock3, GitBranch, Globe2, House, Users } from 'lucide-react'

export const navigation = [
  { id: 'overview', label: '总览', icon: House },
  { id: 'chapters', label: '章节', icon: BookOpenText },
  { id: 'characters', label: '人物', icon: Users },
  { id: 'arcs', label: '故事弧', icon: GitBranch },
  { id: 'timeline', label: '时间线', icon: Clock3 },
  { id: 'foreshadowing', label: '伏笔', icon: Bookmark },
  { id: 'world', label: '世界观', icon: Globe2 },
] as const

export type ViewId = typeof navigation[number]['id']

interface Props {
  selected: ViewId
  onSelect: (id: ViewId) => void
}

export function Sidebar({ selected, onSelect }: Props) {
  return (
    <aside className="sidebar">
      <button className="wordmark" onClick={() => onSelect('overview')} aria-label="回到总览">章法</button>
      <nav aria-label="小说项目导航">
        {navigation.map(({ id, label, icon: Icon }) => (
          <button key={id} className={selected === id ? 'nav-item is-active' : 'nav-item'} onClick={() => onSelect(id)} aria-current={selected === id ? 'page' : undefined}>
            <Icon size={24} strokeWidth={1.6} />
            <span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-note">
        <span className="margin-mark" />
        Novel Project<br />Format v1
      </div>
    </aside>
  )
}
