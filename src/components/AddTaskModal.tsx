import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { CreateTaskInput, TaskType, TaskBacklog, TaskPhase } from '@/types';
import { TASK_TYPE_OPTIONS, TASK_BACKLOG_OPTIONS, TASK_PHASE_OPTIONS } from '@/types';
import { PM_OPTIONS, UX_OPTIONS, GROUP_OPTIONS } from './dashboard/constants';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (task: CreateTaskInput) => Promise<void>;
}

export function AddTaskModal({ isOpen, onClose, onSubmit }: AddTaskModalProps) {
  const [formData, setFormData] = useState<CreateTaskInput>({
    name: '',
    description: '',
    pm: '',
    ux: '',
    group: '',
    developers: [],
    type: undefined,
    target_date: '',
    backlog: undefined,
    jira_link: '',
    phase: 'Planning',
  });
  const [developersInput, setDevelopersInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        developers: developersInput ? developersInput.split(',').map(d => d.trim()).filter(Boolean) : [],
      });
      // Reset form
      setFormData({
        name: '',
        description: '',
        pm: '',
        ux: '',
        group: '',
        developers: [],
        type: undefined,
        target_date: '',
        backlog: undefined,
        jira_link: '',
        phase: 'Planning',
      });
      setDevelopersInput('');
      onClose();
    } catch (err) {
      console.error('Failed to create task:', err);
      setError(err instanceof Error ? err.message : 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      name: '',
      description: '',
      pm: '',
      ux: '',
      group: '',
      developers: [],
      type: undefined,
      target_date: '',
      backlog: undefined,
      jira_link: '',
      phase: 'Planning',
    });
    setDevelopersInput('');
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Add New Task</h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Task Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Task Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter task name..."
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                autoFocus
                disabled={isSubmitting}
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter task description..."
                rows={3}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 resize-none"
                disabled={isSubmitting}
              />
            </div>

            {/* Type, Backlog, Phase row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Type
                </label>
                <select
                  value={formData.type || ''}
                  onChange={(e) => setFormData({ ...formData, type: (e.target.value || undefined) as TaskType | undefined })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select Type</option>
                  {TASK_TYPE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Backlog
                </label>
                <select
                  value={formData.backlog || ''}
                  onChange={(e) => setFormData({ ...formData, backlog: (e.target.value || undefined) as TaskBacklog | undefined })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select Backlog</option>
                  {TASK_BACKLOG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Phase
                </label>
                <select
                  value={formData.phase || 'Planning'}
                  onChange={(e) => setFormData({ ...formData, phase: e.target.value as TaskPhase })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  {TASK_PHASE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* PM, UX, Group row */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  PM
                </label>
                <select
                  value={formData.pm || ''}
                  onChange={(e) => setFormData({ ...formData, pm: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select PM</option>
                  {PM_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  UX
                </label>
                <select
                  value={formData.ux || ''}
                  onChange={(e) => setFormData({ ...formData, ux: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select UX</option>
                  {UX_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Group
                </label>
                <select
                  value={formData.group || ''}
                  onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                >
                  <option value="">Select Group</option>
                  {GROUP_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Developers and Target Date row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Developers
                </label>
                <input
                  type="text"
                  value={developersInput}
                  onChange={(e) => setDevelopersInput(e.target.value)}
                  placeholder="e.g., John, Jane, Bob"
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                />
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Separate names with commas</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Target Date
                </label>
                <input
                  type="date"
                  value={formData.target_date || ''}
                  onChange={(e) => setFormData({ ...formData, target_date: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Jira Link */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Jira Link
              </label>
              <input
                type="url"
                value={formData.jira_link || ''}
                onChange={(e) => setFormData({ ...formData, jira_link: e.target.value })}
                placeholder="https://jira.example.com/browse/TASK-123"
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg">
              {error}
            </div>
          )}

          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 font-medium transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.name.trim() || isSubmitting}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddTaskModal;
