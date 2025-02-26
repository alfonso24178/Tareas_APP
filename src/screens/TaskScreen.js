// src/screens/TaskScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList } from 'react-native';
import { getTasks, addTask } from '../services/firebaseConfig';
import { auth } from '../services/firebaseConfig';

const TaskScreen = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const userId = auth.currentUser?.uid; // Obtener el UID del usuario actual

    // Cargar tareas al iniciar la pantalla
    useEffect(() => {
        if (userId) {
            const loadTasks = async () => {
                const userTasks = await getTasks(userId);
                setTasks(userTasks);
            };
            loadTasks();
        }
    }, [userId]);

    // Agregar una nueva tarea
    const handleAddTask = async () => {
        if (userId) {
            const task = { id: Date.now(), title: newTask, completed: false };
            await addTask(task, userId); // Guardar la tarea en Firestore
            setTasks([...tasks, task]); // Actualizar el estado local
            setNewTask('');
        }
    };

    return (
        <View>
            <TextInput
                placeholder="Nueva tarea"
                value={newTask}
                onChangeText={setNewTask}
            />
            <Button title="Agregar tarea" onPress={handleAddTask} />
            <FlatList
                data={tasks}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <View>
                        <Text>{item.title}</Text>
                    </View>
                )}
            />
        </View>
    );
};

export default TaskScreen;