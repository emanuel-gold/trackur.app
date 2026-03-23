import { useCallback } from 'react';
import { MAX_TODOS } from '../constants.js';

function sortTodos(todos) {
  const uncompleted = todos.filter((t) => !t.completed).sort((a, b) =>
    (a.createdAt || '').localeCompare(b.createdAt || '')
  );
  const completed = todos.filter((t) => t.completed).sort((a, b) =>
    (b.completedAt || '').localeCompare(a.completedAt || '')
  );
  return [...uncompleted, ...completed];
}

export default function useTodos(job, onUpdate) {
  const todos = job?.todos ?? [];

  const setTodos = useCallback(
    (newTodos) => {
      if (!job) return;
      onUpdate(job.id, { todos: sortTodos(newTodos) });
    },
    [job, onUpdate]
  );

  const addTodo = useCallback(
    (text, dueDate = null) => {
      if (!text.trim() || todos.length >= MAX_TODOS) return;
      const newTodo = {
        id: crypto.randomUUID(),
        text: text.trim(),
        dueDate: dueDate || null,
        completed: false,
        completedAt: null,
        createdAt: new Date().toISOString(),
      };
      setTodos([...todos, newTodo]);
    },
    [todos, setTodos]
  );

  const toggleTodo = useCallback(
    (todoId) => {
      setTodos(
        todos.map((t) =>
          t.id === todoId
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? new Date().toISOString() : null,
              }
            : t
        )
      );
    },
    [todos, setTodos]
  );

  const removeTodo = useCallback(
    (todoId) => {
      setTodos(todos.filter((t) => t.id !== todoId));
    },
    [todos, setTodos]
  );

  const updateTodo = useCallback(
    (todoId, updates) => {
      setTodos(
        todos.map((t) => (t.id === todoId ? { ...t, ...updates } : t))
      );
    },
    [todos, setTodos]
  );

  return {
    todos: sortTodos(todos),
    addTodo,
    toggleTodo,
    removeTodo,
    updateTodo,
  };
}
