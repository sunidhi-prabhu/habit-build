import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import '../css/Dashboard.css';

function Dashboard() {
  const [quote, setQuote] = useState({ text: '', author: '' });
  const [category, setCategory] = useState('motivational');
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const categories = ['motivational', 'success', 'happiness', 'mindfulness'];

  const fetchQuote = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/quotes/${category}`);
      setQuote({ text: res.data.text, author: res.data.author });
    } catch (err) {
      console.error(err);
    }
  };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/tasks`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      const today = new Date().setHours(0, 0, 0, 0);
      const updatedTasks = res.data.map(task => {
        const taskDate = new Date(task.date).setHours(0, 0, 0, 0);
        if (taskDate < today && task.completed) {
          // Reset completed status for tasks from previous days
          axios.put(
            `${API_URL}/api/tasks/${task._id}`,
            { completed: false },
            { headers: { 'x-auth-token': localStorage.getItem('token') } }
          );
          return { ...task, completed: false };
        }
        return task;
      });
      setTasks(updatedTasks);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${API_URL}/api/tasks`,
        { description: task },
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setTasks([...tasks, res.data]);
      setTask('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleTask = async (id) => {
    try {
      const res = await axios.put(
        `${API_URL}/api/tasks/${id}`,
        {},
        { headers: { 'x-auth-token': localStorage.getItem('token') } }
      );
      setTasks(tasks.map(task => (task._id === id ? res.data : task)));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    fetchQuote();
    fetchTasks();
  }, [category]);

  const completedTasks = tasks.filter(task => task.completed).length;
  const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

  return (
    <div className="dashboard-container">
      <div className="container">
        <div className="dashboard-header flex justify-between items-center">
          <h1 className="dashboard-title">Habit Build Dashboard</h1>
          <button onClick={handleLogout} className="btn-logout">Logout</button>
        </div>

        <div className="dashboard-grid">
          <motion.div className="quote-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <h2 className="quote-title">Daily Inspiration</h2>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="quote-select"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
              ))}
            </select>
            <button onClick={fetchQuote} className="btn-new-quote">New Quote</button>
            <motion.p
              className="quote-text"
              key={quote.text}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {quote.text}
            </motion.p>
            <p className="quote-author">— {quote.author}</p>
          </motion.div>

          <div>
            <motion.div className="task-section fade-in">
              <h2 className="task-title">Add Task</h2>
              <form onSubmit={handleAddTask} className="task-form">
                <input
                  type="text"
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Enter your task"
                  className="task-input"
                />
                <button type="submit" className="btn-add-task">Add Task</button>
              </form>
            </motion.div>

            <motion.div className="task-section fade-in">
              <h2 className="task-list-title">Your Tasks</h2>
              <div className="progress-tracker">
                <p className="progress-text">{completedTasks}/{tasks.length} Tasks Completed</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
              {tasks.length === 0 ? (
                <p className="no-tasks">No tasks yet. Add one above!</p>
              ) : (
                <div className="task-grid">
                  {tasks.map(task => (
                    <motion.div
                      key={task._id}
                      className={`task-item ${task.completed ? 'completed' : ''}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task._id)}
                        className="task-checkbox"
                      />
                      <span className={`task-text ${task.completed ? 'completed' : ''}`}>
                        {task.description}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;