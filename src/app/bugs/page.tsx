"use client";

import * as React from "react";
import { 
  Plus, 
  Trash2, 
  Flame, 
  Sparkles, 
  Bug as BugIcon, 
  Loader2,
  MoreVertical,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  Zap,
  Edit2,
  Save,
  Trash
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useFirestore, useCollection, useUser } from "@/firebase";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  updateDoc, 
  doc, 
  query, 
  where, 
  deleteDoc,
  Firestore,
  orderBy
} from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { errorEmitter } from "@/firebase/error-emitter";
import { FirestorePermissionError } from "@/firebase/errors";
import { aiDebuggingAssistant } from "@/ai/flows/ai-debugging-assistant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ColumnType = "backlog" | "todo" | "in-progress" | "resolved";
type PriorityType = "basse" | "moyenne" | "haute" | "critique";

interface Bug {
  id: string;
  title: string;
  description?: string;
  status: ColumnType;
  priority: PriorityType;
  userId: string;
  createdAt: any;
}

const COLUMNS: { id: ColumnType; label: string; color: string; icon: any }[] = [
  { id: "backlog", label: "Backlog", color: "text-neutral-500", icon: Clock },
  { id: "todo", label: "À Faire", color: "text-yellow-400", icon: AlertCircle },
  { id: "in-progress", label: "En Cours", color: "text-blue-400", icon: Zap },
  { id: "resolved", label: "Terminé", color: "text-emerald-400", icon: CheckCircle2 },
];

const PRIORITY_COLORS: Record<PriorityType, string> = {
  basse: "bg-blue-500",
  moyenne: "bg-yellow-500",
  haute: "bg-orange-500",
  critique: "bg-red-600",
};

