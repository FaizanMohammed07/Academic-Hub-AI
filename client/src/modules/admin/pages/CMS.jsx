import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cmsAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { useToast } from '@shared/context/NotificationContext';
import {
  Globe, Save, Plus, Trash2, X, Loader2, Eye, EyeOff, Image, Video,
  Trophy, Briefcase, GraduationCap, CalendarDays
} from 'lucide-react';

const TABS = [
  { key: 'hero',         label: 'Hero',         icon: Globe },
  { key: 'stats',        label: 'Stats',        icon: Globe },
  { key: 'hod',          label: 'HOD',          icon: Globe },
  { key: 'gallery',      label: 'Gallery',      icon: Image },
  { key: 'videos',       label: 'Videos',       icon: Video },
  { key: 'achievements', label: 'Achievements', icon: Trophy },
  { key: 'placements',   label: 'Placements',   icon: Briefcase },
  { key: 'alumni',       label: 'Alumni',       icon: GraduationCap },
  { key: 'events',       label: 'Events',       icon: CalendarDays },
];

export default function CMS() {
  const [activeTab, setActiveTab] = useState('hero');

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="page-title">Website CMS</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage public website content</p>
      </div>

      {/* Tab bar */}
      <div className="card p-1 flex gap-1 flex-wrap">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeTab === key ? 'bg-brand-500 text-white' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}
          >
            <Icon className="w-3.5 h-3.5" /> {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {['hero', 'stats', 'hod'].includes(activeTab) && <JsonSectionEditor sectionKey={activeTab} />}
          {activeTab === 'gallery'      && <GalleryManager />}
          {activeTab === 'videos'       && <VideosManager />}
          {activeTab === 'achievements' && <AchievementsManager />}
          {activeTab === 'placements'   && <PlacementsManager />}
          {activeTab === 'alumni'       && <AlumniManager />}
          {activeTab === 'events'       && <EventsManager />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── JSON Section Editor (Hero / Stats / HOD) ── */
function JsonSectionEditor({ sectionKey }) {
  const qc    = useQueryClient();
  const toast = useToast();
  const [jsonStr, setJsonStr] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['cms', 'sections'],
    queryFn:  () => cmsAPI.getPublicSections().then((r) => r.data.data),
    onSuccess: (d) => {
      const section = d?.[sectionKey] || d?.find?.((s) => s.sectionKey === sectionKey);
      setJsonStr(JSON.stringify(section?.data || {}, null, 2));
    },
  });

  const saveMut = useMutation({
    mutationFn: (payload) => cmsAPI.upsertSection(sectionKey, { data: payload }),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'sections']); toast.success('Section saved'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to save'),
  });

  if (isLoading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-zinc-800 rounded-xl" />;

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      saveMut.mutate(parsed);
    } catch {
      toast.error('Invalid JSON');
    }
  };

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title capitalize">{sectionKey} Section</h2>
        <button onClick={handleSave} disabled={saveMut.isLoading} className="btn-primary">
          {saveMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save</>}
        </button>
      </div>
      <textarea
        value={jsonStr || '{}'}
        onChange={(e) => setJsonStr(e.target.value)}
        rows={20}
        className="input font-mono text-xs resize-y"
        spellCheck={false}
      />
      <p className="text-xs text-gray-400">Edit the JSON above and click Save. Invalid JSON will be rejected.</p>
    </div>
  );
}

