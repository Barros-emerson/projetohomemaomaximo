import { useState, useRef, useCallback } from "react";
import { BookOpen, Flame, Check, ChevronRight, Heart, HandHeart, Shield, BookMarked, X, Sparkles, Send, Mic, Square, Play, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { planosDisponiveis, versiculosMemorizacao, type LeituraDia } from "@/data/biblia-planos";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const getWeekOfYear = () => Math.ceil(((Date.now() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000 + 1) / 7);

const Biblia = () => {
  const [planoId, setPlanoId] = useState("salmos-proverbios");
  const [leituras, setLeituras] = useState<Record<string, LeituraDia[]>>(() => {
    const saved = localStorage.getItem("ham-biblia-leituras");
    if (saved) return JSON.parse(saved);
    const init: Record<string, LeituraDia[]> = {};
    planosDisponiveis.forEach(p => { init[p.id] = p.leituras.map(l => ({ ...l })); });
    return init;
  });
  const [reflexao, setReflexao] = useState(() => localStorage.getItem("ham-biblia-reflexao-hoje") || "");
  const [oracaoTab, setOracaoTab] = useState("gratidao");
  const [oracoes, setOracoes] = useState<Record<string, string>>(() => {
    const saved = localStorage.getItem("ham-biblia-oracoes");
    return saved ? JSON.parse(saved) : { gratidao: "", pedidos: "", intercessao: "" };
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("ham-biblia-streak");
    return saved ? JSON.parse(saved) : { count: 0, lastDate: "" };
  });
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [modoLeitura, setModoLeitura] = useState(false);
  const [leituraSelecionada, setLeituraSelecionada] = useState<LeituraDia | null>(null);
  const [numeroCamila, setNumeroCamila] = useState(() => localStorage.getItem("ham-numero-camila") || "");
  const [showNumeroModal, setShowNumeroModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const planoAtual = planosDisponiveis.find(p => p.id === planoId)!;
  const leiturasPlano = leituras[planoId] || planoAtual.leituras;

  const hoje = new Date().toISOString().split("T")[0];
  const devocionalHoje = leiturasPlano.find(l => !l.concluido) || leiturasPlano[0];
  const progresso = leiturasPlano.filter(l => l.concluido).length;
  const total = leiturasPlano.length;
  const pct = Math.round((progresso / total) * 100);

  const semanaAtual = getWeekOfYear();
  const versiculo = versiculosMemorizacao[(semanaAtual - 1) % versiculosMemorizacao.length];

  const saveAll = (newLeituras: Record<string, LeituraDia[]>, newStreak?: typeof streak) => {
    localStorage.setItem("ham-biblia-leituras", JSON.stringify(newLeituras));
    if (newStreak) {
      localStorage.setItem("ham-biblia-streak", JSON.stringify(newStreak));
      setStreak(newStreak);
    }
  };

  const concluirLeitura = (dia: number) => {
    const updated = { ...leituras };
    updated[planoId] = leiturasPlano.map(l => l.dia === dia ? { ...l, concluido: true } : l);
    setLeituras(updated);

    const newStreak = streak.lastDate === hoje
      ? streak
      : {
          count: isYesterday(streak.lastDate) ? streak.count + 1 : 1,
          lastDate: hoje,
        };
    saveAll(updated, newStreak);
  };

  const salvarReflexao = () => {
    localStorage.setItem("ham-biblia-reflexao-hoje", reflexao);
    localStorage.setItem(`ham-biblia-reflexao-${hoje}`, reflexao);
  };

  const salvarOracoes = (key: string, value: string) => {
    const updated = { ...oracoes, [key]: value };
    setOracoes(updated);
    localStorage.setItem("ham-biblia-oracoes", JSON.stringify(updated));
  };

  const isYesterday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.toISOString().split("T")[0] === y.toISOString().split("T")[0];
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(t => t.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch {
      toast.error("Permissão de microfone negada");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }, []);

  const playAudio = useCallback(() => {
    if (!audioUrl) return;
    const audio = new Audio(audioUrl);
    audioPlayerRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  }, [audioUrl]);

  const deleteAudio = useCallback(() => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBlob(null);
    setIsPlaying(false);
  }, [audioUrl]);

  const enviarParaCamila = useCallback(() => {
    if (!numeroCamila) {
      setShowNumeroModal(true);
      return;
    }

    const leituraAtual = leiturasPlano.find(l => l.concluido) 
      ? leiturasPlano.filter(l => l.concluido).slice(-1)[0]
      : devocionalHoje;

    const dataFormatada = new Date().toLocaleDateString("pt-BR", { 
      weekday: "long", day: "numeric", month: "long" 
    });

    let mensagem = `✝️ *Devocional — ${dataFormatada}*\n\n`;
    mensagem += `📖 *Leitura:* ${leituraAtual?.passagem || "—"}\n\n`;
    
    if (reflexao.trim()) {
      mensagem += `💭 *Reflexão:*\n${reflexao.trim()}\n\n`;
    }

    if (audioBlob) {
      mensagem += `🎙️ _Gravei uma mensagem de voz pra você — te envio em seguida!_\n\n`;
    }

    mensagem += `🔥 Streak: ${streak.count} dia(s)\n`;
    mensagem += `\n— Emerson, via HOMEM AO MÁXIMO`;

    const numero = numeroCamila.replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(mensagem)}`;
    window.open(url, "_blank");

    toast.success("WhatsApp aberto! Confirme o envio 💛");
  }, [numeroCamila, reflexao, audioBlob, streak, leiturasPlano, devocionalHoje]);

  const salvarNumeroCamila = (num: string) => {
    setNumeroCamila(num);
    localStorage.setItem("ham-numero-camila", num);
    setShowNumeroModal(false);
    toast.success("Número salvo!");
  };

  // Modo leitura limpo
  if (modoLeitura && leituraSelecionada) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => setModoLeitura(false)} className="text-muted-foreground">
            <X size={24} />
          </button>
          <span className="font-mono text-xs tracking-widest text-muted-foreground">MODO LEITURA</span>
          <div className="w-6" />
        </div>
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-lg mx-auto space-y-6">
            <p className="text-xs font-mono tracking-widest text-violet-400 uppercase">Dia {leituraSelecionada.dia}</p>
            <h2 className="text-2xl font-bold text-foreground leading-tight">{leituraSelecionada.passagem}</h2>
            <div className="h-px bg-border my-4" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Abra sua Bíblia (NVI/ARC) e leia a passagem acima com atenção.
              Após a leitura, feche este modo e registre sua reflexão.
            </p>
            <Button
              className="w-full mt-8 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => {
                concluirLeitura(leituraSelecionada.dia);
                setModoLeitura(false);
              }}
            >
              <Check size={16} className="mr-2" />
              Concluir leitura
            </Button>
          </div>
        </ScrollArea>
      </div>
    );
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      {/* Header + Streak */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-mono text-sm font-bold tracking-widest text-foreground">BÍBLIA & REFLEXÃO</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Devocional diário</p>
        </div>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1.5"
        >
          <Flame size={16} className="text-amber-500" />
          <span className="font-mono text-sm font-bold text-amber-500">{streak.count}</span>
          <span className="text-[10px] text-amber-500/70">dias</span>
        </motion.div>
      </div>

      {/* Versículo de memorização semanal */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="surface-card p-4 border-violet-500/20"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={14} className="text-violet-400" />
          <span className="font-mono text-[10px] tracking-widest text-violet-400 uppercase">Versículo da semana</span>
        </div>
        <p className="text-sm text-foreground leading-relaxed italic">"{versiculo.texto}"</p>
        <p className="text-xs text-violet-400 mt-2 font-medium">{versiculo.referencia}</p>
      </motion.div>

      {/* Leitura do dia */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="surface-card p-4"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BookOpen size={16} className="text-violet-400" />
            <span className="font-mono text-xs tracking-widest text-foreground">{planoAtual.nome.toUpperCase()}</span>
          </div>
          <button
            onClick={() => setShowPlanoModal(true)}
            className="text-[10px] font-mono text-violet-400 tracking-wider hover:text-violet-300"
          >
            TROCAR PLANO
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-3">
          <div className="flex justify-between text-[10px] font-mono text-muted-foreground mb-1">
            <span>{progresso}/{total} leituras</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-violet-500 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Leitura de hoje */}
        {devocionalHoje && (
          <div
            className="flex items-center justify-between p-3 rounded-lg bg-violet-500/5 border border-violet-500/10 cursor-pointer hover:bg-violet-500/10 transition-colors"
            onClick={() => {
              setLeituraSelecionada(devocionalHoje);
              setModoLeitura(true);
            }}
          >
            <div>
              <p className="text-[10px] font-mono text-violet-400 mb-0.5">DIA {devocionalHoje.dia}</p>
              <p className="text-sm font-medium text-foreground">{devocionalHoje.passagem}</p>
            </div>
            <ChevronRight size={18} className="text-violet-400" />
          </div>
        )}

        {/* Últimas leituras */}
        <div className="mt-3 space-y-1.5">
          {leiturasPlano.filter(l => l.concluido).slice(-3).reverse().map(l => (
            <div key={l.dia} className="flex items-center gap-2 px-3 py-2 rounded bg-secondary/50">
              <Check size={12} className="text-primary" />
              <span className="text-xs text-muted-foreground">Dia {l.dia}</span>
              <span className="text-xs text-foreground">{l.passagem}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Editor de reflexão */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="surface-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <BookMarked size={16} className="text-violet-400" />
          <span className="font-mono text-xs tracking-widest text-foreground">REFLEXÃO DO DIA</span>
        </div>
        <Textarea
          value={reflexao}
          onChange={e => setReflexao(e.target.value)}
          placeholder="O que Deus falou com você hoje? Escreva aqui sua reflexão..."
          className="bg-secondary/50 border-border text-sm min-h-[100px] resize-none focus:border-violet-500/50"
        />
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs"
            onClick={salvarReflexao}
          >
            Salvar reflexão
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-green-600/30 text-green-500 hover:bg-green-600/10"
            onClick={enviarParaCamila}
          >
            <Send size={12} className="mr-1" />
            Enviar para Camila
          </Button>
        </div>
      </motion.div>

      {/* Gravar voz para Camila */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        className="surface-card p-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <Mic size={16} className="text-green-500" />
          <span className="font-mono text-xs tracking-widest text-foreground">MENSAGEM DE VOZ</span>
          <span className="text-[10px] text-muted-foreground">opcional</span>
        </div>
        <p className="text-xs text-muted-foreground mb-3">
          Grave uma mensagem de voz para enviar junto com o devocional.
        </p>

        {!audioUrl ? (
          <Button
            size="sm"
            variant={isRecording ? "destructive" : "outline"}
            className={`text-xs ${!isRecording ? "border-green-600/30 text-green-500 hover:bg-green-600/10" : ""}`}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? (
              <>
                <Square size={12} className="mr-1" />
                Parar gravação
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="ml-2 w-2 h-2 rounded-full bg-red-500 inline-block"
                />
              </>
            ) : (
              <>
                <Mic size={12} className="mr-1" />
                Gravar mensagem
              </>
            )}
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" className="text-xs" onClick={playAudio} disabled={isPlaying}>
              <Play size={12} className="mr-1" />
              {isPlaying ? "Tocando..." : "Ouvir"}
            </Button>
            <Button size="sm" variant="outline" className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10" onClick={deleteAudio}>
              <Trash2 size={12} className="mr-1" />
              Apagar
            </Button>
            <span className="text-[10px] text-primary">✓ Áudio gravado</span>
          </div>
        )}
      </motion.div>

      {/* Seção de oração */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="surface-card p-4"
      >
        <span className="font-mono text-xs tracking-widest text-foreground mb-3 block">ORAÇÃO</span>
        <Tabs value={oracaoTab} onValueChange={setOracaoTab}>
          <TabsList className="w-full bg-secondary/50 h-9">
            <TabsTrigger value="gratidao" className="flex-1 text-[11px] gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Heart size={12} /> Gratidão
            </TabsTrigger>
            <TabsTrigger value="pedidos" className="flex-1 text-[11px] gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <HandHeart size={12} /> Pedidos
            </TabsTrigger>
            <TabsTrigger value="intercessao" className="flex-1 text-[11px] gap-1 data-[state=active]:bg-violet-600 data-[state=active]:text-white">
              <Shield size={12} /> Intercessão
            </TabsTrigger>
          </TabsList>
          {(["gratidao", "pedidos", "intercessao"] as const).map(key => (
            <TabsContent key={key} value={key}>
              <Textarea
                value={oracoes[key] || ""}
                onChange={e => salvarOracoes(key, e.target.value)}
                placeholder={
                  key === "gratidao" ? "Pelo que você é grato hoje?"
                  : key === "pedidos" ? "Quais são seus pedidos a Deus?"
                  : "Por quem você quer interceder hoje?"
                }
                className="bg-secondary/50 border-border text-sm min-h-[80px] resize-none focus:border-violet-500/50"
              />
            </TabsContent>
          ))}
        </Tabs>
      </motion.div>

      {/* Modal trocar plano */}
      <Dialog open={showPlanoModal} onOpenChange={setShowPlanoModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm tracking-widest">PLANO DE LEITURA</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 mt-2">
            {planosDisponiveis.map(p => {
              const isActive = p.id === planoId;
              const done = (leituras[p.id] || p.leituras).filter(l => l.concluido).length;
              return (
                <button
                  key={p.id}
                  onClick={() => { setPlanoId(p.id); setShowPlanoModal(false); }}
                  className={`w-full text-left p-3 rounded-lg border transition-colors ${
                    isActive
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-border bg-secondary/30 hover:bg-secondary/60"
                  }`}
                >
                  <p className="text-sm font-medium text-foreground">{p.nome}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{p.descricao}</p>
                  {done > 0 && (
                    <Badge variant="secondary" className="mt-1.5 text-[10px]">
                      {done}/{p.leituras.length} concluídas
                    </Badge>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Biblia;
