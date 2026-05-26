
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { updateProfile, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { Camera, Loader2, Save, ArrowLeft, User as UserIcon, Lock, ShieldCheck, KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { useUser } from "@/firebase"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { LoadingHamster } from "@/components/LoadingHamster"

export default function ProfilePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()
  const { toast } = useToast()
  
  const [displayName, setDisplayName] = React.useState("")
  const [photoURL, setPhotoURL] = React.useState("")
  const [isUploading, setIsUploading] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)

  const [currentPassword, setCurrentPassword] = React.useState("")
  const [newPassword, setNewPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [isUpdatingPassword, setIsUpdatingPassword] = React.useState(false)

  React.useEffect(() => {
    if (!authLoading && !user) router.push("/login")
    else if (user) {
      setDisplayName(user.displayName || "")
      setPhotoURL(user.photoURL || "")
    }
  }, [user, authLoading, router])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_IMAGES

    if (!cloudName || !uploadPreset) {
      toast({ variant: "destructive", title: "Cloudinary non configuré" })
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", uploadPreset)

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body: formData })
      const result = await res.json()
      if (result.secure_url) {
        setPhotoURL(result.secure_url)
        toast({ title: "Photo prête" })
      }
    } catch (error) {
      toast({ variant: "destructive", title: "Erreur upload" })
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async () => {
    if (!user) return
    setIsSaving(true)
    try {
      await updateProfile(user, { displayName: displayName.trim(), photoURL })
      toast({ title: "Profil mis à jour" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: "Impossible de mettre à jour le profil." })
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!user || !newPassword || !currentPassword) return
    if (newPassword !== confirmPassword) {
      toast({ variant: "destructive", title: "Erreur", description: "Les nouveaux mots de passe ne correspondent pas." })
      return
    }
    
    setIsUpdatingPassword(true)
    try {
      // Re-authentification requise pour les actions sensibles comme le changement de mot de passe
      const credential = EmailAuthProvider.credential(user.email!, currentPassword)
      await reauthenticateWithCredential(user, credential)
      
      // Une fois ré-authentifié, on peut mettre à jour le mot de passe
      await updatePassword(user, newPassword)
      toast({ title: "Mot de passe mis à jour", description: "Votre nouveau mot de passe est désormais actif." })
      
      // Reset des champs
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      console.error(error)
      toast({ 
        variant: "destructive", 
        title: "Erreur de sécurité", 
        description: error.code === 'auth/wrong-password' ? "Le mot de passe actuel est incorrect." : "Impossible de mettre à jour le mot de passe." 
      })
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (authLoading) return <div className="h-screen flex items-center justify-center"><LoadingHamster label="Chargement..." /></div>

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 px-4">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 rounded-xl hover:bg-white/10">
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-3xl font-headline font-bold text-white tracking-tighter">Mon Profil.</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* INFORMATIONS GENERALES */}
        <Card className="glass rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="text-center pt-8">
            <div className="relative mx-auto h-32 w-32 mb-6 group">
              <div className="h-full w-full rounded-[2.5rem] bg-white/5 border-2 border-dashed border-white/10 flex items-center justify-center relative overflow-hidden transition-all group-hover:border-white/20">
                {photoURL ? (
                  <Image src={photoURL} alt="P" fill className="object-cover" unoptimized />
                ) : (
                  <UserIcon className="h-16 w-16 opacity-20 text-white" />
                )}
                {isUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 h-10 w-10 bg-white text-black rounded-xl flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-xl">
                <Camera className="h-5 w-5" />
                <input type="file" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
              </label>
            </div>
            <CardTitle className="text-xl text-white">{user?.email}</CardTitle>
            <CardDescription className="text-zinc-500 uppercase text-[10px] font-bold tracking-widest mt-1">Identité Numérique</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-[0.3em] px-1 text-zinc-500">Nom d'affichage</label>
              <Input 
                value={displayName} 
                onChange={e => setDisplayName(e.target.value)} 
                className="bg-white/5 border-white/10 h-12 rounded-xl text-white focus:ring-white/20" 
              />
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-end">
            <Button className="h-12 px-8 rounded-xl font-bold bg-white text-black hover:bg-zinc-200" onClick={handleUpdate} disabled={isSaving || isUploading}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Enregistrer
            </Button>
          </CardFooter>
        </Card>

        {/* SECURITE & MOT DE PASSE */}
        <Card className="glass rounded-[2.5rem] overflow-hidden flex flex-col">
          <CardHeader className="pt-8 px-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                <Lock className="h-5 w-5 text-blue-400" />
              </div>
              <CardTitle className="text-xl text-white">Sécurité.</CardTitle>
            </div>
            <CardDescription className="text-zinc-500">Mettez à jour votre accès sécurisé.</CardDescription>
          </CardHeader>
          <CardContent className="p-8 space-y-6 flex-1">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] px-1 text-zinc-500">Mot de passe actuel</label>
                <div className="relative">
                  <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <Input 
                    type="password"
                    value={currentPassword} 
                    onChange={e => setCurrentPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white pl-12 focus:ring-blue-500/20" 
                  />
                </div>
              </div>
              
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] px-1 text-zinc-500">Nouveau mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <Input 
                    type="password"
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white pl-12 focus:ring-blue-500/20" 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-[0.3em] px-1 text-zinc-500">Confirmer le nouveau mot de passe</label>
                <div className="relative">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600" />
                  <Input 
                    type="password"
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    placeholder="••••••••"
                    className="bg-white/5 border-white/10 h-12 rounded-xl text-white pl-12 focus:ring-blue-500/20" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="p-8 bg-blue-500/[0.02] border-t border-white/5 flex justify-end">
            <Button 
              className="h-12 px-8 rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-500" 
              onClick={handleUpdatePassword} 
              disabled={isUpdatingPassword || !newPassword || !confirmPassword || !currentPassword}
            >
              {isUpdatingPassword ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />} Mettre à jour
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
