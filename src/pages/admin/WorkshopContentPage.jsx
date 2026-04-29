import React, { useMemo } from 'react';
import { ArrowLeft, PlayCircle } from 'lucide-react';

const toNumber = (value, fallback = 0) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const sortByOrder = (items = []) => [...items].sort((left, right) => toNumber(left.order) - toNumber(right.order));

const formatFileSize = (bytes = 0) => {
  const value = Number(bytes);
  if (!Number.isFinite(value) || value <= 0) return '0 B';
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
};

const normalizeModules = (workshop) => {
  const sourceModules = Array.isArray(workshop?.modules) ? workshop.modules : [];

  return sortByOrder(sourceModules).map((module, moduleIndex) => {
    const sourceVideos = Array.isArray(module?.videos) ? module.videos : [];

    return {
      id: String(module?.id ?? `module-${moduleIndex + 1}`),
      title: module?.title || `Module ${moduleIndex + 1}`,
      description: module?.description || '',
      videos: sortByOrder(sourceVideos).map((video, videoIndex) => ({
        id: String(video?.id ?? `video-${moduleIndex + 1}-${videoIndex + 1}`),
        title: video?.title || `Video ${videoIndex + 1}`,
        description: video?.description || '',
        duration: video?.duration || '00:00',
        fileSize: toNumber(video?.fileSize),
      })),
    };
  });
};

const VideoRow = ({ video }) => (
  <div className="flex items-start gap-3 rounded-lg border border-slate-800 bg-slate-900/40 p-3">
    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-500/10 text-sky-400">
      <PlayCircle className="h-4 w-4" />
    </div>

    <div className="min-w-0 flex-1">
      <h4 className="truncate text-sm font-medium text-slate-200">{video.title}</h4>
      <p className="mt-0.5 truncate text-xs text-slate-400">{video.description || 'No description'}</p>
      <div className="mt-1 text-[11px] text-slate-500">Duration: {video.duration} | Size: {formatFileSize(video.fileSize)}</div>
    </div>
  </div>
);

const WorkshopContentPage = ({ workshop, onBack }) => {
  const modules = useMemo(() => normalizeModules(workshop), [workshop]);
  const totalVideos = modules.reduce((sum, module) => sum + module.videos.length, 0);

  return (
    <div className="text-white">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
            >
              <ArrowLeft className="h-5 w-5" />
              <span className="text-sm font-medium">Back to Courses</span>
            </button>

            <div>
              <h1 className="text-2xl font-bold text-white">Course Content</h1>
              <p className="text-sm text-slate-400">Viewing: {workshop?.title || 'Untitled Course'}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Modules</div>
            <div className="mt-1 text-xl font-semibold text-slate-100">{modules.length}</div>
          </div>
          <div className="rounded-lg border border-slate-800 bg-slate-900/40 p-3">
            <div className="text-xs uppercase tracking-[0.12em] text-slate-500">Videos</div>
            <div className="mt-1 text-xl font-semibold text-slate-100">{totalVideos}</div>
          </div>
        </div>

        {modules.length === 0 && (
          <div className="rounded-xl border-2 border-dashed border-slate-800 bg-slate-900/20 px-6 py-12 text-center">
            <h3 className="text-lg font-medium text-slate-200">No modules yet</h3>
            <p className="mt-1 text-sm text-slate-400">This course has no module/video content in the database right now.</p>
          </div>
        )}

        {modules.map((module) => (
          <section key={module.id} className="overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-sm">
            <div className="border-b border-slate-800 bg-slate-800/30 p-4">
              <h3 className="text-base font-semibold text-white">{module.title}</h3>
              <p className="mt-1 text-xs text-slate-400">{module.description || 'No description'}</p>
              <p className="mt-2 text-[11px] text-slate-500">{module.videos.length} {module.videos.length === 1 ? 'video' : 'videos'}</p>
            </div>

            <div className="space-y-2 p-4">
              {module.videos.length > 0 ? (
                module.videos.map((video) => <VideoRow key={video.id} video={video} />)
              ) : (
                <div className="rounded-lg border border-dashed border-slate-700 px-4 py-6 text-center text-sm text-slate-400">
                  No videos found in this module.
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};

export default WorkshopContentPage;