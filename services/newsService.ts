import { NewsStory } from "../types";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001/api'; // Configure via .env in a real setup
console.log('Frontend attempting to connect to backend at:', BACKEND_URL);

const handleFetchError = (error: any, context: string, url: string): Error => {
    if (error instanceof TypeError && error.message.toLowerCase().includes('failed to fetch')) {
        return new Error(`${context}: Failed to fetch from backend. Please ensure the backend server is running and accessible at ${url.substring(0, url.indexOf('/api') + (url.includes('/api') ? 4 : 0))}. Original error: ${error.message}`);
    }
    if (error instanceof Error) {
        return new Error(`${context}: ${error.message}`);
    }
    return new Error(`${context}: An unknown error occurred.`);
};

export const fetchNewsStoriesFromBackend = async (): Promise<NewsStory[]> => {
  const url = `${BACKEND_URL}/news`;
  try {
    const response = await fetch(url);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to fetch news: ${errorData.message || response.statusText} (status: ${response.status})`);
    }
    const stories: NewsStory[] = await response.json();
    return stories;
  } catch (error) {
    console.error("Error fetching news stories from backend:", error);
    throw handleFetchError(error, "Error fetching news stories from backend", url);
  }
};

export const triggerConfiguredRssIngestion = async (): Promise<{ message: string, count: number }> => {
  const url = `${BACKEND_URL}/news/ingest-feeds`;
  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to trigger RSS ingestion: ${errorData.message || response.statusText} (status: ${response.status})`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error triggering configured RSS ingestion:", error);
    throw handleFetchError(error, "Error triggering configured RSS ingestion", url);
  }
};

export const requestAnalysisForStory = async (storyId: number): Promise<NewsStory> => {
  const url = `${BACKEND_URL}/news/${storyId}/analyze`;
  try {
    const response = await fetch(url, { method: 'POST' });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Failed to request analysis: ${errorData.message || response.statusText} (status: ${response.status})`);
    }
    const updatedStory: NewsStory = await response.json();
    return updatedStory;
  } catch (error) {
    console.error(`Error requesting analysis for story ${storyId}:`, error);
    throw handleFetchError(error, `Error requesting analysis for story ${storyId}`, url);
  }
};