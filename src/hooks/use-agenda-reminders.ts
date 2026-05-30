"use client"

import { useEffect, useRef } from "react"
import { useUser, useFirestore } from "@/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, doc } from "firebase/firestore"
import { format, isMonday, getWeek, addDays } from "date-fns"
import { generateWeeklyAgendaSynthesis } from "@/app/actions/agenda-ai"

export function useAgendaReminders() {
  const { user } = useUser()
  const db = useFirestore()
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (!user || !db) return

    // --- 1. Service Worker Actions Listener ---
    const handleSWMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'AGENDA_ACTION') {
        const { action, eventId } = event.data
        if (!eventId) return
        
        try {
          if (action === 'complete') {
            await updateDoc(doc(db, "events", eventId), { status: 'completed' })
          } else if (action === 'snooze') {
            // Reporter de 15 minutes
            const evDoc = await getDocs(query(collection(db, "events")))
            const evSnap = evDoc.docs.find(d => d.id === eventId)
            if (evSnap) {
               const ev = evSnap.data()
               const newDate = new Date(new Date(ev.date).getTime() + 15 * 60000)
               await updateDoc(doc(db, "events", eventId), { date: newDate.toISOString() })
               
               // Retirer des notifications locales pour qu'il sonne à nouveau
               const notifiedStr = localStorage.getItem(`notifiedEvents_${user.uid}`) || "[]"
               let notified = JSON.parse(notifiedStr)
               notified = notified.filter((id: string) => id !== eventId)
               localStorage.setItem(`notifiedEvents_${user.uid}`, JSON.stringify(notified))
            }
          }
        } catch(e) {
          console.error("Erreur action SW:", e)
        }
      }
    }

    navigator.serviceWorker?.addEventListener('message', handleSWMessage)

    // --- 2. IA Weekly Synthesis ---
    const checkWeeklyAI = async () => {
      const today = new Date()
      if (isMonday(today)) {
        const weekNum = getWeek(today)
        const storageKey = `aiSummarySent_${user.uid}_${today.getFullYear()}_W${weekNum}`
        
        if (!localStorage.getItem(storageKey)) {
           const q = query(collection(db, "events"), where("userId", "==", user.uid))
           const snapshot = await getDocs(q)
           const weekEvents = snapshot.docs
             .map(d => ({ id: d.id, ...d.data() } as any))
             .filter(e => {
                const ed = new Date(e.date)
                return ed >= today && ed <= addDays(today, 7) && e.status !== 'completed'
             })
             
           const aiText = await generateWeeklyAgendaSynthesis(weekEvents)
           
           if ("Notification" in window && Notification.permission === "granted") {
             new Notification("Résumé de la semaine 🤖", {
               body: aiText,
               icon: "/logo.png"
             })
           }
           
           await addDoc(collection(db, "notifications"), {
             userId: user.uid,
             title: "Résumé de la semaine 🤖",
             message: aiText,
             type: "info",
             read: false,
             createdAt: serverTimestamp()
           })
           
           localStorage.setItem(storageKey, "true")
        }
      }
    }

    checkWeeklyAI()

    // --- 3. Just-in-time Reminders ---
    const checkReminders = async () => {
      try {
        const q = query(collection(db, "events"), where("userId", "==", user.uid))
        const snapshot = await getDocs(q)
        const now = new Date().getTime()
        
        const notifiedStr = localStorage.getItem(`notifiedEvents_${user.uid}`) || "[]"
        const notifiedEvents: string[] = JSON.parse(notifiedStr)
        let newlyNotified = false

        snapshot.docs.forEach(docSnap => {
          const event = { id: docSnap.id, ...docSnap.data() } as any
          if (event.status === 'completed' || notifiedEvents.includes(event.id)) return
          
          const eventTime = new Date(event.date).getTime()
          const offset = (event.reminderOffset || 0) * 60000
          const triggerTime = eventTime - offset
          
          // Déclenche si on a dépassé l'heure de trigger, mais expire 1h après l'événement
          if (now >= triggerTime && now < eventTime + 3600000) {
            notifiedEvents.push(event.id)
            newlyNotified = true
            
            const timeStr = format(new Date(event.date), "HH:mm")
            let title = `Rappel : ${event.title}`
            let message = `Prévu pour ${timeStr}`
            if (offset > 0) message += ` (Dans ${event.reminderOffset} min)`

            if ("Notification" in window && Notification.permission === "granted") {
              // @ts-ignore
              navigator.serviceWorker?.ready.then(registration => {
                registration.showNotification(title, {
                  body: message,
                  icon: "/logo.png",
                  data: { eventId: event.id },
                  actions: [
                    { action: 'complete', title: '✅ Terminer' },
                    { action: 'snooze', title: '💤 Reporter 15m' }
                  ]
                })
              }).catch(() => {
                new Notification(title, { body: message, icon: "/logo.png" })
              })
            }

            addDoc(collection(db, "notifications"), {
              userId: user.uid,
              title: title,
              message: message,
              type: "warning",
              read: false,
              createdAt: serverTimestamp()
            })
          }
        })

        if (newlyNotified) {
          localStorage.setItem(`notifiedEvents_${user.uid}`, JSON.stringify(notifiedEvents))
        }
      } catch(e) {
        console.error(e)
      }
    }

    checkReminders()
    intervalRef.current = setInterval(checkReminders, 60000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      navigator.serviceWorker?.removeEventListener('message', handleSWMessage)
    }
  }, [user, db])
}
