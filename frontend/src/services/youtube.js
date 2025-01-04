const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

export async function searchYoutubeVideos(query, maxResults = 8) {
  try {
    // First, search for videos with more strict parameters
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      new URLSearchParams({
        part: 'snippet',
        q: `${query}`,
        type: 'video',
        maxResults: maxResults * 2, // Request more videos to filter
        key: YOUTUBE_API_KEY,
        relevanceLanguage: 'en',
        videoCategoryId: '26', // Food category
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        videoDefinition: 'high',
        regionCode: 'US',
        safeSearch: 'none',
        order: 'viewCount' // Changed to viewCount for more reliable results
      })
    );
    
    if (!searchResponse.ok) {
      throw new Error('YouTube API search request failed');
    }

    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      return [];
    }

    // Get video details including statistics and status
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      new URLSearchParams({
        part: 'snippet,statistics,status,contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY
      })
    );

    if (!detailsResponse.ok) {
      throw new Error('YouTube API details request failed');
    }

    const detailsData = await detailsResponse.json();

    // Filter and map the response data
    return detailsData.items
      .filter(item => 
        // Only include videos that are:
        item.status.embeddable && // Can be embedded
        item.status.privacyStatus === 'public' && // Are public
        !item.contentDetails.regionRestriction && // No region restrictions
        parseInt(item.statistics.viewCount, 10) > 1000 // Has meaningful views
      )
      .map(item => ({
        id: item.id,
        title: item.snippet.title,
        thumbnail: item.snippet.thumbnails.medium,
        channelTitle: item.snippet.channelTitle,
        description: item.snippet.description,
        viewCount: parseInt(item.statistics.viewCount, 10),
        likeCount: parseInt(item.statistics.likeCount, 10) || 0,
        duration: item.contentDetails.duration
      }))
      .sort((a, b) => b.viewCount - a.viewCount) // Sort by view count
      .slice(0, maxResults); // Limit to requested number of results
  } catch (error) {
    console.error('Error searching YouTube videos:', error);
    throw error;
  }
} 