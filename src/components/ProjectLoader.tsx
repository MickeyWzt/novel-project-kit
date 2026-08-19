import { FolderOpen } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Props {
  onFiles: (files: FileList) => void
  compact?: boolean
}

export function ProjectLoader({ onFiles, compact = false }: Props) {
  const input = useRef<HTMLInputElement>(null)

  useEffect(() => {
    input.current?.setAttribute('webkitdirectory', '')
    input.current?.setAttribute('directory', '')
  }, [])

  return (
    <>
      <input
        ref={input}
        className="visually-hidden"
        type="file"
        multiple
        aria-label="选择小说项目文件夹"
        onChange={(event) => event.target.files && onFiles(event.target.files)}
      />
      <button className={compact ? 'open-button open-button--compact' : 'open-button'} onClick={() => input.current?.click()}>
        <FolderOpen size={compact ? 18 : 21} strokeWidth={1.7} />
        打开小说项目
      </button>
    </>
  )
}
