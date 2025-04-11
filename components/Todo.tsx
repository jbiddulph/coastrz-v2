import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Todo {
  id: string;
  title: string;
  completed: boolean;
  user_id: string;
}

export default function Todo() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get current user
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchTodos(user.id);
      }
    });
  }, []);

  const fetchTodos = async (uid: string) => {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Error fetching todos');
      return;
    }

    setTodos(data || []);
  };

  const addTodo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim() || !userId) return;

    const { error } = await supabase
      .from('todos')
      .insert([{ 
        title: newTodo.trim(),
        user_id: userId
      }]);

    if (error) {
      toast.error('Error adding todo');
      return;
    }

    toast.success('Todo added!');
    setNewTodo('');
    fetchTodos(userId);
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    if (!userId) return;

    const { error } = await supabase
      .from('todos')
      .update({ completed: !completed })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error updating todo');
      return;
    }

    fetchTodos(userId);
  };

  const deleteTodo = async (id: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) {
      toast.error('Error deleting todo');
      return;
    }

    toast.success('Todo deleted!');
    fetchTodos(userId);
  };

  return (
    <div className="container">
      <div className="card">
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Todo List</h1>
        
        <form onSubmit={addTodo} style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="input"
              style={{ flex: 1 }}
            />
            <button type="submit" className="button">
              Add
            </button>
          </div>
        </form>

        <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="card"
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                margin: '0',
                padding: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="checkbox"
                />
                <span style={{ 
                  textDecoration: todo.completed ? 'line-through' : 'none',
                  color: todo.completed ? '#666' : '#333'
                }}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="button danger"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 