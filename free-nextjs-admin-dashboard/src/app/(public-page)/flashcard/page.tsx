'use client';

import Pagination from '@/components/tables/Pagination';
import { userVocabQuery } from '@/queries/user-vocab.query';
import { HskLevel, vocabularyQuery, VocabularyResponse } from '@/queries/vocabulary.query';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import FilterBox, { LearnedStatus } from '../components/FilterBox';
import FlashCard from '../components/FlashCard';

const PAGE_SIZE = 20;

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function FlashcardPage() {
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | undefined>(undefined);
  const [learnedStatus, setLearnedStatus] = useState<LearnedStatus>(LearnedStatus.ALL);
  const [currentPage, setCurrentPage] = useState(1);
  const [shuffledVocabulary, setShuffledVocabulary] = useState<VocabularyResponse[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [knownCount, setKnownCount] = useState(0);
  const [dontKnowCount, setDontKnowCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const { mutate: saveVocabulary } = useMutation({
    mutationFn: ({ id, isSaved }: { id: string, isSaved: boolean }) => userVocabQuery.create(id, isSaved),
    onSuccess: () => {
      console.log('Từ vựng đã được lưu');
    },
    onError: () => {
      console.log('Lưu từ vựng thất bại');
    },
  });

  const { data: vocabulary, isLoading, isFetching } = useQuery({
    queryKey: ['vocabulary-flashcard', selectedLevel || undefined, learnedStatus || undefined, currentPage || undefined, learnedStatus],
    queryFn: () => vocabularyQuery.list({ level: selectedLevel || undefined, limit: PAGE_SIZE, page: currentPage, learned: learnedStatus }),
  });

  useEffect(() => {
    if (vocabulary?.data) {
      setShuffledVocabulary(shuffleArray(vocabulary.data));
      setCurrentIndex(0);
      setKnownCount(0);
      setDontKnowCount(0);
      setSessionComplete(false);
    }
  }, [vocabulary?.data]);

  const handleFilterChange = useCallback((level: HskLevel | undefined, learned: LearnedStatus) => {
    setSelectedLevel(level);
    setLearnedStatus(learned);
    setCurrentPage(1);
  }, []);

  const currentCard = shuffledVocabulary[currentIndex];
  const totalCards = shuffledVocabulary.length;
  const totalItems = vocabulary?.total || 0;
  const totalPages = vocabulary?.totalPages || 1;
  const progressPercent = totalCards > 0 ? ((currentIndex) / totalCards) * 100 : 0;

  const handleKnow = (id: string) => {
    saveVocabulary({ id, isSaved: true });
  };

  const handleDontKnow = (id: string) => {
    saveVocabulary({ id, isSaved: false });
  };

  const handleNext = useCallback(() => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    } else {
      setSessionComplete(true);
    }
  }, [currentIndex, totalCards, currentPage, totalPages]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    } else if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  }, [currentIndex, currentPage]);

  const handleRestart = useCallback(() => {
    if (vocabulary?.data) {
      setShuffledVocabulary(shuffleArray(vocabulary.data));
      setCurrentIndex(0);
      setKnownCount(0);
      setDontKnowCount(0);
      setSessionComplete(false);
    }
  }, [vocabulary?.data]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const isFirstCard = currentIndex === 0 && currentPage === 1;
  const isLastCard = currentIndex === totalCards - 1 && currentPage === totalPages;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Flashcard HSK
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left - Flashcard Area */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : !currentCard && !sessionComplete ? (
            <div className="text-center py-20">
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                Không có từ vựng nào phù hợp với bộ lọc.
              </p>
            </div>
          ) : sessionComplete ? (
            <div className="text-center py-12">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md mx-auto">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  Hoàn thành phiên học!
                </h2>
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-lg">
                    <span className="text-green-600 dark:text-green-400">Đã thuộc:</span>
                    <span className="font-semibold text-green-600 dark:text-green-400">
                      {knownCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg">
                    <span className="text-red-600 dark:text-red-400">Chưa thuộc:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">
                      {dontKnowCount}
                    </span>
                  </div>
                  <div className="flex justify-between text-lg border-t pt-2 mt-2">
                    <span className="text-gray-600 dark:text-gray-400">Tổng cộng:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {knownCount + dontKnowCount}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleRestart}
                  className="w-full px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                >
                  Học lại
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span>
                    Card {currentIndex + 1} / {totalCards} (Trang {currentPage}/{totalPages})
                  </span>
                  <span>
                    <span className="text-green-600 dark:text-green-400">✓ {knownCount}</span>
                    <span className="mx-2">|</span>
                    <span className="text-red-600 dark:text-red-400">✗ {dontKnowCount}</span>
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>

              {/* FlashCard */}
              <FlashCard
                key={`${currentPage}-${currentCard?.id}`}
                vocabulary={currentCard!}
                onKnow={() => handleKnow(currentCard?.id)}
                onDontKnow={() => handleDontKnow(currentCard?.id)}
                onNext={handleNext}
                onPrev={handlePrev}
                isFirst={isFirstCard}
                isLast={isLastCard}
              />

              {/* Page Info */}
              <div className="text-center mt-4 text-sm text-gray-500 dark:text-gray-400">
                {isFetching && <span className="text-blue-500">Đang tải...</span>}
              </div>

              {/* Pagination */}
              <div className="flex justify-center mt-6">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </div>

              {/* Restart Button */}
              <div className="flex justify-center mt-4">
                <button
                  onClick={handleRestart}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  🔀 Shuffle & Restart
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
              onLevelChange={(level) => handleFilterChange(level, learnedStatus)}
              learnedStatus={learnedStatus}
              onLearnedChange={(learned) => handleFilterChange(selectedLevel, learned as LearnedStatus)}
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

export default FlashcardPage;
