"use client"

import { useEffect } from "react"
import { useUser, useFirestore } from "@/firebase"
import { collection, query, where, getDocs, addDoc, serverTimestamp } from "firebase/firestore"
import { startOfDay, endOfDay, format } from "date-fns"

export function useAgendaReminders() {
  const { user } = useUser()
  const db = useFirestore()

  useEffect(() => {
    if (!user || !db) return

    const checkAgenda = async () => {
      const today = new Date()
      const dateKey = format(today, "yyyy-MM-dd")
      const storageKey = `agendaReminderSent_${user.uid}_${dateKey}`

      // Si le rappel a déjà été envoyé aujourd'hui, on ne fait rien
      if (localStorage.getItem(storageKey)) return

      const start = startOfDay(today)
      const end = endOfDay(today)

      try {
        // Récupérer tous les événements de l'utilisateur
        const q = query(
          collection(db, "events"),
          where("userId", "==", user.uid)
        )
        
        const snapshot = await getDocs(q)
        
        // Filtrer localement pour ceux d'aujourd'hui
        const todayEvents = snapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as any))
          .filter(event => {
            const eventDate = new Date(event.date)
            return eventDate >= start && eventDate <= end
          })

        if (todayEvents.length > 0) {
          let message = ""
          let title = "Rappel d'Agenda"

          if (todayEvents.length === 1) {
            const event = todayEvents[0]
            const eventTime = format(new Date(event.date), "HH:mm")
            message = `⏰ Rappel : Vous avez '${event.title}' à réaliser aujourd'hui à ${eventTime}.`
            title = event.title
          } else {
            message = "📅 Rappel : Vous avez des tâches à réaliser aujourd'hui. Veuillez vérifier votre agenda."
          }

          // Créer une notification interne dans la base de données
          await addDoc(collection(db, "notifications"), {
            userId: user.uid,
            title: title,
            message: message,
            type: "info",
            read: false,
            createdAt: serverTimestamp()
          })

          // Déclencher une notification native si autorisé
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification(title, {
              body: message,
              icon: "/logo.png"
            })
          }

          // Mémoriser que c'est fait pour aujourd'hui
          localStorage.setItem(storageKey, "true")
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'agenda:", error)
      }
    }

    checkAgenda()
  }, [user, db])
}
