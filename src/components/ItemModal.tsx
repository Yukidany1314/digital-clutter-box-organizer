import React, { useState, useEffect } from 'react';
import { X, Globe, BookOpen, Video, FileText, Check, AlertCircle, AlertTriangle, Clock, Sparkles } from 'lucide-react';
import { ClutterItem, ItemCategory, ContentType } from '../types';
import { AICategorizationPanel } from './AICategorizationPanel';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    title: string;
    category: ItemCategory;
    content_type: ContentType;
    url?: string;
    description?: string;
    tags: string[];
    customDate?: string;
  }) => void;
  editingItem?: ClutterItem | null;
  onCheckDuplicateUrl: (url: string, excludeId?: string) => boolean;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  editingItem,
  onCheckDuplicateUrl,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('read');
  const [contentType, setContentType] = useState<ContentType>('article');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [simulateForgotten, setSimulateForgotten] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDuplicateUrl, setIsDuplicateUrl] = useState(false);

  useEffect(() => {
    if (editingItem) {
      setTitle(editingItem.title);
      setCategory(editingItem.category);
      setContentType(editingItem.content_type);
      setUrl(editingItem.url || '');
      setDescription(editingItem.description || '');
      setTags(editingItem.tags || []);
      setSimulateForgotten(false);
      setIsDuplicateUrl(false);
    } else {
      setTitle('');
      setCategory('read');
      setContentType('article');
      setUrl('');
      setDescription('');
      setTags([]);
      setSimulateForgotten(false);
      setIsDuplicateUrl(false);
    }
    setError(null);
  }, [editingItem, isOpen]);

  // URL duplicate check
  useEffect(() => {
    if (url.trim()) {
      const isDup = onCheckDuplicateUrl(url, editingItem?.id);
      setIsDuplicateUrl(isDup);
    } else {
      setIsDuplicateUrl(false);
    }
  }, [url, editingItem, onCheckDuplicateUrl]);

  const handleAddTag = () => {
    const clean = tagInput.trim().toLowerCase().replace(/^#/, '');
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

    if (url.trim()) {
      try {
        const testUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`;
        new URL(testUrl);
      } catch {
        setError('Please enter a valid URL (e.g., https://example.com).');
        return;
      }
    }

    let customDate: string | undefined = undefined;
    if (simulateForgotten && !editingItem) {
      const d = new Date();
      d.setDate(d.getDate() - 25);
      customDate = d.toISOString();
    }

    onSubmit({
      title: title.trim(),
      category,
      content_type: contentType,
      url: url.trim() || undefined,
      description: description.trim() || undefined,
      tags,
      customDate,
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
      <div className="relative w-full max-w-xl max-h-[90vh] flex flex-col bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-slate-900">
              {editingItem ? 'Edit Saved Item' : 'Quick Capture to ClutterBox'}
            </h2>
            <p className="text-xs text-slate-400">
              {editingItem
                ? 'Update metadata, box assignment, or tags.'
                : 'Save articles, tasks, links, or notes with optional AI classification.'}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

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
              placeholder="e.g. Modern CSS Grid Techniques, Complete portfolio draft..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400"
            />
          </div>

          {/* URL with duplicate warning */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Website URL <span className="text-slate-400 font-normal">(optional for notes/tasks)</span>
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com/guide"
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800 placeholder:text-slate-400 font-mono"
            />
            {isDuplicateUrl && (
              <div className="mt-1.5 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                <span>Notice: This URL already exists in your ClutterBox. Saving it will create an additional record.</span>
              </div>
            )}
          </div>

          {/* AI Smart Categorization Panel */}
          <AICategorizationPanel
            title={title}
            url={url}
            description={description}
            currentCategory={category}
            onApply={(suggestions) => {
              setCategory(suggestions.category);
              setContentType(suggestions.contentType);
              setTags(suggestions.tags);
              if (suggestions.descriptionSummary && !description) {
                setDescription(suggestions.descriptionSummary);
              }
            }}
          />

          {/* Smart Box Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Smart Box Category
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                {
                  id: 'read' as ItemCategory,
                  title: 'READ Box',
                  desc: 'Articles, blogs & videos',
                  activeColor: 'border-indigo-500 bg-indigo-50/60 text-indigo-900',
                },
                {
                  id: 'do' as ItemCategory,
                  title: 'DO Box',
                  desc: 'Actionable tasks & chores',
                  activeColor: 'border-emerald-500 bg-emerald-50/60 text-emerald-900',
                },
                {
                  id: 'reference' as ItemCategory,
                  title: 'REFERENCE Box',
                  desc: 'Docs, cheatsheets & tools',
                  activeColor: 'border-sky-500 bg-sky-50/60 text-sky-900',
                },
              ].map((c) => {
                const isSelected = category === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c.id)}
                    className={`p-3 text-left border rounded-xl transition-all ${
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

          {/* Content Type Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Content Type
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value as ContentType)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800"
            >
              <option value="article">Article (Reading / Blog)</option>
              <option value="video">Video (Tutorial / Lecture)</option>
              <option value="task">Task (Action item / Todo)</option>
              <option value="note">Note (Personal insight / Fleeting thought)</option>
              <option value="link">Link (Web resource)</option>
              <option value="document">Document (Spec / Cheatsheet)</option>
              <option value="idea">Idea (Future project spark)</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Description / Action Notes <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add key takeaways, context, or action items..."
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder:text-slate-400"
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
                placeholder="e.g. design, react, priority"
                className="flex-1 px-3.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 text-slate-800 placeholder:text-slate-400"
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

          {/* Demo simulation toggle */}
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
                  Simulate item saved 25 days ago (Test Forgotten Treasure immediately)
                </span>
              </label>
            </div>
          )}

          {/* Form Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
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
