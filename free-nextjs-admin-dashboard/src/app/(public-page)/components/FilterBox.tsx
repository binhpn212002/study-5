'use client';

import { HskLevel } from '@/queries/vocabulary.query';
import { useCallback } from 'react';

const HSK_LEVELS = [
  { value: undefined, label: 'All' },
  { value: HskLevel.HSK1, label: 'HSK 1' },
  { value: HskLevel.HSK2, label: 'HSK 2' },
  { value: HskLevel.HSK3, label: 'HSK 3' },
  { value: HskLevel.HSK4, label: 'HSK 4' },
  { value: HskLevel.HSK5, label: 'HSK 5' },
  { value: HskLevel.HSK6, label: 'HSK 6' },
];

const LEARNED_OPTIONS = [
  { value: undefined, label: 'All' },
  { value: true, label: 'Đã thuộc' },
  { value: false, label: 'Chưa thuộc' },
];

interface FilterBoxProps {
  selectedLevel: HskLevel | undefined;
  onLevelChange: (level: HskLevel | undefined) => void;
  selectedLearned: boolean | undefined;
  onLearnedChange: (learned: boolean | undefined) => void;
}

function FilterBox({
  selectedLevel,
  onLevelChange,
  selectedLearned,
  onLearnedChange,
}: FilterBoxProps) {
  const handleLevelChange = useCallback(
    (level: HskLevel | undefined) => {
      onLevelChange(level);
    },
    [onLevelChange]
  );

  const handleLearnedChange = useCallback(
    (learned: boolean | undefined) => {
      onLearnedChange(learned);
    },
    [onLearnedChange]
  );

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      {/* HSK Level Filter */}
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          HSK Level
        </h3>
        <div className="flex flex-wrap gap-2">
          {HSK_LEVELS.map((level) => (
            <button
              key={level.label}
              onClick={() => handleLevelChange(level.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedLevel === level.value
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      {/* Learned/Unlearned Filter */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Trạng thái
        </h3>
        <div className="flex flex-wrap gap-2">
          {LEARNED_OPTIONS.map((option) => (
            <button
              key={option.label}
              onClick={() => handleLearnedChange(option.value)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedLearned === option.value
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FilterBox;
