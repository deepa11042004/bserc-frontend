import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function AddModuleModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onSave({ title, description });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#2B2B30] bg-[#111115] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F1F23] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Module' : 'Add New Module'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 transition-colors hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="mb-1 block text-sm font-medium text-slate-300">
                Module Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none transition-shadow focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                placeholder="e.g. Introduction to React"
                required
              />
            </div>
            
            <div>
              <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-300">
                Description <span className="font-normal text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full resize-none rounded-lg border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none transition-shadow focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                placeholder="Briefly describe what this module covers..."
              />
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-[#2B2B30] bg-[#0F0F12] px-4 py-2 text-sm font-medium text-slate-200 transition-colors hover:bg-[#1A1A1F]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {initialData ? 'Save Changes' : 'Create Module'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
