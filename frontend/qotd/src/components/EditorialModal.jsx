import React from "react";
import { useQotdStore } from "../store/useQotdStore";
import { X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function EditorialModal({ isOpen, onClose }) {
  const { editorialContent } = useQotdStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 text-white p-6 rounded-2xl shadow-2xl border border-zinc-700">
        
        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-3xl font-bold mb-4 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.7)]">
          📝 Editorial
        </h2>

        {/* Markdown Content */}
        {editorialContent ? (
          <div className="prose prose-invert max-w-none prose-pre:bg-zinc-800 prose-pre:text-white prose-code:text-green-300 prose-h3:text-purple-400">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {editorialContent}
            </ReactMarkdown>
          </div>
        ) : (
          <p className="text-red-400">🔒 Editorial is locked or not available yet.</p>
        )}
      </div>
    </div>
  );
}
