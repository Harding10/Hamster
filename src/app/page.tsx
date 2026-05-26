"use client"

import { 
  Sparkles, 
  Plus,
  Zap,
  FileText,
  BrainCircuit,
  Bug,
  Heart,
  TrendingUp,
  History,
  Files,
  ArrowUpRight,
  Target,
  Layers,
  Activity,
  Code2,
  Database,
  Cpu,
  ArrowRight,
  Link as LinkIcon
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCollection, useFirestore, useUser } from "@/firebase";
import { collection, query, limit, where, orderBy } from "firebase/firestore";
import React from "react";
import { cn } from "@/lib/utils";
import { LoadingHamster } from "@/components/LoadingHamster";
import { NoteCard } from "@/components/NoteCard";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Area, 
  AreaChart, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip, 
  XAxis, 
  YAxis,
  CartesianGrid
} from "recharts";

const activityData = [
  { name: "Lun", value: 12 },
  { name: "Mar", value: 18 },
  { name: "Mer", value: 15 },
  { name: "Jeu", value: 25 },
  { name: "Ven", value: 22 },
  { name: "Sam", value: 30 },
  { name: "Dim", value: 28 },
];

export default function Home() {
  const router = useRouter()
  const { user, loading: userLoading } = useUser()
  const db = useFirestore()

  const { data: notes } = useCollection<any>(React.useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "notes"), where("userId", "==", user.uid), orderBy("createdAt", "desc"), limit(4));
  }, [db, user]));

  const { data: bugs } = useCollection<any>(React.useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "bugs"), where("userId", "==", user.uid), where("status", "!=", "resolved"));
  }, [db, user]));

  const { data: habits } = useCollection<any>(React.useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "addictions"), where("userId", "==", user.uid));
  }, [db, user]));

  const { data: bookmarks } = useCollection<any>(React.useMemo(() => {
    if (!db || !user) return null;
    return query(collection(db, "bookmarks"), where("userId", "==", user.uid));
  }, [db, user]));

  if (userLoading) return (
    <div className="h-[80vh] flex items-center justify-center">
      <LoadingHamster label="Initialisation du Noyau..." />
    </div>
  )

  if (!user) {
    return (
      <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 pointer-events-none">
          <FloatingIcon icon={BrainCircuit} delay={0} x="10%" y="20%" size={40} />
          <FloatingIcon icon={Code2} delay={1} x="85%" y="15%" size={30} />
          <FloatingIcon icon={Database} delay={2} x="15%" y="75%" size={35} />
          <FloatingIcon icon={Cpu} delay={1.5} x="80%" y="80%" size={45} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-primary/10 rounded-full blur-[80px] md:blur-[100px] animate-pulse" />
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="text-center space-y-6 md:space-y-10 relative z-10 w-full"
        >
          <div className="inline-flex items-center gap-2 px-4 md:px-6 py-1.5 md:py-2 rounded-full bg-white/5 border border-white/10 text-[8px] md:text-[10px] font-bold text-primary tracking-[0.3em] md:tracking-[0.4em] uppercase">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4" /> Second Brain Ecosystem
          </div>
          <h1 className="text-5xl md:text-9xl font-headline font-bold text-white tracking-tighter leading-tight md:leading-none italic">
            QbLog <br />
            <span className="text-primary opacity-80">Antigravity.</span>
          </h1>
          <p className="text-muted-foreground text-sm md:text-2xl max-w-2xl mx-auto leading-relaxed font-light px-4">
            Une interface neurale pour architectes logiciels. <br className="hidden md:block" />Documentez le futur, maîtrisez le présent.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 pt-6 md:pt-10 px-4">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto h-16 md:h-20 px-8 md:px-16 rounded-2xl md:rounded-[2.5rem] bg-primary text-black hover:bg-primary/90 text-lg md:text-2xl font-black shadow-[0_0_50px_rgba(255,177,73,0.3)] transition-all hover:scale-105 active:scale-95 border-none">
                Initialiser le Flux
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto space-y-8 md:space-y-12 py-4 md:py-6 w-full">
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 md:gap-8 pb-2 md:pb-4"
      >
        <div className="space-y-1">
          <p className="text-muted-foreground text-sm md:text-base italic font-light px-2">
            Bienvenue, <span className="text-white font-bold">{user.displayName || 'Architecte'}</span>. Vos flux de données sont synchronisés.
          </p>
        </div>
      </motion.header>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6">
        
        {/* GROWTH CHART CARD */}
        <Card className="md:col-span-12 lg:col-span-8 glass border-white/5 rounded-3xl md:rounded-[2.5rem] overflow-hidden group relative">
          <div className="absolute top-4 right-4 md:top-8 md:right-8 z-10">
             <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-bold text-primary uppercase tracking-widest bg-primary/10 px-2 md:px-3 py-1 rounded-full border border-primary/20">
               <TrendingUp className="h-2.5 w-2.5 md:h-3 md:w-3" /> +24% expansion
             </div>
          </div>
          <CardHeader className="p-6 md:p-8">
            <CardTitle className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 md:h-5 md:w-5 text-primary" /> Croissance du Savoir
            </CardTitle>
            <CardDescription className="text-zinc-500 text-xs md:text-sm">Activité neurale des 7 derniers jours</CardDescription>
          </CardHeader>
          <CardContent className="px-2 md:px-4 pb-4 md:pb-6">
            <div className="h-[200px] md:h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#71717a', fontSize: 10, fontWeight: 700 }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <RechartsTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        return (
                          <div className="bg-black/90 border border-white/10 p-3 rounded-xl shadow-2xl backdrop-blur-md">
                            <p className="text-[10px] font-bold text-primary uppercase mb-1">{payload[0].payload.name}</p>
                            <p className="text-lg md:text-xl font-bold text-white">{payload[0].value} <span className="text-[10px] text-zinc-500">blocs</span></p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorValue)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </Card>

        {/* STATS STACK */}
        <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-3 md:gap-4">
           <PremiumStatCard icon={FileText} count={notes?.length || 0} label="Journal" color="text-blue-500" bg="bg-blue-500/10" isLink onClick={() => router.push('/notes')} />
           <PremiumStatCard icon={Bug} count={bugs?.length || 0} label="Anomalies" color="text-red-500" bg="bg-red-500/10" isLink onClick={() => router.push('/bugs')} />
           <PremiumStatCard icon={LinkIcon} count={bookmarks?.length || 0} label="Nexus" color="text-emerald-500" bg="bg-emerald-500/10" isLink onClick={() => router.push('/links')} />
           <PremiumStatCard icon={Heart} count={habits?.length || 0} label="Discipline" color="text-orange-500" bg="bg-orange-500/10" isLink onClick={() => router.push('/addictions')} />
        </div>

        {/* RECENT ACTIVITY FLOW */}
        <div className="md:col-span-12 lg:col-span-8 space-y-4 md:space-y-6">
           <div className="flex items-center justify-between px-2 md:px-4">
              <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-zinc-500 flex items-center gap-2 md:gap-3">
                <History className="h-3.5 w-3.5 md:h-4 md:w-4" /> Flux Temporel Récent
              </h3>
              <Link href="/notes" className="group flex items-center gap-1.5 md:gap-2 hover:text-primary transition-colors">
                <span className="text-[9px] md:text-[10px] font-black text-zinc-600 group-hover:text-primary transition-colors tracking-widest uppercase">Bibliothèque</span>
                <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3" />
              </Link>
           </div>
           
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
              <AnimatePresence mode="popLayout">
                {notes?.map((n: any, i: number) => (
                  <motion.div
                    key={n.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    whileHover={{ y: -5 }}
                  >
                    <NoteCard 
                      note={n} 
                      onClick={() => router.push(`/notes?id=${n.id}`)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
              
              {(!notes || notes.length === 0) && (
                <div className="col-span-full py-12 md:py-20 text-center glass border-dashed border-white/5 rounded-3xl md:rounded-[2.5rem] opacity-30">
                  <Layers className="h-8 w-8 md:h-10 md:w-10 mx-auto mb-4 text-zinc-700" />
                  <p className="text-xs md:text-sm font-bold">Le second cerveau est vide.</p>
                </div>
              )}
           </div>
        </div>

        {/* AI TIP & STATUS */}
        <div className="md:col-span-12 lg:col-span-4 space-y-4 md:space-y-6">
          <Card className="glass border-white/5 rounded-3xl md:rounded-[2.5rem] p-6 md:p-8 flex flex-col gap-4 md:gap-6 relative overflow-hidden group min-h-[250px] lg:h-full">
             <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all" />
             
             <div className="h-10 w-10 md:h-12 md:w-12 rounded-xl md:rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
               <Zap className="h-5 w-5 md:h-6 md:w-6 text-primary shadow-[0_0_15px_rgba(255,177,73,0.5)]" />
             </div>

             <div className="space-y-3 md:space-y-4">
                <h4 className="text-lg md:text-xl font-bold text-white tracking-tight">Intelligence Neurale</h4>
                <p className="text-xs md:text-sm text-zinc-400 leading-relaxed font-light">
                  L'analyse de vos notes suggère une corrélation forte entre vos bugs <span className="text-red-400">#h3x1</span> et la structure de votre API. Pensez à réviser le bloc "Auth Flow".
                </p>
             </div>

             <div className="mt-auto pt-4 md:pt-6 border-t border-white/5">
                <div className="flex items-center justify-between">
                   <span className="text-[8px] md:text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Latence IA</span>
                   <span className="text-[8px] md:text-[10px] font-mono text-primary font-bold">120ms</span>
                </div>
                <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                   <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "85%" }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-primary" 
                   />
                </div>
             </div>
          </Card>
        </div>

      </div>
    </div>
  );
}

function FloatingIcon({ icon: Icon, delay, x, y, size }: { icon: any, delay: number, x: string, y: string, size: number }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ 
        opacity: [0.1, 0.4, 0.1],
        y: ["-20px", "20px", "-20px"],
        rotate: [0, 10, -10, 0]
      }}
      transition={{ 
        duration: 6, 
        repeat: Infinity, 
        delay,
        ease: "easeInOut"
      }}
      className="absolute text-primary/40 pointer-events-none"
      style={{ top: y, left: x }}
    >
      <Icon size={size} strokeWidth={1} />
    </motion.div>
  )
}

