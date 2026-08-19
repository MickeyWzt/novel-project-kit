import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const output = resolve(root, 'examples', 'yesterday-awake')

async function write(path, value) {
  const target = resolve(output, path)
  if (!target.startsWith(output)) throw new Error(`拒绝写出示例目录：${target}`)
  await mkdir(dirname(target), { recursive: true })
  await writeFile(target, typeof value === 'string' ? value : `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

const titles = [
  '另一个清晨', '不属于我的房间', '课桌下的纸条', '父亲的旧相机', '梦里的雨', '图书馆闭馆后', '第二个梦境者', '消失的十二分钟', '陈言的谎言',
  '河堤上的鞋印', '没有寄出的录音', '镜子背面', '陌生人的生日', '学校旧档案', '父亲去过那里', '记忆的盲区', '夜车终点', '被擦掉的名字',
  '两个人的同一个梦', '醒来后的伤口', '窗外的蓝灯', '母亲留下的频率', '无人接听', '倒着生长的树', '第三次敲门', '父亲终于开口', '玻璃里的陌生人'
]

const characters = [
  {
    id: 'lin-xia', name: '林夏', role: 'protagonist', summary: '十七岁的高中生，开始在睡梦中进入另一个人的人生。',
    status: { location: 'lin-home', condition: '轻度失眠', emotion: '焦虑、怀疑自己的记忆' }, traits: ['敏锐', '克制', '不轻易求助'],
    goals: ['找到另一个梦境者', '弄清母亲失踪的真相'], knowledge: ['梦境会留下现实伤痕', '父亲曾研究相同现象'], secrets: ['没有告诉陈言第 27 章看到的脸'],
    relationships: [{ characterId: 'chen-yan', type: '朋友', strength: 0.74, note: '信任开始出现裂缝' }, { characterId: 'lin-father', type: '父女', strength: 0.42, note: '隔阂正在被迫打破' }],
    lastUpdatedChapter: 27, canon: { lockedFields: ['traits'] }
  },
  {
    id: 'chen-yan', name: '陈言', role: 'deuteragonist', summary: '林夏的同学，擅长从档案和设备记录中寻找线索。',
    status: { location: 'school-library', condition: '正常', emotion: '开始隐瞒线索' }, traits: ['理性', '好奇', '保护欲强'], goals: ['证明梦境有现实来源'],
    knowledge: ['学校档案曾被人为修改'], secrets: ['私下复制了母亲录音'],
    relationships: [{ characterId: 'lin-xia', type: '朋友', strength: 0.74, note: '担心真相伤害林夏' }],
    lastUpdatedChapter: 26, canon: { lockedFields: [] }
  },
  {
    id: 'lin-father', name: '林父', role: 'supporting', summary: '林夏的父亲，曾参与一项与共享梦境有关的研究。',
    status: { location: 'lin-home', condition: '旧伤复发', emotion: '知道梦境的存在' }, traits: ['沉默', '谨慎', '负罪感'], goals: ['阻止林夏继续进入梦境'],
    knowledge: ['母亲并非普通失踪', '玻璃后的空间是真实的'], secrets: ['他亲手关闭了最初的实验'],
    relationships: [{ characterId: 'lin-xia', type: '父女', strength: 0.42, note: '决定说出部分真相' }],
    lastUpdatedChapter: 27, canon: { lockedFields: ['secrets'] }
  }
]

const arcs = [
  { id: 'arc-dreamer', title: '寻找另一个梦境者', type: 'mystery', status: 'active', progress: 42, summary: '林夏逐步确认梦中的人生属于一个真实存在的人。', target: '找到并面对另一个梦境者', relatedCharacters: ['lin-xia', 'chen-yan'], lastAdvancedChapter: 27, locked: false },
  { id: 'arc-father', title: '林夏与父亲的关系', type: 'relationship', status: 'active', progress: 68, summary: '沉默多年的父亲开始承认自己知道梦境。', target: '父女共同面对母亲失踪的真相', relatedCharacters: ['lin-xia', 'lin-father'], lastAdvancedChapter: 27, locked: false },
  { id: 'arc-origin', title: '梦境真正来源', type: 'mystery', status: 'active', progress: 24, summary: '线索指向一场被从记录中抹去的实验。', target: '揭开共享梦境的来源与代价', relatedCharacters: ['lin-xia', 'lin-father'], lastAdvancedChapter: 25, locked: true },
  { id: 'arc-growth', title: '林夏的自我信任', type: 'growth', status: 'active', progress: 37, summary: '林夏学习区分自己的记忆与他人的记忆。', target: '在真相面前仍能相信自己的选择', relatedCharacters: ['lin-xia'], lastAdvancedChapter: 26, locked: false }
]

const plots = Array.from({ length: 7 }, (_, index) => ({
  id: `plot-${String(index + 1).padStart(2, '0')}`,
  title: ['校园档案失窃', '陈言的隐瞒', '父亲的旧相机', '母亲留下的录音', '图书管理员的身份', '河堤蓝灯', '现实伤痕'][index],
  status: 'active', purpose: ['提供线索', '改变关系', '揭露过去', '连接母亲', '制造误导', '扩大世界观', '提高代价'][index],
  summary: '与当前主线交织的可调整支线。', relatedCharacters: index === 1 ? ['lin-xia', 'chen-yan'] : ['lin-xia'],
  relatedArcs: index < 2 ? ['arc-dreamer'] : ['arc-origin'], introducedChapter: index + 2, lastAdvancedChapter: 21 + index, locked: false
}))

const foreshadowings = [
  ...Array.from({ length: 12 }, (_, index) => ({
    id: `f-open-${String(index + 1).padStart(2, '0')}`, title: `未回收线索 ${index + 1}`, status: 'open', description: '尚未得到解释的具体细节。',
    plantedChapter: index + 1, relatedCharacters: ['lin-xia'], relatedArcs: ['arc-origin'], lastAdvancedChapter: Math.max(index + 1, 9 + index), locked: false
  })),
  ...Array.from({ length: 7 }, (_, index) => ({
    id: `f-dev-${String(index + 1).padStart(2, '0')}`, title: `发展中线索 ${index + 1}`, status: 'developing', description: '已经出现第二层含义。',
    plantedChapter: index + 3, relatedCharacters: ['lin-xia', 'chen-yan'], relatedArcs: ['arc-dreamer'], lastAdvancedChapter: 20 + index, locked: false
  })),
  ...Array.from({ length: 16 }, (_, index) => ({
    id: `f-resolved-${String(index + 1).padStart(2, '0')}`, title: `已回收线索 ${index + 1}`, status: 'resolved', description: '已在前文中得到解释。',
    plantedChapter: Math.max(1, index), relatedCharacters: ['lin-xia'], relatedArcs: ['arc-dreamer'], lastAdvancedChapter: 10 + index, locked: false
  }))
]

await write('novel.json', {
  formatVersion: '1.0.0', id: 'yesterday-awake', title: '昨日醒来的人', subtitle: '青春 · 悬疑 · 超自然', author: '示例创作者', language: 'zh-CN',
  genres: ['青春', '悬疑', '超自然'], status: 'draft', createdAt: '2026-06-02', updatedAt: '2026-08-19',
  target: { chapters: 64, wordsPerChapter: 4000 }, current: { chapter: 27, wordCount: 108420 },
  cover: { concept: '深夜窗前，玻璃倒影中的面孔比现实中的主角年长。', asset: null, locked: true }
})
await write('story/direction.md', '# 故事方向\n\n林夏通过共享梦境追查母亲失踪的真相。主线允许动态调整，但另一个梦境者真实存在、父亲参与过早期实验、林夏最终必须亲自决定是否关闭梦境通道三点不可改变。\n')
await write('story/bible.md', '# Story Bible\n\n## 核心命题\n\n我们能否相信一段只属于自己的记忆？\n\n## 世界规则\n\n梦境连接会在现实身体留下轻微痕迹；同一时间只能有两名清醒的梦境者；记忆不能凭空创造事实。\n')
await write('story/style.md', '# 文风规范\n\n第三人称有限视角，紧贴林夏。短句与克制的感官描写为主，对话保持留白；悬疑来自信息边界，不靠故意隐去视角人物已知事实。常规章节约 4000 字。\n')
await write('story/arcs.json', { arcs })
for (const character of characters) await write(`characters/${character.id}.json`, character)
await write('world/locations.json', { locations: [
  { id: 'lin-home', name: '林夏家', type: 'home', summary: '带长走廊的旧公寓，父亲的暗房在尽头。', locked: false },
  { id: 'school-library', name: '学校图书馆', type: 'school', summary: '地下旧档案室曾被封闭。', locked: false },
  { id: 'dream-room', name: '梦中房间', type: 'dream', summary: '布局与林夏家相似，但窗外永远是雨夜。', locked: true }
] })
await write('world/rules.json', { rules: [
  { id: 'rule-trace', title: '梦境留痕', description: '梦境中的强烈伤害会在现实留下短暂痕迹。', locked: true },
  { id: 'rule-two', title: '双人上限', description: '同一连接中最多有两名保持自我意识的人。', locked: true },
  { id: 'rule-fact', title: '记忆不造物', description: '梦境只能重组真实发生或被感知过的信息。', locked: true }
] })
await write('plots/soft-plots.json', { plots })
await write('plots/foreshadowing.json', { foreshadowings })

const events = []
for (let chapter = 1; chapter <= 27; chapter += 1) {
  const id = `event-${String(chapter).padStart(3, '0')}`
  const relatedArcs = chapter >= 16 ? ['arc-dreamer', 'arc-father', 'arc-origin'] : ['arc-dreamer']
  events.push({ id, chapter, order: 1, storyDate: `第 ${chapter} 天`, title: titles[chapter - 1], summary: `第 ${chapter} 章的关键事件推动了梦境调查。`, characters: chapter >= 4 ? ['lin-xia', chapter % 3 === 0 ? 'lin-father' : 'chen-yan'] : ['lin-xia'], locations: [chapter % 2 === 0 ? 'school-library' : 'lin-home'], arcs: relatedArcs, plots: [`plot-${String(((chapter - 1) % 7) + 1).padStart(2, '0')}`], foreshadowings: chapter <= 12 ? [`f-open-${String(chapter).padStart(2, '0')}`] : [] })
}
await write('timeline/events.jsonl', `${events.map((event) => JSON.stringify(event)).join('\n')}\n`)

for (let chapter = 1; chapter <= 27; chapter += 1) {
  const number = String(chapter).padStart(3, '0')
  const wordCount = chapter <= 25 ? 4000 : chapter === 26 ? 4292 : 4128
  const title = titles[chapter - 1]
  await write(`plans/${number}.md`, `# 第 ${chapter} 章计划：${title}\n\n## 目标\n\n推进梦境调查，同时改变至少一条人物关系或信息边界。\n\n## Beats\n\n1. 承接上一章留下的具体动作。\n2. 新线索改变原有判断。\n3. 结尾留下可验证而非纯情绪的悬念。\n`)
  const finalText = chapter === 27
    ? '林夏站在玻璃后，和林父隔着一道看不见的墙。她伸手触碰，指尖传来的却是冰冷的潮气。倒影没有跟随她，而是慢慢抬起了头。那是一张比她年长许多的脸。'
    : `第 ${chapter} 天，林夏再次确认梦境并不是一场可以随意忘记的梦。她把新发现记进纸本，避免醒来后被另一段记忆覆盖。`
  await write(`chapters/${number}.md`, `# 第 ${chapter} 章 ${title}\n\n${finalText}\n\n窗外的光逐渐暗下去，线索仍指向下一处未被解释的空白。\n`)
  await write(`summaries/${number}.json`, {
    chapter, title, summary: chapter === 27 ? '林夏在玻璃后看见比自己年长的陌生面孔，父亲确认那不是普通倒影。' : `林夏在第 ${chapter} 天获得一条与梦境来源有关的新线索。`,
    wordCount, characters: events[chapter - 1].characters, locations: events[chapter - 1].locations, events: [events[chapter - 1].id],
    arcUpdates: events[chapter - 1].arcs, plotUpdates: events[chapter - 1].plots, foreshadowingUpdates: events[chapter - 1].foreshadowings
  })
}

await write('state/current.json', {
  chapter: 27, phase: '第二幕', scene: '玻璃后的房间', storyDate: '第 27 天',
  activeArcs: arcs.map((arc) => arc.id), activePlots: plots.map((plot) => plot.id),
  openForeshadowings: foreshadowings.filter((item) => ['open', 'developing'].includes(item.status)).map((item) => item.id),
  lastUpdatedAt: '2026-08-19'
})
await write('state/locks.json', { locks: [
  { path: 'story/direction.md', scope: 'file', reason: '创作者确认的 Hard Plot', lockedAt: '2026-08-19' },
  { path: 'world/rules.json', scope: 'file', reason: '世界核心规则', lockedAt: '2026-08-19' },
  { path: 'novel.json', scope: 'fields', fields: ['title', 'cover'], reason: '标题和封面概念已确认', lockedAt: '2026-08-19' }
] })

console.log(`Generated example at ${output}`)
