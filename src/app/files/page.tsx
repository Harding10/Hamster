"use client"

import * as React from "react"
import { 
  Folder, 
  File, 
  Plus, 
  Search, 
  ChevronRight, 
  Upload, 
  Trash2, 
  FolderPlus,
  Loader2,
  ExternalLink,
  Home,
  LayoutGrid,
  List as ListIcon
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Checkbox } from "@/components/ui/checkbox"
import { useFirestore, useCollection, useUser, useDoc } from "@/firebase"
import { collection, addDoc, serverTimestamp, doc, query, where, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function FilesPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  const [currentFolderId, setCurrentFolderId] = React.useState<string | null>(null)
  const [search, setSearch] = React.useState("")
  const [view, setView] = React.useState<'grid' | 'list'>('grid')
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [isAddingFolder, setIsAddingFolder] = React.useState(false)
  const [newFolderName, setNewFolderName] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)

  const folderRef = React.useMemo(() => (db && currentFolderId ? doc(db, "folders", currentFolderId) : null), [db, currentFolderId])
  const { data: currentFolder } = useDoc<any>(folderRef)

  const foldersQuery = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "folders"), where("userId", "==", user.uid), where("parentId", "==", currentFolderId))
  }, [db, user, currentFolderId])

  const filesQuery = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "files"), where("userId", "==", user.uid), where("folderId", "==", currentFolderId))
  }, [db, user, currentFolderId])

  const { data: folders } = useCollection<any>(foldersQuery)
  const { data: files } = useCollection<any>(filesQuery)

  const allItems = React.useMemo(() => {
    const flds = (folders || []).map(f => ({ ...f, isDirectory: true }))
    const fls = (files || []).map(f => ({ ...f, isDirectory: false }))
    return [...flds, ...fls]
  }, [folders, files])

  const filteredItems = allItems.filter(item => item.name.toLowerCase().includes(search.toLowerCase()))

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !db || !user) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = file.type.startsWith('image/') 
      ? process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_IMAGES 
      : process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_DOCUMENTS

    if (!cloudName || !uploadPreset) {
      toast({ variant: "destructive", title: "Configuration manquante", description: "Veuillez vérifier vos variables d'environnement Cloudinary." })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, { method: "POST", body: formData })
      const result = await response.json()
      
      if (result.secure_url) {
        await addDoc(collection(db, "files"), {
          name: file.name,
          url: result.secure_url,
          type: file.type,
          size: file.size,
          folderId: currentFolderId,
          userId: user.uid,
          createdAt: serverTimestamp()
        })
        toast({ title: "Fichier importé avec succès" })
      }
    } catch (error) { 
      toast({ variant: "destructive", title: "Erreur", description: "Échec de l'upload." }) 
    } finally { 
      setIsUploading(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!db || selectedIds.size === 0) return
    const batch = writeBatch(db)
    selectedIds.forEach(id => {
      const item = allItems.find(i => i.id === id)
      batch.delete(doc(db, item?.isDirectory ? "folders" : "files", id))
    })
    await batch.commit()
    setSelectedIds(new Set())
    toast({ title: "Éléments supprimés" })
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-140px)] flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
        <nav className="flex items-center gap-2 text-xs font-medium bg-black/20 px-4 py-2 rounded-xl border border-white/5">
          <button onClick={() => setCurrentFolderId(null)} className="hover:text-white transition-colors flex items-center gap-2">
            <Home className="h-3.5 w-3.5" /> Racine
          </button>
          {currentFolder && (
            <>
              <ChevronRight className="h-3 w-3 opacity-30" />
              <span className="text-white font-bold">{currentFolder.name}</span>
            </>
          )}
        </nav>

        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <Button variant="ghost" size="icon" className="text-red-400 mr-2" onClick={handleBulkDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          <div className="flex bg-black/20 border border-white/5 p-1 rounded-xl mr-2">
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === 'grid' && "bg-white/10")} onClick={() => setView('grid')}><LayoutGrid className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className={cn("h-8 w-8", view === 'list' && "bg-white/10")} onClick={() => setView('list')}><ListIcon className="h-4 w-4" /></Button>
          </div>
          <Dialog open={isAddingFolder} onOpenChange={setIsAddingFolder}>
            <DialogTrigger asChild><Button variant="outline" className="border-white/10 h-10 rounded-xl"><FolderPlus className="mr-2 h-4 w-4" /> Dossier</Button></DialogTrigger>
            <DialogContent className="glass"><DialogHeader><DialogTitle>Nouveau dossier</DialogTitle></DialogHeader>
              <Input placeholder="Nom..." value={newFolderName} onChange={e => setNewFolderName(e.target.value)} className="bg-white/5" />
              <DialogFooter><Button onClick={() => {
                addDoc(collection(db!, "folders"), { name: newFolderName, parentId: currentFolderId, userId: user!.uid, createdAt: serverTimestamp() });
                setIsAddingFolder(false); setNewFolderName("");
              }} className="bg-white text-black font-bold">Créer</Button></DialogFooter>
            </DialogContent>
          </Dialog>
          <div className="relative">
            <Input type="file" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={handleFileUpload} disabled={isUploading} />
            <Button className="bg-white text-black h-10 px-6 font-bold rounded-xl" disabled={isUploading}>
              {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />} Importer
            </Button>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Rechercher..." value={search} onChange={e => setSearch(e.target.value)} className="pl-11 h-12 bg-white/5 border-white/10 rounded-2xl" />
      </div>

      <div className="flex-1 overflow-y-auto">
        {view === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-6 pb-20">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={cn(
                  "group relative aspect-square rounded-[2rem] border transition-all flex flex-col items-center justify-center p-6 cursor-pointer",
                  selectedIds.has(item.id) ? "bg-blue-500/10 border-blue-500/40" : "border-white/5 bg-white/[0.02] hover:bg-white/[0.05]"
                )}
                onClick={() => item.isDirectory ? setCurrentFolderId(item.id) : setSelectedIds(prev => {
                  const n = new Set(prev);
                  if (n.has(item.id)) n.delete(item.id); else n.add(item.id);
                  return n;
                })}
              >
                {item.isDirectory ? <Folder className="h-16 w-16 text-zinc-500" /> : (
                  <div className="h-20 w-20 rounded-2xl bg-blue-500/10 flex items-center justify-center relative overflow-hidden">
                    {item.type?.startsWith('image') ? <Image src={item.url} alt={item.name} fill className="object-cover" unoptimized /> : <File className="h-10 w-10 text-blue-400" />}
                  </div>
                )}
                <span className="mt-4 text-[11px] font-bold text-white truncate w-full text-center">{item.name}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass rounded-[2rem] overflow-hidden">
            <Table>
              <TableHeader className="bg-white/5"><TableRow className="border-white/5">
                <TableHead className="w-[50px]"></TableHead><TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead className="text-right">Action</TableHead>
              </TableRow></TableHeader>
              <TableBody>{filteredItems.map(item => (
                <TableRow key={item.id} className="border-white/5 hover:bg-white/[0.02]">
                  <TableCell><Checkbox checked={selectedIds.has(item.id)} onCheckedChange={() => setSelectedIds(prev => {
                    const n = new Set(prev);
                    if (n.has(item.id)) n.delete(item.id); else n.add(item.id);
                    return n;
                  })} /></TableCell>
                  <TableCell className="font-medium text-white">{item.name}</TableCell>
                  <TableCell className="text-zinc-500 text-[10px] uppercase">{item.isDirectory ? 'Dossier' : 'Fichier'}</TableCell>
                  <TableCell className="text-right">
                    {!item.isDirectory && <a href={item.url} target="_blank"><ExternalLink className="h-4 w-4 ml-auto" /></a>}
                  </TableCell>
                </TableRow>
              ))}</TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  )
}