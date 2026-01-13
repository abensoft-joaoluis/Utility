import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import mammoth from "mammoth"
import TurndownService from "turndown"
import Markdown from 'react-markdown'
import FileUpload from '@/components/editor/upload/FileUpload'
import { Button } from '@/components/ui/button'

export default function DocumentUploadHandler() {
  const [file, setFile] = useState<File | null>(null)

  const renderMarkdown = (html: string) => {
    const turndownService = new TurndownService()
    const markdown = turndownService.turndown(html)
    return markdown
  }

  const handleSend = () => {
    if (!file) return
    if (!file.name.endsWith(".docx")) return

    const reader = new FileReader()
    reader.onload = async () => {
      console.log('File sent (simulated):', file.name)

      const arrayBuffer = reader.result as ArrayBuffer
      const result = await mammoth.convertToHtml({arrayBuffer})
      console.log(result.value)
      console.log(result.messages)
      const markdown = renderMarkdown(result.value) as string
      createRoot(document.body).render(<Markdown>{markdown}</Markdown>)
      console.log(markdown)
    }
    reader.readAsArrayBuffer(file)
  }

  return (
    <div className="w-full max-w-xl p-8 bg-white dark:bg-[#171717] rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">Upload & Send</h1>
      <FileUpload onFile={setFile} />

      {file && (
        <div className="mt-4 flex items-center justify-between gap-5">
          <div className="text-sm text-gray-700 dark:text-gray-200 pr-5">
            {file.name} • {(file.size / 1024).toFixed(1)} KB
          </div>
          <Button onClick={handleSend} className="ml-5">
            Send
          </Button>
        </div>
      )}
    </div>
  )
}
