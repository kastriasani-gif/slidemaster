import React, { useState } from 'react';
import { DesignReview } from './components/DesignReview';
import { DeckViewer } from './components/DeckViewer';
import { generatePresentationContent } from './services/geminiService';
import { AppState, DesignSystem, PresentationData } from './types';
import { MonitorPlay } from 'lucide-react';

const defaultDesignSystem: DesignSystem = {
  name: "Custom Presentation Theme",
  colors: {
    background: "#000000",
    text: "#FFFFFF",
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    accent: "#E30613", 
  },
  fonts: {
    heading: "Arial, sans-serif",
    body: "Arial, sans-serif",
  },
  logo: {
    placement: "top-right",
    style: "light",
    images: {}
  },
  masters: {
    title: {
      background: "#000000",
      textColor: "#FFFFFF",
      accentColor: "#E30613",
    },
    section: {
      background: "#000000",
      textColor: "#FFFFFF",
      accentColor: "#E30613",
    },
    default: {
      background: "#000000",
      textColor: "#FFFFFF",
      accentColor: "#E30613",
    },
  },
  vibe: "Professional, clear, and impactful.",
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('review');
  const [designSystem, setDesignSystem] = useState<DesignSystem | null>(defaultDesignSystem);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (topic: string, updatedSystem: DesignSystem) => {
    // Update the system in state with any changes (like the uploaded logo)
    setDesignSystem(updatedSystem);
    
    try {
      setIsLoading(true);
      const slides = await generatePresentationContent(topic, updatedSystem);
      setPresentation({ topic, slides });
      setState('presentation');
    } catch (e) {
      console.error(e);
      alert('Failed to generate content. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-indigo-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-indigo-900/20 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full" />
      </div>

      {state !== 'presentation' && (
        <header className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
               <MonitorPlay className="w-6 h-6 text-white" />
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight">Presentation<span className="text-indigo-400">Intelligence</span></h1>
               <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Engine v1.0</p>
             </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm font-medium text-zinc-500">
             <span className={state === 'review' ? 'text-indigo-400' : ''}>1. Configuration</span>
             <div className="w-4 h-[1px] bg-zinc-800" />
             <span className={state === 'presentation' ? 'text-indigo-400' : ''}>2. Result</span>
          </div>
        </header>
      )}

      <main className="relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        
        {state === 'review' && designSystem && (
          <DesignReview 
            system={designSystem} 
            onConfirm={handleGenerate}
            isLoading={isLoading}
          />
        )}

        {state === 'presentation' && presentation && designSystem && (
          <DeckViewer 
            slides={presentation.slides} 
            system={designSystem}
            onClose={() => setState('review')}
          />
        )}
      </main>
    </div>
  );
};

export default App;