import React, { useState } from 'react';
import { DesignSystem, UI_TEXT_EN } from '../types';
import { Settings, Upload, Play, Sparkles, Loader2 } from 'lucide-react';

interface DesignReviewProps {
  system: DesignSystem;
  onConfirm: (topic: string, system: DesignSystem) => void;
  isLoading: boolean;
}

export const DesignReview: React.FC<DesignReviewProps> = ({ system, onConfirm, isLoading }) => {
  const [topic, setTopic] = useState("Digital Marketing Strategy 2025");
  const [localSystem, setLocalSystem] = useState<DesignSystem>(system);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSystem(prev => ({
          ...prev,
          logo: {
            ...prev.logo,
            images: {
              ...prev.logo.images,
              [type]: reader.result as string
            }
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLocalSystem(prev => ({
          ...prev,
          masters: {
            ...prev.masters,
            title: { ...prev.masters.title, backgroundVideo: reader.result as string },
             section: { ...prev.masters.section, backgroundVideo: reader.result as string },
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full max-w-4xl animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Left Column: Configuration */}
        <div className="space-y-8">
          
          <div className="space-y-4">
            <label className="text-xs font-bold tracking-widest text-zinc-500 uppercase">
              {UI_TEXT_EN.labels.presentationTopic}
            </label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 text-xl font-medium text-white focus:ring-2 focus:ring-[#e4022b] focus:border-transparent outline-none transition-all resize-none h-32"
              placeholder="e.g. Q4 Financial Review..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4 text-[#e4022b]" />
              <span className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Branding Assets</span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Light Logo Upload */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'light')}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                   {localSystem.logo.images?.light ? (
                     <img src={localSystem.logo.images.light} className="h-8 object-contain mb-2" alt="Light Logo" />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                       <Upload className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                     </div>
                   )}
                   <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">Light Logo</span>
                   <span className="text-[10px] text-zinc-600">(For Dark Bg)</span>
                </div>
              </div>

              {/* Dark Logo Upload */}
              <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors group relative overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => handleLogoUpload(e, 'dark')}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center gap-2 text-center">
                   {localSystem.logo.images?.dark ? (
                     <img src={localSystem.logo.images.dark} className="h-8 object-contain mb-2" alt="Dark Logo" />
                   ) : (
                     <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2">
                       <Upload className="w-5 h-5 text-zinc-500 group-hover:text-white transition-colors" />
                     </div>
                   )}
                   <span className="text-xs font-medium text-zinc-400 group-hover:text-white transition-colors">Dark Logo</span>
                   <span className="text-[10px] text-zinc-600">(For Light Bg)</span>
                </div>
              </div>
            </div>

            {/* Video Upload */}
            <div className="relative group">
              <input 
                  type="file" 
                  accept="video/mp4,video/webm"
                  onChange={handleVideoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              <div className="w-full p-4 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center flex-shrink-0 group-hover:bg-[#e4022b]/10 group-hover:text-[#e4022b] transition-colors">
                  <Play className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {localSystem.masters.title.backgroundVideo ? "Video Uploaded" : "Background Video Loop"}
                  </p>
                  <p className="text-xs text-zinc-500">MP4 or WebM (Title Slides)</p>
                </div>
                <Upload className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
              </div>
            </div>
          </div>

          <button
            onClick={() => onConfirm(topic, localSystem)}
            disabled={isLoading || !topic.trim()}
            className="w-full py-4 bg-white text-black rounded-xl font-bold text-lg tracking-wide hover:bg-zinc-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.4)]"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {UI_TEXT_EN.buttons.generating}
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                {UI_TEXT_EN.buttons.generate}
              </>
            )}
          </button>
        </div>

        {/* Right Column: Preview Card */}
        <div className="relative hidden lg:block">
          <div className="sticky top-8">
             <div className="text-xs font-bold tracking-widest text-zinc-500 uppercase mb-4 text-center">Style Preview</div>
             <div className="aspect-video bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-800">
                {/* Background */}
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-all duration-500"
                  style={{ 
                    backgroundColor: localSystem.masters.title.background,
                    backgroundImage: localSystem.masters.title.backgroundVideo ? 'none' : `url(${localSystem.masters.title.backgroundImage})`
                  }}
                >
                   {localSystem.masters.title.backgroundVideo && (
                     <video 
                       src={localSystem.masters.title.backgroundVideo} 
                       className="w-full h-full object-cover" 
                       autoPlay muted loop playsInline 
                     />
                   )}
                </div>

                {/* Overlay for readability if image exists */}
                {localSystem.masters.title.backgroundImage && !localSystem.masters.title.backgroundVideo && (
                    <div className="absolute inset-0 bg-black/30" />
                )}

                {/* Logo Preview */}
                <div className="absolute top-8 right-8 w-32 h-12 flex items-center justify-end z-20">
                   {localSystem.logo.images?.light && (
                     <img src={localSystem.logo.images.light} className="max-h-full object-contain" alt="Logo" />
                   )}
                </div>

                {/* Content Preview */}
                <div className="absolute inset-0 flex flex-col justify-end p-12 z-10">
                   <h1 
                    className="text-4xl font-bold mb-2 leading-tight"
                    style={{ 
                      color: localSystem.masters.title.textColor,
                      fontFamily: localSystem.fonts.heading
                    }}
                   >
                     {topic || "Presentation Title"}
                   </h1>
                   <div 
                    className="h-1 w-20 mb-4"
                    style={{ backgroundColor: localSystem.colors.accent }}
                   />
                   <p className="opacity-60 text-sm" style={{ color: localSystem.masters.title.textColor }}>
                     {new Date().getFullYear()} Strategic Overview
                   </p>
                </div>
             </div>
             
             <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Primary Font</div>
                  <div className="text-sm font-medium">{localSystem.fonts.heading.split(',')[0]}</div>
                </div>
                <div className="bg-zinc-900/30 rounded-xl p-4 border border-zinc-800">
                  <div className="text-xs text-zinc-500 mb-1">Accent Color</div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: localSystem.colors.accent }} />
                    <div className="text-sm font-medium uppercase">{localSystem.colors.accent}</div>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};