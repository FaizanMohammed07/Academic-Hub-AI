import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award, Trophy, Star, FileCheck, Download, Copy, CheckCheck,
  Inbox, X, Shield, Medal,
} from 'lucide-react';
import { vaultAPI } from '@services/api';
import { format } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

const TYPE_CONFIG = {
  course_completion: { label: 'Course Completion', icon: FileCheck, color: 'text-brand-500',  bg: 'bg-brand-50 dark:bg-brand-900/20',  badge: 'badge-brand' },
  achievement:       { label: 'Achievement',       icon: Trophy,    color: 'text-amber-500',  bg: 'bg-amber-50 dark:bg-amber-900/20',  badge: 'badge-amber' },
  participation:     { label: 'Participation',     icon: Medal,     color: 'text-blue-500',   bg: 'bg-blue-50 dark:bg-blue-900/20',   badge: 'badge-blue' },
  excellence:        { label: 'Excellence',        icon: Star,      color: 'text-violet-500', bg: 'bg-violet-50 dark:bg-violet-900/20', badge: 'badge-brand' },
  merit:             { label: 'Merit',             icon: Award,     color: 'text-emerald-500',bg: 'bg-emerald-50 dark:bg-emerald-900/20', badge: 'badge-green' },
  default:           { label: 'Certificate',       icon: Shield,    color: 'text-gray-500',   bg: 'bg-gray-50 dark:bg-zinc-800',       badge: 'badge-blue' },
};

export default function Certificates() {
  const [verifyModal, setVerifyModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const toast = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['student', 'vault', 'certificates'],
    queryFn: () => vaultAPI.getCertificates().then((r) => {
      const d = r.data.data;
      return Array.isArray(d) ? d : (d?.certificates || []);
    }),
  });

  const certificates = data || [];

  const copyCode = (cert) => {
    navigator.clipboard.writeText(cert.verificationCode);
    setCopiedId(cert._id);
    toast.success('Verification code copied!');
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (isLoading) return <CertSkeleton />;

  return (
    <motion.div variants={stagger} initial="hidden" animate="visible" className="space-y-6 max-w-7xl">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="page-title">My Certificates</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            All your earned certificates and credentials
          </p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
          {certificates.length} certificate{certificates.length !== 1 ? 's' : ''}
        </div>
      </motion.div>

      {certificates.length === 0 ? (
        <motion.div variants={item} className="card p-16 flex flex-col items-center justify-center text-center gap-4">
          <div className="w-20 h-20 rounded-2xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
            <Award className="w-10 h-10 text-amber-300 dark:text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No certificates yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
              Complete assignments and lab work with excellence to earn certificates. They'll appear here automatically.
            </p>
          </div>
        </motion.div>
      ) : (
        <motion.div variants={item} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {certificates.map((cert) => {
            const config = TYPE_CONFIG[cert.type] || TYPE_CONFIG.default;
            const Icon = config.icon;
            return (
              <div
                key={cert._id}
                className="card p-5 flex flex-col gap-4 hover:shadow-md transition-shadow"
              >
                {/* Type icon + badge */}
                <div className="flex items-start justify-between">
                  <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${config.color}`} />
                  </div>
                  <span className={config.badge}>{config.label}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug">{cert.title}</h3>
                  {cert.issuedBy && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Issued by {cert.issuedBy}</p>
                  )}
                  {cert.issueDate && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {format(new Date(cert.issueDate), 'MMM d, yyyy')}
                    </p>
                  )}
                </div>

                {/* Verification code preview */}
                {cert.verificationCode && (
                  <div className="flex items-center gap-2 bg-gray-50 dark:bg-zinc-800 rounded-lg px-3 py-2">
                    <code className="text-xs font-mono text-gray-600 dark:text-gray-300 flex-1 truncate">
                      {cert.verificationCode}
                    </code>
                    <button
                      onClick={() => copyCode(cert)}
                      className="btn-icon btn-ghost p-1 text-brand-500"
                      title="Copy verification code"
                    >
                      {copiedId === cert._id
                        ? <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                        : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setVerifyModal(cert)}
                    className="btn-secondary btn-sm flex-1"
                  >
                    <Shield className="w-3.5 h-3.5" /> Verify
                  </button>
                  {cert.fileUrl && (
                    <a
                      href={cert.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary btn-sm flex-1"
                    >
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Verify Modal */}
      <AnimatePresence>
        {verifyModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setVerifyModal(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
            >
              <div className="card p-6 w-full max-w-md pointer-events-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="section-title">Certificate Details</h3>
                  <button onClick={() => setVerifyModal(null)} className="btn-icon btn-ghost">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-center space-y-4">
                  {(() => {
                    const config = TYPE_CONFIG[verifyModal.type] || TYPE_CONFIG.default;
                    const Icon = config.icon;
                    return (
                      <div className={`w-16 h-16 rounded-2xl ${config.bg} flex items-center justify-center mx-auto`}>
                        <Icon className={`w-8 h-8 ${config.color}`} />
                      </div>
                    );
                  })()}

                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{verifyModal.title}</h4>
                    {verifyModal.issuedBy && (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Issued by {verifyModal.issuedBy}</p>
                    )}
                    {verifyModal.issueDate && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 mt-0.5">
                        {format(new Date(verifyModal.issueDate), 'MMMM d, yyyy')}
                      </p>
                    )}
                  </div>

                  {verifyModal.verificationCode && (
                    <div className="bg-gray-50 dark:bg-zinc-800 rounded-xl p-4 text-left">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Verification Code</p>
                      <div className="flex items-center gap-3">
                        <code className="flex-1 text-sm font-mono font-bold text-gray-900 dark:text-white tracking-widest break-all">
                          {verifyModal.verificationCode}
                        </code>
                        <button
                          onClick={() => copyCode(verifyModal)}
                          className="btn-secondary btn-sm flex-shrink-0"
                        >
                          {copiedId === verifyModal._id
                            ? <><CheckCheck className="w-3.5 h-3.5 text-emerald-500" /> Copied</>
                            : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                        </button>
                      </div>
                    </div>
                  )}

                  {verifyModal.fileUrl && (
                    <a
                      href={verifyModal.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="btn-primary w-full"
                    >
                      <Download className="w-4 h-4" /> Download Certificate
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function CertSkeleton() {
  return (
    <div className="space-y-6 max-w-7xl animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-zinc-800 rounded" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-56 bg-gray-200 dark:bg-zinc-800 rounded-xl" />
        ))}
      </div>
    </div>
  );
}
