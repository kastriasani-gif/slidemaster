import React, { useState, useCallback } from 'react';
import { DesignReview } from './components/DesignReview';
import { DeckViewer } from './components/DeckViewer';
import { generatePresentationContent } from './services/geminiService';
import { AppState, DesignSystem, PresentationData, UI_TEXT_EN, UIText } from './types';
import { AlertCircle } from 'lucide-react';

// Default design system - customize these values for your brand
const defaultDesignSystem: DesignSystem = {
  name: "Standard Theme",
  colors: {
    background: "#000000",
    text: "#FFFFFF",
    primary: "#FFFFFF",
    secondary: "#A1A1AA",
    accent: "#e4022b", // Change this to your brand color
  },
  fonts: {
    heading: "Inter, sans-serif",
    body: "Inter, sans-serif",
  },
  logo: {
    placement: "top-right",
    style: "light",
    images: {},
    maxHeight: 60 // Logo max height in pixels
  },
  masters: {
    title: { background: "#000000", textColor: "#FFFFFF", accentColor: "#e4022b" },
    section: { background: "#000000", textColor: "#FFFFFF", accentColor: "#e4022b" },
    default: { background: "#f8f7f6", textColor: "#363131", accentColor: "#e4022b" },
  },
  vibe: "Professional and modern",
  settings: {
    showPageNumbers: true,
    dateFormat: 'en-GB',
    endSlide: {
      title: "Thank You!",
      subtitle: "" // Leave empty or add your company name
    },
    language: 'en'
  }
};

// UI Text - can be switched based on language
const UI_TEXT: UIText = UI_TEXT_EN;

const App: React.FC = () => {
  const [state, setState] = useState<AppState>('review');
  const [designSystem, setDesignSystem] = useState<DesignSystem>(defaultDesignSystem);
  const [presentation, setPresentation] = useState<PresentationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async (topic: string, updatedSystem: DesignSystem) => {
    setDesignSystem(updatedSystem);
    setState('generating');
    setError(null);
    try {
      const slides = await generatePresentationContent(topic, updatedSystem);
      if (slides && slides.length > 0) {
        setPresentation({ topic, slides });
        setState('presentation');
      } else {
        throw new Error(UI_TEXT.errors.noSlides);
      }
    } catch (e) {
      console.error(e);
      setError(UI_TEXT.errors.generationFailed);
      setState('review');
    }
  }, []);

  const accentColor = designSystem.colors.accent;

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-black/50 backdrop-blur-md z-20">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight">
              Presentation <span style={{ color: accentColor }}>Engine</span>
            </h1>
            <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-widest">Intelligence Engine</p>
          </div>
        </div>
        
        <div className="flex items-center gap-6 text-xs font-medium text-zinc-500 uppercase tracking-widest">
          <span style={{ color: state === 'review' || state === 'generating' ? accentColor : undefined }}>
            1. {UI_TEXT.labels.configure}
          </span>
          <div className="w-4 h-[1px] bg-zinc-800" />
          <span style={{ color: state === 'presentation' ? accentColor : undefined }}>
            2. {UI_TEXT.labels.result}
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 container mx-auto px-4 py-12 flex flex-col items-center justify-center">
        {error && (
          <div className="w-full max-w-2xl mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div className="w-full flex justify-center">
          {(state === 'review' || state === 'generating') && (
            <DesignReview 
              system={designSystem} 
              onConfirm={handleGenerate}
              isLoading={state === 'generating'}
            />
          )}
        </div>
      </main>

      {/* DeckViewer - Moved outside of main to ensure correct z-index stacking */}
      {state === 'presentation' && presentation && (
        <DeckViewer 
          slides={presentation.slides} 
          system={designSystem}
          onClose={() => setState('review')}
        />
      )}

      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] blur-[120px] rounded-full mix-blend-screen" 
          style={{ backgroundColor: `${accentColor}10` }}
        />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-900/10 blur-[120px] rounded-full mix-blend-screen" />
      </div>
    </div>
  );
};

export default App;