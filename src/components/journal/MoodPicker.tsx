'use client';

import { MoodLevel, MOOD_METADATA } from '@/types/journal';

interface MoodPickerProps {
  selectedMood?: MoodLevel;
  onMoodSelect: (mood: MoodLevel) => void;
}

export function MoodPicker({ selectedMood, onMoodSelect }: MoodPickerProps) {
  const moods = [
    MoodLevel.VERY_SAD,
    MoodLevel.SAD,
    MoodLevel.NEUTRAL,
    MoodLevel.HAPPY,
    MoodLevel.VERY_HAPPY,
  ];

  return (
    <div className="space-y-2">
      <label className="block text-xs font-medium text-zen-moss dark:text-zen-stone">
        How are you feeling?
      </label>
      <div className="flex gap-2">
        {moods.map((mood) => {
          const moodData = MOOD_METADATA[mood];
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              type="button"
              onClick={() => onMoodSelect(mood)}
              className={`flex-1 py-2 px-1 rounded-lg border transition-all duration-200 ${
                isSelected
                  ? 'shadow-sm ring-1 ring-zen-sage/30'
                  : 'hover:shadow-sm'
              }`}
              style={{
                backgroundColor: isSelected ? moodData.bgColor : undefined,
                borderColor: isSelected ? moodData.color : 'var(--color-zen-sand, #DDD8D0)',
              }}
            >
              <div className="text-2xl mb-0.5">{moodData.emoji}</div>
              <div
                className="text-[10px] font-medium"
                style={{ color: moodData.color }}
              >
                {moodData.label}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
