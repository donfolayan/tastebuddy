import { useState } from 'react';
import { searchYoutubeVideos } from '../services/youtube';

function TestRecipe() {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sample recipe data
  const testRecipe = {
    id: 'test-123',
    title: "Korean BBQ Pork Belly (Samgyeopsal)",
    description: "A delicious Korean BBQ dish featuring grilled pork belly slices served with fresh vegetables and dipping sauces.",
    cookingTime: 30,
    difficultyLevel: "Medium",
    cuisineType: "Korean",
    ingredients: [
      "1 pound pork belly, sliced",
      "Lettuce leaves for wrapping",
      "Garlic cloves",
      "Korean green peppers",
      "Ssamjang (dipping sauce)",
      "Gochujang (red pepper paste)",
      "Sesame oil",
      "Salt and pepper"
    ],
    instructions: [
      "Slice the pork belly into 1/4 inch thick pieces if not pre-sliced",
      "Prepare the lettuce leaves and vegetables for serving",
      "Heat the grill or pan until very hot",
      "Grill the pork belly slices for 3-4 minutes per side until golden brown",
      "Serve with lettuce leaves, vegetables, and dipping sauces",
      "To eat, wrap the pork in lettuce with sauce and vegetables"
    ]
  };

  // Format view count
  const formatViews = (views) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M views`;
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K views`;
    }
    return `${views} views`;
  };

  const searchVideos = async () => {
    setLoading(true);
    try {
      const searchQuery = [
        'how to make',
        testRecipe.title,
        testRecipe.cuisineType === 'Korean' ? 'korean food' : testRecipe.cuisineType,
        'recipe',
        'cooking tutorial'
      ].filter(Boolean).join(' ');
      
      console.log('Searching for videos:', searchQuery);
      const videoResults = await searchYoutubeVideos(searchQuery);
      console.log('Found videos:', videoResults.length);
      
      setVideos(videoResults);
      if (videoResults.length > 0) {
        setSelectedVideo(videoResults[0]);
      }
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-4xl font-bold text-text-primary">{testRecipe.title}</h1>
          <button
            onClick={searchVideos}
            className="bg-secondary-accent hover:bg-secondary-accent-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            Search Videos
          </button>
        </div>
        
        {/* Video Section */}
        <div className="mb-8">
          {loading ? (
            <div className="bg-card rounded-lg p-4 text-text-secondary text-center">
              Loading videos...
            </div>
          ) : selectedVideo ? (
            <div>
              {/* Main Video Player */}
              <div className="bg-black rounded-lg overflow-hidden shadow-lg mb-4">
                <div style={{ position: 'relative', paddingTop: '56.25%' }}>
                  <iframe
                    src={`https://www.youtube.com/embed/${selectedVideo.id}?rel=0&modestbranding=1`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none'
                    }}
                  ></iframe>
                </div>
              </div>

              {/* Video Info */}
              <div className="mb-4 p-4 bg-card rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-text-primary font-semibold mb-2">{selectedVideo.title}</h3>
                    <p className="text-text-secondary text-sm">
                      {selectedVideo.channelTitle} • {formatViews(selectedVideo.viewCount)}
                    </p>
                  </div>
                  <a
                    href={`https://www.youtube.com/watch?v=${selectedVideo.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-secondary-accent hover:bg-secondary-accent-dark text-white px-4 py-2 rounded-lg transition-colors text-sm"
                  >
                    Watch on YouTube
                  </a>
                </div>
              </div>

              {/* Video Selection */}
              {videos.length > 1 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {videos.map((video) => (
                    <button
                      key={video.id}
                      onClick={() => setSelectedVideo(video)}
                      className={`p-2 rounded-lg transition-colors ${
                        selectedVideo.id === video.id
                          ? 'bg-card-hover ring-2 ring-secondary-accent'
                          : 'bg-card hover:bg-card-hover'
                      }`}
                    >
                      <div className="relative">
                        <img
                          src={video.thumbnail.url}
                          alt={video.title}
                          className="w-full rounded mb-1"
                        />
                        <div className="absolute bottom-1 right-1 bg-black bg-opacity-80 text-white text-xs px-1 rounded">
                          {formatViews(video.viewCount)}
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-xs text-text-primary line-clamp-2 mb-1">
                          {video.title}
                        </p>
                        <p className="text-xs text-text-secondary">
                          {video.channelTitle}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="bg-card rounded-lg p-4 text-text-secondary text-center">
              Click "Search Videos" to load videos
            </div>
          )}
        </div>
        
        {/* Recipe Content */}
        <div className="bg-card rounded-lg p-8 space-y-8 shadow-lg">
          <p className="text-text-secondary">{testRecipe.description}</p>
          
          <div className="grid grid-cols-3 gap-4 mb-6 text-sm text-text-secondary">
            <div>
              <span className="font-semibold text-text-primary">Cooking Time:</span> {testRecipe.cookingTime} mins
            </div>
            <div>
              <span className="font-semibold text-text-primary">Difficulty:</span> {testRecipe.difficultyLevel}
            </div>
            <div>
              <span className="font-semibold text-text-primary">Cuisine:</span> {testRecipe.cuisineType}
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2 text-text-primary">Ingredients</h2>
            <ul className="list-disc list-inside space-y-1 text-text-secondary">
              {testRecipe.ingredients.map((ingredient, index) => (
                <li key={index}>{ingredient}</li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2 text-text-primary">Instructions</h2>
            <ol className="list-decimal list-inside space-y-2 text-text-secondary">
              {testRecipe.instructions.map((step, index) => (
                <li key={index} className="pl-2">{step}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestRecipe; 