import React, { useCallback } from "react";

interface ChineseCardProps {
  chinese: string;
  pinyin: string;
  vietnameseMeaning: string;
  exampleSentence: string | null;
  exampleMeaning: string | null;
}

const ChineseCard: React.FC<ChineseCardProps> = ({
  chinese,
  pinyin,
  vietnameseMeaning,
  exampleSentence,
  exampleMeaning,
}) => {
  const speak = useCallback((text: string, lang: string = "zh-CN") => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      {/* Card Header */}
      <div className="px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-white/90">
              {chinese}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {pinyin}
            </p>
          </div>
          <button
            onClick={() => speak(chinese)}
            className="rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            title="Nghe phát âm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          </button>
        </div>
        <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          {vietnameseMeaning}
        </p>
        {exampleSentence && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {exampleSentence}
          </p>
        )}
        {exampleMeaning && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {exampleMeaning}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChineseCard;
