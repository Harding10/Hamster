"use client"

import * as React from "react"
import { 
  Link as LinkIcon, 
  Plus, 
  Search, 
  ExternalLink, 
  Trash2, 
  Tag, 
  Globe,
  Loader2,
  MoreVertical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

interface Bookmark {
  id: string
  label: string
  url: string
  category: string
  userId: string
  createdAt: any
}

export default function LinksPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [search, setSearch] = React.useState("")
  const [isAdding, setIsAdding] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  
  // Form state
  const [label, setLabel] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [category, setCategory] = React.useState("")

  const q = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "bookmarks"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawBookmarks, loading: bookmarksLoading } = useCollection<Bookmark>(q)

  const bookmarks = React.useMemo(() => {
    if (!rawBookmarks) return null
    return [...rawBookmarks].sort((a, b) => {
      const timeA = a.createdAt?.toMillis?.() || 0
      const timeB = b.createdAt?.toMillis?.() || 0
      return timeB - timeA
    })
  }, [rawBookmarks])

  const filteredBookmarks = bookmarks?.filter(b => 
    b.label.toLowerCase().includes(search.toLowerCase()) || 
    b.category.toLowerCase().includes(search.toLowerCase()) ||
    b.url.toLowerCase().includes(search.toLowerCase())
  )

  const bookmarksByCategory = React.useMemo(() => {
    if (!filteredBookmarks) return {}
    return filteredBookmarks.reduce((acc, curr) => {
      const cat = curr.category || "Sans catégorie"
      if (!acc[cat]) acc[cat] = []
      acc[cat].push(curr)
      return acc
    }, {} as Record<string, Bookmark[]>)
  }, [filteredBookmarks])

  const handleCreate = async () => {
    if (!db || !user || !label.trim() || !url.trim()) return
    setLoading(true)
    
    // Ensure URL has protocol
    let formattedUrl = url.trim()
    if (!/^https?:\/\//i.test(formattedUrl)) {
      formattedUrl = 'https://' + formattedUrl
    }

    const data = {
      label: label.trim(),
      url: formattedUrl,
      category: category.trim() || "Général",
      userId: user.uid,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "bookmarks"), data)
      .then(() => {
        toast({ title: "Nexus mis à jour", description: "Le lien a été ajouté à votre bibliothèque." })
        // Créer une notification système
        addDoc(collection(db, "notifications"), {
          userId: user.uid,
          title: "Nouveau lien archivé",
          message: `Le lien "${data.label}" a été ajouté à votre Nexus.`,
          type: "success",
          read: false,
          createdAt: serverTimestamp()
        })
        setIsAdding(false)
        setLabel(""); setUrl(""); setCategory("")
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'bookmarks', operation: 'create', requestResourceData: data })))
      .finally(() => setLoading(false))
  }

  const handleDelete = (id: string) => {
    if (!db) return
    deleteDoc(doc(db, "bookmarks", id))
      .then(() => toast({ title: "Lien supprimé" }))
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname;
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    } catch (e) {
      return null;
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
             <div className="h-12 w-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
               <LinkIcon className="h-6 w-6 text-primary" />
             </div>
             <h1 className="text-4xl font-headline font-bold text-white tracking-tighter italic">Nexus de Liens.</h1>
          </div>
          <p className="text-muted-foreground">Centralisez et organisez vos ressources web par catégorie.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-primary text-black font-bold h-14 rounded-2xl px-8 shadow-2xl hover:scale-105 transition-transform">
              <Plus className="mr-2 h-5 w-5" /> Nouveau Lien
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 rounded-[2.5rem] max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-white flex items-center gap-3">
                <Globe className="h-6 w-6 text-primary" /> Archiver un Lien
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Label du site</label>
                <Input 
                  placeholder="Ex: Documentation Shadcn, Uiverse..." 
                  value={label} 
                  onChange={e => setLabel(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">URL</label>
                <Input 
                  placeholder="https://..." 
                  value={url} 
                  onChange={e => setUrl(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Catégorie</label>
                <Input 
                  placeholder="Ex: UI Design, Dev Tools, IA..." 
                  value={category} 
                  onChange={e => setCategory(e.target.value)}
                  className="bg-white/5 border-white/10 h-12 rounded-xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={loading || !label || !url} className="w-full bg-primary text-black font-bold h-12 rounded-xl">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Sauvegarder dans le Nexus"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-white transition-colors" />
        <Input 
          placeholder="Rechercher par label, URL ou catégorie..." 
          className="pl-12 h-14 bg-white/5 border-white/10 rounded-2xl focus-visible:ring-primary/10 text-lg"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="space-y-12">
        {bookmarksLoading ? (
          <div className="py-20 flex justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : Object.keys(bookmarksByCategory).length > 0 ? (
          Object.entries(bookmarksByCategory).map(([cat, items]) => (
            <div key={cat} className="space-y-4">
              <div className="flex items-center gap-3 px-2">
                <Tag className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold uppercase tracking-[0.3em] text-zinc-500">{cat}</h2>
                <div className="h-px flex-1 bg-white/5" />
                <span className="text-[10px] font-bold text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{items.length} ressources</span>
              </div>
              <div className="flex flex-col gap-3">
                {items.map(bookmark => {
                  const favicon = getFaviconUrl(bookmark.url);
                  return (
                    <div key={bookmark.id} className="group relative glass border-white/5 bg-white/[0.02] hover:bg-white/[0.04] p-4 rounded-2xl transition-all hover:scale-[1.01] hover:border-primary/20 flex flex-col sm:flex-row sm:items-center gap-4">
                       <div className="flex items-center gap-4 flex-1 min-w-0">
                         <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                           {favicon ? (
                             <img 
                               src={favicon} 
                               alt="" 
                               className="h-6 w-6 object-contain"
                               onError={(e) => {
                                 (e.target as HTMLImageElement).src = ""; 
                                 (e.target as HTMLImageElement).classList.add('hidden');
                               }}
                             />
                           ) : (
                             <Globe className="h-5 w-5 text-zinc-500 group-hover:text-primary transition-colors" />
                           )}
                         </div>
                         <div className="flex-1 min-w-0">
                            <h3 className="font-bold text-white truncate">{bookmark.label}</h3>
                            <p className="text-[11px] text-zinc-500 font-mono truncate">{bookmark.url}</p>
                         </div>
                       </div>
                       
                       <div className="flex items-center gap-2 shrink-0 sm:ml-auto self-end sm:self-auto">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-600 hidden md:block mr-2">{bookmark.category}</span>
                          <a 
                            href={bookmark.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="h-10 px-4 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary hover:text-black transition-all text-sm font-semibold"
                          >
                            Visiter <ExternalLink className="h-4 w-4 ml-2" />
                          </a>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-white">
                                <MoreVertical className="h-5 w-5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="glass border-white/10 rounded-xl">
                               <DropdownMenuItem className="text-red-400 gap-2" onClick={() => handleDelete(bookmark.id)}>
                                 <Trash2 className="h-4 w-4" /> Supprimer
                               </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                       </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="py-40 text-center glass border-dashed border-white/10 rounded-[3rem] opacity-30 flex flex-col items-center">
             <LinkIcon className="h-16 w-16 mb-6 text-zinc-600" />
             <p className="text-xl font-bold">Votre Nexus est vide.</p>
             <p className="text-sm mt-2 max-w-xs mx-auto">Sauvegardez vos liens favoris pour les retrouver instantanément plus tard.</p>
          </div>
        )}
      </div>
    </div>
  )
}

function ArrowRight({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
  )
}
