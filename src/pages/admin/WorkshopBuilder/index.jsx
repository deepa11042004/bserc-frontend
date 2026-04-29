import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { lmsAdminService } from '../../../services/lmsAdminService';

const toApiId = (value) => {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  if (Number.isInteger(parsed) && parsed > 0) return parsed;

  const match = String(value ?? '').match(/(\d+)/);
  if (!match) return null;

  const extracted = Number.parseInt(match[1], 10);
  return Number.isInteger(extracted) && extracted > 0 ? extracted : null;
};

const resolveCourseId = (course, routeCourseId) => {
  if (course && typeof course === 'object') {
    const byApiField = toApiId(course.apiCourseId);
    if (byApiField) return byApiField;

    const byId = toApiId(course.id);
    if (byId) return byId;
  }

  return toApiId(routeCourseId);
};

const getErrorMessage = (error, fallback) => error?.message || fallback;

const isCoursePublished = (course) => Boolean(course?.isPublished ?? course?.status === 'published');

export default function WorkshopBuilder({ course = null, onPublished = null }) {
  const { id: routeCourseId } = useParams();
  const courseId = useMemo(() => resolveCourseId(course, routeCourseId), [course, routeCourseId]);
  const courseTitle = course?.title || 'Space Tech Course';
  const [isPublished, setIsPublished] = useState(isCoursePublished(course));
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
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

  const showNotice = useCallback((message) => {
    setNotice(message);

    window.setTimeout(() => {
      setNotice((current) => (current === message ? '' : current));
    }, 2800);
  }, []);

  const loadModules = useCallback(async () => {
    if (!courseId) {
      setModules([]);
      setError('');
      return;
    }

    setLoadingModules(true);
    setError('');

    try {
      const nextModules = await lmsAdminService.getCourseBuilderModules(courseId);
      setModules(nextModules);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not load modules for this course.'));
    } finally {
      setLoadingModules(false);
    }
  }, [courseId]);

  useEffect(() => {
    void loadModules();
  }, [loadModules]);

  useEffect(() => {
    setIsPublished(isCoursePublished(course));
  }, [course?.isPublished, course?.status, courseId]);

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

          if (activeModuleIndex < 0 || overModuleIndex < 0) return prev;
          
          const newModules = [...prev];
          const activeLessonIndex = newModules[activeModuleIndex].lessons.findIndex(l => l.id === active.id);
          const overLessonIndex = newModules[overModuleIndex].lessons.findIndex(l => l.id === over.id);

          if (activeLessonIndex < 0 || overLessonIndex < 0) return prev;
          
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
          if (oldIndex < 0 || newIndex < 0) return items;
          return arrayMove(items, oldIndex, newIndex);
        });
      }
    } else if (active.data.current?.type === 'Lesson' && over.data.current?.type === 'Lesson') {
      const activeModuleId = active.data.current.moduleId;
      const overModuleId = over.data.current.moduleId;

      if (activeModuleId === overModuleId) {
         setModules((items) => {
            const moduleIndex = items.findIndex(m => m.id === activeModuleId);
            if (moduleIndex < 0) return items;

            const newModules = [...items];
            const oldIndex = newModules[moduleIndex].lessons.findIndex(l => l.id === active.id);
            const newIndex = newModules[moduleIndex].lessons.findIndex(l => l.id === over.id);
            if (oldIndex < 0 || newIndex < 0) return items;

            newModules[moduleIndex].lessons = arrayMove(newModules[moduleIndex].lessons, oldIndex, newIndex);
            return newModules;
         });
      }
    }
  };

  const handleSaveModule = async (moduleData) => {
    if (!courseId) {
      setError('Select a valid course before adding modules.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (editingModule) {
        await lmsAdminService.updateCourseBuilderModule(editingModule.id, moduleData);
        showNotice('Module updated successfully.');
      } else {
        await lmsAdminService.createCourseBuilderModule(courseId, moduleData);
        showNotice('Module created successfully.');
      }

      await loadModules();
      setIsModuleModalOpen(false);
      setEditingModule(null);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not save module.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteModule = async (moduleId) => {
    if(window.confirm("Are you sure you want to delete this module and all its lessons?")) {
      setBusy(true);
      setError('');

      try {
        await lmsAdminService.deleteCourseBuilderModule(moduleId);
        setModules((current) => current.filter((module) => module.id !== moduleId));
        showNotice('Module deleted successfully.');
      } catch (err) {
        console.error(err);
        setError(getErrorMessage(err, 'Could not delete module.'));
      } finally {
        setBusy(false);
      }
    }
  };

  const handleSaveLesson = async (lessonData) => {
    const targetModuleId = editingLesson?.moduleId || lessonModalModuleId;

    if (!targetModuleId) {
      setError('Select a module before saving the lesson.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      if (editingLesson) {
        await lmsAdminService.updateCourseBuilderLesson(editingLesson.id, {
          ...lessonData,
          module_id: targetModuleId,
        });
        showNotice('Lesson updated successfully.');
      } else {
        await lmsAdminService.createCourseBuilderLesson(targetModuleId, lessonData);
        showNotice('Lesson created successfully.');
      }

      await loadModules();
      setLessonModalModuleId(null);
      setEditingLesson(null);
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not save lesson.'));
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteLesson = async (moduleId, lessonId) => {
    if(window.confirm("Are you sure you want to delete this lesson?")) {
      setBusy(true);
      setError('');

      try {
        await lmsAdminService.deleteCourseBuilderLesson(lessonId);
        setModules((current) =>
          current.map((module) => {
            if (module.id !== moduleId) return module;
            return {
              ...module,
              lessons: module.lessons.filter((lesson) => lesson.id !== lessonId),
            };
          })
        );
        showNotice('Lesson deleted successfully.');
      } catch (err) {
        console.error(err);
        setError(getErrorMessage(err, 'Could not delete lesson.'));
      } finally {
        setBusy(false);
      }
    }
  };

  const persistBuilderChanges = useCallback(async () => {
    const lessonModuleUpdates = modules.flatMap((module) =>
      (module.lessons || []).map((lesson) =>
        lmsAdminService.updateCourseBuilderLesson(lesson.id, {
          module_id: module.id,
        })
      )
    );

    if (lessonModuleUpdates.length) {
      await Promise.all(lessonModuleUpdates);
    }

    await lmsAdminService.reorderCourseBuilderModules(courseId, modules.map((module) => module.id));

    const lessonReorders = modules
      .filter((module) => (module.lessons || []).length > 0)
      .map((module) =>
        lmsAdminService.reorderCourseBuilderLessons(
          module.id,
          module.lessons.map((lesson) => lesson.id)
        )
      );

    if (lessonReorders.length) {
      await Promise.all(lessonReorders);
    }

    await loadModules();
  }, [courseId, modules, loadModules]);

  const handleSaveChanges = async () => {
    if (!courseId) {
      setError('Select a valid course before saving.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await persistBuilderChanges();
      showNotice('Course builder changes saved.');
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not save changes.'));
    } finally {
      setBusy(false);
    }
  };

  const handlePublishCourse = async () => {
    if (!courseId) {
      setError('Select a valid course before publishing.');
      return;
    }

    if (!modules.length) {
      setError('Add at least one module before publishing.');
      return;
    }

    setBusy(true);
    setError('');

    try {
      await persistBuilderChanges();
      const publishedCourse = await lmsAdminService.publishCourseBuilderCourse(courseId);
      setIsPublished(true);

      if (typeof onPublished === 'function' && publishedCourse) {
        onPublished(publishedCourse);
      }

      showNotice('Course published. It is now available for users.');
    } catch (err) {
      console.error(err);
      setError(getErrorMessage(err, 'Could not publish course.'));
    } finally {
      setBusy(false);
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
    <div className="space-y-4">
      <section className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-white">{courseTitle}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${isPublished
                  ? 'bg-emerald-500/15 text-emerald-200'
                  : 'bg-amber-500/15 text-amber-200'
                  }`}
              >
                {isPublished ? 'Published' : 'Draft'}
              </span>
              <span className="text-xs text-slate-400">{courseId ? `Course ID: ${courseId}` : 'Unsaved changes'}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePublishCourse}
              disabled={busy || loadingModules || !courseId || isPublished}
              className="inline-flex items-center rounded-md border border-[#2B2B30] bg-[#0F0F12] px-3 py-2 text-sm text-slate-100 transition hover:bg-[#1A1A1F] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Play className="mr-2 h-4 w-4" />
              {isPublished ? 'Published' : 'Publish'}
            </button>
            <button
              onClick={handleSaveChanges}
              disabled={busy || loadingModules || !courseId || !modules.length}
              className="inline-flex items-center rounded-md bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="mr-2 h-4 w-4" />
              {busy ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </section>
      ) : null}

      {notice ? (
        <section className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
          {notice}
        </section>
      ) : null}

      <section className="rounded-xl border border-[#1F1F23] bg-[#111115] p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-300">Course Builder</h2>
          <button
            onClick={() => setIsModuleModalOpen(true)}
            disabled={busy || loadingModules || !courseId}
            className="inline-flex items-center rounded-md border border-sky-500/40 bg-sky-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="mr-2 h-4 w-4" />
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
          {loadingModules ? (
            <div className="rounded-lg border border-dashed border-[#2B2B30] bg-[#0F0F12] px-4 py-8 text-center text-sm text-slate-400">
              Loading modules...
            </div>
          ) : modules.length ? (
            <div className="space-y-3">
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
          ) : (
            <div className="rounded-lg border border-dashed border-[#2B2B30] bg-[#0F0F12] px-4 py-8 text-center text-sm text-slate-400">
              {courseId
                ? 'No modules added yet. Create your first module to start building this course.'
                : 'Open this builder from a saved course to manage modules and lessons.'}
            </div>
          )}

          <DragOverlay dropAnimation={dropAnimation}>
            {activeType === 'Module' && activeModule ? (
              <ModuleCard module={activeModule} isOverlay />
            ) : null}
            {activeType === 'Lesson' && activeLesson ? (
              <div className="rounded-md border border-[#2B2B30] bg-[#111115] p-3 shadow-xl">
                <div className="text-sm font-medium text-white">{activeLesson.title}</div>
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </section>

      {/* Modals */}
      {(isModuleModalOpen || editingModule) && (
        <AddModuleModal
          isOpen={true}
          onClose={() => {
            if (busy) return;
            setIsModuleModalOpen(false);
            setEditingModule(null);
          }}
          onSave={handleSaveModule}
          initialData={editingModule}
        />
      )}

      {(lessonModalModuleId || editingLesson) && (
        <AddLessonModal
          isOpen={true}
          onClose={() => {
            if (busy) return;
            setLessonModalModuleId(null);
            setEditingLesson(null);
          }}
          onSave={handleSaveLesson}
          initialData={editingLesson}
        />
      )}
    </div>
  );
}

