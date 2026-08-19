import { ChevronLeft, ChevronRight, FileText } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { countTextUnits } from '../../core/format.js'

export function ChaptersView({ project }: { project: any }) {
  const chapters = useMemo(
    () => [...project.chapters].sort((left, right) => left.number - right.number),
    [project.chapters],
  )
  const summaries = useMemo(
    () => new Map(project.summaries.map((item: any) => [item.chapter, item])),
    [project.summaries],
  )
  const reader = useRef<HTMLElement>(null)
  const [selected, setSelected] = useState<number | null>(() => chapters[0]?.number ?? null)
  const [scrollProgress, setScrollProgress] = useState(0)

  useEffect(() => {
    setSelected(chapters[0]?.number ?? null)
    setScrollProgress(0)
  }, [project.files, chapters])

  const chapterIndex = Math.max(0, chapters.findIndex((item) => item.number === selected))
  const chapter = chapters[chapterIndex]
  const summary: any = chapter ? summaries.get(chapter.number) : undefined
  const actualWordCount = chapter ? countTextUnits(chapter.content) : 0
  const previous = chapterIndex > 0 ? chapters[chapterIndex - 1] : null
  const next = chapterIndex < chapters.length - 1 ? chapters[chapterIndex + 1] : null

  const selectChapter = (number: number) => {
    setSelected(number)
  }

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const element = reader.current
      if (!element) return
      element.scrollTo({ top: 0 })
      setScrollProgress(element.scrollHeight > element.clientHeight ? 0 : 100)
    })
    return () => cancelAnimationFrame(frame)
  }, [chapter?.number, project.files])

  const updateScrollProgress = () => {
    const element = reader.current
    if (!element) return
    const scrollable = element.scrollHeight - element.clientHeight
    setScrollProgress(scrollable > 0 ? Math.round((element.scrollTop / scrollable) * 100) : 100)
  }

  if (!chapter) return <div className="empty-view">项目中还没有章节正文。请在 chapters/ 中加入 001.md。</div>

  return (
    <div className="split-view chapter-view">
      <aside className="index-panel">
        <div className="view-heading"><h2>章节</h2><p>{chapters.length} 章 · 从第一章开始</p></div>
        {project.__sourceKind === 'demo' && <div className="demo-note"><strong>这是界面演示，不是正式小说</strong><p>原对话没有提供任何章节正文。这里保留的是短节选；打开你的小说项目后，右侧会逐字读取 chapters/*.md。</p></div>}
        <div className="chapter-index">
          {chapters.map((item) => {
            const data: any = summaries.get(item.number)
            const words = countTextUnits(item.content)
            return <button key={item.number} className={chapter.number === item.number ? 'index-row is-selected' : 'index-row'} onClick={() => selectChapter(item.number)}>
              <span>{String(item.number).padStart(3, '0')}</span><div><strong>{data?.title ?? `第 ${item.number} 章`}</strong><small>{words.toLocaleString('zh-CN')} 字{project.__sourceKind === 'demo' ? ' · 节选' : ''}</small></div>
            </button>
          })}
        </div>
      </aside>

      <article className="reading-panel" ref={reader} tabIndex={0} onScroll={updateScrollProgress} aria-label={`第 ${chapter.number} 章正文`}>
        <div className="reader-progress" aria-label={`阅读进度 ${scrollProgress}%`}><i style={{ width: `${scrollProgress}%` }} /></div>
        <header className="reader-toolbar">
          <div><span>第 {chapterIndex + 1} / {chapters.length} 章</span><small><FileText size={13} />{chapter.path} · {actualWordCount.toLocaleString('zh-CN')} 字</small></div>
          <nav aria-label="章节翻页">
            <button disabled={!previous} onClick={() => previous && selectChapter(previous.number)}><ChevronLeft size={17} />上一章</button>
            <button disabled={!next} onClick={() => next && selectChapter(next.number)}>下一章<ChevronRight size={17} /></button>
          </nav>
        </header>
        {project.__sourceKind === 'demo' && <p className="content-source-note">当前显示的是内置短节选，不是 4,000 字正式章节。页面按 <code>{chapter.path}</code> 的实际内容呈现，没有隐藏后文。</p>}
        {summary && <p className="summary-line">本章摘要｜{summary.summary}</p>}
        <div className="reading-page"><ReactMarkdown>{chapter.content}</ReactMarkdown></div>
        <footer className="chapter-footer">
          <button disabled={!previous} onClick={() => previous && selectChapter(previous.number)}><ChevronLeft size={18} />{previous ? `第 ${previous.number} 章` : '已是第一章'}</button>
          <span>本章完</span>
          <button disabled={!next} onClick={() => next && selectChapter(next.number)}>{next ? `第 ${next.number} 章` : '已是最后一章'}<ChevronRight size={18} /></button>
        </footer>
      </article>
    </div>
  )
}
