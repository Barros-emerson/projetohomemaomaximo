import { useState, useMemo, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from "framer-motion";
import { Check, Clock, X, ChevronLeft, ChevronRight, Utensils, Droplets, AlertTriangle, Calendar } from "lucide-react";
import { rotinaSemanal, type RotinaItem } from "@/data/rotina-diaria";
import { dietaSemanal } from "@/data/dieta-semanal";
import { getLocalDateStr } from "@/lib/dateUtils";
import {
  loadCheckedFromDB,
  toggleChecklistItem,
  updateChecklistTime,
  loadTipoDiaFromDB,
  saveTipoDia as saveTipoDiaDB,
} from "@/hooks/useChecklistDB";

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

export const getTipoDiaHoje = async (): Promise<TipoDia> => {
  const tipo = await loadTipoDiaFromDB();
  if (TIPOS_DIA.find(t => t.id === tipo)) return tipo as TipoDia;
  return "normal";
};

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
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [realTimes, setRealTimes] = useState<Record<string, string>>({});
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editTimeValue, setEditTimeValue] = useState("");
  const [tipoDia, setTipoDia] = useState<TipoDia>("normal");
  const [showTipoModal, setShowTipoModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const isToday = selectedDay === todayIdx;
  const tipoConfig = TIPOS_DIA.find((t) => t.id === tipoDia)!;
  const isDiaEspecial = tipoDia !== "normal";

  // Load data from DB
  const loadDayData = useCallback(async (dayIdx: number) => {
    setLoading(true);
    const map = await loadCheckedFromDB(dayIdx);
    const newChecked = new Set<string>();
    const newTimes: Record<string, string> = {};
    map.forEach((time, id) => {
      newChecked.add(id);
      if (time) newTimes[id] = time;
    });
    setChecked(newChecked);
    setRealTimes(newTimes);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadDayData(todayIdx);
    loadTipoDiaFromDB().then((t) => setTipoDia(t as TipoDia));
  }, [todayIdx, loadDayData]);

  // Reload when page regains focus (e.g. returning from Modo Foco)
  useEffect(() => {
    const handleFocus = () => {
      loadDayData(selectedDay);
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") handleFocus();
    });
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [selectedDay, loadDayData]);

  const handleSetTipo = async (tipo: TipoDia) => {
    setTipoDia(tipo);
    await saveTipoDiaDB(tipo);
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

  const toggle = async (id: string) => {
    const wasChecked = checked.has(id);
    const now = new Date();
    const timeStr = `${now.getHours()}:${now.getMinutes().toString().padStart(2, "0")}`;

    // Optimistic update
    setChecked((prev) => {
      const next = new Set(prev);
      if (wasChecked) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    if (wasChecked) {
      setRealTimes((rt) => { const copy = { ...rt }; delete copy[id]; return copy; });
    } else {
      setRealTimes((rt) => ({ ...rt, [id]: timeStr }));
    }

    // Persist to DB
    await toggleChecklistItem(selectedDay, id, wasChecked, timeStr);

    // Ao marcar "dormir", salva hora_dormiu no registro de sono do dia seguinte
    if (id === "dormir" && !wasChecked) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = getLocalDateStr(tomorrow);
      const { data: existing } = await supabase
        .from("sono_registros")
        .select("id")
        .eq("data", tomorrowStr)
        .limit(1);
      if (existing && existing.length > 0) {
        await supabase
          .from("sono_registros")
          .update({ hora_dormiu: timeStr })
          .eq("id", existing[0].id);
      } else {
        await supabase
          .from("sono_registros")
          .insert({ data: tomorrowStr, hora_dormiu: timeStr, hora_acordou: "06:00", duracao_minutos: 0, suficiente: false });
      }
    }

    // Ao marcar "acordar", salva hora_acordou (20 min antes) no registro de sono do dia atual
    if ((id === "acordar" || id === "acordar_sab") && !wasChecked) {
      const now = new Date();
      const totalMin = now.getHours() * 60 + now.getMinutes() - 20;
      const adjusted = totalMin < 0 ? 0 : totalMin;
      const acordouTime = `${Math.floor(adjusted / 60)}:${(adjusted % 60).toString().padStart(2, "0")}`;
      const todayStr = getLocalDateStr(new Date());
      const { data: existingAcordar } = await supabase
        .from("sono_registros")
        .select("id")
        .eq("data", todayStr)
        .limit(1);
      if (existingAcordar && existingAcordar.length > 0) {
        await supabase
          .from("sono_registros")
          .update({ hora_acordou: acordouTime })
          .eq("id", existingAcordar[0].id);
      } else {
        await supabase
          .from("sono_registros")
          .insert({ data: todayStr, hora_dormiu: "22:30", hora_acordou: acordouTime, duracao_minutos: 0, suficiente: false });
      }
    }
  };

  const openEdit = (item: RotinaItem) => { setEditingItem(item.id); setEditTimeValue(realTimes[item.id] || item.time); };
  const saveEdit = async () => {
    if (editingItem && editTimeValue) {
      setRealTimes((prev) => ({ ...prev, [editingItem]: editTimeValue }));
      await updateChecklistTime(selectedDay, editingItem, editTimeValue);
    }
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

  const handleSelectDay = async (i: number) => {
    setSelectedDay(i);
    await loadDayData(i);
  };

  return (
    <div className="p-4 space-y-4">
      {/* Day selector */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
        {rotinaSemanal.map((d, i) => {
          const isTodayPill = i === todayIdx; const isSelected = i === selectedDay;
          return (
            <button key={i} onClick={() => handleSelectDay(i)}
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
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
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
                      {isDone && <Check size={14} className="text-primary-foreground" />}
                    </button>

                    {isDone ? (
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-mono text-xs text-muted-foreground line-through truncate">{item.label}</span>
                        {hasRealTime && <span className="font-mono text-[10px] text-primary shrink-0">{realTimes[item.id]}</span>}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 shrink-0">
                          {isAdjusted
                            ? <span className="font-mono text-xs font-bold" style={{ color: "#FB923C" }}>→ {item.adjustedTime}</span>
                            : <span className="font-mono text-xs text-muted-foreground">{item.time}</span>}
                        </div>
                        <div className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: item.dotColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-sm text-foreground font-medium">{item.label}</span>
                            {isAdjusted && <span className="text-[9px] font-mono font-bold" style={{ color: "#FB923C" }}>+{item.deltaMinutes}min</span>}
                            {item.immutable && <span className="text-[8px] font-mono font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded">IMÓVEL</span>}
                            {isDiaEspecial && isToday && <span className="text-[8px] font-mono font-bold px-1.5 py-0.5 rounded" style={{ color: tipoConfig.color, background: tipoConfig.bg }}>OPCIONAL</span>}
                          </div>
                          <p className="font-mono text-[10px] text-muted-foreground leading-relaxed mt-0.5">{item.detail}</p>
                          {item.tags && item.tags.length > 0 && !isDiaEspecial && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {item.tags.map((t) => <span key={t.label} className="text-[8px] font-mono px-1.5 py-0.5 rounded-md bg-secondary" style={{ color: t.color }}>{t.label}</span>)}
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
      )}

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
          <div className="surface-card p-4 border-glow space-y-3">
            <p className="font-mono text-[10px] text-muted-foreground tracking-widest flex items-center gap-1.5"><Utensils size={12} />ALIMENTAÇÃO</p>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 rounded-full" style={{ background: "hsl(var(--primary))" }} />
                <span className="font-mono text-xs text-muted-foreground">{currentMeal.time}</span>
                <span className="font-mono text-sm text-foreground font-bold">{currentMeal.label}</span>
                <span className="text-[8px] font-mono font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">AGORA</span>
              </div>
              <div className="pl-7">
                {currentMeal.subtitle && <p className="font-mono text-[11px] text-muted-foreground italic mb-1">{currentMeal.subtitle}</p>}
                <div className="space-y-0.5">{currentMeal.items.map((it, i) => <p key={i} className="font-mono text-[11px] text-foreground/80">{it.emoji}{it.text}</p>)}</div>
                {currentMeal.tip && <p className="font-mono text-[10px] text-primary mt-1.5">→ {currentMeal.tip}</p>}
              </div>
            </div>
            {(dieta.regras.length > 0 || dieta.hidratacao) && (
              <div className="border-t border-border pt-2 mt-2 space-y-2">
                {dieta.regras.map((regra, i) => (
                  <div key={i}>
                    <p className="font-mono text-[9px] text-muted-foreground tracking-widest mb-0.5">{regra.title}</p>
                    {regra.items.map((it, j) => <p key={j} className="font-mono text-[10px] text-muted-foreground">✕ {it}</p>)}
                  </div>
                ))}
                {dieta.hidratacao && <p className="font-mono text-[10px] text-primary/80"><Droplets className="inline w-3 h-3 mr-1" />HIDRATAÇÃO: {dieta.hidratacao}</p>}
              </div>
            )}
          </div>
        );
      })()}

      {/* Modal horário */}
      <AnimatePresence>
        {editingItem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-md p-6" onClick={() => setEditingItem(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="surface-card p-5 border-glow w-full max-w-sm space-y-4" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <p className="font-mono text-xs font-bold tracking-widest text-foreground">HORÁRIO REAL</p>
                <button onClick={() => setEditingItem(null)} className="active:scale-90"><X size={18} className="text-muted-foreground" /></button>
              </div>
              <p className="font-mono text-[11px] text-muted-foreground">Que horas você realmente fez "{day.items.find((i) => i.id === editingItem)?.label}"?</p>
              <input type="time" value={editTimeValue} onChange={(e) => setEditTimeValue(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-3 font-mono text-lg text-foreground text-center focus:outline-none focus:ring-2 focus:ring-primary" />
              <div className="flex gap-2">
                <button onClick={async () => { if (editingItem) { setRealTimes((p) => { const n = { ...p }; delete n[editingItem]; return n; }); await updateChecklistTime(selectedDay, editingItem, null); } setEditingItem(null); }}
                  className="flex-1 py-2.5 rounded-lg border border-border font-mono text-xs text-muted-foreground active:scale-95">LIMPAR</button>
                <button onClick={saveEdit}
                  className="flex-1 py-2.5 rounded-lg bg-primary text-primary-foreground font-mono text-xs font-bold active:scale-95">SALVAR</button>
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
