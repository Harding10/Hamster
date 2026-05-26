"use client"

import * as React from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { 
  Save,
  Loader2,
  FileText,
  Wand2,
  ArrowLeft,
  Plus,
  Book
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useFirestore, useUser, useDoc, useCollection } from "@/firebase"
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, where, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { noteStructurer } from "@/ai/flows/note-structurer"
import { cn } from "@/lib/utils"
import { LoadingHamster } from "@/components/LoadingHamster"
import { ForwardRefEditor } from "@/components/Editor/ForwardRefEditor"
import { type MDXEditorMethods } from "@mdxeditor/editor"
import { NoteCard } from "@/components/NoteCard"

export default function JournalPage() {
  const db = useFirestore()
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const selectedId = searchParams.get('id')
  const isNew = searchParams.get('new') === 'true'
  
  const [isSaving, setIsSaving] = React.useState(false)
  const [isAiLoading, setIsAiLoading] = React.useState(false)
  const [title, setTitle] = React.useState("")
  const editorRef = React.useRef<MDXEditorMethods>(null)

  React.useEffect(() => {
    if (!authLoading && !user) router.push("/login")
  }, [user, authLoading, router])

  const notesQuery = React.useMemo(() => {
    if (!db || !user || selectedId || isNew) return null
    return query(collection(db, "notes"), where("userId", "==", user.uid))
  }, [db, user, selectedId, isNew])

  const { data: rawNotes, loading: notesLoading } = useCollection<any>(notesQuery)
  
  const notes = React.useMemo(() => {
    if (!rawNotes) return null;
    return [...rawNotes].sort((a, b) => {
      if (a.isFavorite && !b.isFavorite) return -1;
      if (!a.isFavorite && b.isFavorite) return 1;
      
      const timeA = a.createdAt?.toMillis?.() || 0;
      const timeB = b.createdAt?.toMillis?.() || 0;
      return timeB - timeA;
    });
  }, [rawNotes])

  const noteRef = React.useMemo(() => (db && selectedId ? doc(db, "notes", selectedId) : null), [db, selectedId])
  const { data: note, loading: noteLoading } = useDoc<any>(noteRef)

  React.useEffect(() => {
    if (note) {
      setTitle(note.title || "")
      editorRef.current?.setMarkdown(note.description || "")
    } else if (isNew) {
      setTitle("")
      editorRef.current?.setMarkdown("")
    }
  }, [note, isNew])

  const handleSave = async () => {
    if (!db || !user) return
    const content = editorRef.current?.getMarkdown() || ""
    if (!title.trim() || !content.trim()) {
      toast({ variant: "destructive", title: "Contenu requis", description: "Le titre et le contenu ne peuvent pas être vides." })
      return
    }

    setIsSaving(true)
    const data = {
      title: title.trim(),
      description: content.trim(),
      userId: user.uid,
      template: "standard",
      updatedAt: serverTimestamp()
    }

    try {
      if (selectedId) {
        await updateDoc(doc(db, "notes", selectedId), data)
        router.push('/notes')
        toast({ title: "Note mise à jour", description: "Vos modifications ont été synchronisées." })
      } else {
        const docRef = await addDoc(collection(db, "notes"), { ...data, createdAt: serverTimestamp() })
        addDoc(collection(db, "notifications"), {
          userId: user.uid,
          title: "Nouvelle note créée",
          message: `Le bloc "${data.title}" a été ajouté à votre bibliothèque.`,
          type: "info",
          read: false,
          createdAt: serverTimestamp()
        })
        router.push('/notes')
        toast({ title: "Note créée", description: "Nouveau savoir archivé avec succès." })
      }
    } catch (e) {
      errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'notes', operation: selectedId ? 'update' : 'create', requestResourceData: data }))
    } finally {
      setIsSaving(false)
    }
  }

  const handleAiFormat = async () => {
    const current = editorRef.current?.getMarkdown() || ""
    if (!current || isAiLoading) return
    setIsAiLoading(true)
    try {
      const res = await noteStructurer({ rawContent: current })
      editorRef.current?.setMarkdown(res.structuredContent)
      if (res.suggestedTitle && !title) setTitle(res.suggestedTitle)
      toast({ title: "Structure IA appliquée", description: "L'assistant a organisé votre texte." })
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur IA" })
    } finally {
      setIsAiLoading(false)
    }
  }

  if (authLoading || (selectedId && noteLoading) || (!selectedId && !isNew && notesLoading)) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <LoadingHamster label="Chargement du journal..." />
      </div>
    )
  }

  if (!selectedId && !isNew) {
    return (
      <div className="max-w-7xl mx-auto space-y-8 md:space-y-12">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
          <div className="space-y-1.5 md:space-y-2">
            <div className="flex items-center gap-3">
               <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-muted border border-border flex items-center justify-center">
                 <Book className="h-5 w-5 md:h-6 md:w-6 text-foreground" />
               </div>
               <h1 className="text-3xl md:text-4xl font-headline font-bold text-foreground tracking-tighter italic">Bibliothèque.</h1>
            </div>
            <p className="text-muted-foreground text-xs md:text-base">Parcourez votre savoir technique structuré.</p>
          </div>
          <Button 
            className="bg-primary text-primary-foreground font-bold h-12 md:h-14 rounded-xl md:rounded-2xl px-6 md:px-8 shadow-2xl hover:scale-105 transition-transform border-none w-full md:w-auto"
            onClick={() => router.push('/notes?new=true')}
          >
            <Plus className="mr-2 h-5 w-5" /> Nouvelle Note
          </Button>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-8 pb-20 px-2">
          {notes?.map(n => (
            <NoteCard 
              key={n.id} 
              note={n} 
              onClick={() => router.push(`/notes?id=${n.id}`)}
            />
          ))}
          {notes?.length === 0 && (
            <div className="col-span-full py-24 md:py-40 text-center border-2 border-dashed border-border rounded-[2rem] md:rounded-[3rem] opacity-30 flex flex-col items-center">
               <FileText className="h-12 w-12 md:h-16 md:w-16 mb-6 text-muted-foreground" />
               <p className="text-lg md:text-xl font-bold text-foreground">La bibliothèque est vide.</p>
               <p className="text-xs md:text-sm mt-2 text-muted-foreground">Documentez votre première découverte technique.</p>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] border border-border rounded-2xl md:rounded-[2.5rem] overflow-hidden glass shadow-2xl w-full">
      <div className="flex-1 flex flex-col bg-muted/20 w-full overflow-hidden">
        <header className="h-16 md:h-20 border-b border-border flex items-center justify-between px-3 md:px-10 bg-background/40 shrink-0">
           <div className="flex-1 flex items-center gap-2 md:gap-4 mr-2 overflow-hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl hover:bg-muted shrink-0"
                onClick={() => router.push('/notes')}
              >
                <ArrowLeft className="h-4 w-4 md:h-5 md:w-5" />
              </Button>
              <FileText className="h-4 w-4 md:h-5 md:w-5 text-blue-500 shrink-0 hidden sm:block" />
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Titre..." 
                className="bg-transparent border-none text-base md:text-lg font-bold text-foreground focus-visible:ring-0 p-0 h-auto w-full truncate"
              />
           </div>
           <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <Button variant="outline" size="sm" className="h-8 md:h-9 border-none text-blue-500 bg-blue-500/5 hover:bg-blue-500/10 rounded-lg px-2 md:px-3" onClick={handleAiFormat} disabled={isAiLoading}>
                <Wand2 className={cn("h-3.5 w-3.5 md:mr-2", isAiLoading && "animate-spin")} />
                <span className="hidden sm:inline">IA</span>
              </Button>
              <Button size="sm" className="h-8 md:h-9 bg-primary text-primary-foreground font-bold rounded-lg px-3 md:px-6 border-none" onClick={handleSave} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5 md:mr-2" />}
                <span className="hidden sm:inline">Sauver</span>
              </Button>
           </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col w-full relative">
          <div className="flex-1 dark-editor overflow-y-auto bg-card/50 w-full">
            <ForwardRefEditor 
              ref={editorRef}
              markdown=""
              placeholder="Commencez à rédiger votre savoir technique ici..."
              contentEditableClassName="prose dark:prose-invert max-w-none focus:outline-none dark:text-foreground text-foreground"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
