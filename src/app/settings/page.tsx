'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { db } from '@/lib/db';
import {
  Trash2,
  Database,
  Star,
  BookOpen,
  FileJson,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileType,
  Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { entries, loadEntries, exportToJSON, exportToPlainText, exportToMarkdown, importFromJSON } =
    useJournalStore();
  const [dbSize, setDbSize] = useState(0);
  const [showPDFSettings, setShowPDFSettings] = useState(false);
  const [pdfSettings, setPdfSettings] = useState({
    includeImages: true,
    includeMood: true,
    includeTags: true,
    includeLocation: true,
    pageSize: 'a4',
    fontSize: 12,
    margins: 20,
  });

  useEffect(() => {
    loadEntries();
    loadDatabaseSize();
  }, [loadEntries]);

  const loadDatabaseSize = async () => {
    const size = await db.getDatabaseSize();
    setDbSize(size);
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleExportJSON = async () => {
    try {
      const jsonData = await exportToJSON();
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal exported to JSON successfully!');
    } catch (_error) {
      toast.error('Failed to export journal');
    }
  };

  const handleExportPlainText = () => {
    try {
      const textData = exportToPlainText();
      const blob = new Blob([textData], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split('T')[0]}.txt`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal exported to plain text successfully!');
    } catch (_error) {
      toast.error('Failed to export journal');
    }
  };

  const handleExportMarkdown = () => {
    try {
      const markdownData = exportToMarkdown();
      const blob = new Blob([markdownData], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split('T')[0]}.md`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal exported to Markdown successfully!');
    } catch (_error) {
      toast.error('Failed to export journal');
    }
  };

  const handleExportCSV = () => {
    try {
      const headers = ['Date', 'Title', 'Content', 'Mood', 'Category', 'Tags', 'Favorite'];
      const rows = entries.map(entry => [
        new Date(entry.createdAt).toLocaleString(),
        `"${entry.title.replace(/"/g, '""')}"`,
        `"${entry.content.replace(/<[^>]*>/g, '').replace(/"/g, '""')}"`,
        entry.mood || '',
        entry.category || '',
        entry.tags.join('; '),
        entry.isFavorite ? 'Yes' : 'No',
      ]);
      const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `journal-export-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Journal exported to CSV successfully!');
    } catch (_error) {
      toast.error('Failed to export journal');
    }
  };

  const handleExportPDF = async () => {
    if (!showPDFSettings) {
      setShowPDFSettings(true);
      return;
    }

    try {
      // Dynamic import to reduce bundle size
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({
        format: pdfSettings.pageSize as any,
      });

      const margin = pdfSettings.margins;
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = margin;

      doc.setFontSize(pdfSettings.fontSize + 6);
      doc.text('My Journal', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(pdfSettings.fontSize - 2);
      doc.text(`Exported on ${new Date().toLocaleDateString()}`, margin, yPosition);
      yPosition += 20;

      entries.forEach((entry, index) => {
        // Check if we need a new page
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }

        // Entry date and title
        doc.setFontSize(pdfSettings.fontSize + 2);
        doc.setFont(undefined, 'bold');
        const dateStr = new Date(entry.createdAt).toLocaleDateString();
        doc.text(`${dateStr} - ${entry.title}`, margin, yPosition);
        yPosition += 8;

        // Mood if enabled
        if (pdfSettings.includeMood && entry.mood) {
          doc.setFontSize(pdfSettings.fontSize - 2);
          doc.setFont(undefined, 'normal');
          doc.text(`Mood: ${entry.mood}`, margin, yPosition);
          yPosition += 6;
        }

        // Location if enabled
        if (pdfSettings.includeLocation && entry.location) {
          doc.setFontSize(pdfSettings.fontSize - 2);
          doc.setFont(undefined, 'normal');
          doc.text(`Location: ${entry.location.placeName || entry.location.address || 'Unknown'}`, margin, yPosition);
          yPosition += 6;
        }

        // Tags if enabled
        if (pdfSettings.includeTags && entry.tags.length > 0) {
          doc.setFontSize(pdfSettings.fontSize - 2);
          doc.text(`Tags: ${entry.tags.join(', ')}`, margin, yPosition);
          yPosition += 6;
        }

        // Content
        doc.setFontSize(pdfSettings.fontSize);
        doc.setFont(undefined, 'normal');
        const content = entry.content.replace(/<[^>]*>/g, '').trim();
        const lines = doc.splitTextToSize(content, maxWidth);

        lines.forEach((line: string) => {
          if (yPosition > pageHeight - margin) {
            doc.addPage();
            yPosition = margin;
          }
          doc.text(line, margin, yPosition);
          yPosition += pdfSettings.fontSize * 0.5;
        });

        yPosition += 15;

        // Separator line
        if (index < entries.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 10;
        }
      });

      doc.save(`journal-export-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Journal exported to PDF successfully!');
      setShowPDFSettings(false);
    } catch (_error) {
      console.error('PDF export error:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleImportJSON = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      await importFromJSON(text);
      await loadDatabaseSize();
      toast.success('Journal imported from JSON successfully!');
    } catch (_error) {
      toast.error('Failed to import journal. Please check the file format.');
    }
  };

  const handleImportText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      // Parse plain text - each entry separated by double newlines
      const entries = text.split('\n\n\n').filter(e => e.trim());

      toast.success(`Found ${entries.length} entries. Import functionality for text files coming soon!`);
    } catch (_error) {
      toast.error('Failed to import text file.');
    }
  };

  const handleImportMarkdown = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      // Parse markdown - entries start with # Date
      const entries = text.split(/^# /m).filter(e => e.trim());

      toast.success(`Found ${entries.length} entries. Import functionality for markdown files coming soon!`);
    } catch (_error) {
      toast.error('Failed to import markdown file.');
    }
  };

  const handleImportCSV = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());

      toast.success(`Found ${lines.length - 1} entries. Import functionality for CSV files coming soon!`);
    } catch (_error) {
      toast.error('Failed to import CSV file.');
    }
  };

  const handleClearAll = async () => {
    if (
      !window.confirm(
        'Are you sure you want to delete ALL journal entries? This action cannot be undone!'
      )
    ) {
      return;
    }

    if (
      !window.confirm(
        'This is your final warning. ALL your journal entries will be permanently deleted. Continue?'
      )
    ) {
      return;
    }

    try {
      await db.clearDatabase();
      await loadEntries();
      await loadDatabaseSize();
      toast.success('All journal data has been cleared');
    } catch (_error) {
      toast.error('Failed to clear database');
    }
  };

  const favoriteCount = entries.filter((e) => e.isFavorite).length;

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
              Settings
            </h1>
            <p className="text-xl text-gray-600">
              Manage your journal data and preferences
            </p>
          </div>

          {/* Statistics */}
          <div className="mb-12 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Statistics</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <BookOpen className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold text-gray-900">{entries.length}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Star className="text-yellow-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Favorites</p>
                  <p className="text-2xl font-bold text-gray-900">{favoriteCount}</p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <Database className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Database Size</p>
                  <p className="text-2xl font-bold text-gray-900">{formatBytes(dbSize)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Export Data */}
          <div className="mb-12 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Export Data</h2>
            <p className="text-gray-600 mb-6">
              Download your journal entries in various formats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all group"
              >
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileJson className="text-blue-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">JSON</p>
                  <p className="text-sm text-gray-600">Full backup</p>
                </div>
              </button>

              <button
                onClick={handleExportPlainText}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all group"
              >
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Plain Text</p>
                  <p className="text-sm text-gray-600">Simple format</p>
                </div>
              </button>

              <button
                onClick={handleExportMarkdown}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group"
              >
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileCode className="text-purple-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">Markdown</p>
                  <p className="text-sm text-gray-600">Formatted</p>
                </div>
              </button>

              <button
                onClick={handleExportCSV}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group"
              >
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <FileSpreadsheet className="text-orange-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">CSV</p>
                  <p className="text-sm text-gray-600">Spreadsheet</p>
                </div>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-red-400 hover:bg-red-50 transition-all group"
              >
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center group-hover:bg-red-200 transition-colors">
                  <FileType className="text-red-600" size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-gray-900">PDF</p>
                  <p className="text-sm text-gray-600">Print ready</p>
                </div>
              </button>
            </div>

            {/* PDF Settings Panel */}
            {showPDFSettings && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <SettingsIcon size={20} />
                    PDF Export Settings
                  </h3>
                  <button
                    onClick={() => setShowPDFSettings(false)}
                    className="text-gray-600 hover:text-gray-900"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Page Size
                    </label>
                    <select
                      value={pdfSettings.pageSize}
                      onChange={(e) => setPdfSettings({ ...pdfSettings, pageSize: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    >
                      <option value="a4">A4</option>
                      <option value="letter">Letter</option>
                      <option value="legal">Legal</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Font Size
                    </label>
                    <select
                      value={pdfSettings.fontSize}
                      onChange={(e) => setPdfSettings({ ...pdfSettings, fontSize: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-red-500 focus:ring-2 focus:ring-red-200"
                    >
                      <option value="10">10pt</option>
                      <option value="12">12pt</option>
                      <option value="14">14pt</option>
                      <option value="16">16pt</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includeMood}
                      onChange={(e) => setPdfSettings({ ...pdfSettings, includeMood: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Include mood indicators</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includeTags}
                      onChange={(e) => setPdfSettings({ ...pdfSettings, includeTags: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Include tags</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={pdfSettings.includeLocation}
                      onChange={(e) => setPdfSettings({ ...pdfSettings, includeLocation: e.target.checked })}
                      className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">Include locations</span>
                  </label>
                </div>

                <button
                  onClick={handleExportPDF}
                  className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  Generate PDF
                </button>
              </div>
            )}
          </div>

          {/* Import Data */}
          <div className="mb-12 bg-white rounded-xl border-2 border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Data</h2>
            <p className="text-gray-600 mb-6">
              Import journal entries from backup files in various formats
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                  <FileJson className="text-blue-600" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Import JSON</p>
                  <p className="text-xs text-gray-600">Full restore</p>
                </div>
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={handleImportJSON}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-green-400 hover:bg-green-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors">
                  <FileText className="text-green-600" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Import Text</p>
                  <p className="text-xs text-gray-600">Coming soon</p>
                </div>
                <input
                  type="file"
                  accept=".txt,text/plain"
                  onChange={handleImportText}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                  <FileCode className="text-purple-600" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Import MD</p>
                  <p className="text-xs text-gray-600">Coming soon</p>
                </div>
                <input
                  type="file"
                  accept=".md,.markdown,text/markdown"
                  onChange={handleImportMarkdown}
                  className="hidden"
                />
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all cursor-pointer group">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                  <FileSpreadsheet className="text-orange-600" size={24} />
                </div>
                <div className="text-left flex-1">
                  <p className="font-semibold text-gray-900 text-sm">Import CSV</p>
                  <p className="text-xs text-gray-600">Coming soon</p>
                </div>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleImportCSV}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-red-50 rounded-xl border-2 border-red-200 p-8">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Danger Zone</h2>
            <p className="text-red-700 mb-6">
              Permanently delete all your journal data. This action cannot be undone!
            </p>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-3 px-6 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-all"
            >
              <Trash2 size={20} />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
