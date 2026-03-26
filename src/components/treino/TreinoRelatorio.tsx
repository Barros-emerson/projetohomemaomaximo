import { motion } from "framer-motion";
import { Trophy, Clock, Dumbbell, TrendingUp, Camera } from "lucide-react";

export interface RelatorioData {
  duracao: number; // seconds
  totalSeries: number;
  seriesCompletas: number;
  exercicios: {
    nome: string;
    setsCompletos: number;
    setsPlanejados: number;
    cargas: { set: number; kg: string }[];
  }[];
  fotos: string[];
  tipo: string;
  foco: string;
  emoji: string;
  colorClass: string;
  bgClass: string;
  borderClass: string;
}

const formatTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}min`;
  return `${m}min ${sec}s`;
};

const TreinoRelatorio = ({ data }: { data: RelatorioData }) => {
  const completionPct = data.totalSeries > 0
    ? Math.round((data.seriesCompletas / data.totalSeries) * 100)
    : 0;

  const maxLoad = data.exercicios.reduce((max, ex) => {
    const exMax = ex.cargas.reduce((m, c) => {
      const val = parseFloat(c.kg);
      return isNaN(val) ? m : Math.max(m, val);
    }, 0);
    return Math.max(max, exMax);
  }, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4"
    >
      {/* Header */}
      <div className={`surface-card p-5 border ${data.borderClass} text-center`}>
        <span className="text-4xl block mb-2">{data.emoji}</span>
        <h3 className={`font-mono text-lg font-extrabold tracking-wider ${data.colorClass}`}>
          TREINO FINALIZADO!
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          {data.tipo} · {data.foco}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className={`surface-card p-4 border ${data.borderClass}`}>
          <Clock size={16} className="text-muted-foreground mb-2" />
          <p className="font-mono text-xl font-extrabold text-foreground">{formatTime(data.duracao)}</p>
          <p className="text-[10px] text-muted-foreground font-mono tracking-wider">DURAÇÃO</p>
        </div>
        <div className={`surface-card p-4 border ${data.borderClass}`}>
          <Dumbbell size={16} className="text-muted-foreground mb-2" />
          <p className="font-mono text-xl font-extrabold text-foreground">
            {data.seriesCompletas}/{data.totalSeries}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono tracking-wider">SÉRIES</p>
        </div>
        <div className={`surface-card p-4 border ${data.borderClass}`}>
          <Trophy size={16} className="text-muted-foreground mb-2" />
          <p className={`font-mono text-xl font-extrabold ${data.colorClass}`}>{completionPct}%</p>
          <p className="text-[10px] text-muted-foreground font-mono tracking-wider">CONCLUSÃO</p>
        </div>
        <div className={`surface-card p-4 border ${data.borderClass}`}>
          <TrendingUp size={16} className="text-muted-foreground mb-2" />
          <p className="font-mono text-xl font-extrabold text-foreground">
            {maxLoad > 0 ? `${maxLoad}kg` : "—"}
          </p>
          <p className="text-[10px] text-muted-foreground font-mono tracking-wider">CARGA MÁX</p>
        </div>
      </div>

      {/* Exercise Details */}
      <div className={`surface-card p-4 border ${data.borderClass}`}>
        <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground mb-3">
          DETALHES POR EXERCÍCIO
        </h4>
        <div className="space-y-3">
          {data.exercicios.map((ex, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{ex.nome}</p>
                <div className="flex gap-1 mt-1">
                  {ex.cargas.length > 0 ? (
                    ex.cargas.map((c, ci) => (
                      <span
                        key={ci}
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${data.bgClass} ${data.colorClass}`}
                      >
                        {c.kg}kg
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] text-muted-foreground">sem carga registrada</span>
                  )}
                </div>
              </div>
              <div className="text-right">
                <span className={`font-mono text-sm font-bold ${
                  ex.setsCompletos === ex.setsPlanejados ? data.colorClass : "text-muted-foreground"
                }`}>
                  {ex.setsCompletos}/{ex.setsPlanejados}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Photos */}
      {data.fotos.length > 0 && (
        <div className={`surface-card p-4 border ${data.borderClass}`}>
          <div className="flex items-center gap-2 mb-3">
            <Camera size={14} className="text-muted-foreground" />
            <h4 className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">
              FOTOS DO TREINO
            </h4>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {data.fotos.map((photo, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden">
                <img src={photo} alt={`Treino ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default TreinoRelatorio;
