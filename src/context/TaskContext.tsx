// src/context/TaskContext.tsx
import React, { createContext, useState } from 'react';
import { scheduleNotification } from '../services/notificationService';

export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  dueDate: Date;
}

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Task) => void;
  editTask: (id: string, updatedTask: Task) => void;
  deleteTask: (id: string) => void;
}

export const TaskContext = createContext<TaskContextType>({
  tasks: [],
  addTask: () => {},
  editTask: () => {},
  deleteTask: () => {},
});

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  const addTask = (task: Task) => {
    const updatedTasks = [...tasks, task].sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    setTasks(updatedTasks);
    scheduleNotification(task); // Programa una notificación para la nueva tarea
  };

  const editTask = (id: string, updatedTask: Task) => {
    const updatedTasks = tasks
      .map((task) => (task.id === id ? updatedTask : task))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
    setTasks(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
  };

  return (
    <TaskContext.Provider value={{ tasks, addTask, editTask, deleteTask }}>
      {children}
    </TaskContext.Provider>
  );
};