import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import TaskList from '../../tasks/TaskList';
import { AuthProvider } from '../../portal/Context/AuthContext';
import { ThemeProvider } from '../../context/ThemeContext';

// Mock apiUrl to return relative paths in tests
vi.mock('../../config/api', () => ({
  apiUrl: (path: string) => path.startsWith('/') ? path : `/${path}`,
}));

// Mock fetch
global.fetch = vi.fn();

// Integration Test: Task List Component with Auth Context
describe('Task Flow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    
    // Mock authenticated user
    localStorage.setItem('teamflow_token', 'mock-token');
    localStorage.setItem('teamflow_user', JSON.stringify({
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
    }));
  });

  it('should fetch and display tasks after authentication', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Test Task 1',
        description: 'First task',
        status: 'TODO',
        priority: 'HIGH',
        team_id: null,
        team_name: null,
        assignee_id: null,
        assignee_name: null,
        tags: [],
        due_date: null,
        created_at: '2024-01-15',
      },
      {
        id: 2,
        title: 'Test Task 2',
        description: 'Second task',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        team_id: 1,
        team_name: 'Team A',
        assignee_id: 1,
        assignee_name: 'User 1',
        tags: ['urgent'],
        due_date: '2024-01-20',
        created_at: '2024-01-16',
      },
    ];

    const mockTeams = [
      { id: 1, title: 'Team A' },
    ];

    // Mock fetch to handle multiple calls:
    // 1. AuthProvider refresh call
    // 2. TaskList teams call
    // 3. TaskList tasks call
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/portal/refresh')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
            token: 'mock-token',
          }),
        });
      }
      if (url.includes('/api/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTeams,
        });
      }
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTasks,
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TaskList />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument();
      expect(screen.getByText('Test Task 2')).toBeInTheDocument();
    }, { timeout: 3000 });

    expect(global.fetch).toHaveBeenCalled();
  });

  it('should filter tasks by status', async () => {
    const mockTasks = [
      {
        id: 1,
        title: 'Todo Task',
        description: 'A todo task',
        status: 'TODO',
        priority: 'MEDIUM',
        team_id: null,
        team_name: null,
        assignee_id: null,
        assignee_name: null,
        tags: [],
        due_date: null,
        created_at: '2024-01-15',
      },
      {
        id: 2,
        title: 'Done Task',
        description: 'A done task',
        status: 'DONE',
        priority: 'MEDIUM',
        team_id: null,
        team_name: null,
        assignee_id: null,
        assignee_name: null,
        tags: [],
        due_date: null,
        created_at: '2024-01-15',
      },
    ];

    const mockTeams: any[] = [];

    // Mock fetch to handle multiple calls
    (global.fetch as any).mockImplementation((url: string) => {
      if (url.includes('/api/portal/refresh')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            user: { id: 1, name: 'Test User', email: 'test@example.com' },
            token: 'mock-token',
          }),
        });
      }
      if (url.includes('/api/teams')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTeams,
        });
      }
      if (url.includes('/api/tasks')) {
        return Promise.resolve({
          ok: true,
          json: async () => mockTasks,
        });
      }
      return Promise.reject(new Error(`Unhandled URL: ${url}`));
    });

    render(
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <TaskList />
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getAllByText('Todo Task').length).toBeGreaterThan(0);
    }, { timeout: 3000 });

    // Find the "Done" filter button (it shows "Done (1)")
    const doneFilter = screen.getByText(/Done \(/i);
    fireEvent.click(doneFilter);

    await waitFor(() => {
      // After filtering, only Done Task should be visible
      expect(screen.getAllByText('Done Task').length).toBeGreaterThan(0);
      // Todo Task should not be visible in the filtered view
      const todoTasks = screen.queryAllByText('Todo Task');
      // Filter out any that might be in buttons or other UI elements
      const visibleTodoTasks = todoTasks.filter(el => {
        const parent = el.closest('[class*="border"]');
        return parent && parent.textContent?.includes('Todo Task');
      });
      expect(visibleTodoTasks.length).toBe(0);
    }, { timeout: 3000 });
  });
});

