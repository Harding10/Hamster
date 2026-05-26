'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Bug, 
  KeyRound 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { useUser } from '@/firebase';

const links = [
  { title: "Accueil", icon: LayoutDashboard, href: "/" },
  { title: "Journal", icon: FileText, href: "/notes" },
  { title: "Bugs", icon: Bug, href: "/bugs" },
  { title: "Snippets", icon: KeyRound, href: "/snippets" },
];

export function FloatingDock() {
  const pathname = usePathname();
  const { user, loading } = useUser();
  let mouseX = useMotionValue(Infinity);

  // Ne pas afficher si l'utilisateur n'est pas connecté ou si le chargement est en cours
  if (loading || !user) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 md:hidden">
      <motion.div
        onMouseMove={(e) => mouseX.set(e.pageX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        className="flex items-end gap-3 px-4 py-3 rounded-[2.5rem] bg-white/[0.03] dark:bg-black/[0.1] border border-white/10 dark:border-white/5 shadow-2xl backdrop-blur-2xl h-16"
      >
        {links.map((link) => (
          <IconContainer 
            mouseX={mouseX} 
            key={link.title} 
            {...link} 
            isActive={pathname === link.href}
          />
        ))}
      </motion.div>
    </div>
  );
}

function IconContainer({
  mouseX,
  title,
  icon: Icon,
  href,
  isActive
}: {
  mouseX: any;
  title: string;
  icon: any;
  href: string;
  isActive: boolean;
}) {
  let ref = useRef<HTMLDivElement>(null);

  let distance = useTransform(mouseX, (val: number) => {
    let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  let sizeTransform = useTransform(distance, [-100, 0, 100], [40, 64, 40]);
  let iconSizeTransform = useTransform(distance, [-100, 0, 100], [20, 32, 20]);

  let size = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });
  let iconSize = useSpring(iconSizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  const [hovered, setHovered] = useState(false);

  return (
    <Link href={href}>
      <motion.div
        ref={ref}
        style={{ width: size, height: size }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          "relative flex items-center justify-center rounded-full transition-colors",
          isActive 
            ? "bg-primary text-primary-foreground shadow-[0_0_20px_rgba(0,0,0,0.1)]" 
            : "bg-white/5 dark:bg-black/10 text-muted-foreground hover:bg-white/10 hover:text-foreground border border-white/5"
        )}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              initial={{ opacity: 0, y: 10, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: 2, x: "-50%" }}
              className="px-2 py-1 whitespace-nowrap rounded-lg bg-popover border border-border text-popover-foreground absolute left-1/2 -top-12 text-[9px] font-bold uppercase tracking-widest pointer-events-none shadow-xl"
            >
              {title}
            </motion.div>
          )}
        </AnimatePresence>
        <motion.div style={{ width: iconSize, height: iconSize }} className="flex items-center justify-center">
          <Icon className="h-full w-full" />
        </motion.div>
      </motion.div>
    </Link>
  );
}
