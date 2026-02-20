'use client';

import { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { MoodPicker } from '@/components/journal/MoodPicker';
import { MoodLevel } from '@/types/journal';
import { X, Tag, FolderOpen, MapPin, Navigation, ChevronDown } from 'lucide-react';
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
  const [tagInput, setTagInput] = useState('');
  const [locationInput, setLocationInput] = useState(location);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  useEffect(() => {
    setLocationInput(location);
  }, [location]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        onTagsChange([...tags, tagInput.trim()]);
      }
      setTagInput('');
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
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&featuretype=settlement`
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
              <Dialog.Title className="text-[17px] font-semibold text-zen-forest dark:text-zen-parchment">
                Entry Details
              </Dialog.Title>
              <Dialog.Close className="p-2 -mr-2 text-zen-moss dark:text-zen-stone hover:text-zen-forest dark:hover:text-zen-parchment rounded-full hover:bg-zen-parchment dark:hover:bg-zen-night-surface transition-colors">
                <X size={20} />
              </Dialog.Close>
            </div>

            <div className="px-5 py-4 space-y-5">
              {/* Mood */}
              <MoodPicker selectedMood={mood} onMoodSelect={onMoodSelect} />

              {/* Category */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  <FolderOpen size={15} />
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

              {/* Tags */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zen-moss dark:text-zen-stone mb-2">
                  <Tag size={15} />
                  Tags
                </label>
                <input
                  type="text"
                  placeholder="Add tags (press Enter)..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="w-full px-4 py-3 border border-zen-sand dark:border-zen-night-border dark:bg-zen-night-surface dark:text-zen-parchment rounded-xl focus:border-zen-sage focus:ring-1 focus:ring-zen-sage/20 transition-all"
                />
                {tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap mt-2.5">
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

              {/* Location */}
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
                    {isGettingLocation ? 'Getting...' : 'Current'}
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
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {locationSuggestions.map((suggestion, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => selectLocation(suggestion.display)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-zen-parchment dark:bg-zen-night-surface rounded-lg text-xs font-medium text-zen-moss dark:text-zen-stone border border-zen-sand/60 dark:border-zen-night-border/60 hover:border-zen-sage/30 transition-colors"
                      >
                        <MapPin size={11} />
                        {suggestion.display}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between pt-2 border-t border-zen-sand/50 dark:border-zen-night-border/50">
                <span className="text-xs text-zen-stone">{characterCount} characters</span>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