/* ── Gallery Manager ── */
function GalleryManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'gallery'],
    queryFn:  () => cmsAPI.getPublicGallery({ published: false }).then((r) => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createGallery(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'gallery']); setAddOpen(false); reset(); toast.success('Image added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, published }) => cmsAPI.updateGallery(id, { published }),
    onSuccess:  () => qc.invalidateQueries(['cms', 'gallery']),
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deleteGallery(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'gallery']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection
      title="Gallery"
      onAdd={() => setAddOpen(true)}
      isLoading={isLoading}
      isEmpty={items.length === 0}
      emptyMsg="No gallery images yet"
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((img) => (
          <div key={img._id} className="card overflow-hidden">
            <div className="h-32 bg-gradient-to-br from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30 flex items-center justify-center">
              {img.imageUrl
                ? <img src={img.imageUrl} alt={img.title} className="w-full h-full object-cover" />
                : <Image className="w-8 h-8 text-brand-400" />}
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{img.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{img.category}</div>
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={() => toggleMut.mutate({ id: img._id, published: !img.published })}
                  className={`text-xs flex items-center gap-1 ${img.published ? 'text-emerald-500' : 'text-gray-400'}`}
                >
                  {img.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {img.published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(img._id); }} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Gallery Image" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Title"><input {...register('title', { required: true })} className="input" /></FormField>
              <FormField label="Category"><input {...register('category')} placeholder="e.g. Events, Labs" className="input" /></FormField>
              <FormField label="Image URL"><input {...register('imageUrl')} placeholder="https://…" className="input" /></FormField>
              <FormField label="Description"><textarea {...register('description')} rows={3} className="input resize-none" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Image'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Videos Manager ── */
function VideosManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'videos'],
    queryFn:  () => cmsAPI.getPublicVideos({ published: false }).then((r) => r.data.data),
  });

  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createVideo(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'videos']); setAddOpen(false); reset(); toast.success('Video added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deleteVideo(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'videos']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const toggleMut = useMutation({
    mutationFn: ({ id, published }) => cmsAPI.updateVideo(id, { published }),
    onSuccess:  () => qc.invalidateQueries(['cms', 'videos']),
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection title="Videos" onAdd={() => setAddOpen(true)} isLoading={isLoading} isEmpty={items.length === 0} emptyMsg="No videos yet">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((v) => (
          <div key={v._id} className="card overflow-hidden">
            <div className="h-28 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30 flex items-center justify-center">
              <Video className="w-8 h-8 text-purple-400" />
            </div>
            <div className="p-3">
              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{v.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{v.url}</div>
              <div className="flex items-center justify-between mt-2">
                <button onClick={() => toggleMut.mutate({ id: v._id, published: !v.published })}
                  className={`text-xs flex items-center gap-1 ${v.published ? 'text-emerald-500' : 'text-gray-400'}`}>
                  {v.published ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  {v.published ? 'Published' : 'Draft'}
                </button>
                <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(v._id); }} className="text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Video" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Title"><input {...register('title', { required: true })} className="input" /></FormField>
              <FormField label="YouTube / Video URL"><input {...register('url')} placeholder="https://youtube.com/…" className="input" /></FormField>
              <FormField label="Description"><textarea {...register('description')} rows={3} className="input resize-none" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Video'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Achievements Manager ── */
function AchievementsManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'achievements'],
    queryFn:  () => cmsAPI.getPublicAchievements().then((r) => r.data.data),
  });
  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createAchievement(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'achievements']); setAddOpen(false); reset(); toast.success('Achievement added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deleteAchievement(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'achievements']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection title="Achievements" onAdd={() => setAddOpen(true)} isLoading={isLoading} isEmpty={items.length === 0} emptyMsg="No achievements yet">
      <div className="space-y-2">
        {items.map((ach) => (
          <div key={ach._id} className="card p-4 flex items-center justify-between gap-4">
            <div>
              <div className="font-medium text-gray-900 dark:text-white">{ach.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{ach.description}</div>
            </div>
            <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(ach._id); }} className="text-red-400 hover:text-red-600 flex-shrink-0">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Achievement" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Title"><input {...register('title', { required: true })} className="input" /></FormField>
              <FormField label="Description"><textarea {...register('description')} rows={3} className="input resize-none" /></FormField>
              <FormField label="Year"><input {...register('year')} type="number" className="input" /></FormField>
              <FormField label="Category"><input {...register('category')} placeholder="Academic / Sports / Cultural" className="input" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Achievement'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Placements Manager ── */
function PlacementsManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'placements'],
    queryFn:  () => cmsAPI.getPublicPlacements().then((r) => r.data.data),
  });
  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createPlacement(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'placements']); setAddOpen(false); reset(); toast.success('Placement added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deletePlacement(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'placements']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection title="Placements" onAdd={() => setAddOpen(true)} isLoading={isLoading} isEmpty={items.length === 0} emptyMsg="No placement records yet">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800/50">
              {['Student', 'Company', 'Package (LPA)', 'Year', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((p) => (
              <tr key={p._id} className="border-b border-gray-50 dark:border-zinc-800/50 hover:bg-gray-50 dark:hover:bg-zinc-800/30">
                <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{p.studentName}</td>
                <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{p.company}</td>
                <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-semibold">{p.package}</td>
                <td className="px-4 py-3 text-gray-500">{p.year}</td>
                <td className="px-4 py-3">
                  <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(p._id); }} className="text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Placement Record" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Student Name"><input {...register('studentName', { required: true })} className="input" /></FormField>
              <FormField label="Company"><input {...register('company', { required: true })} className="input" /></FormField>
              <FormField label="Package (LPA)"><input {...register('package')} placeholder="e.g. 12" className="input" /></FormField>
              <FormField label="Year"><input {...register('year')} type="number" className="input" /></FormField>
              <FormField label="Role"><input {...register('role')} placeholder="Software Engineer" className="input" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Placement'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Alumni Manager ── */
function AlumniManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'alumni'],
    queryFn:  () => cmsAPI.getPublicAlumni().then((r) => r.data.data),
  });
  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createAlumni(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'alumni']); setAddOpen(false); reset(); toast.success('Alumni added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deleteAlumni(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'alumni']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection title="Alumni" onAdd={() => setAddOpen(true)} isLoading={isLoading} isEmpty={items.length === 0} emptyMsg="No alumni records yet">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((a) => (
          <div key={a._id} className="card p-4 flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">{a.name}</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{a.company} • {a.batch}</div>
              </div>
            </div>
            <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(a._id); }} className="text-red-400 hover:text-red-600 flex-shrink-0">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Alumni" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Name"><input {...register('name', { required: true })} className="input" /></FormField>
              <FormField label="Batch"><input {...register('batch')} placeholder="e.g. 2022" className="input" /></FormField>
              <FormField label="Company"><input {...register('company')} className="input" /></FormField>
              <FormField label="Designation"><input {...register('designation')} className="input" /></FormField>
              <FormField label="LinkedIn URL"><input {...register('linkedIn')} placeholder="https://…" className="input" /></FormField>
              <FormField label="Photo URL"><input {...register('photoUrl')} placeholder="https://…" className="input" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Alumni'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Events Manager ── */
