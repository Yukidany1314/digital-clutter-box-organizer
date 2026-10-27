/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useClutterStore } from './hooks/useClutterStore';
import { ClutterItem, ItemCategory } from './types';
import { Sidebar } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { DashboardView } from './components/DashboardView';
import { ItemsListView } from './components/ItemsListView';
import { ForgottenTreasureView } from './components/ForgottenTreasureView';
import { AIAssistantView } from './components/AIAssistantView';
import { SettingsView } from './components/SettingsView';
import { ItemModal } from './components/ItemModal';
import { RescueModal } from './components/RescueModal';
import { DeleteModal } from './components/DeleteModal';
import { ToastContainer } from './components/Toast';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { Loader2 } from 'lucide-react';

/**
 * Route protection wrapper
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8F9FC] flex items-center justify-center text-slate-500">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

/**
 * Main authenticated app container layout
 */
function AuthenticatedApp() {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    items,
    settings,
    toasts,
    forgottenItems,
    clutterScoreData,
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
  } = useClutterStore();

  const [globalSearch, setGlobalSearch] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ClutterItem | null>(null);
  const [isRescueModalOpen, setIsRescueModalOpen] = useState(false);
  const [rescueItemTarget, setRescueItemTarget] = useState<ClutterItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClutterItem | null>(null);

  // Counts for sidebar
  const unarchived = items.filter((i) => !i.is_archived);
  const counts = {
    all: unarchived.filter((i) => !i.is_completed).length,
    read: unarchived.filter((i) => i.category === 'read' && !i.is_completed).length,
    do: unarchived.filter((i) => i.category === 'do' && !i.is_completed).length,
    reference: unarchived.filter((i) => i.category === 'reference' && !i.is_completed).length,
    forgotten: forgottenItems.length,
    completed: unarchived.filter((i) => i.is_completed).length,
    archived: items.filter((i) => i.is_archived).length,
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
    if (target) setDeleteTarget(target);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] text-slate-900 flex font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        counts={counts}
        clutterScore={clutterScoreData}
        onOpenRescueModal={() => handleOpenRescueModal()}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <TopHeader
          searchQuery={globalSearch}
          onSearchChange={setGlobalSearch}
          onOpenAddModal={handleOpenAddModal}
          onOpenRescueModal={() => handleOpenRescueModal()}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          forgottenCount={forgottenItems.length}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route
              path=""
              element={
                <DashboardView
                  items={items}
                  clutterScore={clutterScoreData}
                  forgottenItems={forgottenItems}
                  thresholdDays={settings.forgottenThresholdDays}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="items"
              element={
                <ItemsListView
                  viewMode="all"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="read"
              element={
                <ItemsListView
                  viewMode="read"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="do"
              element={
                <ItemsListView
                  viewMode="do"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="reference"
              element={
                <ItemsListView
                  viewMode="reference"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="forgotten"
              element={
                <ForgottenTreasureView
                  forgottenItems={forgottenItems}
                  thresholdDays={settings.forgottenThresholdDays}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="completed"
              element={
                <ItemsListView
                  viewMode="completed"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="archived"
              element={
                <ItemsListView
                  viewMode="archived"
                  items={items}
                  thresholdDays={settings.forgottenThresholdDays}
                  initialSearch={globalSearch}
                  onOpenAddModal={handleOpenAddModal}
                  onOpenRescueModal={handleOpenRescueModal}
                  onToggleComplete={toggleComplete}
                  onVisit={visitItem}
                  onMarkReviewed={markReviewed}
                  onChangeCategory={changeCategory}
                  onArchive={archiveItem}
                  onRestore={restoreItem}
                  onEdit={handleEditItem}
                  onDelete={handleDeletePrompt}
                />
              }
            />

            <Route
              path="assistant"
              element={
                <AIAssistantView
                  items={items}
                  clutterScore={clutterScoreData}
                  thresholdDays={settings.forgottenThresholdDays}
                  onOpenRescueModal={handleOpenRescueModal}
                  onNavigateTab={(tab) => navigate(`/app/${tab}`)}
                />
              }
            />

            <Route
              path="settings"
              element={
                <SettingsView
                  settings={settings}
                  onUpdateSettings={updateSettings}
                  onResetSample={resetToSample}
                  onClearAll={clearAll}
                  onExport={exportData}
                  onImport={importData}
                  totalItems={items.length}
                />
              }
            />

            <Route path="*" element={<Navigate to="/app" replace />} />
          </Routes>
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
        onCheckDuplicateUrl={checkDuplicateUrl}
        onSubmit={(data) => {
          if (editingItem) {
            updateItem(editingItem.id, data);
          } else {
            addItem(data);
          }
        }}
      />

      {/* Signature Feature: Rescue Modal */}
      <RescueModal
        isOpen={isRescueModalOpen}
        onClose={() => {
          setIsRescueModalOpen(false);
          setRescueItemTarget(null);
        }}
        forgottenItems={forgottenItems}
        thresholdDays={settings.forgottenThresholdDays}
        initialItem={rescueItemTarget}
        onRescueAction={rescueItem}
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

      {/* Toasts */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route
            path="/app/*"
            element={
              <ProtectedRoute>
                <AuthenticatedApp />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
