"use client"

import * as React from "react"
import { Search, Plus, Filter, Copy, MoreHorizontal, Sparkles, Trash2, Loader2, Code2, Save, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"
import { aiCodeOptimizer } from "@/ai/flows/ai-code-optimizer"
import { generateCodeSnippet } from "@/ai/flows/code-generator"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

export default function SnippetsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [search, setSearch] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [isAiGenerating, setIsAiGenerating] = React.useState(false)
  const [aiPrompt, setAiPrompt] = React.useState("")
  
  const [title, setTitle] = React.useState("")
  const [code, setCode] = React.useState("")
  const [language, setLanguage] = React.useState("javascript")
  const [isSaving, setIsSaving] = React.useState(false)
  const [optimizingId, setOptimizingId] = React.useState<string | null>(null)

  const q = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "snippets"), where("userId", "==", user.uid), orderBy("createdAt", "desc"))
  }, [db, user])

  const { data: snippets, loading } = useCollection<any>(q)

  const filteredSnippets = snippets?.filter(s => 
    s.title.toLowerCase().includes(search.toLowerCase()) || 
    s.language.toLowerCase().includes(search.toLowerCase())
  )

  const handleCreateSnippet = async () => {
    if (!db || !user || !title.trim() || !code.trim()) return
    setIsSaving(true)
    const snippetData = {
      title: title.trim(),
      code: code.trim(),
      language: language.toLowerCase(),
      userId: user.uid,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "snippets"), snippetData)
      .then(() => {
        toast({ title: "Snippet sauvegardé" })
        setIsAdding(false)
        setTitle(""); setCode(""); setLanguage("javascript")
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'snippets', operation: 'create', requestResourceData: snippetData })))
      .finally(() => setIsSaving(false))
  }

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "snippets", id))
      .then(() => toast({ title: "Snippet supprimé" }))
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copié !", description: "Le code est dans votre presse-papier." })
  }

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return
    setIsAiGenerating(true)
    try {
      const res = await generateCodeSnippet({ description: aiPrompt })
      setTitle(res.title)
      setCode(res.code)
      setLanguage(res.language)
      toast({ title: "Code généré par l'IA" })
      setAiPrompt("")
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur IA" })
    } finally {
      setIsAiGenerating(false)
    }
  }

  const handleOptimize = async (snippet: any) => {
    setOptimizingId(snippet.id)
    try {
      const result = await aiCodeOptimizer({ codeSnippet: snippet.code })
      toast({ title: "Optimisation suggérée", description: result.summary.slice(0, 100) + "..." })
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur d'optimisation" })
    } finally {
      setOptimizingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
               <Code2 className="h-6 w-6 text-white" />
             </div>
             <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Snippet Vault.</h1>
          </div>
          <p className="text-muted-foreground">Votre bibliothèque de code réutilisable et optimisé.</p>
        </div>
        <Button 
          className="bg-white text-black font-bold h-14 rounded-2xl px-8 shadow-2xl hover:scale-105 transition-transform"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="mr-2 h-5 w-5" /> Nouvel Extrait
        </Button>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-white transition-colors" />
        <Input 
          placeholder="Rechercher par titre, langage, tags..." 
          className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-white/10 text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-zinc-700" /></div>
        ) : filteredSnippets?.map((snippet) => (
          <div key={snippet.id} className="group rounded-[2.5rem] border border-white/5 bg-white/[0.02] overflow-hidden hover:border-white/10 transition-all shadow-xl">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 gap-4 bg-white/[0.01] border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <span className="text-[10px] font-bold uppercase text-blue-400">{snippet.language.slice(0, 2)}</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white tracking-tight">{snippet.title}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                      {snippet.createdAt ? formatDistanceToNow(snippet.createdAt.toDate(), { addSuffix: true, locale: fr }) : '...'}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-zinc-800" />
                    <span className="text-[10px] text-blue-400/70 font-mono uppercase">{snippet.language}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="flex-1 sm:flex-none h-9 rounded-xl hover:bg-blue-500/10 text-blue-400 gap-2"
                  onClick={() => handleOptimize(snippet)}
                  disabled={optimizingId === snippet.id}
                >
                  {optimizingId === snippet.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                  <span className="text-[10px] font-bold uppercase">Optimiser</span>
                </Button>
                <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white/10" onClick={() => handleCopy(snippet.code)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="icon" variant="ghost" className="h-9 w-9 rounded-xl hover:bg-white/10">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="glass border-white/10 rounded-xl">
                    <DropdownMenuItem className="gap-2"><Plus className="h-4 w-4" /> Dupliquer</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <DropdownMenuItem className="text-red-400 gap-2" onClick={() => handleDelete(snippet.id)}>
                      <Trash2 className="h-4 w-4" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <div className="p-6 bg-black/40">
              <pre className="code-font text-sm leading-relaxed text-zinc-300 p-6 rounded-2xl overflow-x-auto border border-white/5 bg-zinc-950/50 scrollbar-hide">
                <code>{snippet.code}</code>
              </pre>
            </div>
          </div>
        ))}

        {!loading && filteredSnippets?.length === 0 && (
          <div className="py-40 text-center glass border-dashed border-white/10 rounded-[3rem] opacity-30 flex flex-col items-center">
             <Code2 className="h-16 w-16 mb-6" />
             <p className="text-xl font-bold">Le coffre est vide.</p>
             <p className="text-sm mt-2">Sauvegardez vos pépites de code ici.</p>
          </div>
        )}
      </div>

      {/* ADD DIALOG */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="glass border-white/10 rounded-[2.5rem] max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
              <Plus className="h-6 w-6 text-blue-500" /> Nouvel Extrait
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* AI GENERATION AREA */}
            <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10 space-y-4">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                <Wand2 className="h-3 w-3" /> Assistant Génération IA
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Décrivez le code (ex: 'un hook react pour le local storage')..." 
                  className="bg-black/40 border-white/5 h-12 rounded-xl"
                  value={aiPrompt}
                  onChange={e => setAiPrompt(e.target.value)}
                />
                <Button 
                  onClick={handleAiGenerate} 
                  disabled={isAiGenerating || !aiPrompt.trim()}
                  className="bg-blue-600 hover:bg-blue-500 text-white h-12 rounded-xl px-6"
                >
                  {isAiGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Titre</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Nom du snippet..." className="bg-white/5 border-white/10 h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Langage</label>
                <Input value={language} onChange={e => setLanguage(e.target.value)} placeholder="ex: typescript, python..." className="bg-white/5 border-white/10 h-12 rounded-xl" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Code Source</label>
              <Textarea 
                value={code} 
                onChange={e => setCode(e.target.value)} 
                placeholder="Collez votre code ici..." 
                className="min-h-[250px] bg-black/40 border-white/10 rounded-2xl p-6 code-font text-sm"
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-12 px-6">Annuler</Button>
            <Button onClick={handleCreateSnippet} disabled={isSaving || !title || !code} className="bg-white text-black font-bold h-12 rounded-xl px-10 shadow-2xl">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
