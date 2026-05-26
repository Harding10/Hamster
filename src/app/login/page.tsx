
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword 
} from "firebase/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Sparkles, Mail, Lock, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import { PlaceHolderImages } from "@/lib/placeholder-images"

export default function LoginPage() {
  const router = useRouter()
  const auth = getAuth()
  const { toast } = useToast()
  
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [isSignUp, setIsSignUp] = React.useState(false)



  const handleGoogleLogin = async () => {
    setLoading(true)
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      router.push("/")
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur", description: error.message })
    } finally {
      setLoading(false)
    }
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password)
      } else {
        await signInWithEmailAndPassword(auth, email, password)
      }
      router.push("/")
    } catch (error: any) {
      toast({ variant: "destructive", title: "Erreur d'authentification", description: "Email ou mot de passe incorrect." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
      
      <Card className="w-full max-w-md glass border-border shadow-2xl relative z-10 rounded-[2rem] overflow-hidden">
        <CardHeader className="text-center space-y-4 pt-10">
          <div className="mx-auto h-24 w-24 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center relative mb-4 overflow-hidden shadow-2xl">
            <Image 
              src="/icon.png" 
              alt="QbLog Logo" 
              width={80}
              height={80}
              className="object-cover"
              priority
              unoptimized
            />
          </div>
          <CardTitle className="text-4xl font-headline font-bold text-foreground tracking-tighter italic">
            QbLog<span className="text-primary">.</span>
          </CardTitle>
          <CardDescription className="text-muted-foreground font-medium">
            {isSignUp ? "Commencez à bâtir votre second cerveau." : "Connectez-vous pour accéder à vos notes techniques."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 px-8">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div className="space-y-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="email" 
                  placeholder="Email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="password" 
                  placeholder="Mot de passe" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-muted/50 border-border h-12 rounded-xl focus:ring-primary/20"
                />
              </div>
            </div>
            <Button 
              type="submit" 
              className="w-full h-12 rounded-xl font-bold text-base bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
              disabled={loading}
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : (isSignUp ? "S'inscrire" : "Se connecter")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground font-bold tracking-widest">Ou</span>
            </div>
          </div>

          <Button 
            variant="outline" 
            className="w-full h-12 border-border bg-muted/30 hover:bg-muted/50 rounded-xl flex items-center justify-center gap-3 font-semibold"
            onClick={handleGoogleLogin}
            disabled={loading}
          >
            <Image src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" width={18} height={18} />
            Continuer avec Google
          </Button>
        </CardContent>
        
        <CardFooter className="pb-10 pt-4 flex justify-center border-t border-border mt-6">
          <button 
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
          >
            {isSignUp ? "Déjà un compte ? Connectez-vous" : "Pas encore de compte ? Inscrivez-vous"}
          </button>
        </CardFooter>
      </Card>
    </div>
  )
}
