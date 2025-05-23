const Parser = require('rss-parser');
const db = require('./database');
require('dotenv').config();

const parser = new Parser();

const RSS_FEEDS_URLS_STRING = process.env.RSS_FEEDS_URLS || 'http://rss.cnn.com/rss/cnn_topstories.rss';

const ingestConfiguredRssFeeds = async () => {
  let totalNewArticlesCount = 0;
  let processedFeedsCount = 0;
  let failedFeedsCount = 0;
  const feedUrls = RSS_FEEDS_URLS_STRING.split(',').map(url => url.trim()).filter(url => url);

  if (feedUrls.length === 0) {
    console.warn("No RSS feed URLs configured in .env file (RSS_FEEDS_URLS).");
    return { message: "No RSS feed URLs configured.", count: 0 };
  }

  console.log(`Starting RSS feed ingestion for ${feedUrls.length} configured feed(s).`);

  for (const feedUrl of feedUrls) {
    let currentFeedNewArticles = 0;
    try {
      console.log(`Fetching RSS feed from: ${feedUrl}`);
      const feed = await parser.parseURL(feedUrl);
      const sourceName = feed.title || feedUrl; // Use URL as fallback for source name

      await Promise.all(feed.items.map(async (item) => {
        const { title, link, contentSnippet, pubDate, categories } = item;
        const summary = contentSnippet ? contentSnippet.substring(0, 300) + (contentSnippet.length > 300 ? '...' : '') : null;
        const publishedDate = pubDate ? new Date(pubDate).toISOString() : new Date().toISOString();
        const category = categories && categories.length > 0 ? (typeof categories[0] === 'string' ? categories[0] : (categories[0]?._ || categories[0]?.term)) : null;


        return new Promise((resolve, reject) => {
          db.get("SELECT id FROM news_articles WHERE link = ?", [link], (err, row) => {
            if (err) {
              console.error(`Error checking for existing article from ${feedUrl}: ${err.message}`);
              return reject(err);
            }
            if (row) {
              return resolve(); 
            }

            const stmt = db.prepare(
              "INSERT INTO news_articles (title, link, summary, sourceName, publishedDate, category) VALUES (?, ?, ?, ?, ?, ?)"
            );
            stmt.run(title, link, summary, sourceName, publishedDate, category, function (err) {
              if (err) {
                console.error(`Error inserting article "${title}" from ${feedUrl}: ${err.message}`);
                if (err.message.includes('UNIQUE constraint failed')) {
                    resolve();
                } else {
                    reject(err);
                }
              } else {
                currentFeedNewArticles++;
                resolve();
              }
            });
            stmt.finalize();
          });
        });
      }));
      
      console.log(`Feed from ${sourceName} processed. ${currentFeedNewArticles} new articles added.`);
      totalNewArticlesCount += currentFeedNewArticles;
      processedFeedsCount++;
    } catch (error) {
      console.error(`Error fetching or parsing RSS feed from ${feedUrl}: ${error.message}`);
      failedFeedsCount++;
    }
  }
  
  const summaryMessage = `RSS feed ingestion complete. Processed ${processedFeedsCount} feed(s). ${failedFeedsCount > 0 ? `${failedFeedsCount} feed(s) failed. ` : ''}${totalNewArticlesCount} total new articles added.`;
  console.log(summaryMessage);
  return { message: summaryMessage, count: totalNewArticlesCount };
};

module.exports = { ingestConfiguredRssFeeds };