import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, ExternalLink, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';
import { useState } from 'react';

interface DocumentViewerProps {
  url: string;
  name: string;
  onClose: () => void;
}

export function DocumentViewer({ url, name, onClose }: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const isPDF = url.toLowerCase().endsWith('.pdf') || url.includes('type=pdf');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-veto-black/90 backdrop-blur-md"
        />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-white w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden shadow-2xl relative flex flex-col border border-white/20"
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md z-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-50 rounded-2xl">
                <ExternalLink size={20} className="text-veto-black" />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900 tracking-tight truncate max-w-[200px] md:max-w-md">{name}</h3>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Prévisualisation Sécurisée</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center bg-gray-100 rounded-xl p-1 mr-4">
                <button 
                  onClick={() => setZoom(prev => Math.max(0.5, prev - 0.1))}
                  className="p-2 hover:bg-white rounded-lg transition-all text-gray-500"
                >
                  <ZoomOut size={18} />
                </button>
                <span className="px-3 text-xs font-black text-gray-900">{Math.round(zoom * 100)}%</span>
                <button 
                  onClick={() => setZoom(prev => Math.min(3, prev + 0.1))}
                  className="p-2 hover:bg-white rounded-lg transition-all text-gray-500"
                >
                  <ZoomIn size={18} />
                </button>
                <div className="w-px h-4 bg-gray-200 mx-1" />
                <button 
                  onClick={() => setRotation(prev => prev + 90)}
                  className="p-2 hover:bg-white rounded-lg transition-all text-gray-500"
                >
                  <RotateCw size={18} />
                </button>
              </div>

              <a 
                href={url} 
                download 
                className="p-3 bg-veto-yellow text-veto-black rounded-2xl hover:scale-105 transition-all shadow-lg shadow-veto-yellow/20"
              >
                <Download size={20} />
              </a>
              <button 
                onClick={onClose} 
                className="p-3 bg-gray-100 text-gray-500 hover:text-gray-900 rounded-2xl hover:bg-gray-200 transition-all"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Viewer Content */}
          <div className="flex-1 bg-gray-50 relative overflow-auto p-4 md:p-12 flex items-center justify-center">
            {isPDF ? (
              <iframe
                src={`${url}#toolbar=0`}
                className="w-full h-full rounded-xl shadow-premium bg-white border border-gray-100"
                title={name}
              />
            ) : (
              <div 
                className="transition-transform duration-200 ease-out flex items-center justify-center"
                style={{ 
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                }}
              >
                <img 
                  src={url} 
                  alt={name} 
                  className="max-w-full max-h-full rounded-xl shadow-premium object-contain bg-white border border-gray-100"
                />
              </div>
            )}
          </div>
          
          {/* Footer Info */}
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 text-center">
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">
              Propulsé par VetoCare Hub • Document Médical Protégé
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
