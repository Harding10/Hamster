"use client"

import * as React from "react"
import { Bell, Check, Info, AlertTriangle, CheckCircle2, Trash2, X } from "lucide-react"
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useFirestore, useCollection, useUser } from "@/firebase"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  updateDoc, 
  doc, 
  deleteDoc,
  writeBatch
} from "firebase/firestore"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { fr } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"

export function NotificationCenter() {
  const db = useFirestore()
  const { user } = useUser()
  const { permission, requestPermission } = usePushNotifications()

  const q = React.useMemo(() => {
    if (!db || !user) return null
    return query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: notifications } = useCollection<any>(q)

  const unreadCount = React.useMemo(() => {
    return notifications?.filter(n => !n.read).length || 0
  }, [notifications])

  const markAsRead = (id: string) => {
    if (!db) return
    updateDoc(doc(db, "notifications", id), { read: true })
  }

  const deleteNotification = (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (!db) return
    deleteDoc(doc(db, "notifications", id))
  }

  const markAllAsRead = async () => {
    if (!db || !notifications) return
    const batch = writeBatch(db)
    notifications.forEach(n => {
      if (!n.read) {
        batch.update(doc(db, "notifications", n.id), { read: true })
      }
    })
    await batch.commit()
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error': return <X className="h-4 w-4 text-red-500" />
      default: return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  if (!user) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-10 w-10 rounded-xl hover:bg-white/10 data-[state=open]:bg-white/10 transition-colors"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-red-600 text-[10px] font-bold border-2 border-background animate-pulse">
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 glass rounded-2xl border-white/10 p-0 overflow-hidden shadow-2xl">
        <DropdownMenuLabel className="p-4 flex items-center justify-between bg-white/5 border-b border-white/5">
          <div className="flex flex-col">
            <span className="text-sm font-bold">Notifications</span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{unreadCount} non lues</span>
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-8 text-[10px] uppercase font-bold text-blue-500 hover:text-blue-400">
              Tout lire
            </Button>
          )}
        </DropdownMenuLabel>
        
        {permission === "default" && (
          <div className="p-3 bg-blue-500/10 border-b border-blue-500/20 flex flex-col gap-2">
            <span className="text-xs text-blue-400 font-medium">Ne manquez rien avec les notifications Push.</span>
            <Button size="sm" onClick={requestPermission} className="h-7 text-[10px] bg-blue-500 hover:bg-blue-600 text-white font-bold w-full">
              Activer les alertes
            </Button>
          </div>
        )}

        <ScrollArea className="h-[350px]">
          {notifications && notifications.length > 0 ? (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  onClick={() => markAsRead(n.id)}
                  className={cn(
                    "relative p-4 border-b border-white/5 last:border-0 cursor-pointer transition-colors group",
                    n.read ? "opacity-60 grayscale-[0.5]" : "bg-white/[0.03]"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foreground line-clamp-1">{n.title}</span>
                        <span className="text-[9px] text-muted-foreground">
                          {n.createdAt ? formatDistanceToNow(n.createdAt.toDate(), { addSuffix: true, locale: fr }) : "..."}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {n.message}
                      </p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={(e) => deleteNotification(e, n.id)}
                    className="absolute right-2 top-2 h-6 w-6 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                <Bell className="h-6 w-6 text-muted-foreground opacity-20" />
              </div>
              <p className="text-xs text-muted-foreground">Aucune notification pour le moment.</p>
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="bg-white/5 m-0" />
        <Button variant="ghost" className="w-full h-10 text-[10px] uppercase font-bold text-muted-foreground hover:text-foreground rounded-none">
          Voir tout l'historique
        </Button>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
