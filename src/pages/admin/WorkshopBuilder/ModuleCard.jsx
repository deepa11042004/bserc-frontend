import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import LessonItem from './LessonItem';

export default function ModuleCard({
  module,
  onAddLesson,
  onEditModule,
  onDeleteModule,
  onEditLesson,
  onDeleteLesson,
  isOverlay = false
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: module.id,
    data: { type: 'Module', module },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.3 : 1,
  };

  const moduleLessons = module.lessons || [];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border bg-[#111115] ${
        isDragging ? 'border-cyan-500/70 ring-2 ring-cyan-500/20' : 'border-[#1F1F23]'
      } ${isOverlay ? 'cursor-grabbing shadow-xl ring-2 ring-cyan-500/20' : ''} transition-all duration-200`}
    >
      {/* Module Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab rounded-md p-1.5 text-slate-500 transition-colors hover:bg-[#1A1A1F] hover:text-slate-300 active:cursor-grabbing"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-white">{module.title}</h3>
              <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-medium bg-sky-500/15 text-sky-200">
                {moduleLessons.length} lesson{moduleLessons.length !== 1 ? 's' : ''}
              </span>
            </div>
            {module.description && (
              <p className="mt-0.5 text-sm text-slate-400">{module.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditModule?.(module)}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-sky-500/10 hover:text-sky-300"
            title="Edit Module"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteModule?.(module.id)}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
            title="Delete Module"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="mx-1 h-6 w-px bg-[#2B2B30]"></div>
          <button
            onClick={() => onAddLesson?.(module.id)}
            className="flex items-center rounded-md p-1.5 text-sm font-medium text-slate-300 transition-colors hover:bg-[#1A1A1F] hover:text-white"
          >
            <Plus className="h-4 w-4 mr-1" />
            Lesson
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-2 rounded-md p-1.5 text-slate-400 transition-colors hover:bg-[#1A1A1F] hover:text-slate-200"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Module Content (Lessons) */}
      {isExpanded && !isOverlay && (
        <div className="border-t border-[#1F1F23] bg-[#0F0F12] px-4 pb-4 pt-3">
          <div className="pl-11 pr-2">
            {moduleLessons.length > 0 ? (
              <SortableContext items={moduleLessons.map(l => l.id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {moduleLessons.map((lesson) => (
                    <LessonItem
                      key={lesson.id}
                      lesson={lesson}
                      moduleId={module.id}
                      onEdit={() => onEditLesson?.(module.id, lesson)}
                      onDelete={() => onDeleteLesson?.(module.id, lesson.id)}
                    />
                  ))}
                </div>
              </SortableContext>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-[#2B2B30] bg-[#111115] py-6 text-center">
                <p className="mb-2 text-sm text-slate-400">No lessons in this module yet.</p>
                <button
                  onClick={() => onAddLesson?.(module.id)}
                  className="inline-flex items-center rounded border border-[#2B2B30] bg-[#0F0F12] px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-[#1A1A1F]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add First Lesson
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
