import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Plus, Save, Play } from 'lucide-react';
import ModuleCard from './ModuleCard';
import AddModuleModal from './AddModuleModal';
import AddLessonModal from './AddLessonModal';

const initialModules = [
  {
    id: "m1",
    title: "Introduction to Space Tech",
    description: "Welcome and overview of the workshop.",
    lessons: [
      {
        id: "l1",
        title: "Welcome Video",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        description: "What you will learn.",
        isPreview: true
      },
      {
        id: "l2",
        title: "History of Space Exploration",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        description: "From Sputnik to Apollo.",
        isPreview: false
      }
    ]
  },
  {
    id: "m2",
    title: "Rocket Propulsion Systems",
    description: "Understanding the physics of rockets.",
    lessons: [
      {
        id: "l3",
        title: "Newton's Third Law",
        videoUrl: "https://youtube.com/watch?v=dQw4w9WgXcQ",
        description: "Action and reaction in a vacuum.",
        isPreview: false
      }
    ]
  }
];

export default function WorkshopBuilder() {
  const { id } = useParams();
  const [modules, setModules] = useState(initialModules);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [lessonModalModuleId, setLessonModalModuleId] = useState(null);
  
  const [editingModule, setEditingModule] = useState(null);
  const [editingLesson, setEditingLesson] = useState(null);

  const [activeId, setActiveId] = useState(null);
  const [activeType, setActiveType] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event) => {
    const { active } = event;
    const type = active.data.current?.type;
    setActiveId(active.id);
    setActiveType(type);
  };

  const handleDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === 'Lesson' && overType === 'Lesson') {
      const activeModuleId = active.data.current.moduleId;
      const overModuleId = over.data.current.moduleId;

      if (activeModuleId !== overModuleId) {
        setModules((prev) => {
          const activeModuleIndex = prev.findIndex(m => m.id === activeModuleId);
          const overModuleIndex = prev.findIndex(m => m.id === overModuleId);
          
          const newModules = [...prev];
          const activeLessonIndex = newModules[activeModuleIndex].lessons.findIndex(l => l.id === active.id);
          const overLessonIndex = newModules[overModuleIndex].lessons.findIndex(l => l.id === over.id);
          
          const [movedLesson] = newModules[activeModuleIndex].lessons.splice(activeLessonIndex, 1);
          movedLesson.moduleId = overModuleId;
          
          newModules[overModuleIndex].lessons.splice(overLessonIndex, 0, movedLesson);
          return newModules;
        });
      }
    }
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setActiveId(null);
    setActiveType(null);

    if (!over) return;

    if (active.data.current?.type === 'Module' && over.data.current?.type === 'Module') {
      if (active.id !== over.id) {
        setModules((items) => {
          const oldIndex = items.findIndex((i) => i.id === active.id);
          const newIndex = items.findIndex((i) => i.id === over.id);
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    } else if (active.data.current?.type === 'Lesson' && over.data.current?.type === 'Lesson') {
      const activeModuleId = active.data.current.moduleId;
      const overModuleId = over.data.current.moduleId;

      if (activeModuleId === overModuleId) {
         setModules((items) => {
            const moduleIndex = items.findIndex(m => m.id === activeModuleId);
            const newModules = [...items];
            const oldIndex = newModules[moduleIndex].lessons.findIndex(l => l.id === active.id);
            const newIndex = newModules[moduleIndex].lessons.findIndex(l => l.id === over.id);
            newModules[moduleIndex].lessons = arrayMove(newModules[moduleIndex].lessons, oldIndex, newIndex);
            return newModules;
         });
      }
    }
  };

  const handleSaveModule = (moduleData) => {
    if (editingModule) {
      setModules(modules.map(m => m.id === editingModule.id ? { ...m, ...moduleData } : m));
      setEditingModule(null);
    } else {
      const newModule = {
        id: `m${Date.now()}`,
        ...moduleData,
        lessons: []
      };
      setModules([...modules, newModule]);
    }
    setIsModuleModalOpen(false);
  };

  const handleDeleteModule = (moduleId) => {
    if(window.confirm("Are you sure you want to delete this module and all its lessons?")) {
      setModules(modules.filter(m => m.id !== moduleId));
    }
  };

  const handleSaveLesson = (lessonData) => {
    if (editingLesson) {
      setModules(modules.map(m => {
        if (m.id === editingLesson.moduleId) {
          return {
            ...m,
            lessons: m.lessons.map(l => l.id === editingLesson.id ? { ...l, ...lessonData } : l)
          };
        }
        return m;
      }));
      setEditingLesson(null);
    } else {
      setModules(modules.map(m => {
        if (m.id === lessonModalModuleId) {
          return {
            ...m,
            lessons: [...m.lessons, { id: `l${Date.now()}`, ...lessonData }]
          };
        }
        return m;
      }));
    }
    setLessonModalModuleId(null);
  };

  const handleDeleteLesson = (moduleId, lessonId) => {
    if(window.confirm("Are you sure you want to delete this lesson?")) {
      setModules(modules.map(m => {
        if (m.id === moduleId) {
          return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
        }
        return m;
      }));
    }
  };

  // Find the dragged item for overlay
  const activeModule = activeType === 'Module' ? modules.find(m => m.id === activeId) : null;
  let activeLesson = null;
  if (activeType === 'Lesson') {
    for (const m of modules) {
      const lesson = m.lessons.find(l => l.id === activeId);
      if (lesson) {
        activeLesson = lesson;
        break;
      }
    }
  }

  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }),
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Space Tech Workshop</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    Draft
                  </span>
                  <span className="text-sm text-gray-500">Unsaved changes</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => { alert('Preview not implemented'); }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Play className="h-4 w-4 mr-2" />
                Preview
              </button>
              <button 
                onClick={() => { alert('Changes Saved!'); }}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Workshop Content</h2>
          <button
            onClick={() => setIsModuleModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </button>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="space-y-4">
            <SortableContext items={modules.map(m => m.id)} strategy={verticalListSortingStrategy}>
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  module={module}
                  onAddLesson={(moduleId) => setLessonModalModuleId(moduleId)}
                  onEditModule={(module) => { setEditingModule(module); setIsModuleModalOpen(true); }}
                  onDeleteModule={handleDeleteModule}
                  onEditLesson={(moduleId, lesson) => { setEditingLesson({ ...lesson, moduleId }); setLessonModalModuleId(moduleId); }}
                  onDeleteLesson={handleDeleteLesson}
                />
              ))}
            </SortableContext>
          </div>

          <DragOverlay dropAnimation={dropAnimation}>
            {activeType === 'Module' && activeModule ? (
              <ModuleCard module={activeModule} isOverlay />
            ) : null}
            {activeType === 'Lesson' && activeLesson ? (
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-xl ring-1 ring-black ring-opacity-5">
                <div className="font-medium text-gray-900">{activeLesson.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Modals */}
      {(isModuleModalOpen || editingModule) && (
        <AddModuleModal
          isOpen={true}
          onClose={() => { setIsModuleModalOpen(false); setEditingModule(null); }}
          onSave={handleSaveModule}
          initialData={editingModule}
        />
      )}

      {(lessonModalModuleId || editingLesson) && (
        <AddLessonModal
          isOpen={true}
          onClose={() => { setLessonModalModuleId(null); setEditingLesson(null); }}
          onSave={handleSaveLesson}
          initialData={editingLesson}
        />
      )}
    </div>
  );
}
