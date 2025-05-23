const express = require('express');
const cors = require('cors');
const db = require('./database');
const { ingestConfiguredRssFeeds } = require('./rssService');
const { analyzeArticleContent } = require('./geminiAnalyzer');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Middleware to parse JSON bodies

// Get all news articles
app.get('/api/news', (req, res) => {
  db.all("SELECT * FROM news_articles ORDER BY publishedDate DESC", [], (err, rows) => {
    if (err) {
      console.error("Error fetching news:", err.message);
      return res.status(500).json({ error: "Failed to retrieve news articles." });
    }
    // Map to frontend's expected NewsStory structure more closely
    const stories = rows.map(row => ({
        id: row.id,
        title: row.title,
        summary: row.summary,
        link: row.link,
        sourceName: row.sourceName,
        publishedDate: row.publishedDate,
        category: row.category,
        analyzedPoliticalBias: row.analyzedPoliticalBias || 'Unknown',
        analyzedTruthfulnessScore: row.analyzedTruthfulnessScore,
        analysisTimestamp: row.analysisTimestamp
    }));
    res.json(stories);
  });
});

// Trigger ingestion from configured RSS feeds
app.post('/api/news/ingest-feeds', async (req, res) => {
  try {
    const result = await ingestConfiguredRssFeeds();
    res.status(200).json(result);
  } catch (error) {
    console.error("Error during RSS ingestion request:", error.message);
    res.status(500).json({ error: "Failed to ingest RSS feeds.", details: error.message });
  }
});

// Trigger AI analysis for a specific article
app.post('/api/news/:id/analyze', async (req, res) => {
  const { id } = req.params;
  db.get("SELECT id, title, summary, link FROM news_articles WHERE id = ?", [id], async (err, article) => {
    if (err) {
      console.error("Error fetching article for analysis:", err.message);
      return res.status(500).json({ error: "Database error fetching article." });
    }
    if (!article) {
      return res.status(404).json({ error: "Article not found." });
    }

    // Use summary if available and long enough, otherwise title, or a combination.
    // For robust analysis, full text is ideal, but RSS often provides summaries.
    const textToAnalyze = (article.summary && article.summary.length > 100) ? article.summary : `${article.title}. ${article.summary || ''}`;
    
    if (!textToAnalyze.trim()) {
        return res.status(400).json({ error: "Not enough content to analyze." });
    }

    try {
      const analysis = await analyzeArticleContent(textToAnalyze);
      const analysisTimestamp = new Date().toISOString();

      db.run(
        "UPDATE news_articles SET analyzedPoliticalBias = ?, analyzedTruthfulnessScore = ?, analysisTimestamp = ? WHERE id = ?",
        [analysis.politicalBias, analysis.truthfulnessScore, analysisTimestamp, id],
        function (updateErr) {
          if (updateErr) {
            console.error("Error updating article with analysis:", updateErr.message);
            return res.status(500).json({ error: "Failed to save analysis results." });
          }
          // Fetch the updated article to return it
          db.get("SELECT * FROM news_articles WHERE id = ?", [id], (fetchErr, updatedArticleRow) => {
             if (fetchErr || !updatedArticleRow) {
                 return res.status(500).json({ error: "Failed to fetch updated article after analysis." });
             }
             const updatedStory = {
                id: updatedArticleRow.id,
                title: updatedArticleRow.title,
                summary: updatedArticleRow.summary,
                link: updatedArticleRow.link,
                sourceName: updatedArticleRow.sourceName,
                publishedDate: updatedArticleRow.publishedDate,
                category: updatedArticleRow.category,
                analyzedPoliticalBias: updatedArticleRow.analyzedPoliticalBias || 'Unknown',
                analyzedTruthfulnessScore: updatedArticleRow.analyzedTruthfulnessScore,
                analysisTimestamp: updatedArticleRow.analysisTimestamp
            };
            res.json(updatedStory);
          });
        }
      );
    } catch (analysisError) {
      console.error("Error during AI analysis request:", analysisError.message);
      res.status(500).json({ error: "Failed to analyze article.", details: analysisError.message });
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  console.log("Ensure the 'db' directory exists or is created by database.js for SQLite.");
});