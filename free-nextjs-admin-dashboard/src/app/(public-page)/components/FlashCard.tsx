'use client';

import { VocabularyResponse } from '@/queries/vocabulary.query';
import { useCallback, useEffect, useRef, useState } from 'react';

interface FlashCardProps {
  vocabulary: VocabularyResponse;
  onKnow: () => void;
  onDontKnow: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
}

function FlashCard({ vocabulary, onKnow, onDontKnow, onNext, onPrev, isFirst, isLast }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 0.8;
      utteranceRef.current = utterance;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  }, []);

  useEffect(() => {
    setIsFlipped(false);
    const timer = setTimeout(() => {
      speak(vocabulary.chinese);
    }, 300);
    return () => clearTimeout(timer);
  }, [vocabulary.id, vocabulary.chinese, speak]);

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleFlip = () => {
    if (!isFlipped) {
      speak(vocabulary.chinese);
    }
    setIsFlipped(!isFlipped);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      handleFlip();
    } else if (e.key === 'ArrowRight') {
      onNext();
    } else if (e.key === 'ArrowLeft') {
      onPrev();
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Perspective Container */}
      <div className="perspective-1000">
      <div
        className="relative cursor-pointer min-h-[200px] md:min-h-[230px]"
        onClick={handleFlip}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label="Click to flip card"
      >
        <div
          className="absolute inset-0 w-full h-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front Side - Chinese */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-6 md:p-8 text-white"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div className="text-5xl md:text-6xl font-bold mb-4">{vocabulary.chinese}</div>
            <div className="flex items-center gap-2 text-lg md:text-xl opacity-80">
              {isSpeaking && <span className="animate-pulse">🔊</span>}
              <span>{isSpeaking ? 'Đang phát âm...' : 'Tap to reveal'}</span>
            </div>
          </div>

          {/* Back Side - Pinyin & Meaning */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8 text-gray-900 dark:text-white"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                speak(vocabulary.chinese);
              }}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Phát âm"
            >
              🔊
            </button>
            <div className="text-3xl font-semibold mb-4 text-blue-600 dark:text-blue-400">
              {vocabulary.pinyin}
            </div>
            <div className="text-2xl text-center mb-6">{vocabulary.vietnameseMeaning}</div>
            {vocabulary.exampleSentence && (
              <div className="text-center">
                <div className="text-lg italic mb-1 text-gray-600 dark:text-gray-300">
                  {vocabulary.exampleSentence}
                </div>
                {vocabulary.exampleMeaning && (
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {vocabulary.exampleMeaning}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-center gap-4 mt-6">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          disabled={isFirst}
          className="flex items-center gap-2 px-6 py-3 bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
        >
          ← Trước
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          disabled={isLast}
          className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
        >
          Sau →
        </button>
      </div>

      {/* Mark Buttons */}
      <div className="flex justify-center gap-4 mt-4">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDontKnow();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium transition-colors"
        >
          <span>✗</span>
          <span>Chưa thuộc</span>
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onKnow();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg font-medium transition-colors"
        >
          <span>✓</span>
          <span>Đã thuộc</span>
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
        <span className="mx-2">←: Trước</span>
        <span className="mx-2">→: Sau</span>
      </div>
    </div>
  );
}

export default FlashCard;
