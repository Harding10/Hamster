"use client"

import * as React from "react"
import { Sparkles, Send, Zap, MessageSquare, Terminal, RefreshCw, Code2, Bug as BugIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { techAssistant } from "@/ai/flows/tech-assistant"
import { useToast } from "@/hooks/use-toast"

export default function AIAssistantPage() {
  const { toast } = useToast()
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [messages, setMessages] = React.useState([
    { role: 'assistant', content: 'Bonjour ! Je suis votre compagnon IA QbLog. Je peux vous aider à refactoriser du code, déboguer des erreurs complexes ou expliquer des concepts techniques. Par quoi commençons-nous ?' }
  ])

  const handleSend = async () => {
    if (!input.trim() || loading) return
    
    const userMessage = input.trim()
    const newMessages = [...messages, { role: 'user', content: userMessage }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const result = await techAssistant({ message: userMessage })
      setMessages([...newMessages, { role: 'assistant', content: result.reply }])
    } catch (e) {
      toast({ variant: "destructive", title: "Erreur IA", description: "L'assistant n'a pas pu répondre." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto h-full md:h-[calc(100vh-140px)] flex flex-col gap-4 md:gap-6 px-1 md:px-0 pb-20 md:pb-0 w-full overflow-hidden">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-1">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-white/5 shrink-0">
            <Sparkles className="h-5 w-5 md:h-6 md:w-6 text-black" />
          </div>
          <div className="overflow-hidden">
            <h1 className="text-lg md:text-2xl font-headline font-bold text-white truncate">Cerveau Technique IA</h1>
            <p className="text-[8px] md:text-xs text-muted-foreground uppercase tracking-widest font-mono truncate">ASSISTANT PROPULSÉ PAR LLM</p>
          </div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
           <Button variant="outline" className="flex-1 sm:flex-none border-white/10 h-8 md:h-9 bg-white/5 text-[10px] md:text-xs" onClick={() => setMessages([messages[0]])}><RefreshCw className="mr-2 h-3 w-3" /> Réinitialiser</Button>
        </div>
      </div>

      <div className="flex-1 glass border-white/5 flex flex-col overflow-hidden relative rounded-2xl md:rounded-3xl min-h-[300px] w-full">
        <ScrollArea className="flex-1 p-3 md:p-6 w-full">
          <div className="space-y-4 md:space-y-6 w-full">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} w-full`}>
                <div className={`max-w-[95%] md:max-w-[85%] p-3 md:p-4 rounded-xl md:rounded-2xl ${m.role === 'user' ? 'bg-white text-black' : 'bg-white/5 border border-white/10 text-zinc-300'} shadow-sm`}>
                   <p className="text-[11px] md:text-sm leading-relaxed whitespace-pre-wrap break-words">{m.content}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-xl md:rounded-2xl">
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 md:p-6 border-t border-white/10 bg-white/[0.01] shrink-0">
          <div className="relative">
            <Textarea 
              placeholder="Posez votre question technique..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="min-h-[60px] md:min-h-[100px] bg-white/5 border-white/10 focus-visible:ring-white/20 resize-none rounded-xl pr-10 md:pr-12 text-xs md:text-sm scrollbar-hide"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute bottom-2 right-2 h-7 w-7 md:h-8 md:w-8 bg-white text-black hover:bg-zinc-200 rounded-lg border-none"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              <Send className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </Button>
          </div>
          <div className="mt-2.5 flex flex-row items-center justify-between gap-2 px-1">
            <div className="flex gap-2 md:gap-3">
              <span className="flex items-center text-[7px] md:text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                <Zap className="h-2 w-2 md:h-2.5 md:w-2.5 mr-1 text-yellow-500" /> Gemini 2.5
              </span>
              <span className="flex items-center text-[7px] md:text-[9px] text-muted-foreground uppercase tracking-wider font-semibold">
                <MessageSquare className="h-2 w-2 md:h-2.5 md:w-2.5 mr-1 text-blue-500" /> Mode: Expert Tech
              </span>
            </div>
            <span className="text-[7px] md:text-[9px] text-muted-foreground font-mono hidden sm:block uppercase tracking-widest">Entrée pour envoyer</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 pb-4 px-1">
        <SuggestionCard icon={Code2} title="Refactoriser" desc="Optimiser boucles" onClick={() => setInput("Peux-tu m'aider à refactoriser une boucle complexe en JavaScript ?")} />
        <SuggestionCard icon={BugIcon} title="Fixer Erreur" desc="Analyser logs" onClick={() => setInput("J'ai une erreur 'Hydration failed' dans Next.js, que faire ?")} />
        <SuggestionCard icon={Zap} title="Architecture" desc="Suggérer archi" onClick={() => setInput("Quelle est la meilleure structure pour un projet Next.js avec Firebase ?")} />
      </div>
    </div>
  )
}

function SuggestionCard({ icon: Icon, title, desc, onClick }: { icon: any, title: string, desc: string, onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-2.5 md:p-4 rounded-xl md:rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all text-left group flex items-center sm:block gap-3 sm:gap-0">
      <div className="h-7 w-7 md:h-8 md:w-8 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 mb-0 sm:mb-3 group-hover:scale-110 transition-transform shrink-0">
        <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
      </div>
      <div className="overflow-hidden">
        <h3 className="text-[10px] md:text-sm font-semibold text-white mb-0.5 md:mb-1 truncate">{title}</h3>
        <p className="text-[8px] md:text-xs text-muted-foreground truncate">{desc}</p>
      </div>
    </button>
  )
}
