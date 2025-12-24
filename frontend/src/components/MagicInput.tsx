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
          flex items-end gap-2 p-2 rounded-2xl
          bg-[#1E1F20]/80 backdrop-blur-md border border-white/10
          focus-within:border-white/20 focus-within:bg-[#1E1F20]
          shadow-lg transition-all duration-200
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
                    placeholder={isProcessing ? "Absorbing..." : "Type a message or drop a file to add memory..."}
                    className="w-full bg-transparent text-gray-100 placeholder-gray-500 p-3 max-h-32 resize-none focus:outline-none text-[15px] leading-relaxed scrollbar-hide"
                    rows={1}
                    style={{ minHeight: '44px' }}
                    disabled={isProcessing}
                />

                {/* Send Button */}
                <button
                    type="submit"
                    disabled={!message.trim() || isProcessing}
                    className={`
            p-3 rounded-full transition-all duration-200
            ${message.trim() && !isProcessing
                            ? 'bg-blue-600 text-white shadow-blue-500/30 shadow-md hover:bg-blue-500'
                            : 'bg-white/5 text-gray-500 cursor-not-allowed'
                        }
          `}
                >
                    {isProcessing ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5 ml-0.5" />
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
