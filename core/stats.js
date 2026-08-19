export function calculateProjectStats(project) {
  const chapterCount = project.chapters.length
  const targetChapters = project.metadata?.target?.chapters || Math.max(chapterCount, 1)
  const currentChapter = project.current?.chapter ?? chapterCount
  const foreshadowings = project.foreshadowings ?? []
  const open = foreshadowings.filter((item) => item.status === 'open')
  const developing = foreshadowings.filter((item) => item.status === 'developing')
  const resolved = foreshadowings.filter((item) => item.status === 'resolved')
  const unresolved = [...open, ...developing]
  const longest = unresolved.reduce((max, item) => {
    const last = item.lastAdvancedChapter ?? item.plantedChapter ?? currentChapter
    return Math.max(max, currentChapter - last)
  }, 0)

  return {
    chapterCount,
    wordCount: project.metadata?.current?.wordCount ?? project.summaries.reduce((sum, item) => sum + (item.wordCount ?? 0), 0),
    activeArcs: project.arcs.filter((item) => item.status === 'active').length,
    activePlots: project.softPlots.filter((item) => item.status === 'active').length,
    openForeshadowings: open.length,
    developingForeshadowings: developing.length,
    resolvedForeshadowings: resolved.length,
    longestUnadvancedForeshadowing: longest,
    progress: Math.min(100, Math.round((currentChapter / targetChapters) * 100)),
  }
}
