/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Car, 
  RefreshCcw, 
  Heart,
  User,
  Gavel,
  ChevronRight,
  ShieldAlert,
  Download,
  BrainCircuit,
  Settings2,
  Lock,
  Sparkles,
  Award
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { MoralEngine } from './engine.ts';
import { Dilemma, Scenario, EntityType, DilemmaFilters } from './types.ts';
import { analyzeEthicalDNA } from './services/geminiService.ts';

const engine = new MoralEngine();

const ENTITY_EMOJIS: Record<EntityType, string> = {
  MAN: '👨',
  WOMAN: '👩',
  CHILDBOY: '👦',
  CHILDGIRL: '👧',
  OLDMAN: '👴',
  OLDWOMAN: '👵',
  DOG: '🐕',
  CAT: '🐈',
  DOCTOR: '🩺',
  PREGNANT: '🤰',
  FATMAN: '🧔',
};

export default function App() {
  const [gameState, setGameState] = useState<'landing' | 'playing' | 'results'>('landing');
  const [dilemma, setDilemma] = useState<Dilemma | null>(null);
  const [results, setResults] = useState<any>(null);
  const [round, setRound] = useState(1);
  const [animating, setAnimating] = useState(false);
  const [complexity, setComplexity] = useState<'SIMPLE' | 'CHAOTIC'>('SIMPLE');
  const [filters, setFilters] = useState<DilemmaFilters>({});
  const [aiProfile, setAiProfile] = useState<any>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  useEffect(() => {
    if (gameState === 'playing' && !dilemma) {
      engine.setComplexity(complexity);
      engine.setFilters(filters);
      setDilemma(engine.generateDilemma());
    }
  }, [gameState]);

  const startNewGame = () => {
    engine.reset();
    engine.setComplexity(complexity);
    engine.setFilters(filters);
    setRound(1);
    setGameState('playing');
    setDilemma(engine.generateDilemma());
    setAiProfile(null);
  };

  const handleChoice = (choice: 'left' | 'right') => {
    if (!dilemma || animating) return;

    setAnimating(true);
    const chosen = choice === 'left' ? dilemma.left : dilemma.right;
    const other = choice === 'left' ? dilemma.right : dilemma.left;

    engine.recordDecision(chosen, other);

    if (engine.isFinished()) {
      setTimeout(() => {
        const finalResults = engine.calculateResults();
        setResults(finalResults);
        setGameState('results');
        setAnimating(false);
        triggerAiAnalysis(finalResults);
      }, 600);
    } else {
      setTimeout(() => {
        setDilemma(engine.generateDilemma());
        setRound(prev => prev + 1);
        setAnimating(false);
      }, 600);
    }
  };

  const triggerAiAnalysis = async (data: any) => {
    setLoadingAi(true);
    const profile = await analyzeEthicalDNA(data);
    setAiProfile(profile);
    setLoadingAi(false);
  };

  const exportReport = () => {
    const reportData = {
      game: "Teste sua moral",
      date: new Date().toISOString(),
      results: results,
      aiProfile: aiProfile
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-moral-${Date.now()}.json`;
    a.click();
  };

  if (gameState === 'landing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <div className="atmosphere-dark" />
        
        <header className="mb-12 space-y-4">
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="neu-flat p-4 rounded-3xl w-20 h-20 mx-auto flex items-center justify-center mb-6"
          >
            <BrainCircuit size={40} className="text-teal-400" />
          </motion.div>
          <h1 className="text-5xl font-extrabold tracking-tight uppercase title-glow">
            Teste sua <span className="text-teal-400">moral</span>
          </h1>
          <p className="text-text-dim text-lg max-w-lg mx-auto leading-relaxed">
            Uma exploração profunda sobre a ética humana e a autonomia das máquinas.
          </p>
        </header>

        <div className="space-y-8 w-full max-w-md">
          <div className="neu-flat p-8 rounded-3xl space-y-6">
            <div className="flex items-center justify-between text-sm uppercase tracking-widest font-bold text-text-dim">
              <div className="flex items-center gap-2">
                <Settings2 size={16} />
                <span>Nível de Complexidade</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => setComplexity('SIMPLE')}
                  className={`px-3 py-1 rounded-full transition-all ${complexity === 'SIMPLE' ? 'bg-teal-500 text-black' : 'bg-white/5 text-text-dim'}`}
                >
                  Simples
                </button>
                <button 
                  onClick={() => setComplexity('CHAOTIC')}
                  className={`px-3 py-1 rounded-full transition-all ${complexity === 'CHAOTIC' ? 'bg-rose-500 text-white' : 'bg-white/5 text-text-dim'}`}
                >
                  Caótico
                </button>
              </div>
            </div>
            
            <p className="text-xs text-text-dim italic">
              {complexity === 'SIMPLE' ? 'Cenários diretos com foco em poucos indivíduos.' : 'Multidões e variáveis complexas em cada decisão.'}
            </p>

            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-text-dim">
                <Gavel size={14} /> Filtros Avançados
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase text-white/40 font-bold block">Prioridade</label>
                  <select 
                    value={filters.prioritizeType || ''} 
                    onChange={(e) => setFilters(f => ({ ...f, prioritizeType: e.target.value as EntityType || undefined }))}
                    className="w-full bg-white/5 border-none rounded-lg p-2 text-[10px] text-white focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="">Nenhum</option>
                    <option value="CHILDBOY">👦 Criança</option>
                    <option value="DOCTOR">🩺 Médico</option>
                    <option value="PREGNANT">🤰 Gestante</option>
                    <option value="OLDMAN">👴 Idoso</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase text-white/40 font-bold block">Consistência Legal</label>
                  <select 
                    value={filters.forceLegality || ''} 
                    onChange={(e) => setFilters(f => ({ ...f, forceLegality: e.target.value as any || undefined }))}
                    className="w-full bg-white/5 border-none rounded-lg p-2 text-[10px] text-white focus:ring-1 focus:ring-teal-500 outline-none"
                  >
                    <option value="">Aleatório</option>
                    <option value="LEGAL">Sempre Verde</option>
                    <option value="ILLEGAL">Sempre Vermelho</option>
                  </select>
                </div>
              </div>
            </div>

            <button 
              onClick={startNewGame}
              className="w-full neu-button py-5 text-xl font-bold uppercase tracking-widest text-white rounded-2xl flex items-center justify-center gap-4 group"
            >
              Iniciar Exploração <ChevronRight className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 text-text-dim">
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <Lock size={12} />
              <span>Privacidade Garantida</span>
            </div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest">
              <Sparkles size={12} />
              <span>Análise via IA</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'results' && results) {
    const chartData = [
      { name: 'Humanos', value: (results.savedHumans / results.totalHumans) * 100 },
      { name: 'Leis', value: (results.savedLegal / results.totalDecisions) * 100 },
      { name: 'Jovens', value: (results.savedYoung / results.totalYoung) * 100 },
      { name: 'Feminino', value: (results.savedFemale / results.totalFemale) * 100 },
    ].map(d => ({ ...d, displayValue: isNaN(d.value) ? 50 : d.value }));

    const scatterData = results.history.map((d: any, i: number) => ({
      round: i + 1,
      humans: d.chosenScenario.entities.filter((e: any) => e.label !== 'Cachorro' && e.label !== 'Gato').length,
      legal: d.chosenScenario.legality === 'LEGAL' ? 1 : d.chosenScenario.legality === 'ILLEGAL' ? -1 : 0
    }));

    return (
      <div className="min-h-screen p-6 md:p-12 overflow-x-hidden">
        <div className="atmosphere-dark" />
        <div className="max-w-6xl mx-auto space-y-12 pb-20">
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-10">
            <div className="space-y-2 text-center md:text-left">
              <h1 className="text-4xl font-extrabold uppercase tracking-tighter">Moral <span className="text-teal-400">Insights</span></h1>
              <p className="text-text-dim font-mono text-xs uppercase tracking-widest">Exploração Ética Finalizada</p>
            </div>
            <div className="flex gap-4">
              <button 
                onClick={exportReport}
                className="neu-button px-6 py-3 rounded-xl flex items-center gap-3 text-xs uppercase font-bold tracking-widest"
              >
                <Download size={16} /> Relatório
              </button>
              <button 
                onClick={startNewGame}
                className="neu-button px-6 py-3 rounded-xl flex items-center gap-3 text-xs uppercase font-bold tracking-widest text-teal-400"
              >
                <RefreshCcw size={16} /> Reset
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* AI DNA Section */}
              <div className="neu-flat p-8 rounded-[40px] border border-white/5 relative overflow-hidden">
                {loadingAi && (
                  <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center z-10">
                    <div className="w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                    <p className="font-mono text-[10px] uppercase tracking-widest animate-pulse">Sincronizando Oráculo...</p>
                  </div>
                )}
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="p-4 bg-teal-500/10 rounded-2xl">
                    <BrainCircuit size={32} className="text-teal-400" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold uppercase tracking-tight">DNA Ético</h2>
                    <p className="text-text-dim text-xs uppercase tracking-widest font-mono">Personalidade Moral via IA</p>
                  </div>
                </div>

                {aiProfile && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                    <div className="flex items-baseline gap-4">
                      <span className="text-text-dim text-sm italic font-serif">Perfil:</span>
                      <h3 className="text-3xl font-black text-teal-400 uppercase italic">
                        {aiProfile.archetype}
                      </h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed text-lg font-light">
                      {aiProfile.description}
                    </p>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                      <div className="flex items-center gap-2 mb-3 text-rose-400 text-xs font-bold uppercase tracking-widest">
                        <ShieldAlert size={14} /> Momento de Ruptura (Round {aiProfile.criticalDecisionRound})
                      </div>
                      <p className="text-sm text-text-dim leading-relaxed">
                        {aiProfile.criticalDecisionAnalysis}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {aiProfile.traits.map((trait: string, i: number) => (
                        <span key={i} className="px-4 py-2 bg-white/5 border border-white/5 rounded-full text-[10px] uppercase font-bold tracking-widest text-teal-200">
                          {trait}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Scatter Chart Section */}
              <div className="neu-flat p-8 rounded-[40px] border border-white/5">
                <h3 className="text-xl font-bold uppercase mb-8 flex items-center gap-3">
                  <Award size={20} className="text-rose-400" /> Dispersão: Salvos vs Legalidade
                </h3>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                      <XAxis 
                        type="number" 
                        dataKey="humans" 
                        name="Humanos" 
                        stroke="#888" 
                        fontSize={10} 
                        label={{ value: 'Humanos Salvos', position: 'insideBottom', offset: -10, fill: '#888', fontSize: 10 }} 
                      />
                      <YAxis 
                        type="number" 
                        dataKey="legal" 
                        name="Adesão à Lei" 
                        stroke="#888" 
                        fontSize={10} 
                        domain={[-1.2, 1.2]} 
                        ticks={[-1, 0, 1]}
                        tickFormatter={(v) => v === 1 ? 'LEGAL' : v === -1 ? 'ILEGAL' : 'Ocu.'}
                      />
                      <ZAxis type="number" range={[100, 100]} />
                      <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: '#121212', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }} />
                      <Scatter name="Decisões" data={scatterData} fill="#14b8a6" />
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-[10px] text-text-dim mt-4 uppercase text-center font-mono tracking-widest">
                  Cada ponto representa um dos 13 dilemas enfrentados.
                </p>
              </div>
            </div>

            {/* Sidebar Stats & Timeline */}
            <div className="space-y-6">
               <div className="neu-flat p-8 rounded-[40px] border border-white/5 flex flex-col items-center text-center">
                  <div className="w-16 h-16 neu-inset rounded-full flex items-center justify-center mb-4">
                    <Heart size={28} className="text-rose-500" />
                  </div>
                  <h4 className="text-4xl font-black">{results.savedHumans}</h4>
                  <span className="text-text-dim text-[10px] uppercase tracking-widest mt-1">Vidas Preservadas</span>
               </div>

               <div className="neu-flat p-8 rounded-[40px] border border-white/5 max-h-[500px] overflow-y-auto custom-scrollbar">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-[#888] mb-8 text-center sticky top-0 bg-[#121212] py-2 z-10">Histórico de Decisões</h4>
                  <div className="space-y-8 relative">
                    <div className="absolute left-4 top-0 bottom-0 w-px bg-white/5" />
                    {results.history.map((d: any, i: number) => (
                      <div key={i} className={`relative pl-12 transition-opacity duration-500 ${aiProfile?.criticalDecisionRound === (i + 1) ? 'opacity-100' : 'opacity-40 hover:opacity-100'}`}>
                        <div className={`absolute left-2 top-1 w-4 h-4 rounded-full border-2 border-[#121212] ${aiProfile?.criticalDecisionRound === (i + 1) ? 'bg-rose-500' : 'bg-teal-500'}`} />
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-white/40 mb-1 block">CASO {i+1}</span>
                            {aiProfile?.criticalDecisionRound === (i + 1) && (
                              <span className="text-[8px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-bold">PIVÔ</span>
                            )}
                          </div>
                          <p className="text-xs font-bold uppercase tracking-tight text-white/80">
                            {d.chosenScenario.isPassengers ? 'Passageiros' : 'Pedestres'}
                          </p>
                          <div className="flex gap-1 overflow-x-hidden pt-1">
                            {d.chosenScenario.entities.map((e: any, idx: number) => (
                              <span key={idx} className="text-lg">{ENTITY_EMOJIS[e.type]}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col selection:bg-teal-500/30 font-sans">
      <div className="atmosphere-dark" />
      
      {/* Progress */}
      <div className="h-1 fixed top-0 left-0 right-0 z-50 bg-white/5">
        <motion.div 
          className="h-full bg-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.6)]"
          animate={{ width: `${(round / 13) * 100}%` }}
        />
      </div>

      <header className="px-8 py-6 flex justify-between items-center z-40">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-xl neu-flat flex items-center justify-center">
             <BrainCircuit size={18} className="text-teal-400" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-widest text-white/60">Auditório Ético</h2>
        </div>
        <div className="neu-inset px-4 py-2 rounded-full font-mono text-[10px] uppercase tracking-[0.3em] text-teal-400 font-bold">
          Caso {round.toString().padStart(2, '0')} / 13
        </div>
      </header>

      <main className="flex-1 flex flex-col relative px-6 md:px-0">
        <AnimatePresence mode="wait">
          {dilemma && (
            <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-0" key={dilemma.left.id + dilemma.right.id}>
              <ScenarioView scenario={dilemma.left} side="left" onSelect={() => handleChoice('left')} animating={animating} />
              <div className="hidden md:flex flex-col items-center justify-center p-4">
                <div className="w-px h-24 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
                <div className="w-10 h-10 neu-flat rounded-full flex items-center justify-center font-black text-xs text-text-dim my-4">VS</div>
                <div className="w-px h-24 bg-gradient-to-t from-transparent via-white/10 to-transparent" />
              </div>
              <ScenarioView scenario={dilemma.right} side="right" onSelect={() => handleChoice('right')} animating={animating} />
            </div>
          )}
        </AnimatePresence>
      </main>

      <footer className="p-8 text-center text-[10px] uppercase tracking-[0.4em] font-medium text-text-dim">
        Exploração Ética Digital • AI Powered Analytics 2026
      </footer>
    </div>
  );
}

function ScenarioView({ scenario, side, onSelect, animating }: { scenario: Scenario, side: 'left' | 'right', onSelect: () => void, animating: boolean }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className={`flex-1 flex flex-col p-6 md:p-12 items-center justify-center relative cursor-pointer group select-none ${animating ? 'pointer-events-none' : ''}`}
      onClick={onSelect}
    >
      <div className="max-w-md w-full space-y-10 text-center">
        <div className="space-y-4">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
            scenario.isPassengers ? 'neu-inset text-rose-400' : 'neu-inset text-teal-400'
          }`}>
             {scenario.isPassengers ? <Car size={14} /> : <ShieldAlert size={14} />}
             <span>{scenario.isPassengers ? 'Salvar Ocupantes' : 'Salvar Pedestres'}</span>
          </div>
          <h4 className="text-2xl font-bold text-white tracking-tight leading-relaxed group-hover:scale-[1.02] transition-transform duration-500">
            {scenario.isPassengers 
                ? 'O veículo seguirá em frente, preservando a vida dos passageiros, mas causando a morte inevitável de quem estiver no caminho.'
                : 'O veículo desviará bruscamente para uma colisão fatal contra a barreira, sacrificando todos a bordo para poupar a vida dos pedestres.'}
          </h4>
        </div>

        <div className="relative py-8">
          {/* Legality indicator */}
           {scenario.legality !== 'NONE' && (
              <div className={`mb-6 flex items-center justify-center gap-3 font-mono text-[9px] uppercase font-bold tracking-widest ${scenario.legality === 'LEGAL' ? 'text-teal-400' : 'text-rose-500'}`}>
                {scenario.legality === 'LEGAL' ? 'Sinal: Livre Atravessia' : 'Sinal: Proibido Atravessar'}
              </div>
           )}

          <div className="neu-flat rounded-[40px] p-10 flex flex-wrap justify-center gap-6 group-hover:shadow-[0_0_30px_rgba(255,255,255,0.05)] transition-all">
            {scenario.entities.map((entity, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <span className="text-5xl filter transition-transform duration-500 group-hover:scale-110 drop-shadow-[0_5px_15px_rgba(0,0,0,0.5)]">
                  {ENTITY_EMOJIS[entity.type]}
                </span>
                <span className="text-[9px] font-bold uppercase text-text-dim tracking-tighter opacity-60 group-hover:opacity-100">{entity.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-center gap-4">
           <div className="w-10 h-1 neu-inset rounded-full group-hover:w-20 transition-all duration-700" />
           <p className="font-extrabold text-[10px] uppercase tracking-[0.2em] text-teal-400/0 group-hover:text-teal-400 transition-all">
              Confirmar Escolha
           </p>
        </div>
      </div>
    </motion.div>
  );
}

function IdentityBadge({ label, percent, color }: { label: string, percent: number, color: 'teal' | 'rose' }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-[10px] uppercase font-bold tracking-widest text-[#888]">
        <span>{label}</span>
        <span className={color === 'teal' ? 'text-teal-400' : 'text-rose-400'}>{percent}%</span>
      </div>
      <div className="h-2 neu-inset rounded-full overflow-hidden">
        <motion.div 
          className={`h-full ${color === 'teal' ? 'bg-teal-500' : 'bg-rose-500'}`}
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 1 }}
        />
      </div>
    </div>
  );
}


