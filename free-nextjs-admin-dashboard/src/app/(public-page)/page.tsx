'use client';
import Advertisement from "@/app/(public-page)/components/Advertisement";
import ChineseCard from "@/components/common/ChineseCard";
import Input from "@/components/form/input/InputField";
import { HskLevel, vocabularyQuery, VocabularyResponse } from "@/queries/vocabulary.query";
import { useCallback, useEffect, useRef, useState } from "react";
const HSK_LEVELS = [
  { value: undefined, label: "All" },
  { value: HskLevel.HSK1, label: "HSK 1" },
  { value: HskLevel.HSK2, label: "HSK 2" },
  { value: HskLevel.HSK3, label: "HSK 3" },
  { value: HskLevel.HSK4, label: "HSK 4" },
  { value: HskLevel.HSK5, label: "HSK 5" },
  { value: HskLevel.HSK6, label: "HSK 6" },
];

const PAGE_SIZE = 12;

function Page() {
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedLevel, setSelectedLevel] = useState<HskLevel | undefined>(undefined);
  const [vocabularies, setVocabularies] = useState<VocabularyResponse[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const fetchVocabularies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await vocabularyQuery.list({
        page: currentPage,
        limit: PAGE_SIZE,
        q: debouncedSearch || undefined,
        level: selectedLevel,
      });
      setVocabularies(response.data);
      setTotal(response.total);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error("Failed to fetch vocabularies:", err);
      setError("Failed to load vocabularies. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, selectedLevel]);

  useEffect(() => {
    fetchVocabularies();
  }, [fetchVocabularies]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);

    // Debounce search
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setCurrentPage(1);
    }, 300);
  };

  const handleLevelChange = (level: HskLevel | undefined) => {
    setSelectedLevel(level);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="container mx-auto">
      {/* Search Section */}
      <div className="box-search-chinese-container flex justify-center items-center py-4">
        <div className="box-search-chinese rounded-lg w-full max-w-2xl">
          <Input
            type="text"
            placeholder="Search for a Chinese word"
            className="w-full"
            defaultValue={search}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* Level Filter */}
      <div className="flex justify-center items-center gap-2 flex-wrap pb-6">
        {HSK_LEVELS.map((level) => (
          <button
            key={level.label}
            onClick={() => handleLevelChange(level.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedLevel === level.value
                ? "bg-blue-500 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1  lg:grid-cols-5 gap-4">
        <div className="col-span-4">
          
      {/* Error Message */}
      {error && (
        <div className="text-center pb-4">
          <p className="text-red-500">{error}</p>
          <button
            onClick={fetchVocabularies}
            className="mt-2 text-blue-500 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vocabularies.map((vocab) => (
          <ChineseCard
            key={vocab.id}
            chinese={vocab.chinese}
            pinyin={vocab.pinyin}
            vietnameseMeaning={vocab.vietnameseMeaning}
            exampleSentence={vocab.exampleSentence}
            exampleMeaning={vocab.exampleMeaning}
          />
        ))}
      </div>

      {/* Empty State */}
      {!isLoading && vocabularies.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            No vocabularies found. Try adjusting your search or filter.
          </p>
        </div>
      )}

        </div>
        <div className="col-span-1">
          <Advertisement />
        </div>
      </div>

     
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 py-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                const distance = Math.abs(page - currentPage);
                return distance <= 2 || page === 1 || page === totalPages;
              })
              .map((page, index, array) => {
                const prevPage = array[index - 1];
                const showEllipsis = prevPage && page - prevPage > 1;

                return (
                  <span key={page} className="flex items-center">
                    {showEllipsis && (
                      <span className="px-2 text-gray-500">...</span>
                    )}
                    <button
                      onClick={() => handlePageChange(page)}
                      className={`w-10 h-10 rounded-lg ${
                        currentPage === page
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {page}
                    </button>
                  </span>
                );
              })}
          </div>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default Page;
