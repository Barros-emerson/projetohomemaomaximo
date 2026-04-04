import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Clock, X, ChevronLeft, ChevronRight, Utensils, Droplets, AlertTriangle, Calendar } from "lucide-react";
import { rotinaSemanal, type RotinaItem } from "@/data/rotina-diaria";
import { dietaSemanal } from "@/data/dieta-semanal";
import { getLocalDateStr } from "@/lib/dateUtils";

const getTodayIndex = () => { const d = new Date().getDay(); return d === 0 ? 6 : d - 1; };
const parseTime = (t: string): number | null => { const m = t.match(/^(\d{1,2}):(\d{2})$/); if (!m) return null; return parseInt(m[1]) * 60 + parseInt(m[2]); };
const formatMinutes = (mins: number): string => { const h = Math.floor(mins / 60); const m = mins % 60; return `${h}:${m.toString().padStart(2, "0")}`; };

// ─── TIPO DE DIA ─────────────────────────────────────────────────────────────

export type TipoDia = "normal" | "feriado" | "doenca" | "viagem" | "livre";

interface TipoDiaConfig {
  id: TipoDia; label: string; emoji: string; color: string;
  bg: string; border: string; mensagem: string; contaScore: boolean;
}

export const TIPOS_DIA: TipoDiaConfig[] = [
  { id: "normal",   label: "Normal",  emoji: "🗓️", color: "#4ADE80", bg: "rgba(74,222,128,0.1)",    border: "rgba(74,222,128,0.3)",    mensagem: "Protocolo ativo. Execute.",                        contaScore: true },
  { id: "feriado",  label: "Feriado", emoji: "🏖️", color: "#FBBF24", bg: "rgba(251,191,36,0.1)",    border: "rgba(251,191,36,0.3)",    mensagem: "Feriado. Rotina arquivada. Streak protegido.",      contaScore: false },
  { id: "doenca",   label: "Doença",  emoji: "🤒", color: "#F87171", bg: "rgba(248,113,113,0.1)",   border: "rgba(248,113,113,0.3)",   mensagem: "Prioridade: recuperação. Descanse sem culpa.",       contaScore: false },
  { id: "viagem",   label: "Viagem",  emoji: "✈️", color: "#60A5FA", bg: "rgba(96,165,250,0.1)",    border: "rgba(96,165,250,0.3)",    mensagem: "Em viagem. Execute o possível. Sem penalidade.",    contaScore: false },
  { id: "livre",    label: "Livre",   emoji: "☀️", color: "#C084FC", bg: "rgba(192,132,252,0.1)",   border: "rgba(192,132,252,0.3)",   mensagem: "Dia livre escolhido. Recarregue.",                  contaScore: false },
];

export const getTipoDiaHoje = (): TipoDia => {
  try { const s = localStorage.getItem(`ham-tipoDia-${getLocalDateStr()}`); if (s && TIPOS_DIA.find(t => t.id === s)) return s as TipoDia; } catch {}
  return "normal";
};

const loadTipoDia = (dateStr: string): TipoDia => {
  try { const s = localStorage.getItem(`ham-tipoDia-${dateStr}`); if (s && TIPOS_DIA.find(t => t.id === s)) return s as TipoDia; } catch {}
  return "normal";
};

// ─── STORAGE ─────────────────────────────────────────────────────────────────

const getStorageKey = (dayIdx: number) => `ham-checklist-${dayIdx}-${getLocalDateStr()}`;
const loadChecked = (dayIdx: number): Set<string> => { try { const s = localStorage.getItem(getStorageKey(dayIdx)); return s ? new Set(JSON.parse(s)) : new Set(); } catch { return new Set(); } };
const loadRealTimes = (dayIdx: number): Record<string, string> => { try { const s = localStorage.getItem(`ham-checklist-times-${dayIdx}-${getLocalDateStr()}`); return s ? JSON.parse(s) : {}; } catch { return {}; } };

// ─── SWIPEABLE ────────────────────────────────────────────────────────────────

interface AdjustedItem extends RotinaItem { adjustedTime: string | null; deltaMinutes: number; }
const SWIPE_THRESHOLD = 80;

