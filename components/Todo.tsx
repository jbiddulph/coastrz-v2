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
    <div className="max-w-3xl mx-auto p-4">
      <div className="bg-neutral rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-6 text-secondary font-cooper-std">Todo List</h1>
        
        <form onSubmit={addTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new todo..."
              className="flex-1 px-4 py-2 bg-bg-main border border-secondary-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-secondary placeholder-secondary-light"
            />
            <button 
              type="submit" 
              className="px-6 py-2 bg-primary text-neutral rounded-lg hover:bg-hover-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-colors"
            >
              Add
            </button>
          </div>
        </form>

        <ul className="space-y-3">
          {todos.map((todo) => (
            <li
              key={todo.id}
              className="flex justify-between items-center p-4 bg-bg-main rounded-lg hover:bg-primary-light transition-colors"
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  className="w-5 h-5 text-primary border-secondary-border rounded focus:ring-primary"
                />
                <span className={`text-secondary ${todo.completed ? 'line-through text-secondary-light' : ''}`}>
                  {todo.title}
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                className="px-4 py-2 text-sm bg-danger text-neutral rounded-lg hover:bg-hover-danger focus:outline-none focus:ring-2 focus:ring-danger focus:ring-offset-2 transition-colors"
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