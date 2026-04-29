import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Edit2, Trash2, Video, Eye } from 'lucide-react';

export default function LessonItem({ lesson, moduleId, onEdit, onDelete }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: lesson.id,
    data: { type: 'Lesson', lesson, moduleId },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 1,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between rounded-lg border p-3 transition-colors duration-200 ${
        isDragging
          ? 'border-cyan-500/60 ring-1 ring-cyan-500/30 bg-[#1A1A1F]'
          : 'border-[#1F1F23] bg-[#0F0F12] hover:bg-[#1A1A1F]'
      } transition-colors duration-200`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab rounded p-1 text-slate-500 hover:text-slate-300 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-[#2B2B30] bg-[#111115] text-sky-300">
          <Video className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="truncate text-sm font-medium text-slate-100">{lesson.title}</h4>
            {lesson.isPreview && (
              <span className="inline-flex items-center gap-1 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-medium text-emerald-300">
                <Eye className="h-3 w-3" />
                Free
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="mt-0.5 truncate text-xs text-slate-400">{lesson.description}</p>
          )}
        </div>
      </div>

      <div className="ml-4 flex flex-shrink-0 items-center gap-1">
        <button
          onClick={() => onEdit?.()}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-sky-500/10 hover:text-sky-300"
          title="Edit Lesson"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete?.()}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
          title="Delete Lesson"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
