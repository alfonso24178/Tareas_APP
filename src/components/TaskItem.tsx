// src/components/TaskItem.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Checkbox, Button } from 'react-native-paper';
import { Task } from '../context/TaskContext';

interface TaskItemProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onToggleStatus: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onEdit, onDelete, onToggleStatus }) => {
  return (
    <View style={styles.container}>
      <Checkbox
        status={task.status === 'completed' ? 'checked' : 'unchecked'}
        onPress={onToggleStatus}
      />
      <View style={styles.taskInfo}>
        <Text style={styles.title}>{task.title}</Text>
        <Text style={styles.description}>{task.description}</Text>
        <Text style={styles.dueDate}>
          Fecha límite: {task.dueDate.toLocaleDateString()}
        </Text>
      </View>
      <Button onPress={onEdit}>Editar</Button>
      <Button onPress={onDelete}>Eliminar</Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  dueDate: {
    fontSize: 12,
    color: '#999',
  },
});

export default TaskItem;