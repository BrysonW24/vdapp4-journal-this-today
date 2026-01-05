'use client';

import { useState, useEffect } from 'react';
import { Layout } from '@/components/Layout';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Plus,
  Edit2,
  Trash2,
  Star,
  Calendar,
  Settings,
  Check,
  Download,
  Upload,
  FileJson,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileType,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { Journal, ThemePattern } from '@/types/journal';

export default function JournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJournal, setEditingJournal] = useState<Journal | null>(null);
  const [journalWithSettingsOpen, setJournalWithSettingsOpen] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#3B82F6',
    icon: '📔',
    theme: 'gradient' as ThemePattern,
  });

  const iconOptions = ['📔', '📕', '📗', '📘', '📙', '📓', '📒', '✏️', '🖊️', '✍️', '💼', '🎨', '🌍', '❤️', '🎯', '💭'];
  const colorOptions = [
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Green', value: '#10B981' },
    { name: 'Orange', value: '#F59E0B' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Teal', value: '#14B8A6' },
    { name: 'Indigo', value: '#6366F1' },
  ];

  const themeOptions: { name: string; value: ThemePattern; description: string }[] = [
    { name: 'Solid', value: 'solid', description: 'Clean single color' },
    { name: 'Gradient', value: 'gradient', description: 'Smooth color blend' },
    { name: 'Dots', value: 'dots', description: 'Subtle dot pattern' },
    { name: 'Grid', value: 'grid', description: 'Minimal grid lines' },
    { name: 'Waves', value: 'waves', description: 'Flowing wave pattern' },
    { name: 'Stripes', value: 'stripes', description: 'Diagonal stripes' },
    { name: 'Paper', value: 'paper', description: 'Classic paper texture' },
    { name: 'Texture', value: 'texture', description: 'Subtle grain effect' },
  ];

  useEffect(() => {
    loadJournals();
  }, []);

  const loadJournals = async () => {
    // Load journals from IndexedDB or API
    // For now, using mock data
    const mockJournals: Journal[] = [
      {
        id: '1',
        name: 'Personal',
        color: '#3B82F6',
        icon: '📔',
        isDefault: true,
        entryCount: 42,
        createdAt: new Date('2024-01-01'),
        lastUsedAt: new Date(),
        theme: 'gradient',
      },
      {
        id: '2',
        name: 'Work',
        color: '#8B5CF6',
        icon: '💼',
        isDefault: false,
        entryCount: 18,
        createdAt: new Date('2024-02-01'),
        lastUsedAt: new Date('2024-12-20'),
        theme: 'grid',
      },
      {
        id: '3',
        name: 'Travel',
        color: '#10B981',
        icon: '🌍',
        isDefault: false,
        entryCount: 7,
        createdAt: new Date('2024-03-01'),
        lastUsedAt: new Date('2024-11-15'),
        theme: 'dots',
      },
    ];
    setJournals(mockJournals);
  };

  const handleCreateJournal = () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a journal name');
      return;
    }

    const newJournal: Journal = {
      id: Date.now().toString(),
      name: formData.name,
      color: formData.color,
      icon: formData.icon,
      isDefault: journals.length === 0,
      entryCount: 0,
      createdAt: new Date(),
      theme: formData.theme,
    };

    setJournals([...journals, newJournal]);
    setShowCreateModal(false);
    setFormData({ name: '', color: '#3B82F6', icon: '📔', theme: 'gradient' });
    toast.success(`Journal "${formData.name}" created!`);
  };

  const handleUpdateJournal = () => {
    if (!editingJournal || !formData.name.trim()) {
      toast.error('Please enter a journal name');
      return;
    }

    setJournals(journals.map(j =>
      j.id === editingJournal.id
        ? { ...j, name: formData.name, color: formData.color, icon: formData.icon, theme: formData.theme }
        : j
    ));
    setEditingJournal(null);
    setFormData({ name: '', color: '#3B82F6', icon: '📔', theme: 'gradient' });
    toast.success('Journal updated!');
  };

  const handleDeleteJournal = (journal: Journal) => {
    if (journal.isDefault) {
      toast.error('Cannot delete the default journal');
      return;
    }

    if (!window.confirm(`Delete "${journal.name}"? This will not delete your entries.`)) {
      return;
    }

    setJournals(journals.filter(j => j.id !== journal.id));
    toast.success('Journal deleted');
  };

  const handleSetDefault = (journal: Journal) => {
    setJournals(journals.map(j => ({
      ...j,
      isDefault: j.id === journal.id,
    })));
    toast.success(`"${journal.name}" set as default journal`);
  };

  const startEdit = (journal: Journal) => {
    setEditingJournal(journal);
    setFormData({
      name: journal.name,
      color: journal.color,
      icon: journal.icon || '📔',
      theme: journal.theme || 'gradient',
    });
  };

  const cancelEdit = () => {
    setEditingJournal(null);
    setShowCreateModal(false);
    setFormData({ name: '', color: '#3B82F6', icon: '📔', theme: 'gradient' });
  };

  // Export/Import handlers for specific journal
  const handleExportJournalJSON = (journal: Journal) => {
    // In production, fetch entries for this specific journal
    const journalData = {
      journal,
      entries: [], // Would fetch entries filtered by journalId
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(journalData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${journal.name}" as JSON`);
  };

  const handleExportJournalText = (journal: Journal) => {
    // In production, fetch entries for this specific journal
    let textContent = `${journal.name}\n${'='.repeat(journal.name.length)}\n\n`;
    textContent += `Exported: ${new Date().toLocaleString()}\n`;
    textContent += `Total Entries: ${journal.entryCount}\n\n`;
    // Would add formatted entries here

    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${journal.name}" as text`);
  };

  const handleExportJournalMarkdown = (journal: Journal) => {
    // In production, fetch entries for this specific journal
    let mdContent = `# ${journal.name}\n\n`;
    mdContent += `**Exported:** ${new Date().toLocaleString()}\n\n`;
    mdContent += `**Total Entries:** ${journal.entryCount}\n\n`;
    mdContent += `---\n\n`;
    // Would add formatted entries here

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${journal.name}" as Markdown`);
  };

  const handleExportJournalCSV = (journal: Journal) => {
    // In production, fetch entries for this specific journal
    let csvContent = 'Date,Title,Content,Mood,Tags,Location\n';
    // Would add CSV rows here

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${journal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported "${journal.name}" as CSV`);
  };

  const handleExportJournalPDF = async (journal: Journal) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();

      // Add title
      doc.setFontSize(20);
      doc.text(journal.name, 20, 20);

      doc.setFontSize(10);
      doc.text(`Exported: ${new Date().toLocaleString()}`, 20, 30);
      doc.text(`Total Entries: ${journal.entryCount}`, 20, 36);

      // In production, would add entries here

      doc.save(`${journal.name.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success(`Exported "${journal.name}" as PDF`);
    } catch (error) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleImportJournalJSON = async (journal: Journal, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      // In production, merge imported entries with existing ones
      toast.success(`Imported data into "${journal.name}"`);
      setJournalWithSettingsOpen(null);
    } catch (error) {
      toast.error('Failed to import JSON file');
    }

    // Reset input
    e.target.value = '';
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                My Journals
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-400">
                Organize your thoughts into different journals
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
            >
              <Plus size={20} />
              New Journal
            </button>
          </div>

          {/* Journals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {journals.map((journal) => (
              <div
                key={journal.id}
                onClick={() => router.push(`/journal?journalId=${journal.id}`)}
                className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl transition-all hover:-translate-y-1 cursor-pointer relative"
                style={{ borderColor: journal.color + '40' }}
              >
                {/* Default Badge */}
                {journal.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full flex items-center gap-1">
                      <Star size={12} fill="currentColor" />
                      Default
                    </span>
                  </div>
                )}

                {/* Journal Icon & Name */}
                <div className="mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 text-3xl"
                    style={{ backgroundColor: journal.color + '20' }}
                  >
                    {journal.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{journal.name}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <BookOpen size={14} />
                      {journal.entryCount} entries
                    </span>
                    {journal.lastUsedAt && (
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {new Date(journal.lastUsedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                  {!journal.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(journal);
                      }}
                      className="flex-1 px-3 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Star size={14} />
                      Set Default
                    </button>
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setJournalWithSettingsOpen(journal.id);
                    }}
                    className="px-3 py-2 text-sm bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                    title="Export/Import"
                  >
                    <Settings size={14} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      startEdit(journal);
                    }}
                    className="px-3 py-2 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  {!journal.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteJournal(journal);
                      }}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Create/Edit Modal */}
          {(showCreateModal || editingJournal) && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={cancelEdit}
            >
              <div
                className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="px-8 pt-8 pb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {editingJournal ? 'Edit Journal' : 'Create New Journal'}
                  </h2>
                </div>

                {/* Scrollable Content */}
                <div className="px-8 overflow-y-auto flex-1">
                  <div className="space-y-6">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Journal Name
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Personal, Work, Travel"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                      autoFocus
                    />
                  </div>

                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose an Icon
                    </label>
                    <div className="grid grid-cols-8 gap-2">
                      {iconOptions.map((icon) => (
                        <button
                          key={icon}
                          onClick={() => setFormData({ ...formData, icon })}
                          className={`w-10 h-10 rounded-lg flex items-center justify-center text-2xl transition-all ${
                            formData.icon === icon
                              ? 'bg-blue-100 ring-2 ring-blue-500'
                              : 'bg-gray-100 hover:bg-gray-200'
                          }`}
                        >
                          {icon}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Choose a Color
                    </label>
                    <div className="grid grid-cols-4 gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.value}
                          onClick={() => setFormData({ ...formData, color: color.value })}
                          className="relative"
                        >
                          <div
                            className={`w-full h-12 rounded-lg transition-all ${
                              formData.color === color.value ? 'ring-2 ring-offset-2' : ''
                            }`}
                            style={{
                              backgroundColor: color.value,
                              ringColor: color.value,
                            }}
                          >
                            {formData.color === color.value && (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <Check size={20} className="text-white" />
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 mt-1 text-center">{color.name}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Background Theme
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {themeOptions.map((theme) => (
                        <button
                          key={theme.value}
                          onClick={() => setFormData({ ...formData, theme: theme.value })}
                          className={`p-3 rounded-lg text-left transition-all border-2 ${
                            formData.theme === theme.value
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-gray-900 text-sm">{theme.name}</p>
                            {formData.theme === theme.value && (
                              <Check size={16} className="text-blue-600" />
                            )}
                          </div>
                          <p className="text-xs text-gray-600">{theme.description}</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                </div>

                {/* Fixed Footer with Actions */}
                <div className="px-8 py-6 border-t border-gray-200">
                  <div className="flex gap-3">
                    <button
                      onClick={cancelEdit}
                      className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={editingJournal ? handleUpdateJournal : handleCreateJournal}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all"
                    >
                      {editingJournal ? 'Save Changes' : 'Create Journal'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Journal Export/Import Settings Modal */}
          {journalWithSettingsOpen && (() => {
            const journal = journals.find(j => j.id === journalWithSettingsOpen);
            if (!journal) return null;

            return (
              <div
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                onClick={() => setJournalWithSettingsOpen(null)}
              >
                <div
                  className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                      {journal.icon} {journal.name} - Export/Import
                    </h2>
                    <button
                      onClick={() => setJournalWithSettingsOpen(null)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Export Section */}
                  <div className="p-6 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Download size={18} />
                      Export Journal
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Download all entries from this journal
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleExportJournalJSON(journal)}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors flex-shrink-0">
                          <FileJson className="text-blue-600" size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-xs">JSON</p>
                          <p className="text-[10px] text-gray-600">Full backup</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExportJournalText(journal)}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors flex-shrink-0">
                          <FileText className="text-green-600" size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-xs">Text</p>
                          <p className="text-[10px] text-gray-600">Plain format</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExportJournalMarkdown(journal)}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors flex-shrink-0">
                          <FileCode className="text-purple-600" size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-xs">Markdown</p>
                          <p className="text-[10px] text-gray-600">Formatted</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExportJournalCSV(journal)}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
                      >
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center group-hover:bg-orange-200 transition-colors flex-shrink-0">
                          <FileSpreadsheet className="text-orange-600" size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-xs">CSV</p>
                          <p className="text-[10px] text-gray-600">Spreadsheet</p>
                        </div>
                      </button>

                      <button
                        onClick={() => handleExportJournalPDF(journal)}
                        className="flex items-center gap-2 p-3 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all group col-span-2"
                      >
                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center group-hover:bg-red-200 transition-colors flex-shrink-0">
                          <FileType className="text-red-600" size={18} />
                        </div>
                        <div className="text-left">
                          <p className="font-semibold text-gray-900 text-xs">PDF</p>
                          <p className="text-[10px] text-gray-600">Print ready</p>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Import Section */}
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                      <Upload size={18} />
                      Import into Journal
                    </h3>
                    <p className="text-sm text-gray-600 mb-4">
                      Import entries from a backup file
                    </p>

                    <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                        <FileJson className="text-purple-600" size={20} />
                      </div>
                      <div className="text-left flex-1">
                        <p className="font-semibold text-gray-900 text-sm">Import JSON</p>
                        <p className="text-xs text-gray-600">Restore from backup</p>
                      </div>
                      <input
                        type="file"
                        accept="application/json,.json"
                        onChange={(e) => handleImportJournalJSON(journal, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </Layout>
  );
}
