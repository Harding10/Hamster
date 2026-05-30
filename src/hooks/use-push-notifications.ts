"use client"

import { useEffect, useState } from "react"
import { getToken, onMessage } from "firebase/messaging"
import { useMessaging, useFirestore, useUser } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"

export function usePushNotifications() {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const getMessaging = useMessaging()
  const db = useFirestore()
  const { user } = useUser()
  const { toast } = useToast()

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setPermission(Notification.permission)
    }
  }, [])

  const requestPermission = async () => {
    try {
      if (!("Notification" in window)) {
        console.log("Ce navigateur ne supporte pas les notifications push.")
        return
      }

      const perm = await Notification.requestPermission()
      setPermission(perm)

      if (perm === "granted") {
        const messaging = getMessaging()
        if (messaging && user && db) {
          const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
          if (!vapidKey) {
            console.warn("VAPID Key manquante pour les notifications Push.")
            return
          }

          const currentToken = await getToken(messaging, { vapidKey })
          if (currentToken) {
            setToken(currentToken)
            // Sauvegarde le token dans Firestore pour envoyer des notifications ciblées depuis le backend
            await setDoc(doc(db, "users", user.uid, "fcmTokens", currentToken), {
              token: currentToken,
              device: navigator.userAgent,
              updatedAt: serverTimestamp()
            })
            
            // Écoute des messages en premier plan
            onMessage(messaging, (payload) => {
              toast({
                title: payload.notification?.title || "Notification",
                description: payload.notification?.body || "Vous avez un nouveau message."
              })
            })
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de l'activation des notifications push:", error)
    }
  }

  return { token, permission, requestPermission }
}
