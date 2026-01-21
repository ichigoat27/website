
import React, { useState } from 'react';
import { UploadedFile, SiteConfig } from '../types';
import { Upload, Trash2, FileText, Sparkles, Loader2, Image as ImageIcon } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';

interface AdminProps {
  files: UploadedFile[];
  onAddFile: (file: UploadedFile) => void;
  onRemoveFile: (id: string) => void;
  siteConfig: SiteConfig;
  onUpdateConfig: (config: Partial<SiteConfig>) => void;
}

export const Admin: React.FC<AdminProps> = ({ files, onAddFile, onRemoveFile, siteConfig, onUpdateConfig }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isLogoUploading, setIsLogoUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      onUpdateConfig({ logoUrl: event.target?.result as string });
      setIsLogoUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      
      let vibeCaption = "";
      if (file.type.startsWith('image/')) {
        try {
          const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
          const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
              parts: [
                { inlineData: { mimeType: file.type, data: dataUrl.split(',')[1] } },
                { text: "Generate a short, cool, one-sentence aesthetic 'vibe-coded' caption for this image. Just the caption." }
              ]
            }
          });
          vibeCaption = response.text || "";
        } catch (err) {
          console.error("AI error:", err);
        }
      }

      const newFile: UploadedFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl,
        timestamp: Date.now(),
        vibeCaption: vibeCaption.trim()
      };

      onAddFile(newFile);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 text-white">
      <div className="mb-12">
        <h1 className="text-5xl font-heading font-black mb-4">TERMINAL</h1>
        <p className="text-white/40">Master control for archive distribution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-1 space-y-8">
          {/* Site Settings Section */}
          <div className="glass p-8 rounded-[2rem] space-y-6">
            <h2 className="text-xl font-heading font-bold flex items-center gap-2">
              <ImageIcon size={20} className="text-orange-400" />
              Site Identity
            </h2>
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative group">
                {siteConfig.logoUrl ? (
                  <img src={siteConfig.logoUrl} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon size={32} className="text-white/20" />
                )}
                {isLogoUploading && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Loader2 size={24} className="animate-spin" />
                  </div>
                )}
              </div>
              <div className="relative">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <button className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold uppercase transition-colors">
                  Upload Icon
                </button>
              </div>
              {siteConfig.logoUrl && (
                <button 
                  onClick={() => onUpdateConfig({ logoUrl: undefined })}
                  className="text-[10px] text-red-400 uppercase tracking-widest hover:underline"
                >
                  Reset to Default
                </button>
              )}
            </div>
          </div>

          {/* Upload Section */}
          <div 
            className={`glass relative h-64 rounded-[2rem] border-2 border-dashed transition-all flex flex-col items-center justify-center p-8 text-center
              ${dragActive ? 'border-orange-500 bg-orange-500/10' : 'border-white/10'}
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
            `}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => { e.preventDefault(); setDragActive(false); }}
          >
            {isUploading ? (
              <div className="space-y-4">
                <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-400" />
                <p className="text-sm font-medium">Processing Archive...</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-4">
                  <Upload size={24} className="text-white/40" />
                </div>
                <h3 className="font-bold mb-2">Ingest New Asset</h3>
                <p className="text-xs text-white/30 mb-6 uppercase tracking-widest">Images or Documents</p>
                <input 
                  type="file" 
                  onChange={handleFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="px-6 py-3 bg-white text-black text-xs font-bold rounded-full uppercase">
                  Select File
                </div>
              </>
            )}
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Sparkles size={18} className="text-orange-400" />
            <h2 className="text-xl font-heading font-bold">Active Archives</h2>
          </div>
          
          {files.length === 0 ? (
            <div className="text-white/20 italic py-12 text-center glass rounded-3xl">
              No assets in current buffer.
            </div>
          ) : (
            <div className="space-y-3">
              {files.map((file) => (
                <div key={file.id} className="glass p-4 rounded-2xl flex items-center justify-between group hover:border-white/20 transition-all">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img src={file.dataUrl} className="w-full h-full object-cover" />
                      ) : (
                        <FileText size={20} className="text-white/40" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold truncate text-sm">{file.name}</h4>
                      <p className="text-[10px] text-white/30 uppercase tracking-tighter">
                        {new Date(file.timestamp).toLocaleDateString()} • {(file.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onRemoveFile(file.id)}
                    className="p-2 hover:bg-red-500/20 text-white/20 hover:text-red-400 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
