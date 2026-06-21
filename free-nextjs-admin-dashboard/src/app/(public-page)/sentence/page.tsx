'use client';

import Pagination from '@/components/tables/Pagination';
import SentenceFilterBox from '../components/SentenceFilterBox';
import { HskLevel, SentenceResponse } from '@/queries/sentence.query';
import { api } from '@/lib/axios';
import { SpeakerWaveIcon } from '@/icons';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

type TranslationMode = 'forward' | 'reverse';

const speakText = (text: string, onEnd?: () => void) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.8;
    if (onEnd) {
      utterance.onend = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  }
};

interface SentenceResult {
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
}

function normalizeVietnamese(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[.,!?;:]/g, '');
}

function SentencePage() {
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [sentences, setSentences] = useState<SentenceResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [result, setResult] = useState<SentenceResult | null>(null);
  const [mode, setMode] = useState<TranslationMode>('forward');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [totalPages, setTotalPages] = useState(1);
  const [showPinyin, setShowPinyin] = useState(true);

  const PAGE_SIZE = 10;

  const fetchSentences = async () => {
    const params: Record<string, string | number> = {
      page: currentPage,
      limit: PAGE_SIZE,
    };
    if (selectedLevel) {
      params.level = selectedLevel;
    }
    const response = await api.get('/sentences', { params });
    return response.data;
  };

  const { data, isLoading, isFetching, error } = useQuery({
    queryKey: ['sentences', selectedLevel, currentPage],
    queryFn: fetchSentences,
  });

  useEffect(() => {
    if (data && data.data) {
      setSentences(data.data);
      setTotalPages(data.totalPages || 1);
      setCurrentIndex(0);
      setResult(null);
    }
  }, [data]);

  const handleLevelChange = useCallback((level: HskLevel | undefined) => {
    setSelectedLevel(level);
    setCurrentPage(1);
    setCurrentIndex(0);
    setResult(null);
  }, []);

  const currentSentence = sentences[currentIndex];
  const totalQuestions = sentences.length;

  const getDisplayText = () => {
    if (!currentSentence) return { source: '', target: '', pinyin: '' };
    if (mode === 'forward') {
      return {
        source: currentSentence.vietnamese,
        target: currentSentence.chinese,
        pinyin: currentSentence.pinyin,
      };
    }
    return {
      source: currentSentence.chinese,
      target: currentSentence.vietnamese,
      pinyin: currentSentence.pinyin,
    };
  };

  const { source, target, pinyin } = getDisplayText();

  useEffect(() => {
    if (currentSentence && !isAnswered) {
      const timer = setTimeout(() => {
        if (mode === 'reverse') {
          speakText(currentSentence.chinese);
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, currentSentence, isAnswered, mode]);

  const checkAnswer = useCallback(() => {
    if (!currentSentence || !userAnswer.trim()) return;

    const correctAnswer = mode === 'forward' ? currentSentence.chinese : currentSentence.vietnamese;
    const normalizedUser = normalizeVietnamese(userAnswer);
    const normalizedCorrect = normalizeVietnamese(correctAnswer);

    const correct = normalizedUser === normalizedCorrect;
    setIsCorrect(correct);
    setIsAnswered(true);
  }, [currentSentence, userAnswer, mode]);

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setUserAnswer('');
      setIsAnswered(false);
      setIsCorrect(false);
    } else {
      const correct = sentences.filter((_, i) => {
        if (i < currentIndex || (i === currentIndex && isCorrect)) return true;
        return false;
      }).length;
      setResult({
        correctCount: correct,
        incorrectCount: totalQuestions - correct,
        totalQuestions,
      });
    }
  }, [currentIndex, totalQuestions, isCorrect, sentences]);

  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !isAnswered) {
        checkAnswer();
      }
    },
    [isAnswered, checkAnswer]
  );

  const handleRestart = useCallback(() => {
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setResult(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((prev) => (prev === 'forward' ? 'reverse' : 'forward'));
    setCurrentIndex(0);
    setUserAnswer('');
    setIsAnswered(false);
    setIsCorrect(false);
    setResult(null);
  }, []);

  const progressPercent =
    totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const scorePercent = result
    ? Math.round((result.correctCount / result.totalQuestions) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Luyện Dịch Câu
        </h1>

        <div className="flex gap-3">
          <button
            onClick={() => setShowPinyin(!showPinyin)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPinyin
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            {showPinyin ? '👁️ Pinyin: Bật' : '👁️ Pinyin: Tắt'}
          </button>
          <button
            onClick={toggleMode}
            className="px-4 py-2 rounded-lg font-medium transition-colors bg-purple-500 hover:bg-purple-600 text-white"
          >
            {mode === 'forward' ? '🔄 Chế độ: Việt → Trung' : '🔄 Chế độ: Trung → Việt'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="text-center py-20">
              <p className="text-red-500 dark:text-red-400 text-lg mb-4">
                Lỗi: {error.message || 'Không thể tải dữ liệu'}
              </p>
            </div>
          ) : !currentSentence && !result ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Không có câu để luyện tập.
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">
                Total: {data?.total || 0}, Data length: {data?.data?.length || 0}
              </p>
            </div>
          ) : result ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">
                  {scorePercent >= 80 ? '🎉' : scorePercent >= 50 ? '👍' : '💪'}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Kết Quả
                </h2>
                <div className="text-5xl font-bold text-blue-500 mb-4">
                  {scorePercent}%
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600 dark:text-green-400">Đúng:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {result.correctCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-red-600 dark:text-red-400">Sai:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {result.incorrectCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Tổng cộng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {result.totalQuestions}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                >
                  Làm Lại
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>
                    Câu {currentIndex + 1} / {totalQuestions} (Trang {currentPage}/{totalPages})
                  </span>
                  <span>
                    <span className="text-gray-500">Chế độ: </span>
                    <span className="font-medium">
                      {mode === 'forward' ? 'Việt → Trung' : 'Trung → Việt'}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    {mode === 'forward' ? 'Dịch câu sau sang tiếng Trung:' : 'Dịch câu sau sang tiếng Việt:'}
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                      {source}
                    </span>
                    {mode === 'reverse' && (
                      <button
                        onClick={() => {
                          if (isSpeaking) {
                            window.speechSynthesis.cancel();
                            setIsSpeaking(false);
                          } else {
                            setIsSpeaking(true);
                            speakText(currentSentence.chinese, () => setIsSpeaking(false));
                          }
                        }}
                        className="p-2 rounded-full bg-blue-100 dark:bg-blue-900 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                        title="Nghe phát âm"
                      >
                        <SpeakerWaveIcon className={`w-6 h-6 text-blue-500 ${isSpeaking ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                  </div>
                  {mode === 'forward' && showPinyin && (
                    <div className="text-lg text-blue-500 dark:text-blue-400 mt-2">
                      {pinyin}
                    </div>
                  )}
                  {currentSentence?.hint && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">
                      💡 Gợi ý: {currentSentence.hint}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {mode === 'forward' ? 'Nhập câu trả lời (tiếng Trung):' : 'Nhập câu trả lời (tiếng Việt):'}
                  </label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isAnswered}
                    placeholder={mode === 'forward' ? 'Nhập câu tiếng Trung...' : 'Nhập câu tiếng Việt...'}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-lg transition-colors outline-none ${
                      isAnswered
                        ? isCorrect
                          ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-red-500 bg-red-50 dark:bg-red-900/20'
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:border-blue-500'
                    }`}
                  />
                </div>

                {isAnswered && (
                  <div
                    className={`mb-4 p-4 rounded-xl ${
                      isCorrect
                        ? 'bg-green-100 dark:bg-green-900/30'
                        : 'bg-red-100 dark:bg-red-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
                      <span className={`font-semibold text-lg ${isCorrect ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
                        {isCorrect ? 'Chính xác!' : 'Chưa đúng rồi!'}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div className="text-gray-700 dark:text-gray-300">
                        <span className="font-medium">Đáp án đúng: </span>
                        <span className="font-semibold">{target}</span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  {!isAnswered ? (
                    <button
                      onClick={checkAnswer}
                      disabled={!userAnswer.trim()}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors"
                    >
                      Kiểm Tra
                    </button>
                  ) : (
                    <button
                      onClick={handleNext}
                      className="flex-1 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                    >
                      {currentIndex < totalQuestions - 1 ? 'Câu Tiếp Theo →' : 'Xem Kết Quả'}
                    </button>
                  )}
                  <button
                    onClick={handleRestart}
                    className="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  >
                    🔀
                  </button>
                </div>
              </div>

              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                {isFetching && <span className="text-blue-500">Đang tải...</span>}
              </div>

              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    setCurrentIndex(0);
                    setResult(null);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <SentenceFilterBox
              selectedLevel={selectedLevel}
              onLevelChange={handleLevelChange}
            />

            <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hướng dẫn
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Chọn HSK level để lọc câu</li>
                <li>• Nhấn &quot;Kiểm Tra&quot; để xem kết quả</li>
                <li>• Nhấn Enter để submit nhanh</li>
                <li>• Bật/tắt hiển thị Pinyin</li>
                <li>• Chế độ 🔄 để đổi chiều dịch</li>
              </ul>
            </div>

            {data?.total && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{data.total}</span> câu
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SentencePage;
