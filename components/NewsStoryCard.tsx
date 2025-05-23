
import React from 'react';
import { NewsStory, PoliticalBias } from '../types';
import BiasIndicator from './BiasIndicator';
import TruthfulnessMeter from './TruthfulnessMeter';
import { InfoIcon, ExternalLinkIcon } from './icons'; // Assuming RepublicanIcon, DemocraticIcon etc. are in BiasIndicator

interface NewsStoryCardProps {
  story: NewsStory;
  onAnalyze: () => void;
  isAnalyzing: boolean;
}

const NewsStoryCard: React.FC<NewsStoryCardProps> = ({ story, onAnalyze, isAnalyzing }) => {
  const formatDate = (isoString?: string) => {
    if (!isoString) return "N/A";
    try {
      const date = new Date(isoString);
      return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return "Invalid Date";
    }
  };

  return (
    <article
      className="bg-white shadow-lg rounded-lg p-6 mb-6 hover:shadow-xl transition-shadow duration-300 relative"
    >
      <header className="mb-4">
        <a
          href={story.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-blue-700 transition-colors duration-200"
          title={`Read full story: "${story.title}" on ${story.sourceName} (opens new tab)`}
        >
          <h2 className="text-2xl font-bold text-slate-800 mb-2 hover:underline">{story.title}</h2>
        </a>
        <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-3 gap-y-1">
          <span className="mr-1">Source:</span>
          <a
            href={story.link} // Could also be a search link for the source if direct link is too specific
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center"
            title={`Visit ${story.sourceName} (opens new tab)`}
          >
            {story.sourceName}
            <ExternalLinkIcon className="w-3 h-3 ml-1" />
          </a>
          {story.category && (
            <>
              <span className="hidden sm:inline">|</span>
              <span>Category: <span className="font-semibold">{story.category}</span></span>
            </>
          )}
          <span className="hidden sm:inline">|</span>
          <span>Published: {formatDate(story.publishedDate)}</span>
        </div>
      </header>
      
      {story.summary && <p className="text-slate-700 mb-4 leading-relaxed">{story.summary}</p>}
      
      <footer className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <div>
          {story.analyzedPoliticalBias && story.analyzedPoliticalBias !== PoliticalBias.UNKNOWN ? (
            <BiasIndicator bias={story.analyzedPoliticalBias} />
          ) : (
            <div className="p-2 rounded-md border border-slate-300 bg-slate-50 text-sm text-slate-600">
              Political bias not yet analyzed.
            </div>
          )}
        </div>
        <div>
          {typeof story.analyzedTruthfulnessScore === 'number' ? (
            <TruthfulnessMeter score={story.analyzedTruthfulnessScore} />
          ) : (
             <div className="p-2 rounded-md border border-slate-300 bg-slate-50 text-sm text-slate-600">
              Truthfulness score not yet available.
            </div>
          )}
        </div>
      </footer>

      {!story.analyzedPoliticalBias && !story.analyzedTruthfulnessScore && (
        <div className="mt-4 text-center">
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze with AI'}
          </button>
        </div>
      )}
       {(story.analyzedPoliticalBias || typeof story.analyzedTruthfulnessScore === 'number') && story.analysisTimestamp && (
         <p className="text-xs text-slate-400 mt-2 text-right">Analyzed: {formatDate(story.analysisTimestamp)}</p>
       )}

      <div className="mt-4 text-xs text-slate-500 flex items-center">
        <InfoIcon className="w-4 h-4 mr-1 flex-shrink-0" />
        <span>News from RSS feeds. AI analysis is performed on article content/summary.</span>
      </div>
    </article>
  );
};

export default NewsStoryCard;
