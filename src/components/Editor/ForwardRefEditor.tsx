
'use client'
/**
 * @fileOverview Wrapper MDXEditor avec dynamic import pour Next.js (no SSR).
 */
import dynamic from 'next/dynamic'
import { forwardRef } from "react"
import { type MDXEditorMethods, type MDXEditorProps} from '@mdxeditor/editor'

// Import dynamique pour éviter les erreurs d'hydratation côté serveur
const Editor = dynamic(() => import('./InitializedMDXEditor'), {
  ssr: false
})

export const ForwardRefEditor = forwardRef<MDXEditorMethods, MDXEditorProps>((props, ref) => (
  <Editor {...props} editorRef={ref} />
))

ForwardRefEditor.displayName = 'ForwardRefEditor'
