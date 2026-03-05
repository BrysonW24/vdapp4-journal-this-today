'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { useJournalStore } from '@/stores/journal-store';
import { useOnboarding } from '@/hooks/useOnboarding';
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
  GraduationCap,
  HelpCircle,
  ChevronRight,
  Upload,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

export default function SettingsPage() {
  const router = useRouter();
  const { entries, loadEntries, exportToJSON, exportToPlainText, exportToMarkdown, importFromJSON } =
    useJournalStore();
  const { resetTour } = useOnboarding();
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
        doc.setFont('helvetica', 'bold');
        const dateStr = new Date(entry.createdAt).toLocaleDateString();
        doc.text(`${dateStr} - ${entry.title}`, margin, yPosition);
        yPosition += 8;

        // Mood if enabled
        if (pdfSettings.includeMood && entry.mood) {
          doc.setFontSize(pdfSettings.fontSize - 2);
          doc.setFont('helvetica', 'normal');
          doc.text(`Mood: ${entry.mood}`, margin, yPosition);
          yPosition += 6;
        }

        // Location if enabled
        if (pdfSettings.includeLocation && entry.location) {
          doc.setFontSize(pdfSettings.fontSize - 2);
          doc.setFont('helvetica', 'normal');
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
        doc.setFont('helvetica', 'normal');
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
      console.error('PDF export error:', _error);
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



  const [clearDialogOpen, setClearDialogOpen] = useState(false);

  const handleClearAll = async () => {
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

  // Reusable iOS-style row component
  const SettingsRow = ({
    icon,
    iconBg,
    label,
    value,
    onClick,
    chevron = true,
    className = '',
    labelClassName = '',
  }: {
    icon: React.ReactNode;
    iconBg: string;
    label: string;
    value?: string | React.ReactNode;
    onClick?: () => void;
    chevron?: boolean;
    className?: string;
    labelClassName?: string;
  }) => {
    const Wrapper = onClick ? 'button' : 'div';
    return (
      <Wrapper
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3.5 bg-white dark:bg-zen-night-card transition-all ${onClick ? 'hover:bg-zen-parchment dark:hover:bg-zen-night-surface cursor-pointer active:scale-[0.99]' : ''} ${className}`}
      >
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mr-3 flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        <span className={`flex-1 text-left text-zen-forest dark:text-zen-parchment text-[15px] ${labelClassName}`}>{label}</span>
        {value && (
          <span className="text-zen-stone dark:text-zen-stone text-[15px] mr-2">{value}</span>
        )}
        {chevron && (
          <ChevronRight size={18} className="text-zen-stone/60 flex-shrink-0" />
        )}
      </Wrapper>
    );
  };

  // Group container
  const SettingsGroup = ({ children }: { children: React.ReactNode }) => (
    <div className="rounded-2xl overflow-hidden border border-zen-sand dark:border-zen-night-border divide-y divide-zen-sand/60 dark:divide-zen-night-border/60">
      {children}
    </div>
  );

  // Section header
  const SectionHeader = ({ title }: { title: string }) => (
    <p className="text-xs font-semibold text-zen-moss dark:text-zen-stone uppercase tracking-wider px-4 pb-2 pt-6 first:pt-0">
      {title}
    </p>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-zen-forest dark:text-zen-sage-light">
              Settings
            </h1>
          </div>

          {/* STATISTICS */}
          <SectionHeader title="Statistics" />
          <SettingsGroup>
            <SettingsRow
              icon={<BookOpen className="text-zen-sage dark:text-zen-sage-light" size={18} />}
              iconBg="bg-zen-sage-soft dark:bg-zen-sage/20"
              label="Total Entries"
              value={String(entries.length)}
              chevron={false}
            />
            <SettingsRow
              icon={<Star className="text-zen-clay dark:text-zen-clay" size={18} />}
              iconBg="bg-zen-clay/20 dark:bg-zen-clay/10"
              label="Favorites"
              value={String(favoriteCount)}
              chevron={false}
            />
            <SettingsRow
              icon={<Database className="text-zen-creek-light dark:text-zen-creek" size={18} />}
              iconBg="bg-zen-creek/20 dark:bg-zen-creek/10"
              label="Database Size"
              value={formatBytes(dbSize)}
              chevron={false}
            />
          </SettingsGroup>

          {/* EXPORT */}
          <SectionHeader title="Export" />
          <SettingsGroup>
            <SettingsRow
              icon={<FileJson className="text-zen-sage dark:text-zen-sage-light" size={18} />}
              iconBg="bg-zen-sage-soft dark:bg-zen-sage/20"
              label="Export as JSON"
              onClick={handleExportJSON}
            />
            <SettingsRow
              icon={<FileText className="text-zen-sage dark:text-zen-sage-light" size={18} />}
              iconBg="bg-zen-sage-soft dark:bg-zen-sage/20"
              label="Export as Plain Text"
              onClick={handleExportPlainText}
            />
            <SettingsRow
              icon={<FileCode className="text-zen-creek-light dark:text-zen-creek" size={18} />}
              iconBg="bg-zen-creek/20 dark:bg-zen-creek/10"
              label="Export as Markdown"
              onClick={handleExportMarkdown}
            />
            <SettingsRow
              icon={<FileSpreadsheet className="text-zen-clay dark:text-zen-clay" size={18} />}
              iconBg="bg-zen-clay/20 dark:bg-zen-clay/10"
              label="Export as CSV"
              onClick={handleExportCSV}
            />
            <SettingsRow
              icon={<FileType className="text-zen-clay-light dark:text-zen-clay" size={18} />}
              iconBg="bg-zen-clay/20 dark:bg-zen-clay/10"
              label="Export as PDF"
              onClick={handleExportPDF}
            />
          </SettingsGroup>

          {/* PDF Settings Panel */}
          {showPDFSettings && (
            <div className="mt-3 bg-white dark:bg-zen-night-card border border-zen-sand dark:border-zen-night-border rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-serif font-semibold text-zen-forest dark:text-zen-parchment flex items-center gap-2">
                  <SettingsIcon size={18} />
                  PDF Export Settings
                </h3>
                <button
                  onClick={() => setShowPDFSettings(false)}
                  className="text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-1">
                    Page Size
                  </label>
                  <select
                    value={pdfSettings.pageSize}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, pageSize: e.target.value })}
                    className="w-full px-3 py-2 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-card dark:text-zen-parchment rounded-lg text-sm focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft"
                  >
                    <option value="a4">A4</option>
                    <option value="letter">Letter</option>
                    <option value="legal">Legal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-1">
                    Font Size
                  </label>
                  <select
                    value={pdfSettings.fontSize}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, fontSize: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-card dark:text-zen-parchment rounded-lg text-sm focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft"
                  >
                    <option value="10">10pt</option>
                    <option value="12">12pt</option>
                    <option value="14">14pt</option>
                    <option value="16">16pt</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pdfSettings.includeMood}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, includeMood: e.target.checked })}
                    className="w-4 h-4 text-zen-sage border-zen-sand rounded focus:ring-zen-sage"
                  />
                  <span className="text-sm text-zen-moss dark:text-zen-stone">Include mood indicators</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pdfSettings.includeTags}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, includeTags: e.target.checked })}
                    className="w-4 h-4 text-zen-sage border-zen-sand rounded focus:ring-zen-sage"
                  />
                  <span className="text-sm text-zen-moss dark:text-zen-stone">Include tags</span>
                </label>

                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={pdfSettings.includeLocation}
                    onChange={(e) => setPdfSettings({ ...pdfSettings, includeLocation: e.target.checked })}
                    className="w-4 h-4 text-zen-sage border-zen-sand rounded focus:ring-zen-sage"
                  />
                  <span className="text-sm text-zen-moss dark:text-zen-stone">Include locations</span>
                </label>
              </div>

              <button
                onClick={handleExportPDF}
                className="w-full px-5 py-3 bg-zen-clay-light text-white rounded-xl font-medium text-sm hover:bg-zen-clay hover:shadow-sm transition-all min-h-[44px] active:scale-[0.98]"
              >
                Generate PDF
              </button>
            </div>
          )}

          {/* IMPORT */}
          <SectionHeader title="Import" />
          <SettingsGroup>
            <label className="flex items-center w-full px-4 py-3 bg-white dark:bg-zen-night-card hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 bg-zen-sage-soft dark:bg-zen-sage/20">
                <Upload className="text-zen-sage dark:text-zen-sage-light" size={18} />
              </div>
              <span className="flex-1 text-left text-zen-forest dark:text-zen-parchment text-[15px]">Import from JSON</span>
              <ChevronRight size={18} className="text-zen-stone/60 flex-shrink-0" />
              <input
                type="file"
                accept="application/json,.json"
                onChange={handleImportJSON}
                className="hidden"
              />
            </label>
          </SettingsGroup>

          {/* GENERAL */}
          <SectionHeader title="General" />
          <SettingsGroup>
            <SettingsRow
              icon={<GraduationCap className="text-zen-sage dark:text-zen-sage-light" size={18} />}
              iconBg="bg-zen-sage-soft dark:bg-zen-sage/20"
              label="Replay Tutorial"
              onClick={async () => {
                await resetTour();
                router.push('/journal');
              }}
            />
            <Link href="/help" className="block">
              <SettingsRow
                icon={<HelpCircle className="text-zen-creek-light dark:text-zen-creek" size={18} />}
                iconBg="bg-zen-creek/20 dark:bg-zen-creek/10"
                label="Help & FAQ"
              />
            </Link>
          </SettingsGroup>

          {/* ABOUT */}
          <SectionHeader title="About" />
          <SettingsGroup>
            <SettingsRow
              icon={<Info className="text-zen-moss dark:text-zen-stone" size={18} />}
              iconBg="bg-zen-parchment dark:bg-zen-night-surface"
              label="App Version"
              value="1.0.0"
              chevron={false}
            />
          </SettingsGroup>

          {/* DANGER */}
          <SectionHeader title="Danger" />
          <SettingsGroup>
            <SettingsRow
              icon={<Trash2 className="text-red-500" size={18} />}
              iconBg="bg-red-50 dark:bg-red-900/20"
              label="Clear All Data"
              labelClassName="text-red-600 dark:text-red-400"
              onClick={() => setClearDialogOpen(true)}
            />
          </SettingsGroup>

          {/* Bottom spacer */}
          <div className="h-8" />
        </div>
      </div>

      <ConfirmDialog
        open={clearDialogOpen}
        onOpenChange={setClearDialogOpen}
        title="Delete All Data"
        description="Are you sure you want to permanently delete ALL journal entries? This action cannot be undone."
        confirmLabel="Delete Everything"
        onConfirm={handleClearAll}
        variant="destructive"
      />
    </Layout>
  );
}
