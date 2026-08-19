export async function loadDemoFiles(): Promise<Record<string, string>> {
  const response = await fetch(`${import.meta.env.BASE_URL}demo-project.json`)
  if (!response.ok) throw new Error(`示例项目加载失败：${response.status}`)
  return response.json()
}
