
'use client'
/**
 * @fileOverview Composant MDXEditor initialisé avec tous les plugins nécessaires.
 */
import React, { type ForwardedRef, useEffect, useState } from 'react'
import {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  MDXEditor,
  type MDXEditorMethods,
  type MDXEditorProps,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CodeToggle,
  CreateLink,
  InsertTable,
  InsertImage,
  InsertCodeBlock,
  ListsToggle,
  Separator,
  codeBlockPlugin,
  codeMirrorPlugin,
  tablePlugin,
  imagePlugin,
  linkPlugin,
  linkDialogPlugin,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { cn } from "@/lib/utils"

export default function InitializedMDXEditor({
  editorRef,
  ...props
}: { editorRef: ForwardedRef<MDXEditorMethods> | null } & MDXEditorProps) {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains('dark'))
    })
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  return (
    <MDXEditor
      className={cn(isDark ? "dark-theme dark-editor" : "", props.className)}
      plugins={[
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        markdownShortcutPlugin(),
        tablePlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        imagePlugin({
          imageUploadHandler: async (file) => {
            const formData = new FormData()
            formData.append('file', file)
            const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_IMAGES || 'qblog_images_preset'
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dnyeyzzcm'
            formData.append('upload_preset', preset)
            
            try {
              const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
              })
              const data = await response.json()
              if (data.secure_url) {
                return data.secure_url
              }
              throw new Error('Upload failed')
            } catch (error) {
              console.error('Image upload error:', error)
              return '' 
            }
          }
        }),
        codeBlockPlugin({ defaultCodeBlockLanguage: 'javascript' }),
        codeMirrorPlugin({ 
          codeBlockLanguages: { 
            js: 'JavaScript', 
            ts: 'TypeScript', 
            tsx: 'React TSX',
            css: 'CSS', 
            html: 'HTML',
            json: 'JSON'
          } 
        }),
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <Separator />
              <BoldItalicUnderlineToggles />
              <Separator />
              <ListsToggle />
              <Separator />
              <BlockTypeSelect />
              <Separator />
              <CodeToggle />
              <InsertCodeBlock />
              <Separator />
              <CreateLink />
              <InsertImage />
              <Separator />
              <InsertTable />
            </>
          )
        })
      ]}
      {...props}
      ref={editorRef}
    />
  )
}
