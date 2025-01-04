function MoodSelector({ onMoodSelect, selectedMood }) {
  const moods = [
    { id: 'happy', label: 'Happy', emoji: '😊' },
    { id: 'energetic', label: 'Energetic', emoji: '⚡' },
    { id: 'relaxed', label: 'Relaxed', emoji: '😌' },
    { id: 'stressed', label: 'Stressed', emoji: '😓' },
    { id: 'cozy', label: 'Cozy', emoji: '🧸' },
    { id: 'adventurous', label: 'Adventurous', emoji: '🌟' },
  ];

  return (
    <div>
      <h3 className="font-display text-xl mb-4">How are you feeling today?</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {moods.map((mood) => (
          <button
            key={mood.id}
            onClick={() => onMoodSelect(mood.id)}
            className={`
              flex flex-col items-center justify-center p-4 rounded-lg border-2 
              transition-all duration-200
              ${selectedMood === mood.id 
                ? 'border-secondary-accent bg-card text-secondary-accent' 
                : 'border-gray-700 hover:border-secondary-accent hover:bg-card-hover text-text-primary hover:text-secondary-accent'
              }
            `}
          >
            <span className="text-2xl mb-2">{mood.emoji}</span>
            <span className="font-medium">{mood.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export default MoodSelector; 