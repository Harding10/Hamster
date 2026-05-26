
"use client"

import * as React from "react"
import { Heart, Plus, Trophy, Flame, AlertCircle, RefreshCw, Sparkles, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, addDoc, serverTimestamp, updateDoc, doc, query, where, orderBy } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow, differenceInDays } from "date-fns"
import { fr } from "date-fns/locale"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

export default function AddictionsPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [isAdding, setIsAdding] = React.useState(false)
  const [name, setName] = React.useState("")
  const [loading, setLoading] = React.useState(false)

  const q = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "addictions"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: habits } = useCollection<any>(q)

  const handleCreate = () => {
    if (!db || !user || !name.trim()) return
    setLoading(true)
    const data = {
      name: name.trim(),
      startDate: new Date().toISOString(),
      lastRelapseDate: new Date().toISOString(),
      userId: user.uid,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "addictions"), data)
      .then(() => {
        toast({ title: "Nouveau défi lancé !" })
        setIsAdding(false)
        setName("")
      })
      .catch((e) => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'addictions', operation: 'create', requestResourceData: data })))
      .finally(() => setLoading(false))
  }

  const handleRelapse = (habitId: string) => {
    if (!db) return
    const updateData = { lastRelapseDate: new Date().toISOString() }
    updateDoc(doc(db, "addictions", habitId), updateData)
      .then(() => toast({ title: "On ne baisse pas les bras !", description: "Le plus important est de recommencer dès maintenant." }))
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4 md:px-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
             <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
               <Heart className="h-6 w-6 text-red-500" />
             </div>
             <h1 className="text-4xl font-headline font-bold text-white tracking-tighter">Liberté & Discipline.</h1>
          </div>
          <p className="text-muted-foreground max-w-lg">Transformez vos habitudes et suivez vos progrès quotidiens pour devenir la meilleure version de vous-même.</p>
        </div>

        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button size="lg" className="bg-white text-black hover:bg-zinc-200 h-16 rounded-2xl px-8 font-bold text-lg shadow-2xl">
              <Plus className="mr-2 h-6 w-6" /> Suivre un comportement
            </Button>
          </DialogTrigger>
          <DialogContent className="glass border-white/10 rounded-[2rem]">
            <DialogHeader>
              <DialogTitle className="text-white">Que souhaitez-vous arrêter ?</DialogTitle>
            </DialogHeader>
            <div className="py-6 space-y-4">
              <Input 
                placeholder="Ex: Tabac, Sucre, Procrastination..." 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="bg-white/5 border-white/10 h-12"
              />
            </div>
            <DialogFooter>
              <Button onClick={handleCreate} disabled={loading || !name} className="w-full bg-white text-black font-bold h-12 rounded-xl">Lancer le défi</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {habits?.map(habit => {
          const lastDate = new Date(habit.lastRelapseDate)
          const streak = differenceInDays(new Date(), lastDate)
          
          return (
            <Card key={habit.id} className="glass border-white/5 rounded-[2.5rem] overflow-hidden group hover:bg-white/[0.02] transition-all">
              <CardContent className="p-8 space-y-8">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{habit.name}</h3>
                    <p className="text-[10px] uppercase font-bold text-zinc-500 tracking-widest">EN COURS DEPUIS</p>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                    <Flame className={streak > 0 ? "text-orange-500" : "text-zinc-600"} />
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center py-6 space-y-2">
                   <div className="text-7xl font-mono font-bold text-white tracking-tighter">
                     {streak}
                   </div>
                   <div className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">Jours consécutifs</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400">
                    <span className="flex items-center gap-1.5"><History className="h-3 w-3" /> DERNIÈRE RECHUTE</span>
                    <span>{formatDistanceToNow(lastDate, { addSuffix: true, locale: fr })}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      className="flex-1 rounded-xl border-red-500/20 text-red-400 hover:bg-red-500/5 h-12"
                      onClick={() => handleRelapse(habit.id)}
                    >
                      <RefreshCw className="mr-2 h-4 w-4" /> Relapse
                    </Button>
                    <Button variant="ghost" className="h-12 w-12 rounded-xl border border-white/5 hover:bg-white/5">
                      <Trophy className="h-4 w-4 text-yellow-500" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 flex gap-3 items-center">
                  <Sparkles className="h-5 w-5 text-blue-400 shrink-0" />
                  <p className="text-[10px] text-blue-300 italic">"Chaque jour sans {habit.name} renforce votre détermination logicielle."</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
        
        {habits?.length === 0 && (
          <div className="col-span-full py-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center space-y-6">
            <div className="h-20 w-20 rounded-[2rem] bg-white/5 flex items-center justify-center mx-auto">
              <AlertCircle className="h-10 w-10 text-white/10" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white/50">Aucun suivi actif</h3>
              <p className="text-muted-foreground text-sm max-w-[250px] mx-auto mt-2">Commencez dès aujourd'hui à suivre une habitude pour améliorer votre discipline.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
