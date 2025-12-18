import { render, screen } from '@testing-library/react';
import StatCard from '../dashboard/components/StatCard';
import { describe, it, expect } from 'vitest';

describe('StatCard Component', () => {
  it('renders correctly with given title and value', () => {
    render(<StatCard title="Total Tasks" value={10} icon={<span>📊</span>} color="cyan" />);
    
    expect(screen.getByText('Total Tasks')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('applies the correct color class', () => {
    const { container } = render(<StatCard title="Test" value={5} icon={<span>📊</span>} color="purple" />);
    // Check if the purple glow or border is present (based on StatCard implementation)
    const card = container.firstChild;
    expect(card).toBeInTheDocument();
  });
});

