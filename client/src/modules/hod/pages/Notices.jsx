import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { noticeAPI } from '@services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useSearchParams } from 'react-router-dom';
import { useToast } from '@shared/context/NotificationContext';
import {
  Bell, Plus, Eye, Send, Trash2, Pencil, X, Loader2, Users, GraduationCap, Globe
} from 'lucide-react';
import { format } from 'date-fns';

const noticeSchema = z.object({
  title:     z.string().min(3, 'Required'),
  content:   z.string().min(10, 'Content too short'),
  type:      z.enum(['general', 'urgent', 'academic', 'event']),
  target:    z.enum(['all', 'students', 'faculty']),
  expiresAt: z.string().optional(),
});

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

const TYPE_BADGES = {
  urgent:   'badge-red',
  academic: 'badge-blue',
  event:    'badge-brand',
  general:  'badge-amber',
};
const TARGET_ICONS = {
  all:      Globe,
  students: GraduationCap,
  faculty:  Users,
};

export default function Notices() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [searchParams] = useSearchParams();

  const [tab, setTab]           = useState('published');
  const [postOpen, setPostOpen] = useState(searchParams.get('action') === 'post');
  const [editNotice, setEditNotice] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['notices', tab],
    queryFn:  () => noticeAPI.getAll({ status: tab, limit: 50 }).then((r) => r.data),
  });
  const notices = data?.data || [];

  const createMut = useMutation({
    mutationFn: (d) => noticeAPI.create(d),
    onSuccess:  () => { qc.invalidateQueries(['notices']); setPostOpen(false); toast.success('Notice created as draft'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to create notice'),
  });
  const createAndPublishMut = useMutation({
    mutationFn: async (d) => {
      const res = await noticeAPI.create(d);
      const id  = res.data?.data?._id || res.data?._id;
      if (id) await noticeAPI.publish(id);
      return res;
    },
    onSuccess: () => { qc.invalidateQueries(['notices']); setPostOpen(false); toast.success('Notice published'); },
    onError:   (e) => toast.error(e?.response?.data?.message || 'Failed to publish'),
  });
  const publishMut = useMutation({
    mutationFn: (id) => noticeAPI.publish(id),
    onSuccess:  () => { qc.invalidateQueries(['notices']); toast.success('Notice published'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to publish'),
  });
  const updateMut = useMutation({
    mutationFn: ({ id, data }) => noticeAPI.update(id, data),
    onSuccess:  () => { qc.invalidateQueries(['notices']); setEditNotice(null); toast.success('Notice updated'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to update'),
  });
  const deleteMut = useMutation({
    mutationFn: (id) => noticeAPI.delete(id),
    onSuccess:  () => { qc.invalidateQueries(['notices']); toast.success('Notice deleted'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to delete'),
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">Notices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Post and manage department notices</p>
        </div>
        <button onClick={() => setPostOpen(true)} className="btn-primary">
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button onClick={() => setTab('published')} className={tab === 'published' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
          Published
        </button>
        <button onClick={() => setTab('draft')} className={tab === 'draft' ? 'btn-primary btn-sm' : 'btn-secondary btn-sm'}>
          Drafts
        </button>
      </div>

      {/* Notices list */}
      {isLoading ? (
        <div className="animate-pulse space-y-4">
          {[1,2,3].map((i) => <div key={i} className="h-32 bg-gray-200 dark:bg-zinc-800 rounded-xl" />)}
        </div>
      ) : notices.length === 0 ? (
        <div className="card p-14 flex flex-col items-center justify-center text-center gap-3">
          <Bell className="w-10 h-10 text-gray-300 dark:text-zinc-700" />
          <p className="text-gray-400 dark:text-gray-600">
            {tab === 'published' ? 'No published notices' : 'No draft notices'}
          </p>
        </div>
      ) : (
        <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-4">
          {notices.map((notice) => {
            const TargetIcon = TARGET_ICONS[notice.target] || Globe;
            return (
              <motion.div key={notice._id} variants={item} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-2 mb-2">
                      <span className={TYPE_BADGES[notice.type] || 'badge-amber'}>{notice.type}</span>
                      <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <TargetIcon className="w-3 h-3" />
                        {notice.target}
                      </span>
                      {notice.viewCount != null && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <Eye className="w-3 h-3" /> {notice.viewCount}
                        </span>
                      )}
                    </div>

                    <h3 className="font-semibold text-gray-900 dark:text-white text-base mb-2">{notice.title}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{notice.content}</p>

                    <div className="flex items-center gap-4 mt-3 text-xs text-gray-400">
                      {notice.publishedAt && (
                        <span>Published {format(new Date(notice.publishedAt), 'MMM d, yyyy')}</span>
                      )}
                      {notice.expiresAt && (
                        <span>Expires {format(new Date(notice.expiresAt), 'MMM d, yyyy')}</span>
                      )}
                      {notice.createdBy?.fullName && (
                        <span>By {notice.createdBy.fullName}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-1 flex-shrink-0">
                    {tab === 'draft' && (
                      <button
                        onClick={() => publishMut.mutate(notice._id)}
                        className="btn-primary btn-sm"
                        title="Publish"
                      >
                        <Send className="w-3.5 h-3.5" /> Publish
                      </button>
                    )}
                    <button onClick={() => setEditNotice(notice)} className="btn-ghost btn-icon btn-sm" title="Edit">
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => { if (window.confirm('Delete this notice?')) deleteMut.mutate(notice._id); }}
                      className="btn-ghost btn-icon btn-sm text-red-400"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Post Notice Modal */}
      <AnimatePresence>
        {postOpen && (
          <SlideOver title="Post Notice" onClose={() => setPostOpen(false)}>
            <NoticeForm
              onDraft={(d) => createMut.mutate({ ...d, status: 'draft' })}
              onPublish={(d) => createAndPublishMut.mutate({ ...d, status: 'published' })}
              draftLoading={createMut.isLoading}
              publishLoading={createAndPublishMut.isLoading}
            />
          </SlideOver>
        )}
      </AnimatePresence>

      {/* Edit Notice Modal */}
      <AnimatePresence>
        {editNotice && (
          <SlideOver title="Edit Notice" onClose={() => setEditNotice(null)}>
            <NoticeForm
              defaultValues={editNotice}
              onDraft={(d) => updateMut.mutate({ id: editNotice._id, data: d })}
              onPublish={(d) => updateMut.mutate({ id: editNotice._id, data: { ...d, status: 'published' } })}
              draftLoading={updateMut.isLoading}
              publishLoading={updateMut.isLoading}
              editMode
            />
          </SlideOver>
        )}
      </AnimatePresence>
    </div>
  );
}

function NoticeForm({ defaultValues, onDraft, onPublish, draftLoading, publishLoading, editMode }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(noticeSchema),
    defaultValues: defaultValues || { type: 'general', target: 'all' },
  });

  return (
    <form className="space-y-5">
      <div>
        <label className="label">Title</label>
        <input {...register('title')} className="input" placeholder="Notice title…" />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
      </div>

      <div>
        <label className="label">Content</label>
        <textarea {...register('content')} rows={6} className="input resize-none" placeholder="Notice content…" />
        {errors.content && <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="label">Type</label>
          <select {...register('type')} className="input">
            <option value="general">General</option>
            <option value="urgent">Urgent</option>
            <option value="academic">Academic</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div>
          <label className="label">Target</label>
          <select {...register('target')} className="input">
            <option value="all">All</option>
            <option value="students">Students</option>
            <option value="faculty">Faculty</option>
          </select>
        </div>
      </div>

      <div>
        <label className="label">Expires At (optional)</label>
        <input {...register('expiresAt')} type="date" className="input" />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit(onDraft)}
          disabled={draftLoading}
          className="btn-secondary flex-1"
        >
          {draftLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={handleSubmit(onPublish)}
          disabled={publishLoading}
          className="btn-primary flex-1"
        >
          {publishLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" />{editMode ? 'Update & Publish' : 'Publish'}</>}
        </button>
      </div>
    </form>
  );
}

function SlideOver({ title, onClose, children }) {
  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <motion.div
        initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-zinc-800">
          <h2 className="section-title">{title}</h2>
          <button onClick={onClose} className="btn-ghost btn-icon"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
      </motion.div>
    </>
  );
}
