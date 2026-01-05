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
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        How are you feeling?
      </label>
      <div className="flex gap-3">
        {moods.map((mood) => {
          const moodData = MOOD_METADATA[mood];
          const isSelected = selectedMood === mood;

          return (
            <button
              key={mood}
              type="button"
              onClick={() => onMoodSelect(mood)}
              className={`flex-1 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                isSelected
                  ? 'scale-105 shadow-lg'
                  : 'hover:shadow-md'
              }`}
              style={{
                backgroundColor: isSelected ? moodData.bgColor : 'white',
                borderColor: isSelected ? moodData.color : moodData.borderColor,
              }}
            >
              <div className="text-3xl mb-2">{moodData.emoji}</div>
              <div
                className="text-xs font-medium"
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