export default function KanbanPage() {
  const db = useFirestore();
  const { user } = useUser();

  const q = React.useMemo(() => {
    if (!db || !user) return null;
    return query(
      collection(db, "bugs"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
  }, [db, user]);

  const { data: bugs, loading } = useCollection<Bug>(q);

  if (loading) {
    return (
      <div className="h-[calc(100vh-140px)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="h-full w-full text-neutral-50 flex flex-col space-y-6 md:space-y-8 overflow-hidden">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 shadow-xl">
              <BugIcon className="h-4 w-4 md:h-5 md:w-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-headline font-bold text-white tracking-tighter">Bug Tracker.</h1>
          </div>
          <p className="text-muted-foreground text-[10px] md:text-sm italic ml-1">Gérez vos tickets par glisser-déposer.</p>
        </div>
      </header>
      
      <div className="flex-1 overflow-x-auto pb-6 scrollbar-hide">
        <div className="flex h-full gap-4 md:gap-6 min-w-max p-2">
          {COLUMNS.map((col) => (
            <Column
              key={col.id}
              title={col.label}
              column={col.id}
              headingColor={col.color}
              icon={col.icon}
              cards={bugs || []}
              db={db}
              userId={user?.uid || ""}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const Column = ({
  title,
  headingColor,
  cards,
  column,
  icon: Icon,
  db,
  userId
}: {
  title: string;
  headingColor: string;
  cards: Bug[];
  column: ColumnType;
  icon: any;
  db: Firestore;
  userId: string;
}) => {
  const { toast } = useToast();
  const [active, setActive] = React.useState(false);

  const handleDragStart = (e: React.DragEvent, card: Bug) => {
    e.dataTransfer.setData("cardId", card.id);
  };

  const handleDragEnd = (e: React.DragEvent) => {
    const cardId = e.dataTransfer.getData("cardId");
    setActive(false);
    if (cardId) {
      updateDoc(doc(db, "bugs", cardId), { status: column })
        .then(() => {
          if (column === "resolved") {
            toast({ title: "Bug résolu !", description: "Le ticket a été déplacé vers terminé." })
            addDoc(collection(db, "notifications"), {
              userId,
              title: "Ticket clôturé",
              message: "Un bug a été marqué comme résolu.",
              type: "success",
              read: false,
              createdAt: serverTimestamp()
            })
          }
        })
        .catch(err => errorEmitter.emit('permission-error', new FirestorePermissionError({ path: `bugs/${cardId}`, operation: 'update' })));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setActive(true);
  };

  const filteredCards = cards.filter((c) => c.status === column);

  return (
    <div className="w-[280px] md:w-[300px] shrink-0 flex flex-col h-full">
      <div className="mb-4 flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <Icon className={cn("h-3.5 w-3.5 md:h-4 md:w-4", headingColor)} />
          <h3 className={cn("font-bold text-[10px] md:text-xs uppercase tracking-widest", headingColor)}>{title}</h3>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[8px] md:text-[10px] font-bold text-neutral-400 border border-white/5">
          {filteredCards.length}
        </span>
      </div>
      
      <div
        onDrop={handleDragEnd}
        onDragOver={handleDragOver}
        onDragLeave={() => setActive(false)}
        className={cn(
          "flex-1 rounded-2xl md:rounded-[2rem] transition-all duration-300 min-h-[200px] p-2 flex flex-col gap-2",
          active ? "bg-white/[0.04]" : "bg-white/[0.01]"
        )}
      >
        <AnimatePresence>
          {filteredCards.map((c) => (
            <BugCard key={c.id} bug={c} handleDragStart={handleDragStart} db={db} userId={userId} />
          ))}
        </AnimatePresence>
        <AddCard column={column} db={db} userId={userId} />
      </div>
    </div>
  );
};

const BugCard = ({ bug, handleDragStart, db, userId }: { bug: Bug, handleDragStart: Function, db: Firestore, userId: string }) => {
  const { toast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState(bug.title);
  const [editDesc, setEditDesc] = React.useState(bug.description || "");

  const handleUpdate = () => {
    if (!editTitle.trim()) return;
    updateDoc(doc(db, "bugs", bug.id), { title: editTitle.trim(), description: editDesc.trim() })
      .then(() => {
        toast({ title: "Bug mis à jour", description: "Le contenu du ticket a été modifié." });
        setIsEditing(false);
      });
  };

  const handleAIDebug = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAnalyzing(true);
    try {
      const result = await aiDebuggingAssistant({
        errorLog: bug.description || bug.title,
        codeSnippet: "Contexte du ticket."
      });
      toast({ title: "Analyse IA terminée", description: result.explanation.slice(0, 100) + "..." });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <DropIndicator beforeId={bug.id} column={bug.status} />
      <motion.div
        layout
        layoutId={bug.id}
        draggable="true"
        onDragStart={(e) => handleDragStart(e, bug)}
        className="group relative cursor-grab active:cursor-grabbing rounded-xl border border-white/5 bg-neutral-900 p-3 md:p-4 transition-all hover:border-white/20 hover:bg-neutral-800/50"
      >
        <div className={cn("absolute left-0 top-1/2 -translate-y-1/2 w-1 h-2/3 rounded-r-full", PRIORITY_COLORS[bug.priority])} />
        
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <p className="text-xs md:text-sm font-medium text-neutral-100 leading-tight line-clamp-2">
              {bug.title}
            </p>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <button onClick={handleAIDebug} className="p-1 hover:text-blue-400 transition-colors" title="Analyse IA">
                 <Sparkles className={cn("h-3 w-3 md:h-3.5 md:w-3.5", isAnalyzing && "animate-spin")} />
               </button>
               <DropdownMenu>
                 <DropdownMenuTrigger asChild>
                   <button className="p-1 hover:text-white transition-colors">
                    <MoreVertical className="h-3 w-3 md:h-3.5 md:w-3.5" />
                   </button>
                 </DropdownMenuTrigger>
                 <DropdownMenuContent align="end" className="glass border-white/10 rounded-xl">
                   <DropdownMenuItem onClick={() => setIsEditing(true)}><Edit2 className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                   <DropdownMenuSeparator className="bg-white/5" />
                   <DropdownMenuItem className="text-red-400" onClick={() => deleteDoc(doc(db, "bugs", bug.id))}><Trash className="h-4 w-4 mr-2" /> Supprimer</DropdownMenuItem>
                 </DropdownMenuContent>
               </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
            <div className="flex items-center gap-2">
              <span className="font-mono">#{bug.id.slice(-4)}</span>
              <span className={cn("px-1.5 py-0.5 rounded-full bg-white/5", bug.priority === 'critique' ? "text-red-400" : "text-neutral-500")}>
                {bug.priority}
              </span>
            </div>
            {bug.description && <div className="h-1 w-1 md:h-1.5 md:w-1.5 rounded-full bg-blue-500/50" title="Contient une description" />}
          </div>
        </div>
      </motion.div>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="glass border-white/10 rounded-2xl md:rounded-[2rem] max-w-[95vw] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Modifier le Bug</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Titre..." className="bg-white/5 border-white/10 h-11" />
            <Textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Logs ou description..." className="min-h-[120px] md:min-h-[150px] bg-white/5 border-white/10 text-xs md:text-sm" />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-white text-black font-bold rounded-xl h-11 w-full sm:w-auto"><Save className="mr-2 h-4 w-4" /> Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

const DropIndicator = ({ beforeId, column }: { beforeId: string | null; column: string }) => {
  return (
    <div
      data-before={beforeId || "-1"}
      data-column={column}
      className="my-0.5 h-0.5 w-full bg-blue-500 opacity-0 transition-opacity duration-200"
    />
  );
};

const AddCard = ({ column, db, userId }: { column: ColumnType, db: Firestore, userId: string }) => {
  const { toast } = useToast();
  const [text, setText] = React.useState("");
  const [adding, setAdding] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    const bugData = {
      title: text.trim(),
      status: column,
      priority: "moyenne",
      userId,
      createdAt: serverTimestamp()
    }
    addDoc(collection(db, "bugs"), bugData).then(() => {
      toast({ title: "Bug ajouté", description: "Le ticket a été créé avec succès." })
      addDoc(collection(db, "notifications"), {
        userId,
        title: "Nouveau bug signalé",
        message: `Le ticket "${bugData.title}" a été ajouté à votre tracker.`,
        type: "warning",
        read: false,
        createdAt: serverTimestamp()
      })
    })
    setAdding(false);
    setText("");
  };

  return (
    <div className="mt-2">
      {adding ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <textarea
            onChange={(e) => setText(e.target.value)}
            autoFocus
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3 text-[10px] md:text-xs text-white resize-none focus:outline-none focus:border-blue-500/50 min-h-[60px]"
            placeholder="Nouveau bug..."
          />
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)} className="text-[8px] md:text-[10px] uppercase font-bold text-zinc-500 h-8">Annuler</Button>
            <Button size="sm" type="submit" className="bg-white text-black font-bold h-8 px-3 rounded-lg text-[10px]">Ajouter</Button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-white/5 text-[8px] md:text-[10px] font-bold uppercase text-neutral-500 hover:text-white transition-all"
        >
          <Plus className="h-2.5 w-2.5 md:h-3 md:w-3" /> Nouveau ticket
        </button>
      )}
    </div>
  );
};
