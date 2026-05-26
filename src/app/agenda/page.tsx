"use client"

import * as React from "react"
import { 
  Calendar as CalendarIcon, 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles,
  Clock,
  LayoutGrid,
  List as ListIcon,
  Trash2,
  X,
  Eye
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { collection, addDoc, serverTimestamp, query, where, orderBy, deleteDoc, doc } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  isSameMonth, 
  isSameDay, 
  addDays, 
  eachDayOfInterval,
  getWeek
} from "date-fns"
import { fr } from "date-fns/locale"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import { cn } from "@/lib/utils"

export default function AgendaPage() {
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()
  
  const [currentDate, setCurrentDate] = React.useState(new Date())
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [isAdding, setIsAdding] = React.useState(false)
  const [viewingEvent, setViewingEvent] = React.useState<any | null>(null)
  
  const [title, setTitle] = React.useState("")
  const [desc, setDesc] = React.useState("")
  const [viewMode, setViewMode] = React.useState<'month' | 'list'>('month')

  // Auto-switch to list view on small screens
  React.useEffect(() => {
    const checkMobile = () => {
      if (window.innerWidth < 768) {
        setViewMode('list')
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const q = React.useMemo(() => {
    if (!db || !user) return null
    return query(collection(db, "events"), where("userId", "==", user.uid))
  }, [db, user])

  const { data: rawEvents } = useCollection<any>(q)

  const events = React.useMemo(() => {
    if (!rawEvents) return null;
    return [...rawEvents].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return timeA - timeB;
    });
  }, [rawEvents])

  const handleCreateEvent = () => {
    if (!db || !user || !title.trim() || !selectedDate) return
    
    const eventData = {
      title: title.trim(),
      description: desc.trim(),
      date: selectedDate.toISOString(),
      userId: user.uid,
      createdAt: serverTimestamp()
    }

    addDoc(collection(db, "events"), eventData)
      .then(() => {
        toast({ title: "Événement planifié" })
        setIsAdding(false)
        setTitle(""); setDesc("")
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: 'events', operation: 'create', requestResourceData: eventData })))
  }

  const handleDeleteEvent = (eventId: string) => {
    if (!db) return
    deleteDoc(doc(db, "events", eventId))
      .then(() => {
        toast({ title: "Événement supprimé" })
        setViewingEvent(null)
      })
      .catch(e => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `events/${eventId}`, operation: 'delete' })))
  }

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 })
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  const weekDays = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"]

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1))
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1))
  const today = () => setCurrentDate(new Date())

  const getEventsForDay = (day: Date) => {
    return events?.filter(event => isSameDay(new Date(event.date), day)) || []
  }

  const handleDayClick = (day: Date) => {
    setSelectedDate(day)
    setIsAdding(true)
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 pb-20 px-1 md:px-0 h-full flex flex-col w-full overflow-hidden">
      {/* HEADER CONTROLS */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white/[0.02] p-3 md:p-4 rounded-2xl md:rounded-3xl border border-white/5 w-full overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
            <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8 hover:bg-white/10 border-none"><ChevronLeft className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8 hover:bg-white/10 border-none"><ChevronRight className="h-4 w-4" /></Button>
          </div>
          <Button variant="outline" onClick={today} className="h-10 border-white/10 bg-white/5 rounded-xl font-bold px-4 md:px-6 text-xs md:text-sm border-none shrink-0">Aujourd'hui</Button>
          <h2 className="text-xl md:text-2xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
            {format(currentDate, "MMMM yyyy", { locale: fr })}
          </h2>
        </div>

        <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 shrink-0">
             <Button 
               variant="ghost" 
               size="sm" 
               className={cn("px-3 md:px-4 rounded-lg text-[10px] md:text-xs font-bold border-none", viewMode === 'month' ? "bg-white/10 text-white" : "text-zinc-500")}
               onClick={() => setViewMode('month')}
             >
               Mois
             </Button>
             <Button 
               variant="ghost" 
               size="sm" 
               className={cn("px-3 md:px-4 rounded-lg text-[10px] md:text-xs font-bold border-none", viewMode === 'list' ? "bg-white/10 text-white" : "text-zinc-500")}
               onClick={() => setViewMode('list')}
             >
               Liste
             </Button>
          </div>
          <Button 
            className="bg-white text-black font-bold h-10 rounded-xl px-4 md:px-6 shadow-xl border-none shrink-0"
            onClick={() => { setSelectedDate(new Date()); setIsAdding(true); }}
          >
            <Plus className="mr-2 h-4 w-4" /> Planifier
          </Button>
        </div>
      </div>

      {/* CALENDAR GRID */}
      {viewMode === 'month' ? (
        <div className="flex-1 bg-white/[0.01] border border-white/5 rounded-2xl md:rounded-[2.5rem] overflow-hidden flex flex-col min-h-[500px] md:min-h-[700px] w-full">
          <div className="grid grid-cols-7 md:grid-cols-[50px_repeat(7,1fr)] border-b border-white/5 bg-white/[0.02]">
            <div className="hidden md:flex items-center justify-center border-r border-white/5">
              <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">W</span>
            </div>
            {weekDays.map(day => (
              <div key={day} className="py-3 md:py-4 text-center border-r border-white/5 last:border-none">
                <span className="text-[8px] md:text-xs font-bold text-zinc-500 uppercase tracking-widest">{day}</span>
              </div>
            ))}
          </div>

          <div className="flex-1 grid grid-cols-7 md:grid-cols-[50px_repeat(7,1fr)]">
             {calendarDays.map((day, idx) => {
               const dayEvents = getEventsForDay(day)
               const isCurrentMonth = isSameMonth(day, monthStart)
               const isToday = isSameDay(day, new Date())
               
               return (
                 <React.Fragment key={day.toString()}>
                   {(idx % 7 === 0) && (
                     <div className="hidden md:flex items-center justify-center border-b border-r border-white/5 bg-white/[0.01]">
                       <span className="text-[10px] font-mono text-zinc-700">{getWeek(day)}</span>
                     </div>
                   )}
                   
                   <div 
                     className={cn(
                       "min-h-[80px] md:min-h-[120px] p-1.5 md:p-2 border-b border-r border-white/5 last:border-r-0 transition-colors group cursor-pointer relative",
                       !isCurrentMonth ? "bg-black/10 md:bg-black/20" : "hover:bg-white/[0.02]",
                       isToday && "bg-blue-500/[0.03]"
                     )}
                     onClick={() => handleDayClick(day)}
                   >
                     <div className="flex justify-between items-start mb-1 md:mb-2">
                        <span className={cn(
                          "text-[10px] md:text-sm font-bold w-6 h-6 md:w-7 md:h-7 flex items-center justify-center rounded-full transition-all",
                          !isCurrentMonth ? "text-zinc-800" : "text-zinc-400",
                          isToday ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.4)]" : "group-hover:text-white"
                        )}>
                          {format(day, "d")}
                        </span>
                     </div>

                     <div className="space-y-1 overflow-hidden">
                        {dayEvents.slice(0, window.innerWidth < 768 ? 1 : 3).map(event => (
                          <div 
                            key={event.id} 
                            className="px-1 md:px-2 py-0.5 md:py-1 rounded-md bg-blue-600/20 border border-blue-500/30 text-blue-300 text-[8px] md:text-[10px] font-bold truncate transition-transform hover:scale-[1.02] cursor-pointer"
                            onClick={(e) => {
                              e.stopPropagation()
                              setViewingEvent(event)
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > (window.innerWidth < 768 ? 1 : 3) && (
                          <div className="text-[7px] md:text-[9px] font-bold text-zinc-500 pl-1">
                            + {dayEvents.length - (window.innerWidth < 768 ? 1 : 3)}
                          </div>
                        )}
                     </div>
                   </div>
                 </React.Fragment>
               )
             })}
          </div>
        </div>
      ) : (
        <div className="space-y-4 w-full">
           {events?.map(event => (
             <div 
               key={event.id} 
               onClick={() => setViewingEvent(event)}
               className="group p-4 md:p-6 rounded-2xl md:rounded-3xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-all flex items-center justify-between cursor-pointer w-full"
             >
                <div className="flex items-center gap-4 md:gap-6 overflow-hidden">
                   <div className="text-center min-w-[50px] md:min-w-[60px] border-r border-white/10 pr-4 md:pr-6 shrink-0">
                      <div className="text-[10px] md:text-xs font-bold text-zinc-500 uppercase">{format(new Date(event.date), "MMM", { locale: fr })}</div>
                      <div className="text-xl md:text-2xl font-bold text-white">{format(new Date(event.date), "dd")}</div>
                   </div>
                   <div className="space-y-0.5 md:space-y-1 overflow-hidden">
                      <h4 className="text-sm md:text-lg font-bold text-white truncate">{event.title}</h4>
                      <p className="text-[10px] md:text-sm text-zinc-500 line-clamp-1">{event.description || "Aucune description"}</p>
                   </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 shrink-0">
                  <div className="text-[8px] md:text-[10px] font-mono text-zinc-600 bg-white/5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-white/5 uppercase tracking-widest">
                     {format(new Date(event.date), "HH:mm")}
                  </div>
                  <Eye className="h-4 w-4 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block" />
                </div>
             </div>
           ))}
           {events?.length === 0 && (
             <div className="py-24 md:py-32 text-center glass border-dashed border-white/10 rounded-[2rem] md:rounded-[3rem] opacity-30">
               <Clock className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-4" />
               <p className="text-sm md:text-base">Aucun événement planifié.</p>
             </div>
           )}
        </div>
      )}

      {/* INSIGHT IA PANEL */}
      <div className="p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] bg-white/[0.02] border border-white/5 space-y-3 md:space-y-4 shadow-2xl w-full">
         <h3 className="text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] md:tracking-[0.3em] text-zinc-500 flex items-center gap-2">
           <Sparkles className="h-3.5 w-3.5 md:h-4 md:w-4 text-blue-400" /> Analyse IA
         </h3>
         <p className="text-[11px] md:text-sm text-zinc-400 leading-relaxed italic max-w-3xl">
           "Votre planification semble équilibrée. Notez une concentration inhabituelle de jalons la troisième semaine. Pensez à décaler vos sprints pour absorber la charge."
         </p>
      </div>

      {/* DIALOGS */}
      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="glass border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white text-xl md:text-2xl font-bold flex items-center gap-2 md:gap-3">
              <CalendarIcon className="h-5 w-5 md:h-6 md:w-6 text-blue-500" />
              {selectedDate ? format(selectedDate, "dd MMMM yyyy", { locale: fr }) : "Nouvel Événement"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 md:space-y-6 py-4 md:py-6">
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Titre de l'événement</label>
              <Input 
                placeholder="Ex: Release v1.0, Meeting client..." 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                className="bg-white/5 border-white/10 h-11 md:h-12 rounded-xl focus:ring-blue-500/20 border-none" 
              />
            </div>
            <div className="space-y-1.5 md:space-y-2">
              <label className="text-[9px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-1">Description / Détails</label>
              <textarea 
                placeholder="Notes additionnelles..." 
                value={desc} 
                onChange={e => setDesc(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 md:p-4 min-h-[100px] md:min-h-[120px] resize-none focus:outline-none focus:ring-1 focus:ring-blue-500/20 text-xs md:text-sm text-white" 
              />
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl h-11 md:h-12 px-6 w-full sm:w-auto border-none">Annuler</Button>
            <Button onClick={handleCreateEvent} className="bg-white text-black font-bold h-11 md:h-12 rounded-xl px-8 md:px-10 shadow-2xl border-none w-full sm:w-auto">Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
        <DialogContent className="glass border-white/10 rounded-2xl md:rounded-[2rem] shadow-2xl max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <div className="space-y-1 md:space-y-1.5">
                <DialogTitle className="text-white text-xl md:text-2xl font-bold">
                  {viewingEvent?.title}
                </DialogTitle>
                <div className="flex items-center gap-2 text-zinc-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                  <Clock className="h-3 w-3" />
                  {viewingEvent && format(new Date(viewingEvent.date), "EEEE d MMMM yyyy à HH:mm", { locale: fr })}
                </div>
              </div>
            </div>
          </DialogHeader>
          <div className="py-4 md:py-6 min-h-[80px] md:min-h-[100px]">
            <p className="text-zinc-300 text-xs md:text-sm leading-relaxed whitespace-pre-wrap">
              {viewingEvent?.description || "Aucune description fournie."}
            </p>
          </div>
          <DialogFooter className="flex flex-col sm:flex-row justify-between items-center gap-3 w-full">
            <Button 
              variant="ghost" 
              className="text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-xl border-none w-full sm:w-auto justify-start sm:justify-center"
              onClick={() => handleDeleteEvent(viewingEvent.id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
            <Button variant="outline" onClick={() => setViewingEvent(null)} className="rounded-xl border-white/10 border-none w-full sm:w-auto">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
