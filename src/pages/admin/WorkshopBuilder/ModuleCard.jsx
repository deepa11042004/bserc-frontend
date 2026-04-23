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
      className={`bg-white rounded-xl shadow-sm border ${
        isDragging ? 'border-indigo-400 ring-2 ring-indigo-100' : 'border-gray-200'
      } ${isOverlay ? 'shadow-xl ring-2 ring-indigo-500 cursor-grabbing' : ''} transition-all duration-200`}
    >
      {/* Module Header */}
      <div className="p-4 flex items-center justify-between group">
        <div className="flex items-center gap-3 flex-1">
          <div
            {...attributes}
            {...listeners}
            className="p-1.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing rounded-md hover:bg-gray-100 transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-900">{module.title}</h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                {moduleLessons.length} lesson{moduleLessons.length !== 1 ? 's' : ''}
              </span>
            </div>
            {module.description && (
              <p className="text-sm text-gray-500 mt-0.5">{module.description}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEditModule?.(module)}
            className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
            title="Edit Module"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDeleteModule?.(module.id)}
            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete Module"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <div className="w-px h-6 bg-gray-200 mx-1"></div>
          <button
            onClick={() => onAddLesson?.(module.id)}
            className="p-1.5 text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors font-medium flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Lesson
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors ml-2"
          >
            {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Module Content (Lessons) */}
      {isExpanded && !isOverlay && (
        <div className="px-4 pb-4">
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
              <div className="text-center py-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-sm text-gray-500 mb-2">No lessons in this module yet.</p>
                <button
                  onClick={() => onAddLesson?.(module.id)}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
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
