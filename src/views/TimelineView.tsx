export function TimelineView({ project }: { project: any }) {
  return <div className="document-view timeline-view"><header className="view-heading"><h2>时间线</h2><p>{project.timeline.length} 个按故事顺序记录的事件</p></header><div className="timeline-list">
    {[...project.timeline].reverse().map((event: any) => <article key={event.id} className="timeline-event"><div className="timeline-dot" /><div className="timeline-date">{event.storyDate}<span>第 {event.chapter} 章</span></div><div><h3>{event.title}</h3><p>{event.summary}</p><small>{event.characters.map((id: string) => project.characters.find((item: any) => item.id === id)?.name ?? id).join(' · ')}</small></div></article>)}
  </div></div>
}
