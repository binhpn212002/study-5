'use client';

import Pagination from '@/components/tables/Pagination';
import { HskLevel, vocabularyQuery, VocabularyResponse } from '@/queries/vocabulary.query';
import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import FilterBox from '../components/FilterBox';

interface QuizQuestion {
  vocabulary: VocabularyResponse;
  options: string[];
  correctIndex: number;
}

interface PageResult {
  page: number;
  correctCount: number;
  incorrectCount: number;
  incorrectIds: number[];
  totalQuestions: number;
}

const PAGE_SIZE = 20;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function generateQuestions(
  vocabularies: VocabularyResponse[],
  count: number = 10
): QuizQuestion[] {
  const shuffled = shuffleArray(vocabularies);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((vocab) => {
    const otherVocab = vocabularies.filter((v) => v.id !== vocab.id);
    const wrongAnswers = shuffleArray(otherVocab)
      .slice(0, 3)
      .map((v) => v.vietnameseMeaning);

    const allOptions = shuffleArray([vocab.vietnameseMeaning, ...wrongAnswers]);
    const correctIndex = allOptions.indexOf(vocab.vietnameseMeaning);

    return {
      vocabulary: vocab,
      options: allOptions,
      correctIndex,
    };
  });
}

function QuizPage() {
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | undefined>(undefined);
  const [selectedLearned, setSelectedLearned] = useState<boolean | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [incorrectIds, setIncorrectIds] = useState<number[]>([]);
  const [pageResult, setPageResult] = useState<PageResult | null>(null);
  const [allPageResults, setAllPageResults] = useState<PageResult[]>([]);

  const { data: vocabulary, isLoading, isFetching } = useQuery({
    queryKey: ['vocabulary-quiz', selectedLevel || undefined, selectedLearned || undefined, currentPage],
    queryFn: () => vocabularyQuery.list({ level: selectedLevel || undefined, limit: PAGE_SIZE, page: currentPage }),
  });

  useEffect(() => {
    if (vocabulary?.data && vocabulary.data.length >= 4) {
      setQuestions(generateQuestions(vocabulary.data, 10));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectCount(0);
      setIncorrectCount(0);
      setIncorrectIds([]);
      setPageResult(null);
    }
  }, [vocabulary?.data, currentPage]);

  const handleFilterChange = useCallback((level: HskLevel | undefined, learned: boolean | undefined) => {
    setSelectedLevel(level);
    setSelectedLearned(learned);
    setCurrentPage(1);
    setPageResult(null);
    setAllPageResults([]);
  }, []);

  const currentQuestion = questions[currentIndex];
  const totalQuestions = questions.length;
  const totalItems = vocabulary?.total || 0;
  const totalPages = vocabulary?.totalPages || 1;
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0;

  const handleAnswer = useCallback(
    (index: number) => {
      if (isAnswered) return;

      setSelectedAnswer(index);
      setIsAnswered(true);

      if (index === currentQuestion.correctIndex) {
        setCorrectCount((prev) => prev + 1);
      } else {
        setIncorrectCount((prev) => prev + 1);
        setIncorrectIds((prev) => [...prev, Number(currentQuestion.vocabulary.id)]);
      }
    },
    [isAnswered, currentQuestion]
  );

  const handleNext = useCallback(() => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      // Da tra loi het cau hoi trong trang - hien thi ket qua cua trang nay
      const result: PageResult = {
        page: currentPage,
        correctCount,
        incorrectCount,
        incorrectIds,
        totalQuestions,
      };
      setPageResult(result);
    }
  }, [currentIndex, totalQuestions, currentPage, correctCount, incorrectCount, incorrectIds]);

  const handleNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      const result: PageResult = {
        page: currentPage,
        correctCount,
        incorrectCount,
        incorrectIds,
        totalQuestions,
      };
      setAllPageResults((prev) => [...prev, result]);
      setCurrentPage((prev) => prev + 1);
    } else {
      // Trang cuoi cung - luu ket qua va hien thi tong hop
      const result: PageResult = {
        page: currentPage,
        correctCount,
        incorrectCount,
        incorrectIds,
        totalQuestions,
      };
      setAllPageResults((prev) => [...prev, result]);
      setPageResult(null);
    }
  }, [currentPage, totalPages, correctCount, incorrectCount, incorrectIds, totalQuestions]);

  const handleRestart = useCallback(() => {
    if (vocabulary?.data && vocabulary.data.length >= 4) {
      setQuestions(generateQuestions(vocabulary.data, 10));
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setIsAnswered(false);
      setCorrectCount(0);
      setIncorrectCount(0);
      setIncorrectIds([]);
      setPageResult(null);
    }
  }, [vocabulary?.data]);

  const handleSaveToNotLearned = useCallback(() => {
    console.log('Danh sach chua thuoc:', incorrectIds);
  }, [incorrectIds]);

  const getOptionStyle = (index: number) => {
    if (!isAnswered) {
      return 'bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900 border-gray-200 dark:border-gray-700';
    }

    if (index === currentQuestion.correctIndex) {
      return 'bg-green-100 dark:bg-green-900 border-green-500 text-green-700 dark:text-green-300';
    }

    if (index === selectedAnswer && index !== currentQuestion.correctIndex) {
      return 'bg-red-100 dark:bg-red-900 border-red-500 text-red-700 dark:text-red-300';
    }

    return 'bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 opacity-50';
  };

  // Tinh tong ket qua tat ca cac trang
  const totalCorrectCount = allPageResults.reduce((sum, r) => sum + r.correctCount, 0) + (pageResult ? pageResult.correctCount : 0);
  const totalIncorrectCount = allPageResults.reduce((sum, r) => sum + r.incorrectCount, 0) + (pageResult ? pageResult.incorrectCount : 0);
  const totalAllQuestions = allPageResults.reduce((sum, r) => sum + r.totalQuestions, 0) + (pageResult ? pageResult.totalQuestions : 0);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Quiz Trắc Nghiệm
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Quiz Area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : !currentQuestion && !pageResult && allPageResults.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                Không có đủ từ vựng để tạo quiz.
              </p>
              <p className="text-gray-400 dark:text-gray-500">
                Cần ít nhất 4 từ vựng để tạo câu hỏi.
              </p>
            </div>
          ) : pageResult ? (
            // Hien thi ket qua cua trang hien tai
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="text-5xl mb-4">
                  {pageResult.correctCount >= pageResult.totalQuestions * 0.8
                    ? '🎉'
                    : pageResult.correctCount >= pageResult.totalQuestions * 0.5
                    ? '👍'
                    : '💪'}
                </div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Kết Quả Trang {pageResult.page}
                </h2>
                <div className="text-4xl font-bold text-blue-500 mb-4">
                  {Math.round((pageResult.correctCount / pageResult.totalQuestions) * 100)}%
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600 dark:text-green-400">Đúng:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {pageResult.correctCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-red-600 dark:text-red-400">Sai:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {pageResult.incorrectCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Tổng cộng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {pageResult.totalQuestions}
                    </span>
                  </div>
                </div>

                {/* Nut chuyen trang tiep theo hoac xem ket qua tong hop */}
                {currentPage < totalPages ? (
                  <button
                    onClick={handleNextPage}
                    className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors mb-3"
                  >
                    Quiz Trang {currentPage + 1} →
                  </button>
                ) : allPageResults.length > 0 ? (
                  <button
                    onClick={() => setPageResult(null)}
                    className="w-full px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-medium transition-colors mb-3"
                  >
                    Xem Kết Quả Tổng Hợp
                  </button>
                ) : null}

                <button
                  onClick={handleRestart}
                  className="w-full px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-medium transition-colors mb-3"
                >
                  Làm Lại Trang Này
                </button>

                {pageResult.incorrectIds.length > 0 && (
                  <button
                    onClick={handleSaveToNotLearned}
                    className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors"
                  >
                    Lưu vào DS chưa thuộc ({pageResult.incorrectIds.length})
                  </button>
                )}
              </div>
            </div>
          ) : allPageResults.length > 0 && totalAllQuestions > 0 ? (
            // Hien thi ket qua tong hop cua tat ca cac trang
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🏆</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Kết Quả Tổng Hợp
                </h2>
                <div className="text-5xl font-bold text-blue-500 mb-4">
                  {Math.round((totalCorrectCount / totalAllQuestions) * 100)}%
                </div>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600 dark:text-green-400">Đúng:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {totalCorrectCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-red-600 dark:text-red-400">Sai:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {totalIncorrectCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Tổng cộng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {totalAllQuestions}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Số trang đã làm:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {allPageResults.length}
                    </span>
                  </div>
                </div>

                {/* Bang ket qua theo trang */}
                <div className="mb-6 text-left">
                  <h3 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Chi tiết theo trang:</h3>
                  <div className="space-y-1">
                    {allPageResults.map((result) => (
                      <div key={result.page} className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Trang {result.page}:</span>
                        <span className={`font-medium ${result.correctCount >= result.totalQuestions * 0.5 ? 'text-green-600' : 'text-red-600'}`}>
                          {result.correctCount}/{result.totalQuestions} ({Math.round((result.correctCount / result.totalQuestions) * 100)}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Nut luu danh sach tu chua thuoc */}
                {totalIncorrectCount > 0 && (
                  <button
                    onClick={() => {
                      const allIncorrectIds = [
                        ...allPageResults.flatMap((r) => r.incorrectIds),
                      ];
                      console.log('Tat ca tu chua thuoc:', allIncorrectIds);
                    }}
                    className="w-full px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-medium transition-colors mb-3"
                  >
                    Lưu vào DS chưa thuộc ({totalIncorrectCount})
                  </button>
                )}

                <button
                  onClick={() => {
                    setPageResult(null);
                    setAllPageResults([]);
                    setCurrentPage(1);
                  }}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                >
                  Bắt Đầu Lại Từ Đầu
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>
                    Câu {currentIndex + 1} / {totalQuestions} (Trang {currentPage}/{totalPages})
                  </span>
                  <span>
                    <span className="text-green-600 dark:text-green-400">✓ {correctCount}</span>
                    <span className="mx-2">|</span>
                    <span className="text-red-600 dark:text-red-400">✗ {incorrectCount}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* Question Card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 md:p-8">
                <div className="text-center mb-8">
                  <div className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentQuestion.vocabulary.chinese}
                  </div>
                  <div className="text-xl text-blue-500 dark:text-blue-400">
                    {currentQuestion.vocabulary.pinyin}
                  </div>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentQuestion.options.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswer(index)}
                      disabled={isAnswered}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${getOptionStyle(
                        index
                      )}`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center font-semibold">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span className="text-sm md:text-base">{option}</span>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Feedback */}
                {isAnswered && (
                  <div className="mt-6 p-4 rounded-xl bg-gray-100 dark:bg-gray-700">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">
                        {selectedAnswer === currentQuestion.correctIndex ? '✅' : '❌'}
                      </span>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {selectedAnswer === currentQuestion.correctIndex
                            ? 'Chính xác!'
                            : 'Sai rồi!'}
                        </div>
                        <div className="text-gray-600 dark:text-gray-300 mt-1">
                          {currentQuestion.vocabulary.chinese} -{' '}
                          {currentQuestion.vocabulary.vietnameseMeaning}
                          {currentQuestion.vocabulary.exampleSentence && (
                            <span className="block text-sm mt-1 italic text-gray-500 dark:text-gray-400">
                              VD: {currentQuestion.vocabulary.exampleSentence}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Next Button */}
                {isAnswered && (
                  <button
                    onClick={handleNext}
                    className="w-full mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                  >
                    {currentIndex < totalQuestions - 1
                      ? 'Câu Tiếp Theo →'
                      : 'Xem Kết Quả Trang Này'}
                  </button>
                )}
              </div>

              {/* Page Info */}
              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                {isFetching && <span className="text-blue-500">Đang tải...</span>}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>

              {/* Restart Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  🔀 Quiz Mới
                </button>
              </div>
            </>
          )}
        </div>

        {/* Right - Filter */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <FilterBox
              selectedLevel={selectedLevel}
              onLevelChange={(level) => handleFilterChange(level, selectedLearned)}
              selectedLearned={selectedLearned}
              onLearnedChange={(learned) => handleFilterChange(selectedLevel, learned)}
            />
            
            {/* Total items info */}
            {totalItems > 0 && (
              <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium text-gray-900 dark:text-white">{totalItems}</span> từ vựng
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default QuizPage;
