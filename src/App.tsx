import { useState } from "react";
import "./App.css";
import { generateText } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";

const App = () => {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [finalAnswer, setFinalAnswer] = useState({
    summary: "",
    relatedSearches: [
      "tell me something about procedure technologies",
      "please give information about last9",
    ] as string[],
  });

  const google = createGoogleGenerativeAI({
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
  });

  const getWebsiteData = async () => {
    const myHeaders = new Headers();
    myHeaders.append("X-API-KEY", import.meta.env.VITE_SERP_API_KEY);
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      q: query,
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow" as RequestRedirect,
    };

    try {
      const response = await fetch(
        "https://google.serper.dev/search",
        requestOptions
      );
      const result = await response.json();
      return result;
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = async () => {
    if (query.trim()) {
      setIsSearching(true);
      const websiteResp = await getWebsiteData();
      const organicResults = websiteResp.organic;
      console.log(organicResults, "resp");
      const responseJoin = organicResults
        .map((result: { title: string; link: string; snippet: string }) => ({
          title: result.title,
          link: result.link,
          snippet: result.snippet,
        }))
        .map(
          (info: { title: string; link: string; snippet: string }) =>
            `Title: ${info.title}\nLink: ${info.link}\nSnippet: ${info.snippet}\n`
        )
        .join("\n");
      // Simulate search process
      console.log(responseJoin, "join");
      // return;

      const { text } = await generateText({
        model: google("gemini-2.5-flash"),
        system:
          "You are a company analysis AI assistant. Your task is to analyze and summarize information about companies/organizations ONLY. If the provided content is NOT about a company, organization, business, or corporate entity, you MUST respond with: 'ERROR: OFF-TOPIC CONTENT - This content does not appear to be about a company or organization. Please provide information about a specific company, business, or organization to analyze.' Do not provide summaries for weather, news, general websites, politics or non-business content.",
        prompt: `Please analyze the following content and provide a company summary if it's about a business/organization, or indicate if it's off-topic: ${responseJoin}`,
      });
      console.log(text, "yeha final answer");
      setFinalAnswer({
        summary: text,
        relatedSearches: websiteResp.relatedSearches
          ? websiteResp.relatedSearches
              .map((item: string | { query: string }) =>
                typeof item === "string" ? item : item.query
              )
              .filter(Boolean)
          : [],
      });
      setIsSearching(false);
      // Here you would typically make an API call
      console.log("Searching for:", query);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleRelatedSearchClick = (searchTerm: string) => {
    setQuery(searchTerm);
  };

  return (
    <div className="app-container">
      {/* Animated background elements */}
      <div className="background-elements">
        <div className="bg-element"></div>
        <div className="bg-element"></div>
        <div className="bg-element"></div>
        <div className="bg-element"></div>
      </div>

      {/* Main container */}
      <div className="main-container">
        {/* Title Section */}
        <div className="title-section">
          <h1 className="main-title">PROLIFIC</h1>
          <p className="subtitle">Your Personal Company Assistant</p>
          <div className="title-underline"></div>
        </div>

        {/* Search Container */}
        <div className="search-container">
          {/* Search Input */}
          <div className="input-group">
            <label htmlFor="search-input" className="input-label">
              ENTER YOUR QUERY
            </label>
            <input
              id="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Please input your query about an organization/company you are looking for..."
              className="search-input"
              disabled={isSearching}
            />
          </div>

          {/* Search Button */}
          <div className="button-container">
            <button
              onClick={handleSearch}
              disabled={!query.trim() || isSearching}
              className="search-button"
            >
              {isSearching ? "SEARCHING..." : "SEARCH"}
            </button>
          </div>

          {/* Status indicator */}
          {isSearching && (
            <div
              className="loading"
              style={{ marginTop: "1.5rem", justifyContent: "center" }}
            >
              <div className="spinner"></div>
              ANALYZING COMPANY DATA...
            </div>
          )}

          {/* Results Section */}
          {(finalAnswer.summary || finalAnswer.relatedSearches.length > 0) && (
            <div className="results-section">
              {/* Summary */}
              {finalAnswer.summary && (
                <div className="summary-container">
                  <h3 className="summary-title">COMPANY ANALYSIS</h3>
                  <div className="summary-content">{finalAnswer.summary}</div>
                </div>
              )}

              {/* Related Searches */}
              {finalAnswer.relatedSearches &&
                finalAnswer.relatedSearches.length > 0 && (
                  <div className="related-searches-container">
                    <h4 className="related-searches-title">RELATED SEARCHES</h4>
                    <div className="tags-container">
                      {finalAnswer.relatedSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => handleRelatedSearchClick(search)}
                          className="search-tag"
                          disabled={isSearching}
                        >
                          {search}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <p className="footer-text">POWERED BY AI • SECURE • FAST</p>
        </div>
      </div>
    </div>
  );
};

export default App;
