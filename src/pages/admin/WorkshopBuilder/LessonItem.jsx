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
      className={`group flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg border ${
        isDragging ? 'border-indigo-300 ring-1 ring-indigo-200' : 'border-gray-200'
      } transition-colors duration-200`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          {...attributes}
          {...listeners}
          className="p-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded"
        >
          <GripVertical className="h-4 w-4" />
        </div>
        
        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-white border border-gray-200 text-indigo-500">
          <Video className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-medium text-gray-900 truncate">{lesson.title}</h4>
            {lesson.isPreview && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
                <Eye className="h-3 w-3" />
                Free
              </span>
            )}
          </div>
          {lesson.description && (
            <p className="text-xs text-gray-500 truncate mt-0.5">{lesson.description}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-4 flex-shrink-0">
        <button
          onClick={() => onEdit?.()}
          className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
          title="Edit Lesson"
        >
          <Edit2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onDelete?.()}
          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
          title="Delete Lesson"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
