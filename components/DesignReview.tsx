import React, { useState, useRef } from 'react';
import { DesignSystem } from '../types';
import { ArrowRight, Sparkles, Wand2, LayoutTemplate, Palette, Type, Upload, Sun, Moon, Image as ImageIcon, Video, FileVideo } from 'lucide-react';

interface DesignReviewProps {
  system: DesignSystem;
  onConfirm: (topic: string, updatedSystem: DesignSystem) => void;
  isLoading: boolean;
}

export const DesignReview: React.FC<DesignReviewProps> = ({ system, onConfirm, isLoading }) => {
  const [topic, setTopic] = useState('');
  
  // State for dual logos
  const [lightLogo, setLightLogo] = useState<string | undefined>(system.logo.images?.light);
  const [darkLogo, setDarkLogo] = useState<string | undefined>(system.logo.images?.dark);
  
  // State for backgrounds
  const [titleBg, setTitleBg] = useState<string | undefined>(system.masters.title.backgroundImage);
  const [titleBgVideo, setTitleBgVideo] = useState<string | undefined>(system.masters.title.backgroundVideo);
  const [sectionBg, setSectionBg] = useState<string | undefined>(system.masters.section?.backgroundImage);
  const [defaultBg, setDefaultBg] = useState<string | undefined>(system.masters.default.backgroundImage);
  
  const lightLogoInputRef = useRef<HTMLInputElement>(null);
  const darkLogoInputRef = useRef<HTMLInputElement>(null);
  const titleBgInputRef = useRef<HTMLInputElement>(null);
  const sectionBgInputRef = useRef<HTMLInputElement>(null);
  const defaultBgInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'light' | 'dark') => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'light') {
          setLightLogo(reader.result as string);
        } else {
          setDarkLogo(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTitleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      if (file.type.startsWith('video/')) {
        reader.onloadend = () => {
          setTitleBgVideo(reader.result as string);
          setTitleBg(undefined); // Clear image if video is selected
        };
      } else {
        reader.onloadend = () => {
          setTitleBg(reader.result as string);
          setTitleBgVideo(undefined); // Clear video if image is selected
        };
      }
      reader.readAsDataURL(file);
    }
  };

  const handleSectionBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setSectionBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDefaultBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setDefaultBg(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateClick = () => {
    const updatedSystem: DesignSystem = {
      ...system,
      logo: {
        ...system.logo,
        images: {
          light: lightLogo,
          dark: darkLogo
        }
      },
      masters: {
        ...system.masters,
        title: {
          ...system.masters.title,
          backgroundImage: titleBg,
          backgroundVideo: titleBgVideo
        },
        section: {
          ...system.masters.section, 
          backgroundImage: sectionBg,
          background: system.masters.section?.background || system.masters.title.background,
          textColor: system.masters.section?.textColor || system.masters.title.textColor,
          accentColor: system.masters.section?.accentColor || system.masters.title.accentColor,
        },
        default: {
          ...system.masters.default,
          backgroundImage: defaultBg,
        }
      }
    };
    onConfirm(topic, updatedSystem);
  };

  return (
    <div className="max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="bg-zinc-900/80 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        
        {/* Hidden inputs */}
        <input 
           ref={titleBgInputRef}
           type="file" 
           accept="image/*,video/mp4,video/webm"
           className="hidden"
           onChange={handleTitleBgUpload}
         />
        <input 
           ref={sectionBgInputRef}
           type="file" 
           accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
           className="hidden"
           onChange={handleSectionBgUpload}
         />
        <input 
           ref={defaultBgInputRef}
           type="file" 
           accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
           className="hidden"
           onChange={handleDefaultBgUpload}
         />
        <input 
           ref={darkLogoInputRef}
           type="file" 
           accept="image/png,image/svg+xml,image/jpeg"
           className="hidden"
           onChange={(e) => handleLogoUpload(e, 'dark')}
         />
        <input 
           ref={lightLogoInputRef}
           type="file" 
           accept="image/png,image/svg+xml,image/jpeg"
           className="hidden"
           onChange={(e) => handleLogoUpload(e, 'light')}
         />

        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Configure Presentation</h2>
              <p className="text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Setup your brand assets and theme
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-0">
          {/* Left Column: Visual Specs */}
          <div className="lg:col-span-7 p-8 space-y-8 border-r border-white/5">
            
            {/* Colors */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                <Palette className="w-4 h-4" />
                Color Palette
              </div>
              <div className="grid grid-cols-5 gap-4">
                {Object.entries(system.colors).map(([key, hex]) => (
                  <div key={key} className="space-y-2 group">
                    <div 
                      className="w-full aspect-square rounded-xl shadow-lg ring-1 ring-inset ring-black/10 transition-transform group-hover:scale-105"
                      style={{ backgroundColor: hex }}
                    />
                    <div className="text-[10px] text-zinc-500 uppercase text-center truncate">{key}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {/* Typography */}
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  <Type className="w-4 h-4" />
                  Typography
                </div>
                <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/50 border border-white/5">
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Heading Font</div>
                    <div className="text-xl text-white truncate font-bold" style={{ fontFamily: system.fonts.heading }}>
                      Aa Bb Cc
                    </div>
                    <div className="text-[10px] text-zinc-600 truncate">{system.fonts.heading}</div>
                  </div>
                  <div>
                    <div className="text-zinc-500 text-xs mb-1">Body Font</div>
                    <div className="text-sm text-zinc-400 truncate" style={{ fontFamily: system.fonts.body }}>
                      The quick brown fox jumps.
                    </div>
                    <div className="text-[10px] text-zinc-600 truncate">{system.fonts.body}</div>
                  </div>
                </div>
              </div>

              {/* Master Slide & Logo Info */}
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">
                  <LayoutTemplate className="w-4 h-4" />
                  Master Template
                </div>
                <div className="space-y-4 p-5 rounded-2xl bg-zinc-950/50 border border-white/5 h-full relative group flex flex-col">
                   
                   {/* Background Graphics Upload */}
                   <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-xs text-zinc-500 uppercase tracking-wider">Background Assets</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 h-24">
                        {/* Title BG (Supports Image OR Video) */}
                        <div 
                           className="w-full h-full rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center transition-all group/bg relative overflow-hidden"
                           onClick={() => titleBgInputRef.current?.click()}
                         >
                           {titleBgVideo ? (
                              <>
                                <video 
                                  src={titleBgVideo}
                                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover/bg:opacity-40 transition-opacity"
                                  autoPlay muted loop playsInline
                                />
                                <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                                  <FileVideo className="w-3 h-3 text-white mb-1" />
                                  <span className="text-[8px] text-white font-medium">Video</span>
                                </div>
                              </>
                           ) : titleBg ? (
                              <>
                                <div 
                                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover/bg:opacity-40 transition-opacity" 
                                  style={{ backgroundImage: `url(${titleBg})` }} 
                                />
                                <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                                  <ImageIcon className="w-3 h-3 text-white mb-1" />
                                  <span className="text-[8px] text-white font-medium">Title</span>
                                </div>
                              </>
                           ) : (
                              <div className="text-center p-1">
                                 <div className="flex justify-center gap-1 mb-1 group-hover/bg:text-indigo-400 text-zinc-600 transition-colors">
                                   <ImageIcon className="w-3 h-3" />
                                   <Video className="w-3 h-3" />
                                 </div>
                                 <p className="text-[7px] text-zinc-400">Title Bg</p>
                              </div>
                           )}
                         </div>

                        {/* Section BG */}
                        <div 
                           className="w-full h-full rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center transition-all group/bg relative overflow-hidden"
                           onClick={() => sectionBgInputRef.current?.click()}
                         >
                           {sectionBg ? (
                              <>
                                <div 
                                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover/bg:opacity-40 transition-opacity" 
                                  style={{ backgroundImage: `url(${sectionBg})` }} 
                                />
                                <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                                  <ImageIcon className="w-3 h-3 text-white mb-1" />
                                  <span className="text-[8px] text-white font-medium">Topic</span>
                                </div>
                              </>
                           ) : (
                              <div className="text-center p-1">
                                 <ImageIcon className="w-3 h-3 text-zinc-600 mx-auto mb-1 group-hover/bg:text-indigo-400 transition-colors" />
                                 <p className="text-[7px] text-zinc-400">Topic Bg</p>
                              </div>
                           )}
                         </div>

                         {/* Default BG */}
                         <div 
                           className="w-full h-full rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 hover:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center transition-all group/bg relative overflow-hidden"
                           onClick={() => defaultBgInputRef.current?.click()}
                         >
                           {defaultBg ? (
                              <>
                                <div 
                                  className="absolute inset-0 bg-cover bg-center opacity-60 group-hover/bg:opacity-40 transition-opacity" 
                                  style={{ backgroundImage: `url(${defaultBg})` }} 
                                />
                                <div className="relative z-10 flex flex-col items-center drop-shadow-md">
                                  <ImageIcon className="w-3 h-3 text-white mb-1" />
                                  <span className="text-[8px] text-white font-medium">Content</span>
                                </div>
                              </>
                           ) : (
                              <div className="text-center p-1">
                                 <ImageIcon className="w-3 h-3 text-zinc-600 mx-auto mb-1 group-hover/bg:text-indigo-400 transition-colors" />
                                 <p className="text-[7px] text-zinc-400">Content Bg</p>
                              </div>
                           )}
                         </div>
                      </div>
                   </div>
                   
                   {/* Logo Logic */}
                   <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center mb-3">
                         <span className="text-xs text-zinc-500 uppercase tracking-wider">Logo Assets</span>
                         <span className="text-[9px] bg-indigo-500/10 text-indigo-400 px-1.5 py-0.5 rounded-full">
                           {system.logo.placement}
                         </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        {/* Dark Logo */}
                        <div 
                          onClick={() => darkLogoInputRef.current?.click()}
                          className="relative aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 bg-white hover:bg-zinc-100 cursor-pointer flex flex-col items-center justify-center transition-all group/dark"
                        >
                           {darkLogo ? (
                             <img src={darkLogo} alt="Dark Logo" className="w-3/4 h-3/4 object-contain" />
                           ) : (
                             <div className="text-center p-2">
                               <Moon className="w-4 h-4 text-zinc-800 mx-auto mb-1" />
                               <p className="text-[9px] text-zinc-600 font-medium">Dark Logo</p>
                               <p className="text-[8px] text-zinc-400">(For Light BG)</p>
                             </div>
                           )}
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/dark:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                             <Upload className="w-4 h-4 text-white" />
                           </div>
                        </div>

                        {/* Light Logo */}
                        <div 
                          onClick={() => lightLogoInputRef.current?.click()}
                          className="relative aspect-square rounded-xl border border-dashed border-zinc-700 hover:border-indigo-500 bg-zinc-950 hover:bg-zinc-900 cursor-pointer flex flex-col items-center justify-center transition-all group/light"
                        >
                           {lightLogo ? (
                             <img src={lightLogo} alt="Light Logo" className="w-3/4 h-3/4 object-contain" />
                           ) : (
                             <div className="text-center p-2">
                               <Sun className="w-4 h-4 text-zinc-200 mx-auto mb-1" />
                               <p className="text-[9px] text-zinc-300 font-medium">Light Logo</p>
                               <p className="text-[8px] text-zinc-500">(For Dark BG)</p>
                             </div>
                           )}
                           <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/light:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                             <Upload className="w-4 h-4 text-white" />
                           </div>
                        </div>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Vibe Analysis</h4>
              <p className="text-zinc-400 text-sm leading-relaxed border-l-2 border-indigo-500/50 pl-4">{system.vibe}</p>
            </div>
          </div>

          {/* Right Column: Generation Action */}
          <div className="lg:col-span-5 p-8 flex flex-col bg-zinc-900/50">
            <div className="flex-1 flex flex-col justify-center space-y-6">
              <div>
                <label className="block text-lg font-medium text-white mb-2">
                  Presentation Topic
                </label>
                <p className="text-zinc-400 text-sm mb-4">
                  We'll apply your custom design system to the content automatically.
                </p>
                <textarea 
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="Describe your presentation topic, audience, and key goals..."
                  className="w-full h-48 bg-zinc-950 text-white rounded-xl border border-zinc-700 p-4 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-zinc-600"
                />
              </div>
              
              <button
                disabled={!topic.trim() || isLoading}
                onClick={handleGenerateClick}
                className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
                  ${!topic.trim() || isLoading
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-500/20 hover:shadow-indigo-500/30 transform hover:-translate-y-1'
                  }
                `}
              >
                {isLoading ? (
                  <>
                    <Wand2 className="w-5 h-5 animate-spin" />
                    Generating Slides...
                  </>
                ) : (
                  <>
                    Generate Presentation
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};