import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, FileText, Loader2, FileType } from 'lucide-react';

interface FileData {
  base64: string;
  mimeType: string;
}

interface FileUploadProps {
  onFileSelect: (data: FileData) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, isLoading }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/gif', 'image/svg+xml'];
    const validDocTypes = ['application/pdf'];

    if (!validImageTypes.includes(file.type) && !validDocTypes.includes(file.type)) {
      if (file.name.endsWith('.pptx') || file.name.endsWith('.ppt')) {
        alert("For PowerPoint files, please save as PDF first to ensure accurate design analysis.");
      } else {
        alert("Please upload a valid Image (JPG, PNG, GIF, SVG) or PDF file.");
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix
      const base64 = result.split(',')[1];
      onFileSelect({ base64, mimeType: file.type });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div 
      className={`relative w-full max-w-2xl mx-auto h-96 border-2 border-dashed rounded-3xl transition-all duration-300 flex flex-col items-center justify-center p-8
        ${dragActive ? 'border-[#e4022b] bg-[#e4022b]/5' : 'border-zinc-700 bg-zinc-900/50 hover:border-zinc-500'}
        ${isLoading ? 'opacity-50 pointer-events-none' : ''}
      `}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".jpg,.jpeg,.png,.webp,.pdf,.gif,.svg"
        onChange={handleChange}
      />

      <div className="flex flex-col items-center gap-6 text-center">
        {isLoading ? (
          <div className="relative">
             <div className="absolute inset-0 bg-[#e4022b] blur-xl opacity-20 animate-pulse rounded-full"></div>
             <Loader2 className="w-16 h-16 text-[#e4022b] animate-spin relative z-10" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center shadow-2xl ring-1 ring-white/10 group-hover:scale-110 transition-transform duration-300">
            {dragActive ? <FileType className="w-8 h-8 text-[#e4022b]" /> : <Upload className="w-8 h-8 text-[#e4022b]" />}
          </div>
        )}
        
        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-white tracking-tight">
            {isLoading ? "Analyzing Design System..." : "Upload Presentation"}
          </h3>
          <p className="text-zinc-400 max-w-sm mx-auto leading-relaxed">
            {isLoading 
              ? "Extracting colors, fonts, and layout rules from your file."
              : "Drag & drop a PDF, Slide export, or Screenshot to reverse engineer its style."}
          </p>
        </div>

        {!isLoading && (
          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500 uppercase tracking-widest mt-4">
             <div className="flex items-center gap-1.5">
               <FileText className="w-4 h-4" />
               <span>PDF</span>
             </div>
             <div className="w-1 h-1 rounded-full bg-zinc-700" />
             <div className="flex items-center gap-1.5">
               <ImageIcon className="w-4 h-4" />
               <span>JPG, PNG, GIF, SVG</span>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};