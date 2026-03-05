'use client';

import { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { MoodLevel } from '@/types/journal';
import { X, Tag, MapPin, Navigation, ChevronDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface MetadataBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mood?: MoodLevel;
  onMoodSelect: (mood: MoodLevel) => void;
  category: string;
  onCategoryChange: (category: string) => void;
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  location: string;
  onLocationChange: (location: string) => void;
  characterCount: number;
}

const TABS = [
  { key: 'mood', label: 'Mood' },
  { key: 'tags', label: 'Tags' },
  { key: 'location', label: 'Location' },
] as const;

type TabKey = (typeof TABS)[number]['key'];

export function MetadataBottomSheet({
  open,
  onOpenChange,
  mood,
  onMoodSelect,
  category,
  onCategoryChange,
  tags,
  onTagsChange,
  location,
  onLocationChange,
  characterCount,
}: MetadataBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('mood');
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState(location);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setLocationInput(location);
  }, [location]);

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      onTagsChange([...tags, tagInput.trim()]);
    }
    setTagInput('');
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    onTagsChange(tags.filter((tag) => tag !== tagToRemove));
  };

  const searchLocation = useCallback(async (query: string) => {
    if (query.length < 3) {
      setLocationSuggestions([]);
      return;
    }
    setIsSearchingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=3&featuretype=settlement`
      );
      const data = await response.json();
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
    } finally {
      setIsSearchingLocation(false);
    }
  }, []);

  const handleLocationInputChange = (value: string) => {
    setLocationInput(value);
    if (value.length >= 3) {
      searchLocation(value);
    } else {
      setLocationSuggestions([]);
    }
  };

  const selectLocation = (displayName: string) => {
    setLocationInput(displayName);
    onLocationChange(displayName);
    setLocationSuggestions([]);
  };

  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation not supported');
      return;
    }
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          const locationName = data.address?.city || data.address?.town || data.address?.village || data.address?.state || 'Unknown Location';
          const fullLocation = `${locationName} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
          setLocationInput(fullLocation);
          onLocationChange(fullLocation);
          toast.success('Location added!');
        } catch {
          const coords = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocationInput(coords);
          onLocationChange(coords);
        } finally {
          setIsGettingLocation(false);
        }
      },
      () => {
        toast.error('Could not get location');
        setIsGettingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 animate-fade-in" />
        <Dialog.Content className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up-sheet focus:outline-none">
          <div className="bg-white dark:bg-zen-night-card rounded-t-[20px] max-h-[85vh] overflow-y-auto pb-[env(safe-area-inset-bottom)]">
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-10 h-1 rounded-full bg-zen-sand dark:bg-zen-night-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-3 border-b border-zen-sand/50 dark:border-zen-night-border/50">
              <Dialog.Title className="text-[17px] font-serif font-semibold text-zen-forest dark:text-zen-parchment">
                Entry Details
                {characterCount > 0 && (
                  <span className="text-[13px] font-normal text-zen-moss/40 dark:text-zen-stone/40 ml-2">
                    · {characterCount} chars
                  </span>
                )}
              </Dialog.Title>
              <Dialog.Close className="p-2 -mr-2 text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment rounded-full hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>

            {/* Tab Bar */}
            <div className="flex items-center justify-center gap-2 px-5 py-3">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[13px] font-medium transition-all ${
                    activeTab === tab.key
                      ? 'bg-zen-forest dark:bg-zen-parchment text-white dark:text-zen-night shadow-sm'
                      : 'bg-zen-parchment/60 dark:bg-zen-night-surface text-zen-moss/60 dark:text-zen-stone/60 hover:bg-zen-parchment dark:hover:bg-zen-night-border'
                  }`}
                >
                  {tab.label}
                  {tab.key === 'tags' && tags.length > 0 && (
                    <span className={`ml-1.5 text-[11px] ${activeTab === tab.key ? 'text-white/70' : 'text-zen-moss/30'}`}>
                      {tags.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="px-5 py-4">
              {/* Mood Tab */}
              {activeTab === 'mood' && (
                <div className="space-y-5">
                  <MoodPicker selectedMood={mood} onMoodSelect={onMoodSelect} />

                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                      Category
                    </label>
                    <div className="relative">
                      <select
                        value={category}
                        onChange={(e) => onCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-surface dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all appearance-none text-zen-forest"
                      >
                        <option value="">Select a category...</option>
                        <option value="Personal">Personal</option>
                        <option value="Work">Work</option>
                        <option value="Travel">Travel</option>
                        <option value="Gratitude">Gratitude</option>
                        <option value="Dreams">Dreams</option>
                        <option value="Goals">Goals</option>
                        <option value="Health">Health</option>
                        <option value="Relationships">Relationships</option>
                      </select>
                      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zen-stone pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Tags Tab */}
              {activeTab === 'tags' && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                    <Tag size={15} />
                    Tags
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Type a tag..."
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      className="flex-1 px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-surface dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                      className="px-4 py-3 bg-zen-sage text-white rounded-xl font-medium text-sm hover:bg-zen-sage-light transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Plus size={16} />
                      Add
                    </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2.5 py-1 bg-zen-sage-soft dark:bg-zen-sage/20 text-zen-sage dark:text-zen-sage-light rounded-lg text-sm font-medium flex items-center gap-1.5"
                        >
                          #{tag}
                          <button
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-zen-forest dark:hover:text-white"
                          >
                            <X size={13} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Location Tab */}
              {activeTab === 'location' && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 text-sm font-medium text-zen-moss dark:text-zen-stone">
                      <MapPin size={15} />
                      Location
                    </label>
                    <button
                      type="button"
                      onClick={getCurrentLocation}
                      disabled={isGettingLocation}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zen-sage hover:bg-zen-sage/5 rounded-lg transition-colors disabled:opacity-50"
                    >
                      <Navigation size={13} />
                      {isGettingLocation ? 'Getting...' : 'Use current'}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Search for a location..."
                    value={locationInput}
                    onChange={(e) => handleLocationInputChange(e.target.value)}
                    className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-surface dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all"
                  />
                  {isSearchingLocation && (
                    <p className="text-xs text-zen-stone mt-2">Searching...</p>
                  )}
                  {locationSuggestions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {locationSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => selectLocation(suggestion.display)}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5 bg-zen-parchment dark:bg-zen-night-surface rounded-xl text-sm text-zen-moss dark:text-zen-stone border border-zen-sand/60 dark:border-zen-night-border/60 hover:border-zen-sage/30 transition-colors text-left"
                        >
                          <MapPin size={14} className="flex-shrink-0 text-zen-moss/40" />
                          {suggestion.display}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
