import React, { useState, useEffect } from 'react';
import { X, Globe, BookOpen, Video, FileText, Check, AlertCircle, Clock } from 'lucide-react';
import { ClutterItem, ItemCategory, ItemType } from '../types';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (itemData: {
    title: string;
    type: ItemType;
    category: ItemCategory;
    url?: string;
    note?: string;
    tags: string[];
    customDate?: string;
    estimatedMinutes?: number;
  }) => void;
  editingItem?: ClutterItem | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<ItemType>('link');
  const [category, setCategory] = useState<ItemCategory>('READ');
  const [url, setUrl] = useState('');
  const [note, setNote] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(undefined);
  const [simulateForgotten, setSimulateForgotten] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Sync state with editingItem or defaults
  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setType(editingItem.type);
      setCategory(editingItem.category);
      setUrl(editingItem.url || '');
      setNote(editingItem.note || '');
      setTags(editingItem.tags || []);
      setEstimatedMinutes(editingItem.estimatedMinutes);
      setSimulateForgotten(false);
    } else {
      setTitle('');
      setType('link');
      setCategory('READ');
      setUrl('');
      setNote('');
      setTags([]);
      setEstimatedMinutes(undefined);
      setSimulateForgotten(false);
    }
    setError(null);
  }, [editingItem, isOpen]);

  // Adjust suggested category when type changes
  const handleTypeChange = (newType: ItemType) => {
    setType(newType);
    if (!editingItem) {
      if (newType === 'note') {
        setCategory('DO');
      } else if (newType === 'link') {
        setCategory('REFERENCE');
      } else {
        setCategory('READ');
      }
    }
  };

  const handleAddTag = () => {
    const clean = tagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title for this item.');
      return;
    }

    // If type is not note, URL is recommended; validate URL syntax if entered
    if (url.trim()) {
      try {
        const testUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        new URL(testUrl);
      } catch {
        setError('Please enter a valid URL (e.g., https://example.com).');
        return;
      }
    } else if (type !== 'note' && !note.trim()) {
      setError('Please provide either a URL or a note description.');
      return;
    }

    let customDate: string | undefined = undefined;
    if (simulateForgotten && !editingItem) {
      const d = new Date();
      d.setDate(d.getDate() - 25); // 25 days ago
      customDate = d.toISOString();
    }

    onSubmit({
      title: title.trim(),
      type,
      category,
      url: url.trim() || undefined,
      note: note.trim() || undefined,
      tags,
      customDate,
      estimatedMinutes: estimatedMinutes ? Number(estimatedMinutes) : undefined,
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900">
              {editingItem ? 'Edit Saved Item' : 'Quick Capture to ClutterBox'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingItem
                ? 'Update details, category box, or notes.'
                : 'Save articles, tasks, links, or fleeting thoughts in seconds.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Item Type Segmented Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Content Type
            </label>
            <div className="grid grid-cols-4 gap-2 p-1 bg-slate-100 rounded-xl">
              {[
                { id: 'link' as ItemType, label: 'Link', icon: Globe },
                { id: 'article' as ItemType, label: 'Article', icon: BookOpen },
                { id: 'video' as ItemType, label: 'Video', icon: Video },
                { id: 'note' as ItemType, label: 'Note / Idea', icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                const isSelected = type === t.id;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleTypeChange(t.id)}
                    className={`flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white text-slate-900 shadow-xs font-semibold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError(null);
              }}
              placeholder="e.g. Modern CSS Grid Techniques, Buy anniversary gift..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* URL (optional for notes) */}
          {type !== 'note' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Website URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 font-mono"
              />
            </div>
          )}

          {/* Smart Box Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Smart Box Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  id: 'READ' as ItemCategory,
                  title: 'READ',
                  desc: 'Articles & videos',
                  activeColor: 'border-indigo-500 bg-indigo-50/60 text-indigo-900',
                },
                {
                  id: 'DO' as ItemCategory,
                  title: 'DO',
                  desc: 'Tasks & actions',
                  activeColor: 'border-emerald-500 bg-emerald-50/60 text-emerald-900',
                },
                {
                  id: 'REFERENCE' as ItemCategory,
                  title: 'REFERENCE',
                  desc: 'Useful resources',
                  activeColor: 'border-sky-500 bg-sky-50/60 text-sky-900',
                },
              ].map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-2.5 text-left border rounded-xl transition-all ${
                      isSelected
                        ? `${c.activeColor} ring-1 ring-offset-0 font-semibold shadow-xs`
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                    }`}
                  >
                    <div className="text-xs font-bold">{c.title}</div>
                    <div className="text-[10px] opacity-75">{c.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes / Thoughts */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Notes / Key Takeaways <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add key takeaways, context, or action checklist..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tags <span className="text-slate-400 font-normal">(press Enter or Add)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                placeholder="e.g. design, react, urgent"
                className="flex-1 px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Add
              </button>
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-[11px] font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:text-rose-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Demo toggle for new items: simulate forgotten */}
          {!editingItem && (
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={simulateForgotten}
                  onChange={(e) => setSimulateForgotten(e.target.checked)}
                  className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                />
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  Simulate item saved 25 days ago (Demo Forgotten Treasure immediately)
                </span>
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:scale-98 rounded-xl shadow-xs transition-all"
            >
              {editingItem ? 'Save Changes' : 'Save to ClutterBox'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
