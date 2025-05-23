
import { NewsStory } from '../types';

export const STORAGE_KEY = 'aiNewsFeedStories_v2'; // Changed key due to new structure

export const isToday = (someDate: Date): boolean => {
  const today = new Date();
  return (
    someDate.getDate() === today.getDate() &&
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

export const isThisWeek = (someDate: Date): boolean => {
  const today = new Date();
  // Make sure 'today' is reset to the current day for consistent week calculation
  const currentDay = new Date();
  const firstDayOfWeek = new Date(currentDay.setDate(currentDay.getDate() - currentDay.getDay() + (currentDay.getDay() === 0 ? -6 : 1))); // Monday as first day
  firstDayOfWeek.setHours(0, 0, 0, 0);
  
  const lastDayOfWeek = new Date(firstDayOfWeek);
  lastDayOfWeek.setDate(lastDayOfWeek.getDate() + 6);
  lastDayOfWeek.setHours(23, 59, 59, 999);

  return someDate >= firstDayOfWeek && someDate <= lastDayOfWeek;
};

export const isThisMonth = (someDate: Date): boolean => {
  const today = new Date();
  return (
    someDate.getMonth() === today.getMonth() &&
    someDate.getFullYear() === today.getFullYear()
  );
};

export const isThisYear = (someDate: Date): boolean => {
  const today = new Date();
  return someDate.getFullYear() === today.getFullYear();
};

export const getUniqueCategories = (stories: Pick<NewsStory, 'category'>[]): string[] => {
  if (!stories || stories.length === 0) return [];
  // Use "General" as a fallback for stories without a category
  const categories = new Set(stories.map(story => story.category || "General"));
  return Array.from(categories).sort();
};
