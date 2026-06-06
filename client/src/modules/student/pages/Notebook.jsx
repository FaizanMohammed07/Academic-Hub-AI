import { useState, useRef, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import {
  NotebookPen, Send, Plus, Bot, User, BookOpen, ChevronDown,
  Sparkles, List, HelpCircle, FileText, LayoutList, Loader2,
  MessageSquare, Inbox,
} from 'lucide-react';
import { studentAPI, aiAPI } from '@services/api';
import { formatDistanceToNow } from 'date-fns';
import { useToast } from '@shared/context/NotificationContext';

const QUICK_ACTIONS = [
  { label: 'Generate Notes',       icon: FileText,     prompt: 'Generate concise study notes for this topic.' },
  { label: 'Important Questions',  icon: HelpCircle,   prompt: 'List the most important exam questions for this subject.' },
  { label: 'MCQs',                 icon: LayoutList,   prompt: 'Create 10 multiple choice questions with answers.' },
  { label: 'Summary',             icon: List,          prompt: 'Give me a short summary of the key concepts in this subject.' },
];

export default function Notebook() {
  const [activeConvId, setActiveConvId] = useState(null);
  const [messages, setMessages]         = useState([]);
  const [input, setInput]               = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isTyping, setIsTyping]         = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const toast = useToast();
  const queryClient = useQueryClient();

  // Conversations list
  const { data: conversations = [], isLoading: convsLoading } = useQuery({
    queryKey: ['student', 'ai', 'conversations'],
    queryFn: () => aiAPI.getConversations().then((r) => r.data.data),
  });

  // Subjects
  const { data: subjects = [] } = useQuery({
    queryKey: ['student', 'subjects'],
    queryFn: () => studentAPI.getSubjects().then((r) => r.data.data),
  });

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Load a conversation's messages
  const loadConversation = useCallback(async (conv) => {
    setActiveConvId(conv._id);
    setMessages(conv.messages || []);
  }, []);

  // Start new conversation
  const startConvMutation = useMutation({
    mutationFn: (payload) => aiAPI.startConversation(payload).then((r) => r.data.data),
    onSuccess: (conv) => {
      setActiveConvId(conv._id);
      setMessages(conv.messages || []);
      queryClient.invalidateQueries(['student', 'ai', 'conversations']);
    },
    onError: () => toast.error('Failed to start conversation.'),
  });

  // Send message
  const sendMutation = useMutation({
    mutationFn: ({ convId, message }) =>
      aiAPI.sendMessage(convId, { message }).then((r) => r.data.data),
    onMutate: ({ message }) => {
      const userMsg = { role: 'user', content: message, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      setIsTyping(true);
    },
    onSuccess: (data) => {
      setIsTyping(false);
      const assistantMsg = data?.message || data;
      if (assistantMsg) {
        setMessages((prev) => [...prev, assistantMsg]);
      }
      queryClient.invalidateQueries(['student', 'ai', 'conversations']);
    },
    onError: () => {
      setIsTyping(false);
      toast.error('Failed to send message. Please try again.');
    },
  });

  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    if (!activeConvId) {
      // Start new conversation then send
      const payload = { initialMessage: msg };
      if (selectedSubject) payload.subjectId = selectedSubject;
      const conv = await startConvMutation.mutateAsync(payload);
      // Messages handled in onSuccess
      return;
    }
    sendMutation.mutate({ convId: activeConvId, message: msg });
  }, [input, activeConvId, selectedSubject, startConvMutation, sendMutation]);

  const handleNewChat = () => {
    setActiveConvId(null);
    setMessages([]);
    setInput('');
    setSelectedSubject('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-7xl">
      <div className="flex gap-0 h-[calc(100vh-8rem)] rounded-xl overflow-hidden border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-card">
        {/* Sidebar */}
        <aside className="w-64 flex-shrink-0 border-r border-gray-100 dark:border-zinc-800 flex flex-col">
          <div className="p-4 border-b border-gray-100 dark:border-zinc-800">
            <button onClick={handleNewChat} className="btn-primary w-full">
              <Plus className="w-4 h-4" /> New Chat
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2">
            {convsLoading ? (
              <div className="space-y-2 p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-14 bg-gray-100 dark:bg-zinc-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center">
                <MessageSquare className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">No conversations yet</p>
              </div>
            ) : (
              <div className="px-2 space-y-1">
                {conversations.map((conv) => (
                  <button
                    key={conv._id}
                    onClick={() => loadConversation(conv)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                      activeConvId === conv._id
                        ? 'bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <p className="text-sm font-medium truncate">
                      {conv.title || conv.subject?.name || 'Conversation'}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                      {conv.updatedAt
                        ? formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })
                        : ''}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Main chat panel */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 dark:border-zinc-800 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
              <NotebookPen className="w-4 h-4 text-violet-500" />
            </div>
            <div>
              <h1 className="text-base font-semibold text-gray-900 dark:text-white">AI Learning Assistant</h1>
              <p className="text-xs text-gray-400 dark:text-gray-500">Powered by VJIT IT Hub AI</p>
            </div>
          </div>

          {/* Messages or Welcome */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.length === 0 && !isTyping ? (
              <WelcomeScreen
                subjects={subjects}
                selectedSubject={selectedSubject}
                setSelectedSubject={setSelectedSubject}
                onQuickAction={(prompt) => handleSend(prompt)}
              />
            ) : (
              <>
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25 }}
                      className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-brand-500 text-white'
                          : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'
                      }`}>
                        {msg.role === 'user'
                          ? <User className="w-4 h-4" />
                          : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-brand-500 text-white rounded-tr-sm'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 rounded-tl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-violet-500" />
                    </div>
                    <div className="bg-gray-100 dark:bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3">
                      <div className="flex gap-1 items-center h-4">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full"
                            animate={{ y: [0, -6, 0] }}
                            transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-zinc-800">
            {/* Quick actions */}
            {messages.length === 0 && !activeConvId && (
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
                  <button
                    key={label}
                    onClick={() => handleSend(prompt)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 dark:border-zinc-700 text-xs font-medium text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  >
                    <Icon className="w-3.5 h-3.5" /> {label}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-3">
              <textarea
                ref={inputRef}
                className="input resize-none flex-1 min-h-[42px] max-h-32 py-2.5"
                placeholder="Ask anything about your subjects..."
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sendMutation.isPending || startConvMutation.isPending}
                className="btn-primary flex-shrink-0 self-end"
              >
                {sendMutation.isPending || startConvMutation.isPending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function WelcomeScreen({ subjects, selectedSubject, setSelectedSubject, onQuickAction }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
      <div className="w-16 h-16 rounded-2xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center">
        <Sparkles className="w-8 h-8 text-violet-500" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Hi, I'm your AI learning assistant</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 max-w-sm">
          Ask me anything about your subjects — notes, questions, explanations, summaries and more.
        </p>
      </div>

      {/* Subject selector */}
      {subjects.length > 0 && (
        <div className="w-full max-w-xs">
          <label className="label text-center">Select a subject (optional)</label>
          <div className="relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select
              className="input pl-9 pr-8 appearance-none"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
            >
              <option value="">Any subject</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Quick action chips */}
      <div className="flex flex-wrap gap-2 justify-center max-w-md">
        {QUICK_ACTIONS.map(({ label, icon: Icon, prompt }) => (
          <button
            key={label}
            onClick={() => onQuickAction(prompt)}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 dark:border-zinc-700 text-sm font-medium text-gray-600 dark:text-gray-400 hover:border-brand-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
          >
            <Icon className="w-4 h-4" /> {label}
          </button>
        ))}
      </div>
    </div>
  );
}