function EventsManager() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [addOpen, setAddOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['cms', 'events'],
    queryFn:  () => cmsAPI.getPublicEvents().then((r) => r.data.data),
  });
  const createMut = useMutation({
    mutationFn: (d) => cmsAPI.createEvent(d),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'events']); setAddOpen(false); reset(); toast.success('Event added'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => cmsAPI.deleteEvent(id),
    onSuccess:  () => { qc.invalidateQueries(['cms', 'events']); toast.success('Deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed'),
  });

  return (
    <CmsSection title="Events" onAdd={() => setAddOpen(true)} isLoading={isLoading} isEmpty={items.length === 0} emptyMsg="No events yet">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((ev) => (
          <div key={ev._id} className="card p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="font-medium text-gray-900 dark:text-white">{ev.title}</div>
              <button onClick={() => { if (window.confirm('Delete?')) deleteMut.mutate(ev._id); }} className="text-red-400 hover:text-red-600 flex-shrink-0">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{ev.description}</div>
            {ev.date && (
              <div className="text-xs text-brand-600 dark:text-brand-400 mt-2 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" /> {ev.date}
              </div>
            )}
          </div>
        ))}
      </div>

      <AnimatePresence>
        {addOpen && (
          <ModalOverlay title="Add Event" onClose={() => setAddOpen(false)}>
            <form onSubmit={handleSubmit((d) => createMut.mutate(d))} className="space-y-4">
              <FormField label="Title"><input {...register('title', { required: true })} className="input" /></FormField>
              <FormField label="Date"><input {...register('date')} type="date" className="input" /></FormField>
              <FormField label="Location"><input {...register('location')} className="input" /></FormField>
              <FormField label="Description"><textarea {...register('description')} rows={3} className="input resize-none" /></FormField>
              <FormField label="Image URL"><input {...register('imageUrl')} placeholder="https://…" className="input" /></FormField>
              <button type="submit" disabled={createMut.isLoading} className="btn-primary w-full">
                {createMut.isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Event'}
              </button>
            </form>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </CmsSection>
  );
}

/* ── Shared wrappers ── */
function CmsSection({ title, onAdd, isLoading, isEmpty, emptyMsg, children }) {
  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="section-title">{title}</h2>
        <button onClick={onAdd} className="btn-primary btn-sm"><Plus className="w-4 h-4" /> Add</button>
      </div>
      {isLoading ? (
        <div className="animate-pulse space-y-3">
          {[1,2,3].map((i) => <div key={i} className="h-16 bg-gray-100 dark:bg-zinc-800 rounded" />)}
        </div>
      ) : isEmpty ? (
        <div className="py-10 text-center text-gray-400 dark:text-gray-600">{emptyMsg}</div>
      ) : children}
    </div>
  );
}

function FormField({ label, children }) {
  return <div><label className="label">{label}</label>{children}</div>;
}

function ModalOverlay({ title, onClose, children }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="section-title">{title}</h2>
            <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
          </div>
          {children}
        </div>
      </motion.div>
    </>
  );
}
