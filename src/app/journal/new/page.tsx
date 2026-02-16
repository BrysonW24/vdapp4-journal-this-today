'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { useJournalStore } from '@/stores/journal-store';
import { MoodLevel, ContentType } from '@/types/journal';
import { Save, X, Tag, FolderOpen, FileText, Lightbulb, Mic, MapPin, Navigation } from 'lucide-react';
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
  const [errors, setErrors] = useState<{ title?: string; content?: string }>({});
  const [touched, setTouched] = useState<{ title?: boolean; content?: boolean }>({});
  const [showTemplates, setShowTemplates] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [transcript, setTranscript] = useState('');
  const [location, setLocation] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [nearbySuggestions, setNearbySuggestions] = useState<any[]>([]);
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false);

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

  const fetchNearbySuggestions = useCallback(async (coords: { lat: number; lon: number }) => {
    try {
      // Use Nominatim reverse geocoding to get current location
      const reverseResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${coords.lat}&lon=${coords.lon}&format=json&addressdetails=1`
      );
      const reverseData = await reverseResponse.json();

      // Search for nearby cities within a radius
      const nearbyResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=10&featuretype=settlement&viewbox=${coords.lon - 0.5},${coords.lat + 0.5},${coords.lon + 0.5},${coords.lat - 0.5}&bounded=1`
      );
      const nearbyData = await nearbyResponse.json();

      // Format nearby locations
      const formattedNearby = nearbyData
        .map((result: any) => {
          const parts = [];
          if (result.address.suburb) parts.push(result.address.suburb);
          if (result.address.city) parts.push(result.address.city);
          if (result.address.state) parts.push(result.address.state);
          if (result.address.country) parts.push(result.address.country);

          return {
            display: parts.join(', '),
            name: result.display_name,
            lat: result.lat,
            lon: result.lon,
          };
        })
        .filter((loc: any) => loc.display); // Filter out empty results

      // Add current location as first suggestion
      const currentLocationParts = [];
      if (reverseData.address?.suburb) currentLocationParts.push(reverseData.address.suburb);
      if (reverseData.address?.city) currentLocationParts.push(reverseData.address.city);
      if (reverseData.address?.state) currentLocationParts.push(reverseData.address.state);
      if (reverseData.address?.country) currentLocationParts.push(reverseData.address.country);

      const suggestions = [
        {
          display: currentLocationParts.join(', ') || 'Current Location',
          name: reverseData.display_name,
          lat: coords.lat,
          lon: coords.lon,
          isCurrent: true,
        },
        ...formattedNearby.slice(0, 7), // Get up to 7 nearby locations
      ];

      setNearbySuggestions(suggestions);
    } catch (error) {
      console.error('Error fetching nearby locations:', error);
      // Fail silently - user can still search manually
    }
  }, []);

  const requestUserLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setHasRequestedLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        await fetchNearbySuggestions(coords);
      },
      (error) => {
        console.error('Location permission denied or unavailable:', error);
        // Silently fail - user can still search manually
      }
    );
  }, [fetchNearbySuggestions]);

  // Request user's location on component mount to get nearby suggestions
  useEffect(() => {
    if (!hasRequestedLocation) {
      requestUserLocation();
    }
  }, [hasRequestedLocation, requestUserLocation]);

  const searchLocation = async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsSearchingLocation(true);
    try {
      // Search using Nominatim API - focus on cities, states, and countries
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=settlement`
      );
      const data = await response.json();

      // Filter and format results to show suburbs, states, countries
      const formattedResults = data.map((result: any) => {
        const parts = [];
        if (result.address.suburb) parts.push(result.address.suburb);
        if (result.address.city) parts.push(result.address.city);
        if (result.address.state) parts.push(result.address.state);
        if (result.address.country) parts.push(result.address.country);

        return {
          display: parts.join(', '),
          name: result.display_name,
          lat: result.lat,
          lon: result.lon,
        };
      });

      setLocationSuggestions(formattedResults);
    } catch (error) {
      console.error('Error searching location:', error);
      toast.error('Failed to search locations');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  const handleLocationChange = (value: string) => {
    setLocation(value);
    setShowLocationSuggestions(true);
    if (value.length >= 3) {
      searchLocation(value);
    } else {
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (locationName: string) => {
    setLocation(locationName);
    setShowLocationSuggestions(false);
    setLocationSuggestions([]);
  };

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
      console.error('Error accessing microphone:', _error);
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

  // Inline validation
  const validate = useCallback(() => {
    const newErrors: { title?: string; content?: string } = {};
    if (touched.title && !title.trim()) {
      newErrors.title = 'Title is required';
    }
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (touched.content && !strippedContent) {
      newErrors.content = 'Content is required';
    }
    setErrors(newErrors);
    return newErrors;
  }, [title, content, touched]);

  // Run validation when fields change
  useEffect(() => {
    validate();
  }, [validate]);

  const handleSave = async () => {
    // Mark all fields as touched
    setTouched({ title: true, content: true });
    const strippedContent = content.replace(/<[^>]*>/g, '').trim();
    if (!title.trim() || !strippedContent) {
      const newErrors: { title?: string; content?: string } = {};
      if (!title.trim()) newErrors.title = 'Title is required';
      if (!strippedContent) newErrors.content = 'Content is required';
      setErrors(newErrors);
      toast.error('Please fill in all required fields');
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
        journalId: 'default',
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
      router.refresh();
    } catch (_error) {
      toast.error('Failed to save entry');
      setIsSaving(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-zen-cream dark:bg-zen-night">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between gap-3">
            <h1 className="text-xl font-semibold text-zen-forest dark:text-zen-sage-light whitespace-nowrap">
              New Entry
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => router.push('/journal')}
                className="px-4 py-2 bg-white dark:bg-zen-night-card border border-zen-sand dark:border-zen-night-border text-zen-forest dark:text-zen-parchment rounded-xl text-sm font-medium hover:border-zen-stone transition-all flex items-center gap-1.5"
              >
                <X size={16} />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-2 bg-zen-sage text-white rounded-xl text-sm font-medium hover:bg-zen-sage-light hover:shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} />
                {isSaving ? 'Saving...' : 'Save Entry'}
              </button>
            </div>
          </div>

          {/* Entry Form */}
          <div className="space-y-5">
            {/* Title */}
            <div>
              <input
                type="text"
                placeholder="Give your entry a title..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onBlur={() => setTouched((prev) => ({ ...prev, title: true }))}
                className={`w-full text-xl font-semibold border-b focus:outline-none focus:ring-0 bg-transparent text-zen-forest dark:text-zen-parchment placeholder-zen-stone/50 pb-2 transition-colors ${
                  errors.title ? 'border-red-400' : 'border-transparent focus:border-zen-sage'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Mood Picker */}
            <MoodPicker selectedMood={mood} onMoodSelect={setMood} />

            {/* Category and Tags */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  <FolderOpen size={16} className="inline mr-2" />
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-card dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all"
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
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  <Tag size={16} className="inline mr-2" />
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-card dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage dark:text-zen-sage-light rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        #{tag}
                        <button
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-zen-forest dark:hover:text-white"
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
            <div className="flex gap-3 py-4 border-y border-zen-sand dark:border-zen-night-border">
              <button
                type="button"
                onClick={() => setShowTemplates(!showTemplates)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  showTemplates ? 'bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage' : 'hover:bg-zen-parchment dark:hover:bg-zen-night-surface'
                }`}
              >
                <FileText size={20} className={showTemplates ? 'text-zen-sage' : 'text-zen-moss dark:text-zen-stone'} />
                <span className="text-xs text-zen-moss dark:text-zen-stone">Templates</span>
              </button>
              <button
                type="button"
                onClick={() => setShowSuggestions(!showSuggestions)}
                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors ${
                  showSuggestions ? 'bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage' : 'hover:bg-zen-parchment dark:hover:bg-zen-night-surface'
                }`}
              >
                <Lightbulb size={20} className={showSuggestions ? 'text-zen-sage' : 'text-zen-moss dark:text-zen-stone'} />
                <span className="text-xs text-zen-moss dark:text-zen-stone">Suggestions</span>
              </button>
              <button
                type="button"
                onClick={handleAudioRecord}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors"
              >
                <Mic size={20} className="text-zen-moss dark:text-zen-stone" />
                <span className="text-xs text-zen-moss dark:text-zen-stone">Audio</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/prompts')}
                className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors ml-auto"
              >
                <span className="text-xs text-zen-moss dark:text-zen-stone">More Prompts →</span>
              </button>
            </div>

            {/* Voice Recording Interface */}
            {isRecording && (
              <div className="bg-zen-sage dark:bg-zen-forest rounded-2xl p-6 text-white shadow-sm">
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
              <div className="bg-zen-sage-soft dark:bg-zen-night-surface border border-zen-sage-light/30 dark:border-zen-night-border rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-zen-forest dark:text-zen-parchment mb-4">Choose a Template</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleUseTemplate(template)}
                      className="text-left p-4 bg-white dark:bg-zen-night-card rounded-lg border border-zen-sand dark:border-zen-night-border hover:border-zen-sage hover:bg-zen-sage-soft/50 dark:hover:bg-zen-sage/10 transition-all"
                    >
                      <h4 className="font-semibold text-zen-forest dark:text-zen-parchment mb-2">{template.name}</h4>
                      <p className="text-sm text-zen-moss dark:text-zen-stone line-clamp-2">{template.content.replace(/<[^>]*>/g, ' ')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Suggestions Modal */}
            {showSuggestions && (
              <div className="bg-zen-creek/10 dark:bg-zen-night-surface border border-zen-creek/20 dark:border-zen-night-border rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-zen-forest dark:text-zen-parchment mb-4">Writing Suggestions</h3>
                <div className="space-y-2">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleUseSuggestion(suggestion)}
                      className="w-full text-left p-3 bg-white dark:bg-zen-night-card rounded-lg border border-zen-sand dark:border-zen-night-border hover:border-zen-creek hover:bg-zen-creek/10 dark:hover:bg-zen-creek/10 transition-all"
                    >
                      <p className="text-zen-forest dark:text-zen-parchment">{suggestion}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            <div className="bg-white dark:bg-zen-night-card rounded-xl border border-zen-sand dark:border-zen-night-border p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone">
                  <MapPin size={16} className="inline mr-2" />
                  Location
                </label>
                <button
                  type="button"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-zen-sage text-white rounded-lg text-sm font-medium hover:bg-zen-sage-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Navigation size={16} />
                  {isGettingLocation ? 'Getting location...' : 'Use Current Location'}
                </button>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="Search for a city, state, or country..."
                  value={location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  onFocus={() => setShowLocationSuggestions(true)}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-surface dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-2 focus:ring-zen-sage-soft transition-all"
                />

                {/* Nearby Location Bubbles - Always visible when available */}
                {nearbySuggestions.length > 0 && location.length === 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-zen-stone mb-2">Nearby Locations</p>
                    <div className="flex flex-wrap gap-2">
                      {nearbySuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(suggestion.display)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            suggestion.isCurrent
                              ? 'bg-zen-sage-soft text-zen-sage border border-zen-sage-light/50 hover:bg-zen-sage-light/30 dark:bg-zen-sage/20 dark:text-zen-sage-light dark:border-zen-sage/30'
                              : 'bg-zen-parchment text-zen-moss border border-zen-sand hover:bg-zen-sand/50 hover:border-zen-stone dark:bg-zen-night-surface dark:text-zen-stone dark:border-zen-night-border'
                          }`}
                        >
                          {suggestion.isCurrent ? (
                            <Navigation size={12} className="text-zen-sage dark:text-zen-sage-light" />
                          ) : (
                            <MapPin size={12} className="text-zen-stone" />
                          )}
                          <span>{suggestion.display}</span>
                          {suggestion.isCurrent && (
                            <span className="ml-1 text-xs">(Current)</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Search Results Dropdown - Only when typing */}
                {showLocationSuggestions && locationSuggestions.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-medium text-zen-stone mb-2">Search Results</p>
                    <div className="flex flex-wrap gap-2">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(suggestion.display)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-zen-night-card rounded-lg text-sm font-medium border border-zen-sand dark:border-zen-night-border text-zen-moss dark:text-zen-stone hover:bg-zen-sage-soft hover:border-zen-sage-light hover:text-zen-sage dark:hover:bg-zen-sage/10 dark:hover:text-zen-sage-light transition-all"
                        >
                          <MapPin size={12} className="text-zen-stone" />
                          <span>{suggestion.display}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isSearchingLocation && (
                  <div className="mt-3 text-center text-sm text-zen-stone">
                    Searching locations...
                  </div>
                )}
              </div>

              <p className="text-xs text-zen-stone mt-2">
                Add a location to see your entries on the map view
              </p>
            </div>

            {/* Rich Text Editor */}
            <div>
              <label className="block text-sm font-medium text-zen-moss dark:text-zen-stone mb-3">
                Write your thoughts...
              </label>
              <div
                className={`rounded-xl transition-all ${errors.content ? 'ring-2 ring-red-400' : ''}`}
                onBlur={() => setTouched((prev) => ({ ...prev, content: true }))}
              >
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="What's on your mind today?"
                />
              </div>
              {errors.content && (
                <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                  <span className="inline-block w-1 h-1 bg-red-500 rounded-full" />
                  {errors.content}
                </p>
              )}
            </div>

            {/* Word Count */}
            <div className="text-sm text-zen-stone text-right">
              {content.replace(/<[^>]*>/g, '').length} characters
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
