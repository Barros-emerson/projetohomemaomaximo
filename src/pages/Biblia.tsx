import { useState, useRef, useCallback, useEffect } from "react";
import { BookOpen, Flame, Check, ChevronRight, Heart, HandHeart, Shield, BookMarked, X, Sparkles, Send, Mic, Square, Play, Trash2, Plus, Phone, Share2, RefreshCw, Loader2, Save, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
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

interface Contato {
  nome: string;
  numero: string;
}

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
  const [anotacoes, setAnotacoes] = useState(() => localStorage.getItem("ham-biblia-anotacoes-hoje") || "");
  const [oracaoTab, setOracaoTab] = useState("gratidao");
  const [oracoes, setOracoes] = useState<Record<string, string>>({ gratidao: "", pedidos: "", intercessao: "" });
  const [oracoesSalvas, setOracoesSalvas] = useState<Array<{ id: string; tipo: string; conteudo: string; data: string; created_at: string }>>([]);
  const [salvandoOracao, setSalvandoOracao] = useState(false);
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("ham-biblia-streak");
    return saved ? JSON.parse(saved) : { count: 0, lastDate: "" };
  });
  const [showPlanoModal, setShowPlanoModal] = useState(false);
  const [modoLeitura, setModoLeitura] = useState(false);
  const [leituraSelecionada, setLeituraSelecionada] = useState<LeituraDia | null>(null);
  
  // Multiple contacts
  const [contatos, setContatos] = useState<Contato[]>(() => {
    const saved = localStorage.getItem("ham-contatos-devocional");
    if (saved) return JSON.parse(saved);
    // Migrate old single number
    const old = localStorage.getItem("ham-numero-camila");
    if (old) return [{ nome: "Amor ♥️", numero: old }];
    return [];
  });
  const [showContatosModal, setShowContatosModal] = useState(false);
  const [novoContatoNome, setNovoContatoNome] = useState("");
  const [novoContatoNumero, setNovoContatoNumero] = useState("");
  
  // Preview before send
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMsg, setPreviewMsg] = useState("");
  const [contatoParaEnviar, setContatoParaEnviar] = useState<Contato | null>(null);
  const [mp3PreviewUrl, setMp3PreviewUrl] = useState<string | null>(null);
  const [mp3PreviewBlob, setMp3PreviewBlob] = useState<Blob | null>(null);
  const [isConvertingMp3, setIsConvertingMp3] = useState(false);
  const [isPlayingMp3, setIsPlayingMp3] = useState(false);
  const mp3PlayerRef = useRef<HTMLAudioElement | null>(null);

  // Direção de Deus (AI)
  const [direcaoDeDeus, setDirecaoDeDeus] = useState<string>("");
  const [direcaoLoading, setDirecaoLoading] = useState(false);
  const [direcaoLeitura, setDirecaoLeitura] = useState<string>("");

  // Bible text fetching
  interface ChapterResult { book: string; chapter: number; text: string; }
  const [bibliaTexto, setBibliaTexto] = useState<ChapterResult[]>([]);
  const [bibliaLoading, setBibliaLoading] = useState(false);

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
    localStorage.setItem("ham-biblia-anotacoes-hoje", anotacoes);
    localStorage.setItem(`ham-biblia-anotacoes-${hoje}`, anotacoes);
    toast.success("Reflexão e anotações salvas!");
  };

  const salvarOracoes = (key: string, value: string) => {
    setOracoes(prev => ({ ...prev, [key]: value }));
  };

  const salvarOracaoDB = useCallback(async () => {
    const entries = Object.entries(oracoes).filter(([, v]) => v.trim());
    if (entries.length === 0) { toast.error("Escreva algo antes de salvar"); return; }
    setSalvandoOracao(true);
    try {
      const today = new Date().toISOString().slice(0, 10);
      const inserts = entries.map(([tipo, conteudo]) => ({ tipo, conteudo, data: today }));
      const { error } = await supabase.from("oracoes").insert(inserts);
      if (error) throw error;
      toast.success("Oração salva!");
      setOracoes({ gratidao: "", pedidos: "", intercessao: "" });
      carregarOracoes();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao salvar oração");
    } finally {
      setSalvandoOracao(false);
    }
  }, [oracoes]);

  const carregarOracoes = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("oracoes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      setOracoesSalvas(data || []);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => { carregarOracoes(); }, [carregarOracoes]);

  const isYesterday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const y = new Date();
    y.setDate(y.getDate() - 1);
    return d.toISOString().split("T")[0] === y.toISOString().split("T")[0];
  };

  const buscarDirecao = useCallback(async (leitura: string) => {
    if (!leitura) return;
    setDirecaoLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("direcao-de-deus", {
        body: { leitura },
      });
      if (error) throw error;
      if (data?.frase) {
        setDirecaoDeDeus(data.frase);
        setDirecaoLeitura(leitura);
        localStorage.setItem("ham-direcao-de-deus", JSON.stringify({ frase: data.frase, leitura, date: hoje }));
      }
    } catch (err: any) {
      console.error("Erro ao buscar direção:", err);
      toast.error("Não foi possível gerar a direção de Deus");
    } finally {
      setDirecaoLoading(false);
    }
  }, [hoje]);

  // Auto-load AI phrase for today's reading
  useEffect(() => {
    const passagem = devocionalHoje?.passagem;
    if (!passagem) return;
    const saved = localStorage.getItem("ham-direcao-de-deus");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === hoje && parsed.leitura === passagem) {
        setDirecaoDeDeus(parsed.frase);
        setDirecaoLeitura(parsed.leitura);
        return;
      }
    }
    buscarDirecao(passagem);
  }, [devocionalHoje?.passagem, hoje, buscarDirecao]);

  const buscarTextoBiblia = useCallback(async (passagem: string) => {
    setBibliaLoading(true);
    setBibliaTexto([]);
    try {
      const { data, error } = await supabase.functions.invoke("buscar-biblia", {
        body: { passagem },
      });
      if (error) throw error;
      if (data?.chapters) {
        setBibliaTexto(data.chapters);
      }
    } catch (err) {
      console.error("Erro ao buscar texto bíblico:", err);
      toast.error("Não foi possível carregar o texto bíblico");
    } finally {
      setBibliaLoading(false);
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      // Force audio-only MIME to prevent video container
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const actualType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: actualType });
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

  const salvarContatos = (novos: Contato[]) => {
    setContatos(novos);
    localStorage.setItem("ham-contatos-devocional", JSON.stringify(novos));
  };

  const adicionarContato = () => {
    if (!novoContatoNumero.trim()) return;
    const nome = novoContatoNome.trim() || "Contato";
    const novos = [...contatos, { nome, numero: novoContatoNumero.trim() }];
    salvarContatos(novos);
    setNovoContatoNome("");
    setNovoContatoNumero("");
    toast.success(`${nome} adicionado!`);
  };

  const removerContato = (index: number) => {
    const novos = contatos.filter((_, i) => i !== index);
    salvarContatos(novos);
  };

  const gerarMensagem = (): string => {
    const leituraAtual = leiturasPlano.find(l => l.concluido)
      ? leiturasPlano.filter(l => l.concluido).slice(-1)[0]
      : devocionalHoje;

    const dataFormatada = new Date().toLocaleDateString("pt-BR", {
      weekday: "long", day: "numeric", month: "long"
    });

    let msg = `✝️ *Devocional de hoje — ${dataFormatada}*\n\n`;
    msg += `📖 *Vamos ler:* ${leituraAtual?.passagem || "—"}\n\n`;

    if (direcaoDeDeus) {
      msg += `✨ *Direção de Deus:*\n"${direcaoDeDeus}"\n\n`;
    }

    if (reflexao.trim()) {
      msg += `REFLEXÃO DO DIA ♥️:\n${reflexao.trim()}\n\n`;
    }

    if (audioBlob) {
      msg += `🎙️ _Gravei uma mensagem de voz pra você — te envio em seguida!_\n\n`;
    }

    msg += `🔥: ${streak.count} dia(s)\n\n`;
    msg += `— Emerson, via Homem de verdade.`;

    return msg;
  };

  const abrirPreview = async (contato: Contato) => {
    setContatoParaEnviar(contato);
    setPreviewMsg(gerarMensagem());
    setMp3PreviewUrl(null);
    setMp3PreviewBlob(null);
    setShowPreviewModal(true);

    // Auto-convert audio to MP3 when opening preview
    if (audioBlob) {
      setIsConvertingMp3(true);
      try {
        const mp3 = await convertToMp3(audioBlob);
        const url = URL.createObjectURL(mp3);
        setMp3PreviewBlob(mp3);
        setMp3PreviewUrl(url);
      } catch {
        toast.error("Erro ao converter áudio para MP3");
      } finally {
        setIsConvertingMp3(false);
      }
    }
  };

  const enviarMensagem = async () => {
    if (!contatoParaEnviar) return;

    // Use pre-converted MP3 if available
    const shareBlob = mp3PreviewBlob || audioBlob;
    if (shareBlob) {
      const isMp3 = shareBlob.type === "audio/mpeg";
      const ext = isMp3 ? "mp3" : "webm";
      const file = new File([shareBlob], `devocional-${hoje}.${ext}`, { type: shareBlob.type });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({
            title: "Devocional de hoje",
            text: previewMsg,
            files: [file],
          });
          cleanupMp3Preview();
          setShowPreviewModal(false);
          toast.success("Compartilhado com sucesso! 💛");
          return;
        } catch (err: any) {
          if (err.name !== "AbortError") {
            toast.error("Erro ao compartilhar. Abrindo WhatsApp...");
          } else {
            return;
          }
        }
      }
    }

    // Fallback: open WhatsApp link
    const numero = contatoParaEnviar.numero.replace(/\D/g, "");
    const url = `https://wa.me/${numero}?text=${encodeURIComponent(previewMsg)}`;
    window.open(url, "_blank");
    cleanupMp3Preview();
    setShowPreviewModal(false);
    toast.success("WhatsApp aberto! Confirme o envio 💛");
  };

  const cleanupMp3Preview = () => {
    if (mp3PreviewUrl) URL.revokeObjectURL(mp3PreviewUrl);
    setMp3PreviewUrl(null);
    setMp3PreviewBlob(null);
    setIsPlayingMp3(false);
    if (mp3PlayerRef.current) {
      mp3PlayerRef.current.pause();
      mp3PlayerRef.current = null;
    }
  };

  const playMp3Preview = () => {
    if (!mp3PreviewUrl) return;
    if (isPlayingMp3 && mp3PlayerRef.current) {
      mp3PlayerRef.current.pause();
      setIsPlayingMp3(false);
      return;
    }
    const audio = new Audio(mp3PreviewUrl);
    mp3PlayerRef.current = audio;
    audio.onended = () => setIsPlayingMp3(false);
    audio.play();
    setIsPlayingMp3(true);
  };

  const convertToMp3 = useCallback(async (blob: Blob): Promise<Blob> => {
    const lamejs = await import("lamejs");
    const arrayBuffer = await blob.arrayBuffer();
    const audioCtx = new AudioContext();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    audioCtx.close();

    const samples = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const mp3encoder = new lamejs.Mp3Encoder(1, sampleRate, 128);
    const blockSize = 1152;
    const mp3Data: Int8Array[] = [];

    const int16 = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      int16[i] = Math.max(-32768, Math.min(32767, Math.round(samples[i] * 32767)));
    }

    for (let i = 0; i < int16.length; i += blockSize) {
      const chunk = int16.subarray(i, i + blockSize);
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) mp3Data.push(mp3buf);
    }

    const end = mp3encoder.flush();
    if (end.length > 0) mp3Data.push(end);

    return new Blob(mp3Data as unknown as BlobPart[], { type: "audio/mpeg" });
  }, []);

  const compartilharAudio = useCallback(async () => {
    if (!audioBlob) return;

    toast.loading("Convertendo áudio para MP3...", { id: "mp3-conv" });
    let mp3Blob: Blob;
    try {
      mp3Blob = await convertToMp3(audioBlob);
    } catch {
      toast.dismiss("mp3-conv");
      toast.error("Erro ao converter áudio. Enviando como webm.");
      mp3Blob = audioBlob;
    }
    toast.dismiss("mp3-conv");

    const isMp3 = mp3Blob.type === "audio/mpeg";
    const ext = isMp3 ? "mp3" : "webm";
    const file = new File([mp3Blob], `devocional-${hoje}.${ext}`, { type: mp3Blob.type });
    const msg = gerarMensagem();

    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          title: "Devocional de hoje",
          text: msg,
          files: [file],
        });
        toast.success("Compartilhado com sucesso! 💛");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          toast.error("Erro ao compartilhar");
        }
      }
    } else {
      const url = URL.createObjectURL(mp3Blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `devocional-${hoje}.${ext}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.info("Áudio MP3 baixado! Envie manualmente pelo WhatsApp.");
    }
  }, [audioBlob, hoje, convertToMp3]);

  // Modo leitura limpo
  if (modoLeitura && leituraSelecionada) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <button onClick={() => { setModoLeitura(false); setBibliaTexto([]); }} className="text-muted-foreground">
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

            {bibliaLoading ? (
              <div className="flex flex-col items-center gap-3 py-12">
                <Loader2 size={28} className="text-violet-400 animate-spin" />
                <p className="text-sm text-muted-foreground">Carregando texto bíblico...</p>
              </div>
            ) : bibliaTexto.length > 0 ? (
              <div className="space-y-10">
                {bibliaTexto.map((ch, idx) => (
                  <div key={idx}>
                    <h3 className="font-mono text-[11px] tracking-[0.2em] text-violet-400 uppercase mb-5 pb-2 border-b border-border">
                      {ch.book} {ch.chapter}
                    </h3>
                    <div className="space-y-3">
                      {ch.text.split("\n").filter(Boolean).map((line, i) => {
                        const match = line.match(/^(\d+)\s+(.*)/);
                        const verseNum = match ? match[1] : null;
                        const verseText = match ? match[2] : line;
                        return (
                          <p key={i} className="text-[15px] text-foreground/90 leading-[2] font-light tracking-[0.01em]">
                            {verseNum && (
                              <span className="inline-block font-mono text-[11px] font-semibold text-violet-400/80 mr-2 align-super select-none">
                                {verseNum}
                              </span>
                            )}
                            {verseText}
                          </p>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground leading-relaxed">
                Não foi possível carregar o texto. Abra sua Bíblia e leia a passagem acima.
              </p>
            )}

            <Button
              className="w-full mt-8 bg-violet-600 hover:bg-violet-700 text-white"
              onClick={() => {
                concluirLeitura(leituraSelecionada.dia);
                setModoLeitura(false);
                setBibliaTexto([]);
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

      {/* Direção de Deus (AI) */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="surface-card p-4 border-amber-500/20"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-amber-400" />
            <span className="font-mono text-[10px] tracking-widest text-amber-400 uppercase">Direção de Deus</span>
          </div>
          <button
            onClick={() => devocionalHoje && buscarDirecao(devocionalHoje.passagem)}
            disabled={direcaoLoading}
            className="text-[10px] font-mono text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <RefreshCw size={10} className={direcaoLoading ? "animate-spin" : ""} />
            {direcaoLoading ? "" : "NOVA"}
          </button>
        </div>
        {direcaoLoading ? (
          <div className="flex items-center gap-2 py-2">
            <div className="h-4 w-4 border-2 border-amber-400/30 border-t-amber-400 rounded-full animate-spin" />
            <span className="text-xs text-muted-foreground">Buscando direção...</span>
          </div>
        ) : direcaoDeDeus ? (
          <>
            <p className="text-lg font-semibold text-foreground leading-snug italic">"{direcaoDeDeus}"</p>
            <p className="text-[10px] text-amber-400/70 mt-2 font-mono">
              — Emerson · Homem de verdade
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground italic">Nenhuma direção gerada ainda.</p>
        )}
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
              buscarTextoBiblia(devocionalHoje.passagem);
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
          className="bg-secondary/50 border-border text-sm min-h-[80px] resize-none focus:border-violet-500/50 rounded-xl"
        />
        <p className="text-[10px] text-muted-foreground mt-1.5 italic">
          💡 O que você escrever aqui será o conteúdo de "REFLEXÃO DO DIA ♥️" no devocional enviado.
        </p>
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            className="bg-violet-600 hover:bg-violet-700 text-white text-xs rounded-xl"
            onClick={salvarReflexao}
          >
            Salvar tudo
          </Button>
          {contatos.length === 0 ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-green-600/30 text-green-500 hover:bg-green-600/10 rounded-xl"
              onClick={() => setShowContatosModal(true)}
            >
              <Plus size={12} className="mr-1" />
              Cadastrar contato
            </Button>
          ) : contatos.length === 1 ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs border-green-600/30 text-green-500 hover:bg-green-600/10 rounded-xl"
              onClick={() => abrirPreview(contatos[0])}
            >
              <Send size={12} className="mr-1" />
              Enviar para {contatos[0].nome}
            </Button>
          ) : (
            <div className="flex gap-1.5 flex-wrap">
              {contatos.map((c, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant="outline"
                  className="text-xs border-green-600/30 text-green-500 hover:bg-green-600/10 rounded-xl"
                  onClick={() => abrirPreview(c)}
                >
                  <Send size={10} className="mr-1" />
                  {c.nome}
                </Button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowContatosModal(true)}
          className="text-[10px] font-mono text-muted-foreground mt-2 flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Phone size={10} />
          Gerenciar contatos ({contatos.length})
        </button>
      </motion.div>

      {/* Gravar voz */}
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
                  className="ml-2 w-2 h-2 rounded-full bg-destructive inline-block"
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
          <div className="space-y-3">
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

            {/* Share audio directly via Web Share API */}
            <div className="border-t border-border pt-2 space-y-2">
              <p className="text-[10px] font-mono text-muted-foreground mb-1">ENVIAR DEVOCIONAL COM ÁUDIO:</p>
              <Button
                size="sm"
                className="w-full text-xs bg-green-600 hover:bg-green-700 text-white rounded-xl"
                onClick={compartilharAudio}
              >
                <Share2 size={14} className="mr-1.5" />
                Compartilhar áudio + mensagem
              </Button>
              <p className="text-[9px] text-muted-foreground italic">
                📎 Envia o áudio + texto do devocional direto para o WhatsApp ou qualquer app.
              </p>
            </div>
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

        <Button
          onClick={salvarOracaoDB}
          disabled={salvandoOracao || !Object.values(oracoes).some(v => v.trim())}
          className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white text-xs h-9 gap-2"
        >
          {salvandoOracao ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Salvar Oração
        </Button>

        {oracoesSalvas.length > 0 && (
          <div className="mt-4 space-y-2">
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest flex items-center gap-1">
              <Clock size={10} /> ORAÇÕES SALVAS
            </p>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {oracoesSalvas.map(o => (
                <div key={o.id} className="bg-secondary/40 rounded-lg p-2.5 border border-border/50">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="outline" className="text-[9px] h-4 px-1.5 border-violet-500/30 text-violet-400">
                      {o.tipo === "gratidao" ? "Gratidão" : o.tipo === "pedidos" ? "Pedidos" : "Intercessão"}
                    </Badge>
                    <span className="text-[9px] text-muted-foreground font-mono">
                      {new Date(o.data + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/80 leading-relaxed line-clamp-2">{o.conteudo}</p>
                </div>
              ))}
            </div>
          </div>
        )}
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

      {/* Modal gerenciar contatos */}
      <Dialog open={showContatosModal} onOpenChange={setShowContatosModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm tracking-widest">CONTATOS DO DEVOCIONAL</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Cadastre os contatos que receberão o devocional via WhatsApp.
          </p>

          {/* Lista de contatos */}
          {contatos.length > 0 && (
            <div className="space-y-2 mt-2">
              {contatos.map((c, i) => (
                <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/50 border border-border">
                  <div>
                    <p className="text-xs font-medium text-foreground">{c.nome}</p>
                    <p className="text-[10px] text-muted-foreground">{c.numero}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                    onClick={() => removerContato(i)}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Adicionar novo */}
          <div className="space-y-2 mt-3 pt-3 border-t border-border">
            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">NOVO CONTATO</p>
            <Input
              placeholder='Nome (ex: Amor ♥️)'
              value={novoContatoNome}
              onChange={e => setNovoContatoNome(e.target.value)}
              className="bg-secondary/50 border-border text-sm"
            />
            <Input
              placeholder="Número com DDD (ex: 5561999999999)"
              value={novoContatoNumero}
              onChange={e => setNovoContatoNumero(e.target.value)}
              className="bg-secondary/50 border-border text-sm"
            />
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={adicionarContato}
              disabled={!novoContatoNumero.trim()}
            >
              <Plus size={14} className="mr-2" />
              Adicionar contato
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal preview antes de enviar */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm tracking-widest flex items-center gap-2">
              <Send size={14} className="text-green-500" />
              PREVIEW — {contatoParaEnviar?.nome}
            </DialogTitle>
          </DialogHeader>
          <p className="text-[10px] text-muted-foreground">Edite a mensagem antes de enviar:</p>
          <Textarea
            value={previewMsg}
            onChange={e => setPreviewMsg(e.target.value)}
            className="bg-secondary/50 border-border text-xs min-h-[200px] resize-none font-mono leading-relaxed rounded-xl"
          />
          {/* MP3 Audio Preview Player */}
          {audioBlob && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50 border border-border">
              <Button
                size="sm"
                variant="outline"
                className="h-8 w-8 p-0"
                onClick={playMp3Preview}
                disabled={isConvertingMp3 || !mp3PreviewUrl}
              >
                {isPlayingMp3 ? <Square size={14} /> : <Play size={14} />}
              </Button>
              <div className="flex-1">
                <p className="text-[10px] font-mono text-muted-foreground">
                  {isConvertingMp3 ? "Convertendo para MP3..." : mp3PreviewUrl ? "🎙️ Áudio MP3 pronto" : "Preparando áudio..."}
                </p>
                {mp3PreviewBlob && (
                  <p className="text-[10px] text-muted-foreground/70">
                    {(mp3PreviewBlob.size / 1024).toFixed(0)} KB
                  </p>
                )}
              </div>
              {isConvertingMp3 && (
                <div className="h-4 w-4 border-2 border-muted-foreground/30 border-t-primary rounded-full animate-spin" />
              )}
            </div>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 text-xs"
              onClick={() => setShowPreviewModal(false)}
            >
              Cancelar
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs"
              onClick={enviarMensagem}
            >
              <Send size={12} className="mr-1" />
              Enviar via WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Biblia;
