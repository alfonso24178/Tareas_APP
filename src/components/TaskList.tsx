// src/components/TaskList.tsx
import React from 'react';
import TaskItem from './TaskItem';
import { Task } from '../context/TaskContext';

interface TaskListProps {
  tasks: Task[];
  onEditTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onToggleTaskStatus: (id: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onEditTask, onDeleteTask, onToggleTaskStatus }) => {
  return (
    <>
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onEdit={() => onEditTask(task.id)}
          onDelete={() => onDeleteTask(task.id)}
          onToggleStatus={() => onToggleTaskStatus(task.id)}
        />
      ))}
    </>
  );
};

export default TaskList;