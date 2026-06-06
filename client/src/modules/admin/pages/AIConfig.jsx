import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '@services/api';
import { motion } from 'framer-motion';
import { useToast } from '@shared/context/NotificationContext';
import { Cpu, Save, Pencil, X, Loader2, Brain, GraduationCap, Shield, Bell } from 'lucide-react';

const stagger = { visible: { transition: { staggerChildren: 0.06 } } };
const item    = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { duration: 0.28 } } };

const CATEGORY_ICONS = { ai: Brain, academic: GraduationCap, security: Shield, notification: Bell };
const CATEGORY_LABELS = { ai: 'AI Settings', academic: 'Academic Settings', security: 'Security Settings', notification: 'Notification Settings' };
const CATEGORY_COLORS = {
  ai:           'text-brand-500 bg-brand-50 dark:bg-brand-900/20',
  academic:     'text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20',
  security:     'text-red-500 bg-red-50 dark:bg-red-900/20',
  notification: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
};

const AI_MODELS = ['gpt-4o', 'gpt-4o-mini', 'claude-sonnet-4-5'];

export default function AIConfig() {
  const qc    = useQueryClient();
  const toast = useToast();
  const [editing, setEditing] = useState(null); // { key, value }
  const [draft, setDraft]     = useState('');

  const { data: settings = [], isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn:  () => adminAPI.getSettings().then((r) => r.data.data),
  });

  const updateMut = useMutation({
    mutationFn: ({ key, value }) => adminAPI.updateSetting(key, { value }),
    onSuccess:  () => { qc.invalidateQueries(['settings']); setEditing(null); toast.success('Setting updated'); },
    onError:    (e) => toast.error(e?.response?.data?.message || 'Failed to update'),
  });

  // Group settings by category
  const grouped = {};
  (settings || []).forEach((s) => {
    const cat = s.category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  });

  const startEdit = (setting) => {
    setEditing(setting);
    setDraft(String(setting.value ?? ''));
  };

  const saveEdit = () => {
    if (!editing) return;
    let parsed = draft;
    if (draft === 'true') parsed = true;
    else if (draft === 'false') parsed = false;
    else if (!isNaN(Number(draft)) && draft !== '') parsed = Number(draft);
    updateMut.mutate({ key: editing.key, value: parsed });
  };

  if (isLoading) return <ConfigSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-4xl">
      <motion.div variants={item}>
        <h1 className="page-title">AI & Platform Configuration</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage system-wide settings and AI model configuration</p>
      </motion.div>

      {Object.keys(grouped).length === 0 && (
        <div className="card p-12 text-center">
          <Cpu className="w-10 h-10 text-gray-300 dark:text-zinc-700 mx-auto mb-3" />
          <p className="text-gray-400 dark:text-gray-600">No settings found</p>
        </div>
      )}

      {Object.entries(grouped).map(([category, catSettings]) => {
        const Icon   = CATEGORY_ICONS[category] || Cpu;
        const label  = CATEGORY_LABELS[category] || category;
        const colorCls = CATEGORY_COLORS[category] || 'text-gray-500 bg-gray-50 dark:bg-zinc-800';

        return (
          <motion.div key={category} variants={item} className="card overflow-hidden">
            <div className="p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colorCls}`}>
                <Icon className="w-4 h-4" />
              </div>
              <h2 className="section-title">{label}</h2>
            </div>

            <div className="divide-y divide-gray-50 dark:divide-zinc-800">
              {catSettings.map((setting) => (
                <div key={setting.key} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {setting.label || setting.key}
                    </div>
                    {setting.description && (
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{setting.description}</div>
                    )}
                  </div>

                  {editing?.key === setting.key ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {setting.key?.includes('model') ? (
                        <select value={draft} onChange={(e) => setDraft(e.target.value)} className="input max-w-48 text-sm">
                          {AI_MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
                        </select>
                      ) : typeof setting.value === 'boolean' || draft === 'true' || draft === 'false' ? (
                        <select value={draft} onChange={(e) => setDraft(e.target.value)} className="input max-w-32 text-sm">
                          <option value="true">Enabled</option>
                          <option value="false">Disabled</option>
                        </select>
                      ) : (
                        <input
                          value={draft}
                          onChange={(e) => setDraft(e.target.value)}
                          className="input max-w-40 text-sm"
                          autoFocus
                        />
                      )}
                      <button onClick={saveEdit} disabled={updateMut.isLoading} className="btn-primary btn-sm">
                        {updateMut.isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => setEditing(null)} className="btn-ghost btn-icon btn-sm">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <SettingValueDisplay setting={setting} />
                      <button onClick={() => startEdit(setting)} className="btn-ghost btn-icon btn-sm">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

function SettingValueDisplay({ setting }) {
  const val = setting.value;
  if (val === true || val === 'true') {
    return <span className="badge-green">Enabled</span>;
  }
  if (val === false || val === 'false') {
    return <span className="badge-red">Disabled</span>;
  }
  return (
    <span className="text-sm font-mono bg-gray-100 dark:bg-zinc-800 px-3 py-1 rounded-lg text-gray-700 dark:text-gray-300 max-w-48 truncate">
      {String(val)}
    </span>
  );
}

const ConfigSkeleton = () => (
  <div className="space-y-6 animate-pulse max-w-4xl">
    <div className="h-8 w-56 bg-gray-200 dark:bg-zinc-800 rounded" />
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="card p-6 space-y-4">
        <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded" />
        {[1, 2, 3].map((j) => <div key={j} className="h-10 bg-gray-100 dark:bg-zinc-800 rounded" />)}
      </div>
    ))}
  </div>
);
