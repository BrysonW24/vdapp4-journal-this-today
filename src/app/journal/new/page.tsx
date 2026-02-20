'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { EntryHeader } from '@/components/journal/EntryHeader';
import { MetadataBottomSheet } from '@/components/journal/MetadataBottomSheet';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useJournalStore } from '@/stores/journal-store';
import { useJournalsStore } from '@/stores/journals-store';
import { MoodLevel, ContentType } from '@/types/journal';
import { FileText, Lightbulb, Mic, MapPin, MoreHorizontal, Camera } from 'lucide-react';
import { toast } from 'sonner';
import type { Journal } from '@/lib/db';

export default function NewEntryPage() {
  const router = useRouter();
  const addEntry = useJournalStore((state) => state.addEntry);
  const { journals, loadJournals, selectedJournalId } = useJournalsStore();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showMetadata, setShowMetadata] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState('');

  useEffect(() => {
    loadJournals();
  }, [loadJournals]);

  const selectedJournal: Journal | undefined = journals.find(j => j.id === selectedJournalId) || journals.find(j => j.isDefault) || journals[0];

  const templates = [
    { id: 1, name: 'Daily Reflection', content: '<p>What went well today?</p><p><br></p><p>What could have gone better?</p><p><br></p><p>What am I grateful for?</p>' },
    { id: 2, name: 'Goal Setting', content: '<p>My main goal:</p><p><br></p><p>Steps to achieve it:</p><p><br></p><p>Potential obstacles:</p><p><br></p><p>How to overcome them:</p>' },
    { id: 3, name: 'Gratitude Journal', content: '<p>Three things I\'m grateful for today:</p><ol><li></li><li></li><li></li></ol><p>Why these matter to me:</p>' },
    { id: 4, name: 'Dream Journal', content: '<p><strong>Date:</strong></p><p><br></p><p><strong>Dream description:</strong></p><p><br></p><p><strong>Emotions felt:</strong></p><p><br></p><p><strong>Possible meaning:</strong></p>' },
  ];

  const suggestions = [
    'What made you smile today?',
    'What are you looking forward to tomorrow?',
    'Describe a challenge you overcame recently',
    'What lesson did you learn today?',
    'Who inspired you this week?',
  ];

  const handleUseTemplate = (template: typeof templates[0]) => {
    setContent(template.content);
    setTitle(template.name);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
  };

  const stopRecording = () => {
    if (recognition) {
      recognition.stop();
      setRecognition(null);
    }
    setIsRecording(false);
  };

  const handleAudioRecord = async () => {
    if (isRecording) {
      stopRecording();
      return;
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported. Try Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const newRecognition = new SpeechRecognition();

      newRecognition.continuous = true;
      newRecognition.interimResults = true;
      newRecognition.lang = 'en-US';

      let finalTranscript = '';

      newRecognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptText = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptText + ' ';
          } else {
            interimTranscript += transcriptText;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
      };

      newRecognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
        setRecognition(null);
        toast.error('Speech recognition error: ' + event.error);
        stream.getTracks().forEach(track => track.stop());
      };

      newRecognition.onend = () => {
        if (finalTranscript.trim()) {
          setContent(prevContent => {
            const newText = finalTranscript.trim();
            if (prevContent && prevContent !== '<p><br></p>') {
              return prevContent + '<p>' + newText + '</p>';
            } else {
              return '<p>' + newText + '</p>';
            }
          });
          toast.success('Voice input added');
        }
        setIsRecording(false);
        setRecognition(null);
        setTranscript('');
        stream.getTracks().forEach(track => track.stop());
      };

      newRecognition.start();
      setRecognition(newRecognition);
      setIsRecording(true);
      toast.success('Recording started');
    } catch {
      toast.error('Microphone access denied');
      setIsRecording(false);
    }
  };

  const handleSave = async () => {
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!title.trim() && !strippedContent) {
      toast.error('Please write something before saving');
      return;
    }

    setIsSaving(true);
    try {
      let locationData = undefined;
      if (location.trim()) {
        const coordMatch = location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
        if (coordMatch) {
          locationData = {
            latitude: parseFloat(coordMatch[1]),
            longitude: parseFloat(coordMatch[2]),
            placeName: location.split('(')[0].trim() || undefined,
            address: location,
          };
        } else {
          locationData = {
            latitude: 0,
            longitude: 0,
            placeName: location.trim(),
            address: location.trim(),
          };
        }
      }

      await addEntry({
        journalId: selectedJournal?.id || 'default',
        title: title.trim() || 'Untitled Entry',
        content: content || '<p></p>',
        contentType: ContentType.HTML,
        mood,
        category: category || undefined,
        tags,
        isFavorite: false,
        isEncrypted: false,
        location: locationData,
      });

      toast.success('Entry saved!');
      router.push('/journal');
      router.refresh();
    } catch {
      toast.error('Failed to save entry');
      setIsSaving(false);
    }
  };

  const characterCount = content.replace(/<[^>]*>/g, '').length;

  return (
    <Layout hideChrome>
      <div className="min-h-screen bg-white dark:bg-zen-night-card flex flex-col">
        {/* Compact Header — Day One style */}
        <EntryHeader
          onCancel={() => router.push('/journal')}
          onSave={handleSave}
          isSaving={isSaving}
        />

        {/* Journal + Location Row */}
        <div className="flex items-center gap-1.5 px-5 py-2 text-[13px] border-b border-zen-sand/30 dark:border-zen-night-border/30">
          <span className="text-zen-sage dark:text-zen-sage-light font-medium">
            {selectedJournal?.name || 'Journal'}
          </span>
          <span className="text-zen-stone/40">·</span>
          {location ? (
            <button
              onClick={() => setShowMetadata(true)}
              className="flex items-center gap-1 text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage transition-colors"
            >
              <MapPin size={12} />
              <span className="truncate max-w-[200px]">{location.split('(')[0].trim()}</span>
            </button>
          ) : (
            <button
              onClick={() => setShowMetadata(true)}
              className="text-zen-sage/60 hover:text-zen-sage transition-colors"
            >
              Add location?
            </button>
          )}
        </div>

        {/* Title Input — inline, borderless */}
        <div className="px-5 pt-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-semibold bg-transparent text-zen-forest dark:text-zen-parchment placeholder-zen-stone/40 focus:outline-none"
          />
        </div>

        {/* Editor — fills remaining space */}
        <div className="flex-1 px-1">
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder="What's on your mind today?"
          />
        </div>

        {/* Voice Recording Overlay */}
        {isRecording && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-zen-sage dark:bg-zen-forest p-5 pb-[calc(20px+env(safe-area-inset-bottom))] text-white animate-slide-up-sheet rounded-t-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  <div className="absolute inset-0 w-3 h-3 bg-red-500 rounded-full animate-ping" />
                </div>
                <span className="font-semibold">Recording...</span>
              </div>
              <button
                onClick={stopRecording}
                className="px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-all"
              >
                Stop
              </button>
            </div>
            <div className="bg-white/10 rounded-xl p-3 backdrop-blur-sm">
              <p className="text-white/90 text-sm leading-relaxed">
                {transcript || 'Speak to see your words appear here...'}
              </p>
            </div>
          </div>
        )}

        {/* Templates Panel */}
        {showTemplates && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-zen-night-card border-t border-zen-sand dark:border-zen-night-border p-5 pb-[calc(20px+env(safe-area-inset-bottom))] animate-slide-up-sheet rounded-t-2xl max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-zen-forest dark:text-zen-parchment">Templates</h3>
              <button onClick={() => setShowTemplates(false)} className="text-zen-stone text-sm">Close</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleUseTemplate(template)}
                  className="text-left p-3 bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 hover:border-zen-sage/30 transition-all"
                >
                  <h4 className="font-medium text-sm text-zen-forest dark:text-zen-parchment mb-1">{template.name}</h4>
                  <p className="text-xs text-zen-moss/60 dark:text-zen-stone/60 line-clamp-2">{template.content.replace(/<[^>]*>/g, ' ').trim()}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions Panel */}
        {showSuggestions && (
          <div className="fixed inset-x-0 bottom-0 z-40 bg-white dark:bg-zen-night-card border-t border-zen-sand dark:border-zen-night-border p-5 pb-[calc(20px+env(safe-area-inset-bottom))] animate-slide-up-sheet rounded-t-2xl max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[15px] font-semibold text-zen-forest dark:text-zen-parchment">Suggestions</h3>
              <button onClick={() => setShowSuggestions(false)} className="text-zen-stone text-sm">Close</button>
            </div>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleUseSuggestion(suggestion)}
                  className="w-full text-left p-3 bg-zen-parchment/50 dark:bg-zen-night-surface rounded-xl border border-zen-sand/60 dark:border-zen-night-border/60 hover:border-zen-sage/30 transition-all"
                >
                  <p className="text-sm text-zen-forest dark:text-zen-parchment">{suggestion}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Quick Actions Bar — Day One style */}
        <div className="sticky bottom-0 z-30 bg-white/95 dark:bg-zen-night-card/95 backdrop-blur-md border-t border-zen-sand/50 dark:border-zen-night-border/50 pb-[env(safe-area-inset-bottom)]">
          <div className="flex items-center justify-between px-4 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
                title="Photos"
              >
                <Camera size={20} />
              </button>
              <button
                type="button"
                onClick={() => { setShowTemplates(!showTemplates); setShowSuggestions(false); }}
                className={`p-2.5 rounded-lg transition-all active:scale-[0.95] ${showTemplates ? 'text-zen-sage bg-zen-sage/10' : 'text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5'}`}
                title="Templates"
              >
                <FileText size={20} />
              </button>
              <button
                type="button"
                onClick={() => { setShowSuggestions(!showSuggestions); setShowTemplates(false); }}
                className={`p-2.5 rounded-lg transition-all active:scale-[0.95] ${showSuggestions ? 'text-zen-sage bg-zen-sage/10' : 'text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5'}`}
                title="Suggestions"
              >
                <Lightbulb size={20} />
              </button>
              <button
                type="button"
                onClick={handleAudioRecord}
                className={`p-2.5 rounded-lg transition-all active:scale-[0.95] ${isRecording ? 'text-red-500 bg-red-50 dark:bg-red-900/20' : 'text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5'}`}
                title="Audio"
              >
                <Mic size={20} />
              </button>
            </div>
            <button
              type="button"
              onClick={() => setShowMetadata(true)}
              className="p-2.5 rounded-lg text-zen-moss/60 dark:text-zen-stone/60 hover:text-zen-sage hover:bg-zen-sage/5 transition-all active:scale-[0.95]"
              title="Entry details"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>
        </div>

        {/* Metadata Bottom Sheet */}
        <MetadataBottomSheet
          open={showMetadata}
          onOpenChange={setShowMetadata}
          mood={mood}
          onMoodSelect={setMood}
          category={category}
          onCategoryChange={setCategory}
          tags={tags}
          onTagsChange={setTags}
          location={location}
          onLocationChange={setLocation}
          characterCount={characterCount}
        />
      </div>
    </Layout>
  );
}
