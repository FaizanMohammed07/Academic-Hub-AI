import { useState, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { mediaAPI } from '@services/api';
import { motion } from 'framer-motion';
import { useToast } from '@shared/context/NotificationContext';
import { Image, Video, Users, GraduationCap, Upload, Copy, Check, AlertCircle } from 'lucide-react';

const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const item    = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.3 } } };

const SECTIONS = [
  {
    key:     'hod',
    label:   'HOD Photo',
    icon:    Users,
    folder:  'cms/hod',
    accept:  'image/*',
    formats: 'JPG, PNG, WEBP — Max 2MB',
    hint:    'Paste the CDN URL into the HOD section of Website CMS.',
    color:   'from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30',
  },
  {
    key:     'faculty',
    label:   'Faculty Photos',
    icon:    GraduationCap,
    folder:  'cms/faculty',
    accept:  'image/*',
    formats: 'JPG, PNG, WEBP — Max 2MB per image',
    hint:    'Use each CDN URL in the Faculty section of Website CMS.',
    color:   'from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30',
  },
  {
    key:     'gallery',
    label:   'Gallery Images',
    icon:    Image,
    folder:  'cms/gallery',
    accept:  'image/*',
    formats: 'JPG, PNG, WEBP — Max 5MB',
    hint:    'Paste CDN URLs when adding items in the Gallery section.',
    color:   'from-brand-100 to-brand-200 dark:from-brand-900/30 dark:to-brand-800/30',
  },
  {
    key:     'videos',
    label:   'Videos',
    icon:    Video,
    folder:  'cms/videos',
    accept:  'video/*',
    formats: 'MP4, WEBM — Max 100MB',
    hint:    'Paste the CDN URL into the Videos section of Website CMS.',
    color:   'from-purple-100 to-purple-200 dark:from-purple-900/30 dark:to-purple-800/30',
  },
];

export default function MediaManager() {
  const toast = useToast();
  const [results, setResults] = useState({}); // key -> { cdnUrl }

  const uploadMut = useMutation({
    mutationFn: ({ fileName, fileType, folder }) => mediaAPI.getUploadUrl({ fileName, fileType, folder }),
    onError: (e) => toast.error(e?.response?.data?.message || 'Failed to get upload URL'),
  });

  const handleFile = async (section, file) => {
    if (!file) return;
    try {
      const res = await mediaAPI.getUploadUrl({
        fileName: file.name,
        fileType: file.type,
        folder:   section.folder,
      });
      const { uploadUrl, cdnUrl, key } = res.data?.data || res.data || {};
      if (uploadUrl) {
        await fetch(uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      }
      const finalUrl = cdnUrl || uploadUrl?.split('?')[0] || '';
      setResults((prev) => ({ ...prev, [section.key]: { cdnUrl: finalUrl } }));
      toast.success('File uploaded — copy the CDN URL below');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    }
  };

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item}>
        <h1 className="page-title">Media Manager</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload assets to S3 and get CDN URLs for use in the Website CMS
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {SECTIONS.map((section) => (
          <motion.div key={section.key} variants={item}>
            <UploadSection
              section={section}
              result={results[section.key]}
              onFile={(file) => handleFile(section, file)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function UploadSection({ section, result, onFile }) {
  const toast     = useToast();
  const fileRef   = useRef();
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success('Copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const Icon = section.icon;

  return (
    <div className="card p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${section.color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-gray-700 dark:text-gray-200" />
        </div>
        <div>
          <h3 className="section-title">{section.label}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">{section.formats}</p>
        </div>
      </div>

      {/* Drag-drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
          ${dragging
            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20'
            : 'border-gray-200 dark:border-zinc-700 hover:border-brand-400 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`}
      >
        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {dragging ? 'Drop file here' : 'Click or drag & drop to upload'}
        </p>
        <p className="text-xs text-gray-400 mt-1">{section.formats}</p>
        <input
          ref={fileRef}
          type="file"
          accept={section.accept}
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) onFile(f); }}
        />
      </div>

      {/* OR: URL input */}
      <div className="flex gap-2 items-center">
        <div className="text-xs text-gray-400 flex-shrink-0">or paste URL:</div>
        <input
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          placeholder="https://cdn.example.com/…"
          className="input text-xs flex-1"
        />
      </div>

      {/* Result CDN URL */}
      {(result?.cdnUrl || urlInput) && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <code className="text-xs text-emerald-700 dark:text-emerald-400 flex-1 break-all">
              {result?.cdnUrl || urlInput}
            </code>
            <button
              onClick={() => copy(result?.cdnUrl || urlInput)}
              className="btn-secondary btn-sm flex-shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      )}

      {/* Hint */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200 dark:border-amber-800">
        <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">{section.hint}</p>
      </div>
    </div>
  );
}
