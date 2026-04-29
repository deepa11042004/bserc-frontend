import React, { useState, useEffect } from 'react';
import { X, Youtube } from 'lucide-react';

export default function AddLessonModal({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setVideoUrl(initialData.videoUrl || '');
      setDescription(initialData.description || '');
      setIsPreview(initialData.isPreview || false);
    } else {
      setTitle('');
      setVideoUrl('');
      setDescription('');
      setIsPreview(false);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !videoUrl.trim()) return;
    onSave({ title, videoUrl, description, isPreview });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-[#2B2B30] bg-[#111115] shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1F1F23] px-6 py-4">
          <h2 className="text-lg font-semibold text-white">
            {initialData ? 'Edit Lesson' : 'Add New Lesson'}
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
              <label htmlFor="lessonTitle" className="mb-1 block text-sm font-medium text-slate-300">
                Lesson Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lessonTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none transition-shadow focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                placeholder="e.g. Setting up your environment"
                required
              />
            </div>
            
            <div>
              <label htmlFor="videoUrl" className="mb-1 block text-sm font-medium text-slate-300">
                YouTube Video URL <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Youtube className="h-4 w-4 text-slate-500" />
                </div>
                <input
                  type="url"
                  id="videoUrl"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  className="w-full rounded-lg border border-[#2B2B30] bg-[#0F0F12] py-2 pl-9 pr-3 text-sm text-white outline-none transition-shadow focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                  placeholder="https://youtube.com/watch?v=..."
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="lessonDesc" className="mb-1 block text-sm font-medium text-slate-300">
                Description <span className="font-normal text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="lessonDesc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full resize-none rounded-lg border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-white outline-none transition-shadow focus:border-sky-400 focus:ring-2 focus:ring-sky-500/20"
                placeholder="Brief summary of this lesson..."
              />
            </div>

            <div className="flex items-center mt-2">
              <input
                id="isPreview"
                type="checkbox"
                checked={isPreview}
                onChange={(e) => setIsPreview(e.target.checked)}
                className="h-4 w-4 rounded border-[#2B2B30] bg-[#0F0F12] text-sky-500 focus:ring-sky-500"
              />
              <label htmlFor="isPreview" className="ml-2 block text-sm text-slate-200">
                Free Preview (Visible to non-enrolled users)
              </label>
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
              disabled={!title.trim() || !videoUrl.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {initialData ? 'Save Changes' : 'Add Lesson'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
