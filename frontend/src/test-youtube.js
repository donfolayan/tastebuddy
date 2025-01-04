import fetch from 'node-fetch';

const YOUTUBE_API_KEY = 'AIzaSyCh3-PxMJYXY_Q42rXdPTeNATMlOyxgkww';

async function testYoutubeSearch(query) {
  try {
    // First, search for videos with more strict parameters
    const searchResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/search?` +
      new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: 5,
        key: YOUTUBE_API_KEY,
        relevanceLanguage: 'en',
        videoCategoryId: '26', // Food category
        videoEmbeddable: 'true',
        videoSyndicated: 'true',
        videoDefinition: 'high',
        regionCode: 'US',
        safeSearch: 'none',
        order: 'viewCount'
      })
    );
    
    const searchData = await searchResponse.json();
    
    if (!searchData.items || searchData.items.length === 0) {
      console.log('No videos found');
      return;
    }

    // Get video details
    const videoIds = searchData.items.map(item => item.id.videoId).join(',');
    const detailsResponse = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?` +
      new URLSearchParams({
        part: 'snippet,statistics,status,contentDetails',
        id: videoIds,
        key: YOUTUBE_API_KEY
      })
    );

    const detailsData = await detailsResponse.json();

    // Process and display results
    const videos = detailsData.items
      .filter(item => 
        item.status.embeddable &&
        item.status.privacyStatus === 'public' &&
        !item.contentDetails.regionRestriction &&
        parseInt(item.statistics.viewCount, 10) > 1000
      )
      .map(item => ({
        id: item.id,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        viewCount: parseInt(item.statistics.viewCount, 10),
        url: `https://www.youtube.com/watch?v=${item.id}`,
        embedUrl: `https://www.youtube.com/embed/${item.id}`
      }));

    console.log('\nSearch Results:');
    videos.forEach((video, index) => {
      console.log(`\n${index + 1}. ${video.title}`);
      console.log(`   Channel: ${video.channelTitle}`);
      console.log(`   Views: ${video.viewCount.toLocaleString()}`);
      console.log(`   Watch URL: ${video.url}`);
      console.log(`   Embed URL: ${video.embedUrl}`);
    });

  } catch (error) {
    console.error('Error:', error);
  }
}

// Test with a sample query
const searchQuery = process.argv[2] || 'how to make korean gochujang pork belly recipe';
console.log(`Searching for: "${searchQuery}"`);
testYoutubeSearch(searchQuery); 