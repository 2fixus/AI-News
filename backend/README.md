# AI News Feed - Backend

This Node.js backend serves as the data source and AI analysis engine for the AI News Feed application.

## Features

- Fetches news articles from a configurable list of RSS feeds.
- Stores articles in an SQLite database.
- Uses the Google Gemini API to analyze articles for political bias and truthfulness.
- Provides API endpoints for the frontend to consume news data and trigger analysis.

## Setup

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Environment Variables:**
    Copy the `.env.example` file to a new file named `.env`:
    ```bash
    cp .env.example .env
    ```
    Edit the `.env` file:
    - Add your Google Gemini `API_KEY`.
    - Optionally adjust `DATABASE_URL` and `PORT`.
    - Modify `RSS_FEEDS_URLS` to a comma-separated list of RSS feed URLs you want to use.
    ```
    API_KEY=YOUR_GEMINI_API_KEY_HERE
    DATABASE_URL=./db/newsfeed.sqlite
    PORT=3001
    RSS_FEEDS_URLS=http://rss.cnn.com/rss/cnn_topstories.rss,https://feeds.npr.org/1001/rss.xml,...
    ```

3.  **Initialize Database:**
    The database and its table will be created automatically when the server starts if they don't exist, or you can run:
    ```bash
    npm run init-db
    ```
    This will create the `db` directory and the `newsfeed.sqlite` file with the necessary table structure.

## Running the Backend

-   **Development (with auto-restarting via nodemon):**
    ```bash
    npm run dev
    ```

-   **Production:**
    ```bash
    npm start
    ```

The server will typically start on `http://localhost:3001` (or the port specified in your `.env` file).

## API Endpoints

-   `GET /api/news`: Fetches all news articles.
-   `POST /api/news/ingest-feeds`: Triggers fetching and storing articles from the `RSS_FEEDS_URLS` defined in `.env`.
-   `POST /api/news/:id/analyze`: Triggers AI analysis for a specific news article by its ID.

Make sure this backend is running when using the frontend application.