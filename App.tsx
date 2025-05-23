import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { NewsStory, PoliticalBias } from './types';
import { fetchNewsStoriesFromBackend, triggerConfiguredRssIngestion, requestAnalysisForStory } from './services/newsService';
import NewsStoryCard from './components/NewsStoryCard';
import LoadingSpinner from './components/LoadingSpinner';
import {
  isToday,
  isThisWeek,
  isThisMonth,
  isThisYear,
  getUniqueCategories, 
  STORAGE_KEY 
} from './utils/helpers';

const App: React.FC = () => {
  const [allStories, setAllStories] = useState<NewsStory[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isIngesting, setIsIngesting] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<number | null>(null); // Store ID of story being analyzed
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>("All Categories");

  const availableCategories = useMemo(() => getUniqueCategories(allStories.map(s => ({...s, category: s.category || "General"}))), [allStories]);

  const loadStories = useCallback(async (showLoading: boolean = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const fetchedStories = await fetchNewsStoriesFromBackend();
      fetchedStories.sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime());
      setAllStories(fetchedStories);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred while fetching news.");
      console.error(err);
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
      loadStories(true);
  }, [loadStories]);

  const handleRefresh = () => {
    loadStories(true);
  };

  const handleIngestFeeds = async () => {
    setIsIngesting(true);
    setError(null);
    try {
      const result = await triggerConfiguredRssIngestion();
      alert(result.message + (result.count > 0 ? ` ${result.count} new articles added.` : ''));
      loadStories(false); // Refresh story list
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to ingest RSS feeds.");
      console.error(err);
    } finally {
      setIsIngesting(false);
    }
  };

  const handleAnalyzeStory = async (storyId: number) => {
    setIsAnalyzing(storyId);
    setError(null);
    try {
      const updatedStory = await requestAnalysisForStory(storyId);
      setAllStories(prevStories => 
        prevStories.map(s => s.id === storyId ? updatedStory : s)
      );
    } catch (err) {
       setError(err instanceof Error ? err.message : `Failed to analyze story ${storyId}.`);
       console.error(err);
    } finally {
      setIsAnalyzing(null);
    }
  };

  const filteredStories = useMemo(() => {
    if (!selectedCategory || selectedCategory === "All Categories") {
      return allStories;
    }
    return allStories.filter(story => (story.category || "General") === selectedCategory);
  }, [allStories, selectedCategory]);

  const groupedStories = useMemo(() => {
    const today: NewsStory[] = [];
    const thisWeek: NewsStory[] = [];
    const thisMonth: NewsStory[] = [];
    const thisYear: NewsStory[] = [];
    const older: NewsStory[] = [];

    filteredStories.forEach(story => {
      const storyDate = new Date(story.publishedDate);
      if (isToday(storyDate)) today.push(story);
      else if (isThisWeek(storyDate)) thisWeek.push(story);
      else if (isThisMonth(storyDate)) thisMonth.push(story);
      else if (isThisYear(storyDate)) thisYear.push(story);
      else older.push(story);
    });
    return { today, thisWeek, thisMonth, thisYear, older };
  }, [filteredStories]);

  if (isLoading && allStories.length === 0 && !error) {
    return <LoadingSpinner />;
  }

  const renderStoryGroup = (title: string, stories: NewsStory[]) => {
    if (stories.length === 0) return null;
    return (
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-slate-700 mb-6 pb-2 border-b-2 border-slate-300">
          {title}
        </h2>
        <div className="space-y-6">
          {stories.map(story => (
            <NewsStoryCard 
              key={story.id} 
              story={story} 
              onAnalyze={() => handleAnalyzeStory(story.id)}
              isAnalyzing={isAnalyzing === story.id}
            />
          ))}
        </div>
      </section>
    );
  };
  
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col">
      <header className="bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight text-center sm:text-left">
            AI News Feed
          </h1>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <button
              onClick={handleIngestFeeds}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isIngesting || isLoading}
            >
              {isIngesting ? 'Ingesting...' : 'Ingest News Feeds'}
            </button>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              disabled={isLoading}
            >
              {isLoading && allStories.length > 0 ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Refreshing...
                </>
              ) : 'Refresh News'}
            </button>
          </div>
        </div>
        {availableCategories.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium mr-2 text-slate-300">Filter by Category:</span>
              <button
                onClick={() => setSelectedCategory("All Categories")}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  selectedCategory === "All Categories" || !selectedCategory
                    ? 'bg-sky-500 text-white'
                    : 'bg-slate-600 hover:bg-sky-600 text-slate-200'
                }`}
              >
                All Categories
              </button>
              {availableCategories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    selectedCategory === category
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-600 hover:bg-sky-600 text-slate-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        
        {renderStoryGroup("Today", groupedStories.today)}
        {renderStoryGroup("This Week", groupedStories.thisWeek)}
        {renderStoryGroup("This Month", groupedStories.thisMonth)}
        {renderStoryGroup("Earlier This Year", groupedStories.thisYear)}
        {renderStoryGroup("Older News", groupedStories.older)}

        {!isLoading && allStories.length === 0 && !error && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-slate-600">No news stories available.</h2>
            <p className="text-slate-500 mt-2">Try ingesting news feeds or refreshing. Ensure the backend is running.</p>
          </div>
        )}
         {!isLoading && filteredStories.length === 0 && allStories.length > 0 && selectedCategory !== "All Categories" && !error && (
          <div className="text-center py-10">
            <h2 className="text-xl font-semibold text-slate-600">No news stories found for "{selectedCategory}".</h2>
            <p className="text-slate-500 mt-2">Try selecting "All Categories" or refreshing.</p>
          </div>
        )}
      </main>

      <footer className="bg-slate-700 text-slate-300 text-center py-4 shadow-inner mt-auto">
        <p className="text-sm">&copy; {new Date().getFullYear()} AI News Feed. News from RSS, analyzed by AI.</p>
        <p className="text-xs mt-1">Ensure backend server is running. For demonstration purposes only.</p>
      </footer>
    </div>
  );
};
export default App;