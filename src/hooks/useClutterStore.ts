import { useState, useEffect, useCallback, useMemo } from 'react';
import { ClutterItem, ItemCategory, ContentType, UserSettings, ToastMessage } from '../types';
import { INITIAL_SAMPLE_ITEMS } from '../utils/sampleData';
import { isItemForgotten, calculateDaysSince, calculateClutterScore } from '../utils/clutterScore';
import { fireRescueConfetti, fireCompleteConfetti } from '../utils/confetti';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const STORAGE_ITEMS_PREFIX = 'clutterbox_items_v3_';
const STORAGE_SETTINGS_PREFIX = 'clutterbox_settings_v3_';

const DEFAULT_SETTINGS: UserSettings = {
  forgottenThresholdDays: 14,
  enableConfetti: true,
  compactView: false,
};

export function useClutterStore() {
  const { user, isDemoMode } = useAuth();
  const storageUserId = user ? user.id : 'guest';

  // Load items for the current user
  const [items, setItems] = useState<ClutterItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ITEMS_PREFIX + storageUserId);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse items from localStorage', e);
    }
    return INITIAL_SAMPLE_ITEMS;
  });

  // Load settings
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SETTINGS_PREFIX + storageUserId);
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

  // When user switches, reload their data
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_ITEMS_PREFIX + storageUserId);
      if (stored) {
        const parsed = JSON.parse(stored);
        setItems(Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_ITEMS);
      } else {
        setItems(INITIAL_SAMPLE_ITEMS);
      }

      const storedSettings = localStorage.getItem(STORAGE_SETTINGS_PREFIX + storageUserId);
      if (storedSettings) {
        setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) });
      }
    } catch {
      setItems(INITIAL_SAMPLE_ITEMS);
    }
  }, [storageUserId]);

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_ITEMS_PREFIX + storageUserId, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save items to localStorage', e);
    }
  }, [items, storageUserId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_SETTINGS_PREFIX + storageUserId, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings to localStorage', e);
    }
  }, [settings, storageUserId]);

  // Check duplicate URL
  const checkDuplicateUrl = useCallback(
    (urlToCheck: string, excludeItemId?: string): boolean => {
      if (!urlToCheck.trim()) return false;
      const clean = urlToCheck.trim().toLowerCase().replace(/\/+$/, '');
      return items.some(
        (item) =>
          item.id !== excludeItemId &&
          !item.is_archived &&
          item.url &&
          item.url.trim().toLowerCase().replace(/\/+$/, '') === clean
      );
    },
    [items]
  );

  // Add Item
  const addItem = useCallback(
    (data: {
      title: string;
      category: ItemCategory;
      content_type: ContentType;
      url?: string;
      description?: string;
      tags: string[];
      customDate?: string;
    }) => {
      const now = new Date().toISOString();
      const createdAt = data.customDate || now;
      const newItem: ClutterItem = {
        id: 'item-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        user_id: user?.id,
        title: data.title.trim(),
        category: data.category,
        content_type: data.content_type,
        url: data.url?.trim() || undefined,
        description: data.description?.trim() || undefined,
        tags: data.tags || [],
        is_completed: false,
        is_archived: false,
        created_at: createdAt,
        last_reviewed_at: createdAt,
        updated_at: now,
        is_sample: false,
      };

      setItems((prev) => [newItem, ...prev]);
      addToast(
        `Added to ${data.category.toUpperCase()} Box`,
        `"${newItem.title.slice(0, 35)}${newItem.title.length > 35 ? '...' : ''}" saved.`
      );
      return newItem;
    },
    [user, addToast]
  );

  // Update Item
  const updateItem = useCallback(
    (id: string, updates: Partial<ClutterItem>) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates, updated_at: now } : item))
      );
      addToast('Item updated', 'Saved changes successfully.');
    },
    [addToast]
  );

  // Delete Item
  const deleteItem = useCallback(
    (id: string) => {
      const target = items.find((i) => i.id === id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      addToast('Item deleted', target ? `"${target.title.slice(0, 30)}" removed.` : undefined, 'info');
    },
    [items, addToast]
  );

  // Archive Item
  const archiveItem = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, is_archived: true, archived_at: now, updated_at: now }
            : item
        )
      );
      addToast('Item archived', 'Moved to archive. Excluded from active clutter.');
    },
    [addToast]
  );

  // Restore Item
  const restoreItem = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, is_archived: false, archived_at: undefined, updated_at: now }
            : item
        )
      );
      addToast('Item restored', 'Returned to active Smart Box.');
    },
    [addToast]
  );

  // Toggle Completion
  const toggleComplete = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      let willComplete = false;

      setItems((prev) =>
        prev.map((item) => {
          if (item.id === id) {
            willComplete = !item.is_completed;
            return {
              ...item,
              is_completed: willComplete,
              completed_at: willComplete ? now : undefined,
              last_reviewed_at: now,
              updated_at: now,
            };
          }
          return item;
        })
      );

      if (willComplete) {
        if (settings.enableConfetti) fireCompleteConfetti();
        addToast('Marked as complete!', 'Great job clearing your digital clutter.');
      } else {
        addToast('Item reopened', 'Returned to active backlog.', 'info');
      }
    },
    [settings.enableConfetti, addToast]
  );

  // Change Category
  const changeCategory = useCallback(
    (id: string, newCategory: ItemCategory) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, category: newCategory, last_reviewed_at: now, updated_at: now }
            : item
        )
      );
      addToast(`Moved to ${newCategory.toUpperCase()} Box`, 'Category updated.');
    },
    [addToast]
  );

  // Review / Touch Item (Refreshes timestamp)
  const markReviewed = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, last_reviewed_at: now, updated_at: now } : item
        )
      );
      addToast('Marked as reviewed', 'Updated review date to today.');
    },
    [addToast]
  );

  // Visit Item URL safely
  const visitItem = useCallback(
    (id: string) => {
      const now = new Date().toISOString();
      const target = items.find((i) => i.id === id);
      if (!target) return;

      setItems((prev) =>
        prev.map((item) =>
          item.id === id ? { ...item, last_reviewed_at: now, updated_at: now } : item
        )
      );

      if (target.url) {
        const safeUrl = target.url.startsWith('http') ? target.url : `https://${target.url}`;
        window.open(safeUrl, '_blank', 'noopener,noreferrer');
        addToast('Opened link', 'Refreshed last-reviewed timestamp.');
      } else {
        addToast('Reviewed today', 'Refreshed timestamp.');
      }
    },
    [items, addToast]
  );

  // Rescue Forgotten Item
  const rescueItem = useCallback(
    (id: string, action: 'revisit' | 'complete' | 'reference' | 'archive' | 'delete') => {
      const now = new Date().toISOString();
      const target = items.find((i) => i.id === id);
      if (!target) return;

      if (action === 'delete') {
        setItems((prev) => prev.filter((i) => i.id !== id));
        addToast('Treasure purged', 'Declutter completed. One less item in your backlog.', 'info');
        return;
      }

      if (action === 'archive') {
        setItems((prev) =>
          prev.map((i) => (i.id === id ? { ...i, is_archived: true, archived_at: now, updated_at: now } : i))
        );
        addToast('Treasure archived', 'Stored safely in your archive.');
        return;
      }

      if (action === 'complete') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, is_completed: true, completed_at: now, last_reviewed_at: now, updated_at: now }
              : i
          )
        );
        addToast('Treasure Rescued & Completed!', 'Digital space lightened.');
        return;
      }

      if (action === 'reference') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, category: 'reference', last_reviewed_at: now, updated_at: now }
              : i
          )
        );
        addToast('Saved as Reference', 'Moved to REFERENCE Box.');
        return;
      }

      if (action === 'revisit') {
        if (settings.enableConfetti) fireRescueConfetti();
        setItems((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, last_reviewed_at: now, updated_at: now } : i
          )
        );
        if (target.url) {
          const safeUrl = target.url.startsWith('http') ? target.url : `https://${target.url}`;
          window.open(safeUrl, '_blank', 'noopener,noreferrer');
        }
        addToast('Treasure Rescued!', 'Reviewed and reset forgotten clock.');
      }
    },
    [items, settings.enableConfetti, addToast]
  );

  // Reset demo items
  const resetToSample = useCallback(() => {
    setItems(INITIAL_SAMPLE_ITEMS);
    addToast('Demo items restored', 'Loaded 8 realistic sample items with varied dates.', 'info');
  }, [addToast]);

  // Clear all
  const clearAll = useCallback(() => {
    setItems([]);
    addToast('All items cleared', 'Your ClutterBox is completely empty.', 'info');
  }, [addToast]);

  // Export JSON
  const exportData = useCallback(() => {
    const backup = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      userEmail: user?.email,
      settings,
      items,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `clutterbox-export-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    addToast('Backup exported', 'ClutterBox JSON file downloaded.');
  }, [items, settings, user, addToast]);

  // Import JSON
  const importData = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        let itemsToLoad: ClutterItem[] = [];

        if (Array.isArray(parsed)) {
          itemsToLoad = parsed;
        } else if (parsed && Array.isArray(parsed.items)) {
          itemsToLoad = parsed.items;
        } else {
          throw new Error('JSON does not contain a valid items list');
        }

        const valid = itemsToLoad.every(
          (i) => typeof i.title === 'string' && typeof i.category === 'string'
        );
        if (!valid) throw new Error('Schema validation failed for one or more items');

        setItems(itemsToLoad);
        addToast('Data imported', `Loaded ${itemsToLoad.length} items successfully.`);
        return true;
      } catch (err: any) {
        addToast('Import failed', err?.message || 'Invalid JSON file', 'error');
        return false;
      }
    },
    [addToast]
  );

  const updateSettings = useCallback(
    (updates: Partial<UserSettings>) => {
      setSettings((prev) => ({ ...prev, ...updates }));
      addToast('Settings updated', 'Preferences saved.');
    },
    [addToast]
  );

  // Computed collections
  const activeItems = useMemo(
    () => items.filter((i) => !i.is_archived && !i.is_completed),
    [items]
  );

  const forgottenItems = useMemo(
    () => activeItems.filter((i) => isItemForgotten(i, settings.forgottenThresholdDays)),
    [activeItems, settings.forgottenThresholdDays]
  );

  const clutterScoreData = useMemo(
    () => calculateClutterScore(items, settings.forgottenThresholdDays),
    [items, settings.forgottenThresholdDays]
  );

  return {
    items,
    settings,
    toasts,
    activeItems,
    forgottenItems,
    clutterScoreData,
    addToast,
    removeToast,
    addItem,
    updateItem,
    deleteItem,
    archiveItem,
    restoreItem,
    toggleComplete,
    changeCategory,
    markReviewed,
    visitItem,
    rescueItem,
    checkDuplicateUrl,
    resetToSample,
    clearAll,
    exportData,
    importData,
    updateSettings,
  };
}
