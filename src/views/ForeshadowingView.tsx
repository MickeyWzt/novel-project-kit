import { useState } from 'react'

const tabs = [['all', '全部'], ['open', '未回收'], ['developing', '发展中'], ['resolved', '已回收']] as const

export function ForeshadowingView({ project }: { project: any }) {
  const [filter, setFilter] = useState<(typeof tabs)[number][0]>('all')
  const items = project.foreshadowings.filter((item: any) => filter === 'all' || item.status === filter)
  return <div className="document-view"><header className="view-heading"><h2>伏笔</h2><p>追踪埋设、推进与回收，不让旧线索从长篇中消失。</p></header><div className="text-tabs" role="tablist">{tabs.map(([id, label]) => <button role="tab" aria-selected={filter === id} key={id} onClick={() => setFilter(id)}>{label}</button>)}</div><div className="ledger"><div className="ledger-head"><span>伏笔</span><span>状态</span><span>埋设</span><span>最近推进</span></div>{items.map((item: any) => <article key={item.id} className="ledger-row"><div><strong>{item.title}</strong><p>{item.description}</p></div><span className={`status-text status-${item.status}`}>{statusLabel(item.status)}</span><span>第 {item.plantedChapter} 章</span><span>第 {item.lastAdvancedChapter} 章</span></article>)}</div></div>
}

function statusLabel(status: string) {
  return ({ open: '未回收', developing: '发展中', resolved: '已回收', abandoned: '已放弃' } as Record<string, string>)[status] ?? status
}
