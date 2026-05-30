
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Plus,
  FileText,
  Files,
  LogOut,
  User as UserIcon,
  Zap,
  Sparkles,
  Bug,
  KeyRound,
  Calendar,
  Heart,
  Settings,
  HelpCircle,
  Link as LinkIcon
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUser, useAuth } from "@/firebase"
import { 
  signOut, 
} from "firebase/auth"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { useAgendaReminders } from "@/hooks/use-agenda-reminders"
import { cn } from "@/lib/utils"
import { PlaceHolderImages } from "@/lib/placeholder-images"

const navigation = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Journal Tech", href: "/notes", icon: FileText },
  { name: "Suivi des Bugs", href: "/bugs", icon: Bug },
  { name: "Coffre de Code", href: "/snippets", icon: KeyRound },
  { name: "Nexus de Liens", href: "/links", icon: LinkIcon },
  { name: "Fichiers", href: "/files", icon: Files },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Liberté & Habitudes", href: "/addictions", icon: Heart },
  { name: "Assistant IA", href: "/ai", icon: Sparkles },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useUser()
  const auth = useAuth()
  const { toast } = useToast()

  // Déclencher la vérification de l'agenda
  useAgendaReminders()

  const [displayName, setDisplayName] = React.useState("")
  const [photoURL, setPhotoURL] = React.useState("")



  React.useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "")
      setPhotoURL(user.photoURL || "")
    }
  }, [user])

  const handleLogout = async () => {
    await signOut(auth)
    router.push("/login")
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-white/5">
      <SidebarHeader className="h-24 flex items-center justify-center px-4 overflow-hidden">
        <Link href="/" className="flex items-center gap-3 w-full group">
          <div className="h-12 w-12 flex items-center justify-center relative overflow-hidden shrink-0">
            <Image 
              src="/logo.png" 
              alt="QbLog Logo" 
              width={48}
              height={48}
              className="object-cover"
              unoptimized
            />
          </div>
          <span className="font-headline font-bold text-2xl tracking-tighter italic text-foreground group-data-[collapsible=icon]:hidden">
            QbLog<span className="text-primary">.</span>
          </span>
        </Link>
      </SidebarHeader>
      
      <SidebarSeparator className="opacity-5 mx-4" />
      
      <SidebarContent className="px-4 py-6">
        <SidebarMenu className="gap-1.5">
          {user && (
            <SidebarMenuItem className="mb-4">
              <SidebarMenuButton 
                asChild 
                className="h-11 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-lg"
              >
                <Link href="/notes?new=true">
                  <Plus className="h-5 w-5" />
                  <span className="font-bold text-sm text-primary-foreground">Nouvelle Note</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}

          {navigation.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton 
                asChild 
                isActive={pathname === item.href}
                tooltip={item.name}
                className="h-10 rounded-xl transition-all hover:bg-accent"
              >
                <Link href={item.href}>
                  <item.icon className={cn("h-4.5 w-4.5", pathname === item.href ? 'text-primary' : 'text-muted-foreground')} />
                  <span className="font-bold text-sm">{item.name}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      
      <SidebarFooter className="p-4">
        <SidebarMenu>
          {user ? (
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton 
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground h-14 rounded-xl border border-white/5 bg-accent/30"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0 overflow-hidden relative border border-border">
                         {photoURL ? (
                           <Image src={photoURL} alt="Avatar" fill className="object-cover" unoptimized />
                         ) : (
                           <UserIcon className="h-4 w-4 text-foreground" />
                         )}
                      </div>
                      <div className="flex flex-col min-w-0 group-data-[collapsible=icon]:hidden text-left">
                        <span className="text-[11px] font-bold text-foreground truncate">{displayName || user.email?.split('@')[0]}</span>
                        <span className="text-[8px] text-muted-foreground uppercase tracking-widest font-mono">MON COMPTE</span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent 
                  className="w-[--radix-dropdown-menu-trigger-width] min-w-56 glass rounded-2xl border-white/10 p-0 overflow-hidden shadow-2xl"
                  side="top"
                  align="end"
                  sideOffset={4}
                >
                  <DropdownMenuLabel className="p-0 font-normal">
                    <div className="flex items-center gap-2 px-3 py-2 text-left text-sm bg-white/5">
                       <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden relative border border-border">
                         {photoURL ? (
                           <Image src={photoURL} alt="Avatar" fill className="object-cover" unoptimized />
                         ) : (
                           <UserIcon className="h-4 w-4 text-foreground" />
                         )}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold text-foreground">{displayName || "Développeur"}</span>
                        <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/5 m-0" />
                  <DropdownMenuGroup className="p-1">
                    <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg" onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator className="bg-white/5 m-0" />
                  <div className="p-1">
                    <DropdownMenuItem className="rounded-lg" onClick={() => toast({ title: "Centre d'aide", description: "L'assistance est en cours de déploiement." })}>
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Aide</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 focus:text-red-300 focus:bg-red-500/10" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Déconnexion</span>
                    </DropdownMenuItem>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="bg-accent text-foreground">
                <Link href="/login">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-bold text-sm">Connexion</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
