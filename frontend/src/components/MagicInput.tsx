import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, FileText, Loader2 } from 'lucide-react';

interface MagicInputProps {
    onSendMessage: (message: string) => void;
    onFileUpload?: (file: File) => void;
    isProcessing?: boolean;
}

export default function MagicInput({ onSendMessage, onFileUpload, isProcessing = false }: MagicInputProps) {
    const [message, setMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (message.trim() && !isProcessing) {
            onSendMessage(message);
            setMessage('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0 && onFileUpload) {
            // Just handle the first file for now or batch them
            onFileUpload(files[0]);
        }
    }, [onFileUpload]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0 && onFileUpload) {
            onFileUpload(e.target.files[0]);
        }
    };

    return (
        <div
            className={`relative w-full max-w-4xl mx-auto transition-all duration-300 ${isDragging ? 'scale-105' : ''
                }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            {/* Drag Overlay Effect */}
            {isDragging && (
                <div className="absolute inset-0 -top-12 bg-blue-500/20 border-2 border-blue-500/50 rounded-2xl backdrop-blur-sm flex items-center justify-center z-50 animate-pulse">
                    <div className="text-blue-100 font-medium flex items-center gap-2">
                        <Paperclip className="w-6 h-6" />
                        Drop to Absorb Memory
                    </div>
                </div>
            )}

            <form
                onSubmit={handleSubmit}
                className={`
          flex items-end gap-2 p-1.5 rounded-2xl
          bg-[#030712]/40 backdrop-blur-xl border border-white/5
          focus-within:border-white/20 focus-within:bg-[#030712]/60
          shadow-2xl transition-all duration-300
        `}
            >
                {/* File Trigger Button */}
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                    disabled={isProcessing}
                >
                    <Paperclip className="w-5 h-5" />
                </button>
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.txt,.md,.docx"
                />

                {/* Text Input */}
                <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isProcessing ? "Absorbing Stream..." : "Input concept or drop file..."}
                    className="w-full bg-transparent text-gray-200 placeholder-gray-600 p-3 max-h-32 resize-none focus:outline-none text-[14px] leading-relaxed scrollbar-hide font-light"
                    rows={1}
                    style={{ minHeight: '44px' }}
                    disabled={isProcessing}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || isProcessing}
                    className={`
            p-3 rounded-xl transition-all duration-300
            ${message.trim() && !isProcessing
                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/50 shadow-lg shadow-blue-500/10 hover:bg-blue-600/40 hover:text-white'
                            : 'bg-white/5 text-gray-600 cursor-not-allowed'
                        }
          `}
                >
                    {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin text-blue-400" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </form>

            {/* Helper Text */}
            <div className="absolute -bottom-6 left-0 right-0 text-center text-xs text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                Supported: PDF, TXT, MD • Drag & Drop anytime
            </div>
        </div>
    );
}
