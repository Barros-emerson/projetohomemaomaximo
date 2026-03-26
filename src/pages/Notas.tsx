import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { StickyNote, Plus, Trash2, X } from "lucide-react";

interface Nota {
  id: string;
  title: string;
  content: string;
  color: string;
  createdAt: string;
}

const COLORS = [
  "hsla(var(--primary) / 0.08)",
  "hsla(var(--accent) / 0.08)",
  "hsla(270 55% 65% / 0.1)",
  "hsla(38 92% 60% / 0.1)",
  "hsla(0 80% 65% / 0.1)",
];

const loadNotas = (): Nota[] => {
  const saved = localStorage.getItem("ham-notas");
  return saved ? JSON.parse(saved) : [];
};

const SwipeableNota = ({
  nota,
  index,
  onTap,
  onRequestDelete,
}: {
  nota: Nota;
  index: number;
  onTap: () => void;
  onRequestDelete: () => void;
}) => {
  const x = useMotionValue(0);
  const bg = useTransform(x, [-120, -60, 0], [
    "hsl(0 70% 50%)",
    "hsl(0 60% 55%)",
    "hsl(0 0% 50%)",
  ]);
  const opacity = useTransform(x, [-100, -40, 0], [1, 0.6, 0]);

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (info.offset.x < -80) {
      onRequestDelete();
    }
  };

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Delete background */}
      <motion.div
        className="absolute inset-0 flex items-center justify-end pr-5 rounded-2xl"
        style={{ backgroundColor: bg }}
      >
        <motion.div style={{ opacity }}>
          <Trash2 size={18} className="text-white" />
        </motion.div>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.03 }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.3}
        onDragEnd={handleDragEnd}
        style={{ x }}
        onClick={onTap}
        className="relative surface-card p-4 cursor-pointer active:scale-[0.98] transition-transform"
      >
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
          style={{ background: nota.color.replace("0.08", "0.5").replace("0.1", "0.5") }}
        />
        <p className="font-mono text-xs font-bold text-foreground">{nota.title}</p>
        {nota.content && (
          <p className="font-mono text-[11px] text-muted-foreground mt-1 line-clamp-2">{nota.content}</p>
        )}
        <p className="font-mono text-[9px] text-muted-foreground/50 mt-2">{nota.createdAt}</p>
      </motion.div>
    </div>
  );
};

const Notas = () => {
  const [notas, setNotas] = useState<Nota[]>(loadNotas);
  const [editing, setEditing] = useState<Nota | null>(null);
  const [showNew, setShowNew] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("ham-notas", JSON.stringify(notas));
  }, [notas]);

  const addNota = () => {
    if (!newTitle.trim() && !newContent.trim()) return;
    const nota: Nota = {
      id: Date.now().toString(),
      title: newTitle.trim() || "Sem título",
      content: newContent.trim(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      createdAt: new Date().toLocaleDateString("pt-BR"),
    };
    setNotas((prev) => [nota, ...prev]);
    setNewTitle("");
    setNewContent("");
    setShowNew(false);
  };

  const deleteNota = (id: string) => {
    setNotas((prev) => prev.filter((n) => n.id !== id));
    setEditing(null);
    setConfirmDelete(null);
  };

  const updateNota = (nota: Nota) => {
    setNotas((prev) => prev.map((n) => (n.id === nota.id ? nota : n)));
    setEditing(null);
  };

  return (
    <div className="p-4 space-y-3 pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <StickyNote size={16} className="text-primary" />
          <h2 className="font-mono text-xs font-bold tracking-[0.15em] text-foreground uppercase">
            Minhas Notas
          </h2>
        </div>
        <button
          onClick={() => setShowNew(true)}
          className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus size={16} className="text-primary" />
        </button>
      </motion.div>

      {/* New note */}
      <AnimatePresence>
        {showNew && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="surface-card p-4 space-y-3">
              <input
                autoFocus
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Título da nota..."
                className="w-full bg-transparent font-mono text-sm font-bold text-foreground placeholder:text-muted-foreground/40 outline-none"
              />
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                placeholder="Escreva aqui..."
                rows={4}
                className="w-full bg-secondary/50 rounded-xl p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground/40 outline-none resize-none border border-border/50 focus:border-primary/30 transition-colors"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowNew(false); setNewTitle(""); setNewContent(""); }}
                  className="flex-1 py-2.5 rounded-xl border border-border font-mono text-[10px] font-bold tracking-wider text-muted-foreground active:scale-95"
                >
                  CANCELAR
                </button>
                <button
                  onClick={addNota}
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground font-mono text-[10px] font-bold tracking-wider active:scale-95"
                >
                  SALVAR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty */}
      {notas.length === 0 && !showNew && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="surface-card p-8 text-center">
          <StickyNote size={28} className="text-muted-foreground/30 mx-auto mb-3" />
          <p className="font-mono text-[11px] text-muted-foreground">
            Nenhuma nota ainda. Toque + para criar.
          </p>
        </motion.div>
      )}

      {/* Notes list */}
      <div className="space-y-2">
        {notas.map((nota, i) => (
          <SwipeableNota
            key={nota.id}
            nota={nota}
            index={i}
            onTap={() => setEditing(nota)}
            onRequestDelete={() => setConfirmDelete(nota.id)}
          />
        ))}
      </div>

      {/* Confirm delete dialog */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-6"
            onClick={() => setConfirmDelete(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-2xl p-5 w-full max-w-xs space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <Trash2 size={24} className="text-destructive mx-auto mb-2" />
                <p className="font-mono text-sm font-bold text-foreground">Apagar nota?</p>
                <p className="font-mono text-[11px] text-muted-foreground mt-1">
                  Essa ação não pode ser desfeita.
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 rounded-xl border border-border font-mono text-[10px] font-bold tracking-wider text-muted-foreground active:scale-95"
                >
                  CANCELAR
                </button>
                <button
                  onClick={() => deleteNota(confirmDelete)}
                  className="flex-1 py-2.5 rounded-xl bg-destructive text-destructive-foreground font-mono text-[10px] font-bold tracking-wider active:scale-95"
                >
                  APAGAR
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md p-4 flex flex-col"
          >
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setEditing(null)} className="active:scale-90">
                <X size={20} className="text-muted-foreground" />
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmDelete(editing.id)}
                  className="p-2 rounded-lg bg-destructive/10 active:scale-95"
                >
                  <Trash2 size={16} className="text-destructive" />
                </button>
                <button
                  onClick={() => updateNota(editing)}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-[10px] font-bold tracking-wider active:scale-95"
                >
                  SALVAR
                </button>
              </div>
            </div>
            <input
              value={editing.title}
              onChange={(e) => setEditing({ ...editing, title: e.target.value })}
              className="w-full bg-transparent font-mono text-base font-bold text-foreground outline-none mb-3"
            />
            <textarea
              value={editing.content}
              onChange={(e) => setEditing({ ...editing, content: e.target.value })}
              className="flex-1 w-full bg-secondary/30 rounded-xl p-4 font-mono text-xs text-foreground outline-none resize-none border border-border/50 focus:border-primary/30 transition-colors"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notas;