function PremiumStatCard({ icon: Icon, count, label, color, bg, isLink = false, onClick }: { icon: any, count: number, label: string, color: string, bg: string, isLink?: boolean, onClick?: () => void }) {
  return (
    <Card 
      onClick={onClick}
      className={cn(
        "p-4 md:p-6 rounded-2xl md:rounded-[2rem] bg-zinc-950/40 border border-white/5 flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 transition-all hover:border-primary/30 hover:bg-white/5 active:scale-95 group w-full",
        isLink && "cursor-pointer"
      )}
    >
       <div className={cn("h-10 w-10 md:h-12 md:w-12 rounded-lg md:rounded-xl flex items-center justify-center transition-all group-hover:scale-110 duration-500", bg)}>
         <Icon className={cn("h-5 w-5 md:h-6 md:w-6", color)} />
       </div>
       <div className="space-y-0.5 md:space-y-1">
         {count >= 0 ? (
           <div className="text-2xl md:text-3xl font-mono font-black text-white tracking-tighter">{count}</div>
         ) : (
           <div className="text-[7px] md:text-[9px] font-black text-primary py-0.5 md:py-1 uppercase tracking-[0.15em] md:tracking-[0.2em] border border-primary/20 rounded-full px-1.5 md:px-2">Action</div>
         )}
         <div className="text-[7px] md:text-[9px] uppercase font-black tracking-[0.15em] md:tracking-[0.2em] text-zinc-600 group-hover:text-zinc-400 transition-colors">{label}</div>
       </div>
    </Card>
  )
}
