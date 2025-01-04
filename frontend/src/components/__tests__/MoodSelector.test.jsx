import { describe, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MoodSelector from '../MoodSelector';

describe('MoodSelector', () => {
  it('renders all mood options', () => {
    render(<MoodSelector onMoodSelect={() => {}} selectedMood={null} />);
    
    expect(screen.getByText('Happy')).toBeInTheDocument();
    expect(screen.getByText('Stressed')).toBeInTheDocument();
    expect(screen.getByText('Energetic')).toBeInTheDocument();
    expect(screen.getByText('Relaxed')).toBeInTheDocument();
  });

  it('calls onMoodSelect when a mood is clicked', () => {
    const mockOnMoodSelect = vi.fn();
    render(<MoodSelector onMoodSelect={mockOnMoodSelect} selectedMood={null} />);
    
    fireEvent.click(screen.getByText('Happy'));
    expect(mockOnMoodSelect).toHaveBeenCalledWith('Happy');
  });

  it('highlights selected mood', () => {
    render(<MoodSelector selectedMood="Happy" onMoodSelect={() => {}} />);
    
    const selectedButton = screen.getByText('Happy');
    expect(selectedButton).toHaveClass('bg-secondary-accent');
  });
}); 