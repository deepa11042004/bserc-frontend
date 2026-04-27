import React, { useState } from 'react';

import {
  ArrowLeft,
  GripVertical,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Plus,
  X
} from 'lucide-react';

const INITIAL_MODULES = [
  {
    id: "m1",
    title: "Introduction to Space Tech",
    description: "Welcome and overview",
    lessons: [
      {
        id: "l1",
        title: "Welcome Video",
        description: "What you will learn",
        youtubeLink: "https://youtube.com/watch?v=mock1",
        isFree: true
      },
      {
        id: "l2",
        title: "History of Space Exploration",
        description: "From Sputnik to modern era",
        youtubeLink: "https://youtube.com/watch?v=mock2",
        isFree: false
      }
    ]
  },
  {
    id: "m2",
    title: "Orbital Mechanics Basics",
    description: "Understanding how orbits work",
    lessons: [
      {
        id: "l3",
        title: "Kepler's Laws",
        description: "The three laws of planetary motion",
        youtubeLink: "https://youtube.com/watch?v=mock3",
        isFree: false
      }
    ]
  }
];

const AddModuleModal = ({ isOpen, onClose, onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onAdd({ title, description });
    setTitle('');
    setDescription('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-white">Add Module</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Module Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              placeholder="e.g. Introduction"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              placeholder="Module description"
              rows={3}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Add Module
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddLessonModal = ({ isOpen, onClose, onAdd, moduleTitle }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [youtubeLink, setYoutubeLink] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !youtubeLink.trim()) return;
    onAdd({ title, description, youtubeLink });
    setTitle('');
    setDescription('');
    setYoutubeLink('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 p-4">
          <h2 className="text-lg font-semibold text-white">Add Lesson to "{moduleTitle}"</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Lesson Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              placeholder="e.g. Welcome Video"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              placeholder="Lesson description"
              rows={2}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm text-slate-300">YouTube Video Link *</label>
            <input
              type="url"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-sky-500"
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!title.trim() || !youtubeLink.trim()}
              className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:opacity-50"
            >
              Add Lesson
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const LessonItem = ({ lesson, index, moveLesson }) => {
  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('lessonIndex', index)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('lessonIndex'), 10);
        if (!isNaN(fromIndex) && fromIndex !== index) {
          moveLesson(fromIndex, index);
        }
      }}
      className="group flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3 hover:bg-slate-800/80 transition-colors"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing">
          <GripVertical className="h-4 w-4" />
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
          <PlayCircle className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium text-slate-200">{lesson.title}</h4>
            {lesson.isFree && (
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400">
                Free
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="truncate text-xs text-slate-400">{lesson.description}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
        <button className="p-1.5 text-slate-400 hover:text-sky-400 rounded-md hover:bg-slate-800 transition-colors">
          <Pencil className="h-4 w-4" />
        </button>
        <button className="p-1.5 text-slate-400 hover:text-red-400 rounded-md hover:bg-slate-800 transition-colors">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

const ModuleCard = ({ module, moduleIndex, moveModule, onAddLesson, updateModuleLessons }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const moveLesson = (fromIndex, toIndex) => {
    const updatedLessons = [...module.lessons];
    const [moved] = updatedLessons.splice(fromIndex, 1);
    updatedLessons.splice(toIndex, 0, moved);
    updateModuleLessons(module.id, updatedLessons);
  };

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData('moduleIndex', moduleIndex)}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        const fromIndex = parseInt(e.dataTransfer.getData('moduleIndex'), 10);
        if (!isNaN(fromIndex) && fromIndex !== moduleIndex) {
          moveModule(fromIndex, moduleIndex);
        }
      }}
      className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm"
    >
      <div className="flex items-center justify-between bg-slate-800/40 p-4">
        <div className="flex items-center gap-3 min-w-0">
          <div className="cursor-grab text-slate-500 hover:text-slate-300 active:cursor-grabbing">
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-white">{module.title}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="truncate">{module.description || 'No description'}</span>
              <span>•</span>
              <span className="shrink-0">{module.lessons.length} {module.lessons.length === 1 ? 'lesson' : 'lessons'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-4">
          <button 
            onClick={() => onAddLesson(module)}
            className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 hover:bg-slate-700 hover:text-white transition-colors"
          >
            <Plus className="h-3.5 w-3.5" /> Lesson
          </button>
          
          <button className="p-2 text-slate-400 hover:text-sky-400 rounded-lg hover:bg-slate-800 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button className="p-2 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
          
          <div className="w-px h-6 bg-slate-700 mx-1"></div>
          
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4 border-t border-slate-800 bg-slate-900/30">
          {module.lessons.length > 0 ? (
            <div className="space-y-2">
              {module.lessons.map((lesson, idx) => (
                <LessonItem 
                  key={lesson.id} 
                  lesson={lesson} 
                  index={idx} 
                  moveLesson={moveLesson} 
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-slate-700 rounded-lg">
              <p className="text-sm text-slate-400 mb-3">No lessons in this module yet.</p>
              <button 
                onClick={() => onAddLesson(module)}
                className="flex items-center gap-1.5 rounded-lg bg-sky-600/10 px-3 py-1.5 text-xs font-medium text-sky-400 hover:bg-sky-600/20 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" /> Add Lesson
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const WorkshopContentPage = ({ workshop, onBack }) => {
  const id = workshop?.id || 'dummy-id';
  const [modules, setModules] = useState(INITIAL_MODULES);
  
  // Modal states
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [lessonModalData, setLessonModalData] = useState({ isOpen: false, module: null });

  const handleAddModule = ({ title, description }) => {
    const newModule = {
      id: `m${Date.now()}`,
      title,
      description,
      lessons: []
    };
    setModules([...modules, newModule]);
  };

  const handleAddLesson = ({ title, description, youtubeLink }) => {
    const newLesson = {
      id: `l${Date.now()}`,
      title,
      description,
      youtubeLink,
      isFree: false
    };
    
    setModules(modules.map(m => {
      if (m.id === lessonModalData.module.id) {
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    }));
  };

  const moveModule = (fromIndex, toIndex) => {
    const updatedModules = [...modules];
    const [moved] = updatedModules.splice(fromIndex, 1);
    updatedModules.splice(toIndex, 0, moved);
    setModules(updatedModules);
  };

  const updateModuleLessons = (moduleId, newLessons) => {
    setModules(modules.map(m => m.id === moduleId ? { ...m, lessons: newLessons } : m));
  };

  return (
    <div className="text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="flex items-center gap-2 px-3 py-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Workshops</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Workshop Content</h1>
              <p className="text-sm text-slate-400">Builder mode • Workshop: {workshop?.title || `ID: ${id}`}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsModuleModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-600/20 hover:bg-sky-500 transition-all active:scale-95"
          >
            <Plus className="h-4 w-4" /> Add Module
          </button>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          {modules.map((module, idx) => (
            <ModuleCard 
              key={module.id} 
              module={module} 
              moduleIndex={idx}
              moveModule={moveModule}
              onAddLesson={(mod) => setLessonModalData({ isOpen: true, module: mod })}
              updateModuleLessons={updateModuleLessons}
            />
          ))}
          
          {modules.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 text-center border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/20">
              <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-4">
                <Plus className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-medium text-slate-200">No modules yet</h3>
              <p className="text-sm text-slate-400 mt-1 mb-6 max-w-sm">Get started by creating your first module to organize your workshop lessons.</p>
              <button 
                onClick={() => setIsModuleModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700 transition-all"
              >
                Add First Module
              </button>
            </div>
          )}
        </div>
      </div>

      <AddModuleModal 
        isOpen={isModuleModalOpen} 
        onClose={() => setIsModuleModalOpen(false)} 
        onAdd={handleAddModule} 
      />
      
      <AddLessonModal 
        isOpen={lessonModalData.isOpen} 
        onClose={() => setLessonModalData({ isOpen: false, module: null })} 
        onAdd={handleAddLesson}
        moduleTitle={lessonModalData.module?.title}
      />
    </div>
  );
};

export default WorkshopContentPage;
