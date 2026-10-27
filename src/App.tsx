/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ViewTab, ClutterItem } from './types';
import { useClutterStore } from './hooks/useClutterStore';
import { calculateClutterScore } from './utils/clutterScore';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ItemsListView } from './components/ItemsListView';
import { ForgottenTreasureView } from './components/ForgottenTreasureView';
import { SettingsView } from './components/SettingsView';
import { ItemModal } from './components/ItemModal';
import { RescueModal } from './components/RescueModal';
import { DeleteModal } from './components/DeleteModal';
import { ToastContainer } from './components/Toast';

export default function App() {
  const {
    items,
    settings,
    toasts,
    forgottenItems,
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
  } = useClutterStore();

  const [currentTab, setCurrentTab] = useState<ViewTab>('dashboard');
  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClutterItem | null>(null);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [rescueItemTarget, setRescueItemTarget] = useState<ClutterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClutterItem | null>(null);

  // Clutter Score
  const scoreData = calculateClutterScore(items, settings.forgottenThresholdDays);

  // Counts for sidebar badges
  const counts = {
    all: items.filter((i) => !i.isCompleted).length,
    read: items.filter((i) => i.category === 'READ' && !i.isCompleted).length,
    do: items.filter((i) => i.category === 'DO' && !i.isCompleted).length,
    reference: items.filter((i) => i.category === 'REFERENCE' && !i.isCompleted).length,
    forgotten: forgottenItems.length,
    completed: items.filter((i) => i.isCompleted).length,
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  };

  const handleEditItem = (item: ClutterItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  };

  const handleOpenRescueModal = (specificItem?: ClutterItem) => {
    setRescueItemTarget(specificItem || null);
    setIsRescueModalOpen(true);
  };

  const handleDeletePrompt = (id: string) => {
    const target = items.find((i) => i.id === id);
    if (target) {
      setDeleteTarget(target);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          // if user had a search query and navigates tabs, retain or allow searching in that tab
        }}
        counts={counts}
        clutterScore={scoreData}
        onOpenRescueModal={() => handleOpenRescueModal()}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        {/* Top Header */}
        <TopHeader
          currentTab={currentTab}
          searchQuery={globalSearch}
          onSearchChange={(q) => {
            setGlobalSearch(q);
            if (q.trim() && currentTab === 'dashboard') {
              setCurrentTab('all');
            }
          }}
          onOpenAddModal={handleOpenAddModal}
          onOpenRescueModal={() => handleOpenRescueModal()}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          forgottenCount={forgottenItems.length}
        />

        {/* View Router */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              items={items}
              clutterScore={scoreData}
              forgottenItems={forgottenItems}
              thresholdDays={settings.forgottenThresholdDays}
              onNavigateTab={(tab) => setCurrentTab(tab)}
              onOpenAddModal={handleOpenAddModal}
              onOpenRescueModal={handleOpenRescueModal}
              onToggleComplete={toggleComplete}
              onVisit={visitItem}
              onMarkReviewed={markReviewedToday}
              onChangeCategory={changeCategory}
              onEdit={handleEditItem}
              onDelete={handleDeletePrompt}
            />
          )}

          {currentTab === 'forgotten' && (
            <ForgottenTreasureView
              forgottenItems={forgottenItems}
              thresholdDays={settings.forgottenThresholdDays}
              onOpenRescueModal={handleOpenRescueModal}
              onToggleComplete={toggleComplete}
              onVisit={visitItem}
              onMarkReviewed={markReviewedToday}
              onChangeCategory={changeCategory}
              onEdit={handleEditItem}
              onDelete={handleDeletePrompt}
            />
          )}

          {(currentTab === 'all' ||
            currentTab === 'read' ||
            currentTab === 'do' ||
            currentTab === 'reference' ||
            currentTab === 'completed') && (
            <ItemsListView
              key={currentTab}
              currentTab={currentTab}
              items={items}
              thresholdDays={settings.forgottenThresholdDays}
              initialSearch={globalSearch}
              onOpenAddModal={handleOpenAddModal}
              onOpenRescueModal={handleOpenRescueModal}
              onToggleComplete={toggleComplete}
              onVisit={visitItem}
              onMarkReviewed={markReviewedToday}
              onChangeCategory={changeCategory}
              onEdit={handleEditItem}
              onDelete={handleDeletePrompt}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={updateSettings}
              onResetSample={resetToSample}
              onClearAll={clearAll}
              onExport={exportData}
              onImport={importData}
              totalItems={items.length}
            />
          )}
        </main>
      </div>

      {/* Add / Edit Modal */}
      <ItemModal
        isOpen={isAddModalOpen}
        editingItem={editingItem}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={(data) => {
          if (editingItem) {
            updateItem(editingItem.id, data);
          } else {
            addItem(data);
          }
        }}
      />

      {/* Signature Feature: Rescue an Item Modal */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => {
          setIsRescueModalOpen(false);
          setRescueItemTarget(null);
        }}
        forgottenItems={forgottenItems}
        thresholdDays={settings.forgottenThresholdDays}
        initialItem={rescueItemTarget}
        onRescueAction={rescueForgottenItem}
      />

      {/* Delete Confirmation Modal */}
      <DeleteModal
        isOpen={deleteTarget !== null}
        item={deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (deleteTarget) {
            deleteItem(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
      />

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
