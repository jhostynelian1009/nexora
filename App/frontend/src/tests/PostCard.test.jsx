// Ref: RNF-007, B-013, B-019
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { PostCard } from '../components/PostCard';
import { AuthProvider } from '../context/AuthContext';
import { vi } from 'vitest';

const mockPost = {
  id: 1,
  content: 'Este es un post de prueba',
  image_url: null,
  created_at: '2026-08-11T00:00:00Z',
  likes_count: 5,
  liked_by_me: false,
  author: {
    id: 10,
    name: 'Ana Torres',
    career: 'Software',
    avatar_url: null
  },
  comments: []
};

describe('PostCard', () => {
  it('renders post content and handles like toggle', () => {
    const handleToggleLike = vi.fn();
    const handleAddComment = vi.fn();
    const handleDeletePost = vi.fn();

    render(
      <MemoryRouter>
        <AuthProvider>
          <PostCard
            post={mockPost}
            onToggleLike={handleToggleLike}
            onAddComment={handleAddComment}
            onDeletePost={handleDeletePost}
          />
        </AuthProvider>
      </MemoryRouter>
    );

    expect(screen.getByText('Este es un post de prueba')).toBeInTheDocument();
    expect(screen.getByText('Ana Torres')).toBeInTheDocument();

    const likeButton = screen.getByRole('button', { name: /5 Me gusta/i });
    fireEvent.click(likeButton);

    expect(handleToggleLike).toHaveBeenCalledWith(1);
  });
});
