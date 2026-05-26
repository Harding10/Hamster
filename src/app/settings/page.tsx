
"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  Settings, 
  Palette, 
  Info, 
  Zap,
  Layout
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/firebase"
import { ThemeToggle } from "@/components/ThemeToggle"
import { LoadingHamster } from "@/components/LoadingHamster"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useUser()

  React.useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  if (authLoading) return (
    <div className="h-screen flex items-center justify-center bg-background">
      <LoadingHamster label="Chargement des réglages..." />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-24 px-4 md:px-0">
      <div className="space-y-2">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-accent flex items-center justify-center border border-border shadow-2xl">
            <Settings className="h-6 w-6 text-foreground" />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold text-foreground tracking-tighter">Paramètres.</h1>
            <p className="text-muted-foreground">Configurez votre environnement technique.</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="interface" className="space-y-8">
        <TabsList className="bg-muted border border-border p-1 h-12 rounded-2xl">
          <TabsTrigger value="interface" className="rounded-xl px-6"><Palette className="mr-2 h-4 w-4" /> Interface</TabsTrigger>
          <TabsTrigger value="about" className="rounded-xl px-6"><Info className="mr-2 h-4 w-4" /> À propos</TabsTrigger>
        </TabsList>

        <TabsContent value="interface" className="space-y-6">
           <Card className="glass border-border rounded-[2.5rem] p-8 max-w-3xl space-y-12">
              <section className="space-y-6">
                 <div className="flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <Layout className="h-5 w-5 text-muted-foreground" />
                     <h3 className="text-lg font-bold text-foreground">Mode Sombre / Clair</h3>
                   </div>
                   <ThemeToggle />
                 </div>
                 <p className="text-sm text-muted-foreground">Adaptez QbLog à votre environnement de travail.</p>
              </section>

              <section className="space-y-6">
                 <div className="flex items-center gap-3">
                   <Zap className="h-5 w-5 text-yellow-500" />
                   <h3 className="text-lg font-bold text-foreground">Densité</h3>
                 </div>
                 <div className="flex gap-4">
                    <Button variant="outline" className="flex-1 rounded-xl h-16">Confortable</Button>
                    <Button variant="outline" className="flex-1 rounded-xl h-16 bg-accent border-primary">Compact</Button>
                 </div>
              </section>
           </Card>
        </TabsContent>

        <TabsContent value="about" className="space-y-6">
           <Card className="glass border-border rounded-[2.5rem] p-12 text-center space-y-8">
              <div className="h-24 w-24 bg-foreground rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                 <span className="font-headline font-bold text-background text-5xl italic">Q</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground tracking-tighter">QbLog Second Brain</h2>
              <p className="text-muted-foreground max-w-md mx-auto">V1.0.0 Stable - Construit pour la performance.</p>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
