import { useState, useEffect, useCallback } from 'react';
import { ClutterItem, ItemCategory, AppSettings, ToastMessage } from '../types';
import { INITIAL_SAMPLE_ITEMS } from '../utils/sampleData';
import { isItemForgotten } from '../utils/clutterScore';
import { fireRescueConfetti, fireCompleteConfetti } from '../utils/confetti';

const STORAGE_ITEMS_KEY = 'clutterbox_items_v2';
const STORAGE_SETTINGS_KEY = 'clutterbox_settings_v2';

const DEFAULT_SETTINGS: AppSettings = {
  forgottenThresholdDays: 14,
  enableConfetti: true,
  compactView: false,
};

export function useClutterStore() {
  // Load initial items
  const [items, setItems] = useState<ClutterItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ITEMS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse clutter items from localStorage', e);
    }
    return INITIAL_SAMPLE_ITEMS;
  });

  // Load initial settings
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (stored) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
      }
    } catch (e) {
      console.warn('Failed to parse settings from localStorage', e);
    }
    return DEFAULT_SETTINGS;
  });

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback(
    (title: string, description?: string, type: ToastMessage['type'] = 'success') => {
      const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
      setToasts((prev) => [...prev, { id, title, description, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3500);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Save items to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items to localStorage', e);
    }
  }, [items]);

  // Save settings to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  // Action: Add new item
  const addItem = useCallback(
    (data: Omit<ClutterItem, 'id' | 'createdAt' | 'lastReviewedAt' | 'isCompleted'> & { customDate?: string }) => {
      const now = new Date().toISOString();
      const newItem: ClutterItem = {
        id: 'item-' + Date.now(),
        title: data.title.trim(),
        type: data.type,
        category: data.category,
        url: data.url?.trim() || undefined,
        note: data.note?.trim() || undefined,
        tags: data.tags || [],
        createdAt: data.customDate || now,
        lastReviewedAt: data.customDate || now,
        isCompleted: false,
        isSample: false,
        estimatedMinutes: data.estimatedMinutes,
      };

      setItems((prev) => [newItem, ...prev]);
      addToast(
        'Item added to ' + data.category,
        `"${newItem.title.slice(0, 40)}${newItem.title.length > 40 ? '...' : ''}" saved successfully.`
      );
      return newItem;
    },
    [addToast]
  );

  // Action: Update item
  const updateItem = useCallback(
    (id: string, updates: Partial<ClutterItem>) => {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
      addToast('Item updated', 'Changes have been saved.');
    },
    [addToast]
  );

  // Action: Delete item
  const deleteItem = useCallback(
    (id: string) => {
      const target = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Item deleted', target ? `"${target.title.slice(0, 30)}" removed.` : undefined, 'info');
    },
    [items, addToast]
  );

  // Action: Toggle completion
  const toggleComplete = useCallback(
    (id: string) => {
      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            const nextCompleted = !item.isCompleted;
            if (nextCompleted && settings.enableConfetti) {
              fireCompleteConfetti();
            }
            return {
              ...item,
              isCompleted: nextCompleted,
              completedAt: nextCompleted ? new Date().toISOString() : undefined,
              lastReviewedAt: new Date().toISOString(),
            };
          }
          return item;
        })
      );

      const target = items.find((i) => i.id === id);
      if (target?.isCompleted) {
        addToast('Item reopened', 'Moved back to active clutter list.', 'info');
      } else {
        addToast('Marked as complete!', 'Great job clearing your digital queue.');
      }
    },
    [items, settings.enableConfetti, addToast]
  );

  // Action: Change category
  const changeCategory = useCallback(
    (id: string, newCategory: ItemCategory) => {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, category: newCategory, lastReviewedAt: new Date().toISOString() } : item
        )
      );
      addToast('Moved to ' + newCategory, 'Category updated.');
    },
    [addToast]
  );

  // Action: Visit item safely and touch lastReviewedAt
  const visitItem = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      const target = items.find((i) => i.id === id);
      if (!target) return;

      // Update last reviewed date
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, lastReviewedAt: now } : item))
      );

      // Open URL safely in new tab if present
      if (target.url) {
        const safeUrl = target.url.startsWith('http') ? target.url : `https://${target.url}`;
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
        addToast('Opened link', 'Refreshed last-reviewed timestamp.');
      } else {
        addToast('Marked as reviewed', 'Updated last-reviewed timestamp to today.');
      }
    },
    [items, addToast]
  );

  // Action: Touch / mark reviewed today (without opening URL)
  const markReviewedToday = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, lastReviewedAt: now } : item))
      );
      addToast('Marked as reviewed', 'Item is no longer considered forgotten.');
    },
    [addToast]
  );

  // Action: Rescue an Item handler
  const rescueForgottenItem = useCallback(
    (id: string, resolution: 'reviewed' | 'complete' | 'reference' | 'deleted') => {
      const now = new Date().toISOString();
      const target = items.find((i) => i.id === id);
      if (!target) return;

      if (resolution === 'deleted') {
        setItems((prev) => prev.filter((item) => item.id !== id));
        addToast('Item released', 'Declutter completed. One less item in your backlog.', 'info');
        return;
      }

      if (resolution === 'complete') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  isCompleted: true,
                  completedAt: now,
                  lastReviewedAt: now,
                }
              : item
          )
        );
        addToast('Treasure Rescued & Completed!', 'Digital space decluttered.');
        return;
      }

      if (resolution === 'reference') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  category: 'REFERENCE',
                  lastReviewedAt: now,
                }
              : item
          )
        );
        addToast('Moved to Reference', 'Item preserved safely for future reference.');
        return;
      }

      if (resolution === 'reviewed') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((item) => (item.id === id ? { ...item, lastReviewedAt: now } : item))
        );
        if (target.url) {
          const safeUrl = target.url.startsWith('http') ? target.url : `https://${target.url}`;
          window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }
        addToast('Treasure Rescued!', 'Reviewed and refreshed timestamp.');
      }
    },
    [items, settings.enableConfetti, addToast]
  );

  // Reset to sample data
  const resetToSample = useCallback(() => {
    setItems(INITIAL_SAMPLE_ITEMS);
    addToast('Reset completed', 'Loaded 8 realistic sample items with varied dates.', 'info');
  }, [addToast]);

  // Clear all data
  const clearAll = useCallback(() => {
    setItems([]);
    addToast('All items cleared', 'Your ClutterBox is completely empty.', 'info');
  }, [addToast]);

  // Export JSON
  const exportData = useCallback(() => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(items, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `clutterbox-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast('Backup exported', 'ClutterBox JSON backup downloaded.');
  }, [items, addToast]);

  // Import JSON
  const importData = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!Array.isArray(parsed)) {
          throw new Error('Imported data must be an array of items');
        }
        // Minimal schema check
        const valid = parsed.every(
          (item) => typeof item.title === 'string' && typeof item.category === 'string'
        );
        if (!valid) {
          throw new Error('Invalid item schema');
        }
        setItems(parsed);
        addToast('Data imported', `Loaded ${parsed.length} items successfully.`);
        return true;
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Invalid JSON file';
        addToast('Import failed', message, 'error');
        return false;
      }
    },
    [addToast]
  );

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
      addToast('Settings updated', 'Preferences saved.');
    },
    [addToast]
  );

  // Get forgotten items
  const forgottenItems = items.filter((item) =>
    isItemForgotten(item, settings.forgottenThresholdDays)
  );

  return {
    items,
    settings,
    toasts,
    forgottenItems,
    addToast,
    removeToast,
    addItem,
    updateItem,
    deleteItem,
    toggleComplete,
    changeCategory,
    visitItem,
    markReviewedToday,
    rescueForgottenItem,
    resetToSample,
    clearAll,
    exportData,
    importData,
    updateSettings,
  };
}
