import React, { useState } from 'react';
import { Plus, X, Sparkles } from 'lucide-react';

interface InputSectionProps {
  onProcess: (text: string) => void;
  isProcessing: boolean;
  isOpen: boolean;
  onClose: () => void;
}

export const InputSection: React.FC<InputSectionProps> = ({ onProcess, isProcessing, isOpen, onClose }) => {
  const [text, setText] = useState('');

  if (!isOpen) return null;

  const handleProcess = () => {
    if (text.trim()) {
      onProcess(text);
      setText(''); // Clear after processing
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="font-bold text-gray-800 flex items-center gap-2">
            <div className="bg-indigo-600 text-white p-1 rounded">
              <Plus size={16} />
            </div>
            Novo Pedido
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200 p-2 rounded-full transition-all"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 flex-1 flex flex-col gap-4">
          <p className="text-sm text-gray-500">
            Cole o texto bruto do pedido abaixo. A IA irá extrair os dados e criar o cartão na coluna do <strong>W (Design)</strong>.
          </p>
          <textarea
            className="w-full flex-1 min-h-[200px] p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none font-mono text-sm leading-relaxed bg-gray-50 focus:bg-white transition-all"
            placeholder="Ex: === XQPQYDUST === ID: 381880614..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isProcessing}
            autoFocus
          />
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleProcess}
            disabled={isProcessing || !text.trim()}
            className={`
              px-6 py-2 rounded-lg font-medium text-white shadow-md flex items-center gap-2 transition-all
              ${isProcessing || !text.trim() 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:scale-95'}
            `}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Criar Ordem
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
