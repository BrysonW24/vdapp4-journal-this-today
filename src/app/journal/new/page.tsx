'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { useJournalStore } from '@/stores/journal-store';
import { MoodLevel, ContentType } from '@/types/journal';
import { Save, X, Tag, FolderOpen, Image as ImageIcon, FileText, Lightbulb, Mic, MapPin, Navigation } from 'lucide-react';
import { toast } from 'sonner';

export default function NewEntryPage() {
  const router = useRouter();
  const addEntry = useJournalStore((state) => state.addEntry);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [mood, setMood] = useState<MoodLevel | undefined>(undefined);
  const [tags, setTags] = useState<string[]>([]);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Use reverse geocoding to get location name
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();

          // Extract location name (city, town, or village)
          const locationName = data.address?.city ||
                              data.address?.town ||
                              data.address?.village ||
                              data.address?.state ||
                              'Unknown Location';

          setLocation(`${locationName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);
          toast.success('Location added!');
        } catch (_error) {
          console.error('Error getting location name:', _error);
          setLocation(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          toast.success('Coordinates added!');
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        console.error('Error getting location:', error);
        toast.error('Could not get your location. Please enter it manually.');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleImageUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const files = target.files;
      if (files) {
        toast.success(`${files.length} image(s) selected (attachment feature coming soon)`);
      }
    };
    input.click();
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

    // Start recording
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error('Speech recognition not supported in this browser. Try Chrome or Edge.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Create speech recognition
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
          // Append to content - use functional update to ensure we get latest content
          setContent(prevContent => {
            const newText = finalTranscript.trim();
            if (prevContent && prevContent !== '<p><br></p>') {
              return prevContent + '<p>' + newText + '</p>';
            } else {
              return '<p>' + newText + '</p>';
            }
          });
          toast.success('Voice input added to entry');
        }
        setIsRecording(false);
        setRecognition(null);
        setTranscript('');
        stream.getTracks().forEach(track => track.stop());
      };

      newRecognition.start();
      setRecognition(newRecognition);
      setIsRecording(true);
      toast.success('Recording started - speak now!');

    } catch (_error) {
      console.error('Error accessing microphone:', error);
      toast.error('Microphone access denied');
      setIsRecording(false);
    }
  };

  const handleUseTemplate = (template: typeof templates[0]) => {
    setContent(template.content);
    setTitle(template.name);
    setShowTemplates(false);
    toast.success(`Template "${template.name}" applied`);
  };

  const handleUseSuggestion = (suggestion: string) => {
    setTitle(suggestion);
    setShowSuggestions(false);
    toast.success('Suggestion applied to title');
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Please add a title to your entry');
      return;
    }

    if (!content.trim()) {
      toast.error('Please write some content');
      return;
    }

    setIsSaving(true);
    try {
      // Parse location data if available
      let locationData = undefined;
      if (location.trim()) {
        // Try to extract coordinates from the location string
        const coordMatch = location.match(/\(([-\d.]+),\s*([-\d.]+)\)/);
        if (coordMatch) {
          const latitude = parseFloat(coordMatch[1]);
          const longitude = parseFloat(coordMatch[2]);
          const placeName = location.split('(')[0].trim();

          locationData = {
            latitude,
            longitude,
            placeName: placeName || undefined,
            address: location,
          };
        } else {
          // If no coordinates, just store the location as place name
          locationData = {
            latitude: 0,
            longitude: 0,
            placeName: location.trim(),
            address: location.trim(),
          };
        }
      }

      await addEntry({
        title: title.trim(),
        content,
        contentType: ContentType.HTML,
        mood,
        category: category || undefined,
        tags,
        isFavorite: false,
        isEncrypted: false,
        location: locationData,
      });

      toast.success('Entry saved successfully!');
      router.push('/journal');
    } catch (_error) {
      toast.error('Failed to save entry');
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              New Journal Entry
            </h1>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/journal')}
                className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-medium hover:border-gray-300 transition-all flex items-center gap-2"
              >
                <X size={20} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:shadow-xl transition-all hover:-translate-y-1 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={20} />
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>

          {/* Entry Form */}
          <div className="space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-3xl font-bold border-none focus:outline-none focus:ring-0 bg-transparent text-gray-900 placeholder-gray-400"
              />
            </div>

            {/* Mood Picker */}
            <MoodPicker selectedMood={mood} onMoodSelect={setMood} />

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <FolderOpen size={16} className="inline mr-2" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Select a category...</option>
                  <option value="Personal">👤 Personal</option>
                  <option value="Work">💼 Work</option>
                  <option value="Travel">✈️ Travel</option>
                  <option value="Gratitude">🙏 Gratitude</option>
                  <option value="Dreams">💭 Dreams</option>
                  <option value="Goals">🎯 Goals</option>
                  <option value="Health">💪 Health</option>
                  <option value="Relationships">❤️ Relationships</option>
                </select>
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Tag size={16} className="inline mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-blue-900"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3 py-4 border-y-2 border-gray-200">
              <button
                type="button"
                onClick={handleImageUpload}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <ImageIcon size={20} className="text-gray-700" />
                <span className="text-xs text-gray-600">Photos</span>
              </button>
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  showTemplates ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <FileText size={20} className={showTemplates ? 'text-blue-600' : 'text-gray-700'} />
                <span className="text-xs text-gray-600">Templates</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  showSuggestions ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
                }`}
              >
                <Lightbulb size={20} className={showSuggestions ? 'text-blue-600' : 'text-gray-700'} />
                <span className="text-xs text-gray-600">Suggestions</span>
              </button>
              <button
                type="button"
                onClick={handleAudioRecord}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Mic size={20} className="text-gray-700" />
                <span className="text-xs text-gray-600">Audio</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/prompts')}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ml-auto"
              >
                <span className="text-xs text-gray-600">More Prompts →</span>
              </button>
            </div>

            {/* Voice Recording Interface */}
            {isRecording && (
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl p-6 text-white shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
                      <div className="absolute inset-0 w-4 h-4 bg-red-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="font-semibold text-lg">Recording...</span>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-xl font-medium transition-all backdrop-blur-sm"
                  >
                    Stop Recording
                  </button>
                </div>

                {/* Waveform visualization */}
                <div className="mb-4 h-16 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <div className="flex items-end gap-1 h-12">
                    {[...Array(40)].map((_, i) => (
                      <div
                        key={i}
                        className="w-1 bg-white/60 rounded-full animate-pulse"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                          animationDuration: '0.8s',
                        }}
                      />
                    ))}
                  </div>
                </div>

                {/* Live transcript */}
                <div className="bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                  <p className="text-sm text-white/70 mb-2">Live Transcript:</p>
                  <p className="text-white text-lg leading-relaxed">
                    {transcript || 'Speak to see your words appear here...'}
                  </p>
                </div>
              </div>
            )}

            {/* Templates Modal */}
            {showTemplates && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleUseTemplate(template)}
                      className="text-left p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50 transition-all"
                    >
                      <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                      <p className="text-sm text-gray-600 line-clamp-2">{template.content.replace(/<[^>]*>/g, ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions Modal */}
            {showSuggestions && (
              <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Writing Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="w-full text-left p-3 bg-white rounded-lg border-2 border-gray-200 hover:border-purple-400 hover:bg-purple-50 transition-all"
                    >
                      <p className="text-gray-900">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation size={16} />
                  {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
                </button>
              </div>
              <input
                type="text"
                placeholder="Enter a location or use current location..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
              <p className="text-xs text-gray-500 mt-2">
                Add a location to see your entries on the map view
              </p>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Write your thoughts...
              </label>
              <RichTextEditor
                content={content}
                onChange={setContent}
                placeholder="What's on your mind today?"
              />
            </div>

            {/* Word Count */}
            <div className="text-sm text-gray-500 text-right">
              {content.replace(/<[^>]*>/g, '').length} characters
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