const SwipeableItem = ({ children, index, isDone, disabled, onSwipeRight, onSwipeLeft }: {
  children: React.ReactNode; index: number; isDone: boolean; disabled?: boolean;
  onSwipeRight: () => void; onSwipeLeft: () => void;
}) => {
  const x = useMotionValue(0);
  const bgOpacity = useTransform(x, [-120, -60, 0, 60, 120], [1, 0.6, 0, 0.6, 1]);
  const checkScale = useTransform(x, [0, 60, 120], [0, 0.8, 1]);
  const editScale = useTransform(x, [-120, -60, 0], [1, 0.8, 0]);
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (disabled) return;
    if (info.offset.x > SWIPE_THRESHOLD) onSwipeRight();
    else if (info.offset.x < -SWIPE_THRESHOLD) onSwipeLeft();
  };
  return (
    <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.02 }} className="relative overflow-hidden rounded-lg">
      <motion.div className="absolute inset-0 flex items-center justify-start pl-5 rounded-lg" style={{ opacity: bgOpacity, background: "linear-gradient(90deg, hsl(142 72% 50% / 0.15), transparent)" }}>
        <motion.div style={{ scale: checkScale }}><Check size={22} className="text-primary" /></motion.div>
      </motion.div>
      <motion.div className="absolute inset-0 flex items-center justify-end pr-5 rounded-lg" style={{ opacity: bgOpacity, background: "linear-gradient(270deg, rgba(251,146,60,0.15), transparent)" }}>
        <motion.div style={{ scale: editScale }}><Clock size={20} style={{ color: "#FB923C" }} /></motion.div>
      </motion.div>
      <motion.div drag={disabled ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4} onDragEnd={handleDragEnd} style={{ x }}
        className={`relative z-10 surface-card px-4 py-3 flex items-start gap-3 cursor-grab active:cursor-grabbing ${isDone ? "opacity-50" : ""} ${disabled ? "cursor-default" : ""}`}>
        {children}
      </motion.div>
    </motion.div>
  );
};

// ─── MODAL TIPO DE DIA ────────────────────────────────────────────────────────

const TipoDiaModal = ({ current, onSelect, onClose }: { current: TipoDia; onSelect: (t: TipoDia) => void; onClose: () => void; }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-50 flex items-end justify-center bg-background/80 backdrop-blur-md" onClick={onClose}>
    <motion.div initial={{ y: 80, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 80, opacity: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 320 }}
      className="surface-card p-5 border-glow w-full max-w-lg rounded-b-none rounded-t-2xl space-y-4" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between">
        <p className="font-mono text-xs font-bold tracking-widest text-foreground">COMO É ESSE DIA?</p>
        <button onClick={onClose} className="active:scale-90"><X size={18} className="text-muted-foreground" /></button>
      </div>
      <p className="font-mono text-[11px] text-muted-foreground">Dias especiais não penalizam o score nem quebram o streak.</p>
      <div className="space-y-2">
        {TIPOS_DIA.map((tipo) => (
          <button key={tipo.id} onClick={() => { onSelect(tipo.id); onClose(); }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]"
            style={current === tipo.id ? { borderColor: tipo.border, background: tipo.bg } : { borderColor: "hsl(var(--border))", background: "transparent" }}>
            <span className="text-xl">{tipo.emoji}</span>
            <div className="flex-1 text-left">
              <p className="font-mono text-sm font-bold" style={{ color: tipo.color }}>{tipo.label}</p>
              <p className="font-mono text-[10px] text-muted-foreground">{tipo.mensagem}</p>
            </div>
            {current === tipo.id && <div className="w-2 h-2 rounded-full shrink-0" style={{ background: tipo.color }} />}
          </button>
        ))}
      </div>
    </motion.div>
  </motion.div>
);

// ─── CHECKLIST ────────────────────────────────────────────────────────────────

