export interface FrasePoder {
  texto: string;
  autor: string;
  obra?: string;
}

export const frasesPoder: FrasePoder[] = [
  // Maquiavel — O Príncipe
  { texto: "Todo mundo vê o que você parece ser; poucos sentem o que você realmente é.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Nunca tente vencer pela força o que pode ser vencido pelo engano.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "É melhor ser temido do que amado, se não é possível ser ambos.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Os homens julgam mais pelos olhos do que pelas mãos.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "O primeiro método para estimar a inteligência de um governante é olhar para os homens que ele tem ao seu redor.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "As injúrias devem ser feitas todas de uma vez, para que, sendo menos saboreadas, ofendam menos.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Quem deseja ser obedecido deve saber mandar.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Não há nada mais difícil de realizar, mais perigoso de conduzir, ou mais incerto quanto ao sucesso, do que tomar a liderança na introdução de uma nova ordem de coisas.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Os homens hesitam menos em prejudicar alguém que se faz amar do que alguém que se faz temer.", autor: "Maquiavel", obra: "O Príncipe" },
  { texto: "Um homem prudente deve sempre seguir os caminhos traçados por grandes homens.", autor: "Maquiavel", obra: "O Príncipe" },

  // Sun Tzu — A Arte da Guerra
  { texto: "Apareça fraco quando for forte e forte quando for fraco.", autor: "Sun Tzu", obra: "A Arte da Guerra" },
  { texto: "A suprema arte da guerra é subjugar o inimigo sem lutar.", autor: "Sun Tzu", obra: "A Arte da Guerra" },
  { texto: "No meio do caos, há também oportunidade.", autor: "Sun Tzu", obra: "A Arte da Guerra" },
  { texto: "Quem conhece o inimigo e conhece a si mesmo não precisa temer o resultado de cem batalhas.", autor: "Sun Tzu", obra: "A Arte da Guerra" },
  { texto: "Toda guerra é baseada no engano.", autor: "Sun Tzu", obra: "A Arte da Guerra" },

  // Musashi — O Livro dos Cinco Anéis
  { texto: "Não há nada fora de você que possa lhe dar poder, paz ou iluminação.", autor: "Miyamoto Musashi", obra: "O Livro dos Cinco Anéis" },
  { texto: "Pense leve de si mesmo e profundamente do mundo.", autor: "Miyamoto Musashi", obra: "O Livro dos Cinco Anéis" },
  { texto: "A disciplina é mais forte que o número. A disciplina é mais forte que o impulso.", autor: "Miyamoto Musashi", obra: "O Livro dos Cinco Anéis" },
  { texto: "Não durma sob um telhado. Carregue pouco dinheiro e nenhuma comida. Viaje leve.", autor: "Miyamoto Musashi", obra: "Dokkōdō" },

  // Marco Aurélio — Meditações
  { texto: "Você tem poder sobre sua mente, não sobre os eventos. Perceba isso e encontrará força.", autor: "Marco Aurélio", obra: "Meditações" },
  { texto: "A melhor vingança é não ser como aquele que te feriu.", autor: "Marco Aurélio", obra: "Meditações" },
  { texto: "Perca tempo com raiva e você perderá sessenta segundos de paz.", autor: "Marco Aurélio", obra: "Meditações" },
  { texto: "Muito do que nos aflige é mais suportável do que nós pensamos.", autor: "Marco Aurélio", obra: "Meditações" },

  // Sêneca
  { texto: "Não é porque as coisas são difíceis que não ousamos; é porque não ousamos que elas são difíceis.", autor: "Sêneca", obra: "Cartas a Lucílio" },
  { texto: "Enquanto perdemos tempo hesitando e adiando, a vida vai passando.", autor: "Sêneca", obra: "Sobre a Brevidade da Vida" },
  { texto: "Quem se poupa a si mesmo prescreve-se uma doença da qual não escapará.", autor: "Sêneca" },

  // Epicteto
  { texto: "O homem que sofre antes de ser necessário sofre mais do que o necessário.", autor: "Epicteto", obra: "Discursos" },
  { texto: "Não explique sua filosofia. Incorpore-a.", autor: "Epicteto", obra: "Encheirídion" },

  // Robert Greene — 48 Leis do Poder
  { texto: "Quando mostrar ao mundo o que pode fazer, gaste a menor quantidade de palavras possível.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Fale sempre menos do que o necessário.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Faça seus feitos parecerem sem esforço.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Use a ausência seletiva para aumentar respeito e honra.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Aprenda a manter as pessoas dependentes de você.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Domine a arte do tempo. Nunca pareça ter pressa.", autor: "Robert Greene", obra: "48 Leis do Poder" },
  { texto: "Planeje até o fim. Nunca reaja, sempre antecipe.", autor: "Robert Greene", obra: "48 Leis do Poder" },

  // Nietzsche
  { texto: "Aquele que tem um porquê para viver pode suportar quase qualquer como.", autor: "Friedrich Nietzsche", obra: "Crepúsculo dos Ídolos" },
  { texto: "Os que eram vistos dançando eram tidos como loucos pelos que não podiam ouvir a música.", autor: "Friedrich Nietzsche" },

  // Outros
  { texto: "Os homens fortes criam bons tempos. Bons tempos criam homens fracos.", autor: "G. Michael Hopf" },
  { texto: "Disciplina é a ponte entre metas e conquistas.", autor: "Jim Rohn" },
  { texto: "Não reze por uma vida fácil; reze para ser um homem forte.", autor: "Bruce Lee" },
  { texto: "Sob pressão, você não se eleva ao nível das expectativas. Você cai ao nível do seu treinamento.", autor: "Arquíloco" },
  { texto: "Só existe um modo de evitar críticas: não faça nada, não diga nada, não seja nada.", autor: "Aristóteles" },
  { texto: "O lobo que caça em silêncio é o que mais mata.", autor: "Provérbio" },

  // 365 dias — extras
  { texto: "Quanto mais silencioso você se torna, mais consegue ouvir.", autor: "Rumi" },
  { texto: "Se quer controlar os outros, primeiro controle a si mesmo.", autor: "Miyamoto Musashi" },
  { texto: "O destino favorece os audaciosos.", autor: "Virgílio", obra: "Eneida" },
  { texto: "Que seus planos sejam escuros e impenetráveis como a noite, e quando agir, caia como um raio.", autor: "Sun Tzu", obra: "A Arte da Guerra" },
  { texto: "Grandes espíritos sempre encontraram oposição violenta de mentes medíocres.", autor: "Albert Einstein" },
  { texto: "Fale apenas quando puder melhorar o silêncio.", autor: "Provérbio" },
  { texto: "Um rei não precisa declarar que é rei.", autor: "Tywin Lannister" },
  { texto: "Deixe que seus movimentos falem por você.", autor: "Provérbio Samurai" },
];

export const getFraseHoje = (): FrasePoder => {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const diff = Date.now() - start.getTime();
  const dayOfYear = Math.floor(diff / 86400000);
  return frasesPoder[dayOfYear % frasesPoder.length];
};
