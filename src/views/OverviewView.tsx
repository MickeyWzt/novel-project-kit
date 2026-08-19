import { calculateProjectStats } from '../../core/stats.js'
import { countTextUnits } from '../../core/format.js'

function SectionTitle({ children }: { children: string }) {
  return <h2 className="section-title"><span />{children}</h2>
}

export function OverviewView({ project }: { project: any }) {
  const stats = calculateProjectStats(project)
  const currentChapter = project.current.chapter ?? project.chapters.length
  const recent = [...project.summaries].sort((a, b) => b.chapter - a.chapter)[0]
  const recentChapter = project.chapters.find((chapter: any) => chapter.number === recent?.chapter)
  const displayedWordCount = project.__sourceKind === 'demo'
    ? project.chapters.reduce((sum: number, chapter: any) => sum + countTextUnits(chapter.content), 0)
    : stats.wordCount
  const recentWordCount = project.__sourceKind === 'demo' && recentChapter
    ? countTextUnits(recentChapter.content)
    : (recent?.wordCount ?? 0)
  const activeArcs = project.arcs.filter((arc: any) => arc.status === 'active').slice(0, 3)
  const featuredCharacters = [...project.characters]
    .sort((left: any, right: any) => roleRank(left.role) - roleRank(right.role))
    .slice(0, 3)

  return (
    <div className="overview">
      <div className="metric-strip" aria-label="小说统计">
        <div><strong>{stats.chapterCount}</strong><span>章</span></div>
        <div><strong>{displayedWordCount.toLocaleString('zh-CN')}</strong><span>{project.__sourceKind === 'demo' ? '字（节选）' : '字'}</span></div>
        <div><strong>{stats.activeArcs}</strong><span>条活跃故事弧</span></div>
        <div><strong>{stats.openForeshadowings}</strong><span>个未回收伏笔</span></div>
      </div>
      <div className="overview-grid">
        <section className="progress-section">
          <SectionTitle>故事进度</SectionTitle>
          <div className="phase-labels">
            <span><b>第一幕</b><em>已完成</em></span>
            <span><b>第二幕</b><em className="accent-text">进行中</em></span>
            <span><b>第三幕</b><em>未开始</em></span>
          </div>
          <div className="story-rail" style={{ '--progress': `${stats.progress}%` } as React.CSSProperties}>
            <span className="rail-start">✓</span><span className="rail-current" /><span className="rail-end" />
          </div>
          <div className="progress-number" style={{ left: `${stats.progress}%` }}>{stats.progress}%</div>
        </section>

        <section className="recent-section">
          <SectionTitle>最近写作</SectionTitle>
          <p className="chapter-kicker">第 {recent?.chapter ?? currentChapter} 章</p>
          <h3>{recent?.title ?? '尚无章节'}</h3>
          <p className="word-count">{recentWordCount.toLocaleString('zh-CN')} 字{project.__sourceKind === 'demo' ? ' · 演示节选' : ''}</p>
          <p className="recent-summary">{recent?.summary ?? '打开项目后，最近一章的摘要会显示在这里。'}</p>
        </section>

        <section className="arc-section">
          <SectionTitle>活跃故事弧</SectionTitle>
          <div className="arc-rows">
            {activeArcs.map((arc: any) => (
              <div className="arc-row" key={arc.id}>
                <span className="arc-name">{arc.title}</span>
                <span className="mini-rail"><i style={{ width: `${arc.progress}%` }} /></span>
                <strong>{arc.progress}%</strong><em>· {arc.progress > 60 ? '转折' : arc.progress > 30 ? '发展中' : '初期'}</em>
              </div>
            ))}
          </div>
        </section>

        <section className="character-section">
          <SectionTitle>人物近况</SectionTitle>
          <div className="character-rows">
            {featuredCharacters.map((character: any) => (
              <div className="character-row" key={character.id}>
                <strong>{character.name}</strong><span>{roleLabel(character.role)}</span><p>{character.status?.emotion}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="foreshadow-section">
          <SectionTitle>伏笔状态</SectionTitle>
          <dl>
            <div><dt>未回收</dt><dd>{stats.openForeshadowings}</dd></div>
            <div><dt>发展中</dt><dd>{stats.developingForeshadowings}</dd></div>
            <div><dt>已回收</dt><dd>{stats.resolvedForeshadowings}</dd></div>
          </dl>
          <p>最久未推进：<strong>{stats.longestUnadvancedForeshadowing} 章</strong></p>
        </section>
      </div>
    </div>
  )
}

export function roleLabel(role: string) {
  return ({ protagonist: '主角', deuteragonist: '重要角色', antagonist: '对手', supporting: '配角', minor: '次要人物' } as Record<string, string>)[role] ?? role
}

function roleRank(role: string) {
  return ({ protagonist: 0, deuteragonist: 1, supporting: 2, antagonist: 3, minor: 4 } as Record<string, number>)[role] ?? 9
}