const Checklist = () => {
  const todayIdx = getTodayIndex();
  const dateStr = getLocalDateStr();
  const [selectedDay, setSelectedDay] = useState(todayIdx);
  const [checked, setChecked] = useState<Set<string>>(() => loadChecked(todayIdx));
  const [realTimes, setRealTimes] = useState<Record<string, string>>(() => loadRealTimes(todayIdx));
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState("");
  const [tipoDia, setTipoDia] = useState<TipoDia>(() => loadTipoDia(dateStr));
  const [showTipoModal, setShowTipoModal] = useState(false);
  const isToday = selectedDay === todayIdx;
  const tipoConfig = TIPOS_DIA.find((t) => t.id === tipoDia)!;
  const isDiaEspecial = tipoDia !== "normal";

  useEffect(() => { localStorage.setItem(getStorageKey(selectedDay), JSON.stringify([...checked])); }, [checked, selectedDay]);
  useEffect(() => { localStorage.setItem(`ham-checklist-times-${selectedDay}-${getLocalDateStr()}`, JSON.stringify(realTimes)); }, [realTimes, selectedDay]);

  const handleSetTipo = (tipo: TipoDia) => {
    setTipoDia(tipo);
    localStorage.setItem(`ham-tipoDia-${dateStr}`, tipo);
  };

  const day = rotinaSemanal[selectedDay];

  const adjustedItems: AdjustedItem[] = useMemo(() => {
    let accumulatedDelay = 0;
    return day.items.map((item) => {
      const idealMins = parseTime(item.time);
      if (realTimes[item.id] && idealMins !== null) {
        const realMins = parseTime(realTimes[item.id]);
        if (realMins !== null) { accumulatedDelay = realMins - idealMins; return { ...item, adjustedTime: null, deltaMinutes: 0 }; }
      }
      if (item.immutable || idealMins === null) return { ...item, adjustedTime: null, deltaMinutes: 0 };
      if (accumulatedDelay > 0 && !checked.has(item.id) && !realTimes[item.id])
        return { ...item, adjustedTime: formatMinutes(idealMins + accumulatedDelay), deltaMinutes: accumulatedDelay };
      return { ...item, adjustedTime: null, deltaMinutes: 0 };
    });
  }, [day.items, realTimes, checked]);

  const totalItems = day.items.length;
  const doneItems = day.items.filter((i) => checked.has(i.id)).length;
  const pct = totalItems > 0 ? Math.round((doneItems / totalItems) * 100) : 0;

  const toggle = (id: string) => {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        setRealTimes((rt) => { const copy = { ...rt }; delete copy[id]; return copy; });
      } else {
        next.add(id);
        const now = new Date();
        setRealTimes((rt) => ({ ...rt, [id]: `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}` }));
      }
      return next;
    });
  };

  const openEdit = (item: RotinaItem) => { setEditingItem(item.id); setEditTimeValue(realTimes[item.id] || item.time); };
  const saveEdit = () => {
    if (editingItem && editTimeValue) setRealTimes((prev) => ({ ...prev, [editingItem]: editTimeValue }));
    setEditingItem(null); setEditTimeValue("");
  };

  const getPhrase = (p: number) => {
    if (isDiaEspecial && isToday) return tipoConfig.mensagem;
    if (p === 0) return "O dia começa agora. Cada check é um voto.";
    if (p < 40) return "Rotina alimentada. Continue no ritmo.";
    if (p < 60) return "Mais da metade. Você não para no meio.";
    if (p < 100) return "Quase lá. Disciplina é liberdade.";
    return "Protocolo completo. Você é a máquina.";
  };

  return (
    <div className="p-4 space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {rotinaSemanal.map((d, i) => {
          const isTodayPill = i === todayIdx; const isSelected = i === selectedDay;
          return (
            <button key={i} onClick={() => { setSelectedDay(i); setChecked(loadChecked(i)); setRealTimes(loadRealTimes(i)); }}
              className="shrink-0 px-3 py-2 rounded-lg border font-mono text-[10px] font-bold tracking-wider transition-all duration-200 active:scale-95"
              style={isSelected ? { color: d.pillColor, borderColor: d.pillBorder, background: d.pillBg } : { borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}>
              <div>{d.dayShort}</div>
              {isTodayPill && <div className="w-1 h-1 rounded-full bg-primary mx-auto mt-1" />}
            </button>
          );
        })}
      </div>

      {/* Tipo do dia — só hoje */}
      {isToday && (
        <motion.button initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowTipoModal(true)}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all active:scale-[0.98]"
          style={{ borderColor: tipoConfig.border, background: tipoConfig.bg }}>
          <span className="text-lg">{tipoConfig.emoji}</span>
          <div className="flex-1 text-left">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest">TIPO DE DIA</p>
            <p className="font-mono text-sm font-bold" style={{ color: tipoConfig.color }}>
              {tipoConfig.label}
              {!tipoConfig.contaScore && <span className="ml-2 text-[9px] font-normal opacity-70">· streak protegido</span>}
            </p>
          </div>
          <Calendar size={14} className="text-muted-foreground shrink-0" />
        </motion.button>
      )}

      {/* Banner dia especial */}
      {isToday && isDiaEspecial && (
        <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl p-4 text-center space-y-1"
          style={{ background: tipoConfig.bg, border: `1px solid ${tipoConfig.border}` }}>
          <span className="text-3xl">{tipoConfig.emoji}</span>
          <p className="font-mono text-sm font-bold" style={{ color: tipoConfig.color }}>{tipoConfig.label.toUpperCase()}</p>
          <p className="font-mono text-[11px] text-muted-foreground">{tipoConfig.mensagem}</p>
          <p className="font-mono text-[10px] text-muted-foreground/60">Itens opcionais. Score e streak preservados.</p>
        </motion.div>
      )}

      {/* Progress header */}
      <motion.div key={selectedDay} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="surface-card p-5 border-glow">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="font-mono text-xs text-muted-foreground tracking-widest">ROTINA — {day.dayLabel.toUpperCase()}</p>
            <div className="flex gap-1.5 mt-1.5 flex-wrap">
              {day.badges.map((b) => (
                <span key={b.label} className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md" style={{ color: b.color, background: b.bg }}>{b.label}</span>
              ))}
              {isToday && isDiaEspecial && (
                <span className="text-[9px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md" style={{ color: tipoConfig.color, background: tipoConfig.bg }}>
                  {tipoConfig.emoji} {tipoConfig.label}
                </span>
              )}
            </div>
          </div>
          <span className="font-mono text-xs text-primary font-bold">{doneItems}/{totalItems}</span>
        </div>
        <div className="w-full bg-secondary rounded-full h-2 mt-3">
          <motion.div className="h-2 rounded-full"
            style={{ background: isDiaEspecial && isToday ? tipoConfig.color : "hsl(var(--primary))" }}
            initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-mono text-3xl font-extrabold text-glow"
            style={{ color: isDiaEspecial && isToday ? tipoConfig.color : "hsl(var(--primary))" }}>
            {isDiaEspecial && isToday ? tipoConfig.emoji : `${pct}%`}
          </span>
          <span className="font-mono text-[10px] text-muted-foreground text-right max-w-[65%] leading-relaxed">{getPhrase(pct)}</span>
        </div>
      </motion.div>

      {/* Swipe hint */}
      {(!isDiaEspecial || !isToday) && (
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/40"><ChevronRight size={10} /><span>DESLIZAR → CONCLUIR</span></div>
          <div className="flex items-center gap-1 text-[9px] font-mono text-muted-foreground/40"><span>EDITAR HORÁRIO ← DESLIZAR</span><ChevronLeft size={10} /></div>
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-1">
        <AnimatePresence initial={false}>
          {adjustedItems.map((item, i) => {
            const isDone = checked.has(item.id);
            const hasRealTime = !!realTimes[item.id];
            const isAdjusted = item.adjustedTime !== null && item.deltaMinutes > 0;
            const canEditTime = !item.immutable && parseTime(item.time) !== null;
            const isVisible = i === 0 || checked.has(adjustedItems[i - 1].id);
            if (!isVisible) return null;
            return (
              <motion.div key={item.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }}>
                <SwipeableItem index={i} isDone={isDone} disabled={isDiaEspecial && isToday && !isDone}
                  onSwipeRight={() => { if (!isDone) toggle(item.id); }}
                  onSwipeLeft={() => { if (!isDone && canEditTime && isToday) openEdit(item); }}>
                  <button onClick={() => toggle(item.id)}
                    className="w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all active:scale-90"
                    style={isDone ? { background: "hsl(var(--primary))", borderColor: "hsl(var(--primary))" } : { borderColor: isDiaEspecial && isToday ? tipoConfig.color + "60" : "hsl(var(--muted-foreground) / 0.3)" }}>
                    <AnimatePresence>{isDone && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}><Check size={14} className="text-primary-foreground" /></motion.div>}</AnimatePresence>
                  </button>

                  {isDone ? (
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      <span className="font-mono text-xs text-muted-foreground line-through truncate">{item.label}</span>
                      {hasRealTime && <span className="font-mono text-[10px] shrink-0" style={{ color: "#FB923C" }}>{realTimes[item.id]}</span>}
                    </div>
                  ) : (
                    <>
                      <div className="w-12 shrink-0 mt-0.5">
                        {isAdjusted
                          ? <span className="font-mono text-[10px] block" style={{ color: "#FB923C" }}>→ {item.adjustedTime}</span>
                          : <span className="font-mono text-[10px] block text-muted-foreground/40">{item.time}</span>}
                      </div>
                      <div className="w-2 h-2 rounded-full shrink-0 mt-2"
                        style={{ background: isDiaEspecial && isToday ? tipoConfig.color + "60" : item.dotColor, boxShadow: item.alert && !isDiaEspecial ? `0 0 6px ${item.dotColor}` : undefined }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-sm block text-foreground">{item.label}</span>
                          {isAdjusted && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "#FB923C", background: "rgba(251,146,60,0.12)" }}>+{item.deltaMinutes}min</span>}
                          {item.immutable && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: "#C084FC", background: "rgba(192,132,252,0.1)" }}>IMÓVEL</span>}
                          {isDiaEspecial && isToday && <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded" style={{ color: tipoConfig.color, background: tipoConfig.bg }}>OPCIONAL</span>}
                        </div>
                        <span className="font-mono text-[10px] text-muted-foreground/60 block mt-0.5">{item.detail}</span>
                        {item.tags && item.tags.length > 0 && !isDiaEspecial && (
                          <div className="flex gap-1 flex-wrap mt-1.5">
                            {item.tags.map((t) => <span key={t.label} className="text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded" style={{ color: t.color, background: `${t.color}15` }}>{t.label}</span>)}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </SwipeableItem>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Diet */}
      {(!isDiaEspecial || !isToday) && (() => {
        const dieta = dietaSemanal[selectedDay];
        if (!dieta) return null;
        const activeItem = adjustedItems.find((item, i) => { const vis = i === 0 || checked.has(adjustedItems[i-1].id); return vis && !checked.has(item.id); });
        if (!activeItem) return null;
        const activeTimeMins = parseTime(activeItem.adjustedTime || activeItem.time);
        let bestMealIdx = 0;
        if (activeTimeMins !== null) dieta.refeicoes.forEach((ref, idx) => { const r = parseTime(ref.time); if (r !== null && r <= activeTimeMins) bestMealIdx = idx; });
        const currentMeal = dieta.refeicoes[bestMealIdx];
        if (!currentMeal) return null;
        return (
          <motion.div key={currentMeal.time} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 space-y-2">
            <div className="flex items-center gap-2 px-1"><Utensils size={14} className="text-primary" /><span className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">ALIMENTAÇÃO</span></div>
            <div className="surface-card rounded-lg overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: currentMeal.dotColor }} />
                <span className="font-mono text-xs text-muted-foreground w-11 shrink-0">{currentMeal.time}</span>
                <span className="font-mono text-sm text-foreground flex-1">{currentMeal.label}</span>
                <span className="text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary">AGORA</span>
              </div>
              <div className="px-4 pb-3 pt-0 space-y-2">
                {currentMeal.subtitle && <p className="font-mono text-[10px] font-bold text-primary tracking-wide">{currentMeal.subtitle}</p>}
                <div className="space-y-1">{currentMeal.items.map((it, i) => <div key={i} className="flex items-center gap-2"><span className="text-sm">{it.emoji}</span><span className="font-mono text-[11px] text-muted-foreground">{it.text}</span></div>)}</div>
                {currentMeal.tip && <p className="font-mono text-[10px] text-primary/80 mt-1.5 border-l-2 border-primary/20 pl-2">→ {currentMeal.tip}</p>}
              </div>
            </div>
            {(dieta.regras.length > 0 || dieta.hidratacao) && (
              <div className="surface-card rounded-lg p-4 space-y-3">
                {dieta.regras.map((regra, i) => (
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1.5"><AlertTriangle size={12} style={{ color: "#F87171" }} /><span className="font-mono text-[10px] font-bold tracking-widest" style={{ color: "#F87171" }}>{regra.title}</span></div>
                    {regra.items.map((it, j) => <p key={j} className="font-mono text-[10px] text-muted-foreground ml-5">✕ {it}</p>)}
                  </div>
                ))}
                {dieta.hidratacao && <div className="flex items-center gap-2"><Droplets size={12} style={{ color: "#60A5FA" }} /><span className="font-mono text-[10px] text-muted-foreground"><span className="font-bold text-foreground">HIDRATAÇÃO:</span> {dieta.hidratacao}</span></div>}
              </div>
            )}
          </motion.div>
        );
      })()}

      {/* Modal horário */}
      <AnimatePresence>
        {editingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md" onClick={() => setEditingItem(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="surface-card p-6 border-glow w-[300px] space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-bold tracking-widest text-foreground">HORÁRIO REAL</p>
                <button onClick={() => setEditingItem(null)} className="active:scale-90"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">Que horas você realmente fez "{day.items.find((i) => i.id === editingItem)?.label}"?</p>
              <input type="time" value={editTimeValue} onChange={(e) => setEditTimeValue(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-2">
                <button onClick={() => { if (editingItem) setRealTimes((p) => { const n = { ...p }; delete n[editingItem]; return n; }); setEditingItem(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-border font-mono text-xs text-muted-foreground active:scale-95">LIMPAR</button>
                <button onClick={saveEdit} className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold active:scale-95">SALVAR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Tipo de Dia */}
      <AnimatePresence>
        {showTipoModal && <TipoDiaModal current={tipoDia} onSelect={handleSetTipo} onClose={() => setShowTipoModal(false)} />}
      </AnimatePresence>
    </div>
  );
};

export default Checklist;
