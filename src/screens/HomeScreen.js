import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Button, StyleSheet, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import * as Notifications from 'expo-notifications';
import { Picker } from '@react-native-picker/picker';
import { auth } from '../services/firebaseConfig'; // Importa auth desde firebaseConfig
import { useNavigation } from '@react-navigation/native'; // Para redirigir al usuario

// Configurar el manejo de notificaciones
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const HomeScreen = () => {
    const navigation = useNavigation(); // Hook para la navegación
    const [tasks, setTasks] = useState([]);
    const [completedTasks, setCompletedTasks] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [newTask, setNewTask] = useState({ title: '', description: '', date: new Date(), category: 'Personal', priority: 'Media' });
    const [editTask, setEditTask] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCalendar, setShowCalendar] = useState(false);
    const [selectedDateTasks, setSelectedDateTasks] = useState([]);
    const [showCompletedTasks, setShowCompletedTasks] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Todas');

    // Verificar si el usuario está autenticado
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((user) => {
            if (!user) {
                // Si no hay usuario autenticado, redirigir a la pantalla de inicio de sesión
                navigation.navigate('Login');
            }
        });

        // Limpiar el listener al desmontar el componente
        return unsubscribe;
    }, [navigation]);

    // Categorías disponibles
    const categories = ['Todas', 'Personal', 'Escuela', 'Trabajo', 'Otros'];

    // Prioridades disponibles
    const priorities = [
        { label: 'Baja', value: 'Baja', color: 'green' },
        { label: 'Media', value: 'Media', color: 'orange' },
        { label: 'Alta', value: 'Alta', color: 'red' },
    ];

    // Solicitar permisos para notificaciones al cargar la aplicación
    useEffect(() => {
        (async () => {
            const { status } = await Notifications.requestPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permisos', 'Necesitas habilitar las notificaciones para recibir recordatorios.');
            }
        })();
    }, []);

    // Función para programar una notificación
    const scheduleNotification = async (task) => {
        const notificationDate = new Date(task.date);
        notificationDate.setDate(notificationDate.getDate() - 1); // Un día antes de la fecha de entrega

        await Notifications.scheduleNotificationAsync({
            content: {
                title: 'Recordatorio de Tarea',
                body: `No olvides completar: ${task.title}`,
                sound: true,
            },
            trigger: notificationDate, // Fecha y hora de la notificación
        });
    };

    // Función para agregar una tarea
    const addTask = async () => {
        if (!newTask.title.trim() || !newTask.description.trim()) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }
        const task = { ...newTask, id: Date.now() }; // Agregar un ID único
        setTasks([...tasks, task]);
        setModalVisible(false);
        setNewTask({ title: '', description: '', date: new Date(), category: 'Personal', priority: 'Media' });

        // Programar una notificación para la nueva tarea
        await scheduleNotification(task);
    };

    // Función para editar una tarea
    const updateTask = () => {
        if (!editTask.title.trim() || !editTask.description.trim()) {
            Alert.alert('Error', 'Por favor, completa todos los campos.');
            return;
        }
        const updatedTasks = tasks.map(task =>
            task.id === editTask.id ? { ...editTask } : task
        );
        setTasks(updatedTasks);
        setEditModalVisible(false);
        setEditTask(null);
    };

    // Función para abrir el modal de edición
    const openEditModal = (task) => {
        setEditTask(task);
        setEditModalVisible(true);
    };

    // Función para confirmar la finalización de una tarea
    const confirmTaskCompletion = (index) => {
        Alert.alert(
            'Confirmar',
            '¿Has completado esta tarea?',
            [
                {
                    text: 'No',
                    style: 'cancel',
                },
                {
                    text: 'Sí',
                    onPress: () => completeTask(index),
                },
            ],
            { cancelable: true }
        );
    };

    // Función para marcar una tarea como completada
    const completeTask = (index) => {
        const taskToComplete = tasks[index];
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
        setCompletedTasks([...completedTasks, { ...taskToComplete, completedDate: new Date() }]);

        // Eliminar la tarea completada después de 15 días
        setTimeout(() => {
            setCompletedTasks((prevCompletedTasks) =>
                prevCompletedTasks.filter((task) => task !== taskToComplete)
            );
        }, 15 * 24 * 60 * 60 * 1000); // 15 días en milisegundos
    };

    // Función para eliminar una tarea
    const deleteTask = (index) => {
        const newTasks = tasks.filter((_, i) => i !== index);
        setTasks(newTasks);
    };

    // Función para obtener los días con tareas
    const getMarkedDates = () => {
        const markedDates = {};
        tasks.forEach(task => {
            const dateString = task.date.toISOString().split('T')[0];
            if (markedDates[dateString]) {
                markedDates[dateString].dots.push({ color: 'red' });
            } else {
                markedDates[dateString] = { 
                    marked: true,
                    dots: [{ color: 'red' }],
                    selected: true,
                    selectedColor: '#FFD700', // Color de fondo para días con tareas
                };
            }
        });
        return markedDates;
    };

    // Función para manejar el clic en un día del calendario
    const handleDayPress = (day) => {
        const tasksForDay = tasks.filter(task => {
            const taskDate = task.date.toISOString().split('T')[0];
            return taskDate === day.dateString;
        });
        setSelectedDateTasks(tasksForDay);
    };

    // Función para filtrar tareas según el texto de búsqueda y la categoría
    const filteredTasks = tasks.filter(task => {
        const taskText = task.title.toLowerCase() + ' ' + task.description.toLowerCase();
        const matchesSearch = taskText.includes(searchText.toLowerCase());
        const matchesCategory = selectedCategory === 'Todas' || task.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    // Función para ordenar las tareas por prioridad
    const sortTasksByPriority = (tasks) => {
        const priorityOrder = { Alta: 3, Media: 2, Baja: 1 };
        return tasks.sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority]);
    };

    return (
        <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setShowCompletedTasks(false)}
                >
                    <Ionicons name="list" size={24} color={!showCompletedTasks ? '#6200ee' : '#666'} />
                    <Text style={[styles.headerText, !showCompletedTasks && styles.activeHeaderText]}>
                        Mis Tareas
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setShowCompletedTasks(true)}
                >
                    <Ionicons name="checkmark-done" size={24} color={showCompletedTasks ? '#6200ee' : '#666'} />
                    <Text style={[styles.headerText, showCompletedTasks && styles.activeHeaderText]}>
                        Completadas
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Selector de categorías */}
            {!showCompletedTasks && (
                <View style={styles.categoryPicker}>
                    <Text style={styles.label}>Categoría:</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={selectedCategory}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedCategory(itemValue)}
                        >
                            {categories.map((category, index) => (
                                <Picker.Item key={index} label={category} value={category} />
                            ))}
                        </Picker>
                    </View>
                </View>
            )}

            {/* Campo de búsqueda */}
            {!showCompletedTasks && (
                <TextInput
                    style={styles.searchInput}
                    placeholder="Buscar tareas..."
                    value={searchText}
                    onChangeText={setSearchText}
                />
            )}

            {/* Lista de Tareas */}
            {showCompletedTasks ? (
                <FlatList
                    data={completedTasks}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item }) => (
                        <View style={styles.taskItem}>
                            <Ionicons name="checkbox-outline" size={24} color="green" />
                            <View style={styles.taskDetails}>
                                <Text style={styles.taskTitle}>{item.title}</Text>
                                <Text>{item.description}</Text>
                                <Text>Categoría: {item.category}</Text>
                                <Text>Prioridad: {item.priority}</Text>
                                <Text>Completada el: {item.completedDate.toLocaleDateString()}</Text>
                            </View>
                        </View>
                    )}
                />
            ) : (
                <FlatList
                    data={sortTasksByPriority(filteredTasks)}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => (
                        <View style={styles.taskItem}>
                            <TouchableOpacity onPress={() => confirmTaskCompletion(index)}>
                                <Ionicons
                                    name="square-outline"
                                    size={24}
                                    color="black"
                                />
                            </TouchableOpacity>
                            <View style={styles.taskDetails}>
                                <Text style={styles.taskTitle}>{item.title}</Text>
                                <Text>{item.description}</Text>
                                <Text>Categoría: {item.category}</Text>
                                <Text style={{ color: priorities.find(p => p.value === item.priority)?.color }}>
                                    Prioridad: {item.priority}
                                </Text>
                                <Text>Entrega: {item.date.toLocaleDateString()}</Text>
                                <TouchableOpacity onPress={() => openEditModal(item)}>
                                    <Ionicons name="create-outline" size={20} color="#6200ee" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                />
            )}

            {/* Barra Inferior */}
            <View style={styles.bottomBar}>
                <TouchableOpacity onPress={() => setShowCalendar(!showCalendar)}>
                    <Ionicons name="calendar" size={30} color="black" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <Ionicons name="add-circle" size={50} color="black" />
                </TouchableOpacity>
                <Ionicons name="person" size={30} color="black" />
            </View>

            {/* Calendario */}
            {showCalendar && (
                <View style={styles.calendarContainer}>
                    <Calendar
                        markedDates={getMarkedDates()}
                        markingType="multi-dot"
                        onDayPress={handleDayPress}
                        theme={{
                            calendarBackground: '#fff',
                            todayTextColor: 'blue',
                            selectedDayBackgroundColor: 'blue',
                            selectedDayTextColor: 'white',
                        }}
                    />
                    {/* Mostrar tareas del día seleccionado */}
                    {selectedDateTasks.length > 0 && (
                        <View style={styles.tasksForDayContainer}>
                            <Text style={styles.tasksForDayTitle}>Tareas para el día:</Text>
                            {selectedDateTasks.map((task, index) => (
                                <View key={index} style={styles.taskForDay}>
                                    <Text style={styles.taskForDayTitle}>{task.title}</Text>
                                    <Text>{task.description}</Text>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            )}

            {/* Modal para Agregar Tarea */}
            <Modal visible={modalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Agregar Nueva Tarea</Text>
                        <Text style={styles.label}>Título de la Tarea:</Text>
                        <TextInput
                            placeholder="Ej. Matemáticas"
                            value={newTask.title}
                            onChangeText={(text) => setNewTask({ ...newTask, title: text })}
                            style={styles.input}
                        />
                        <Text style={styles.label}>Descripción:</Text>
                        <TextInput
                            placeholder="Ej. Hacer página 15 y 16"
                            value={newTask.description}
                            onChangeText={(text) => setNewTask({ ...newTask, description: text })}
                            style={styles.input}
                        />
                        <Text style={styles.label}>Categoría:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={newTask.category}
                                style={styles.picker}
                                onValueChange={(itemValue) => setNewTask({ ...newTask, category: itemValue })}
                            >
                                {categories.slice(1).map((category, index) => (
                                    <Picker.Item key={index} label={category} value={category} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Prioridad:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={newTask.priority}
                                style={styles.picker}
                                onValueChange={(itemValue) => setNewTask({ ...newTask, priority: itemValue })}
                            >
                                {priorities.map((priority, index) => (
                                    <Picker.Item key={index} label={priority.label} value={priority.value} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Fecha de Entrega:</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color="black" />
                            <Text style={styles.dateText}>
                                {newTask.date.toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={newTask.date}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setNewTask({ ...newTask, date: selectedDate });
                                }}
                            />
                        )}
                        <View style={styles.modalButtons}>
                            <Button title="Guardar" onPress={addTask} />
                            <Button title="Cancelar" onPress={() => setModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>

            {/* Modal para Editar Tarea */}
            <Modal visible={editModalVisible} transparent={true} animationType="slide">
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Editar Tarea</Text>
                        <Text style={styles.label}>Título de la Tarea:</Text>
                        <TextInput
                            placeholder="Ej. Matemáticas"
                            value={editTask?.title || ''}
                            onChangeText={(text) => setEditTask({ ...editTask, title: text })}
                            style={styles.input}
                        />
                        <Text style={styles.label}>Descripción:</Text>
                        <TextInput
                            placeholder="Ej. Hacer página 15 y 16"
                            value={editTask?.description || ''}
                            onChangeText={(text) => setEditTask({ ...editTask, description: text })}
                            style={styles.input}
                        />
                        <Text style={styles.label}>Categoría:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={editTask?.category || 'Personal'}
                                style={styles.picker}
                                onValueChange={(itemValue) => setEditTask({ ...editTask, category: itemValue })}
                            >
                                {categories.slice(1).map((category, index) => (
                                    <Picker.Item key={index} label={category} value={category} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Prioridad:</Text>
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={editTask?.priority || 'Media'}
                                style={styles.picker}
                                onValueChange={(itemValue) => setEditTask({ ...editTask, priority: itemValue })}
                            >
                                {priorities.map((priority, index) => (
                                    <Picker.Item key={index} label={priority.label} value={priority.value} />
                                ))}
                            </Picker>
                        </View>
                        <Text style={styles.label}>Fecha de Entrega:</Text>
                        <TouchableOpacity
                            style={styles.datePickerButton}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Ionicons name="calendar" size={20} color="black" />
                            <Text style={styles.dateText}>
                                {editTask?.date.toLocaleDateString() || new Date().toLocaleDateString()}
                            </Text>
                        </TouchableOpacity>
                        {showDatePicker && (
                            <DateTimePicker
                                value={editTask?.date || new Date()}
                                mode="date"
                                display="default"
                                onChange={(event, selectedDate) => {
                                    setShowDatePicker(false);
                                    if (selectedDate) setEditTask({ ...editTask, date: selectedDate });
                                }}
                            />
                        )}
                        <View style={styles.modalButtons}>
                            <Button title="Guardar" onPress={updateTask} />
                            <Button title="Cancelar" onPress={() => setEditModalVisible(false)} />
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
        paddingBottom: 10,
    },
    headerButton: {
        alignItems: 'center',
    },
    headerText: {
        fontSize: 16,
        color: '#666',
    },
    activeHeaderText: {
        color: '#6200ee',
        fontWeight: 'bold',
    },
    categoryPicker: {
        marginBottom: 10,
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        marginBottom: 10,
    },
    picker: {
        height: 50,
        width: '100%',
    },
    searchInput: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
    },
    taskItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        marginVertical: 5,
        backgroundColor: '#f2f2f2',
        borderRadius: 10,
    },
    taskDetails: {
        marginLeft: 10,
        flex: 1,
    },
    taskTitle: {
        fontWeight: 'bold',
    },
    bottomBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 15,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        padding: 20,
        borderRadius: 10,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
        textAlign: 'center',
    },
    label: {
        marginBottom: 5,
        fontWeight: 'bold',
    },
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    datePickerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 5,
        padding: 10,
        marginBottom: 15,
    },
    dateText: {
        marginLeft: 10,
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    calendarContainer: {
        marginTop: 20,
        padding: 10,
        backgroundColor: '#fff',
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 5,
    },
    tasksForDayContainer: {
        marginTop: 10,
        padding: 10,
        backgroundColor: '#f9f9f9',
        borderRadius: 5,
    },
    tasksForDayTitle: {
        fontWeight: 'bold',
        marginBottom: 5,
    },
    taskForDay: {
        marginBottom: 10,
    },
    taskForDayTitle: {
        fontWeight: 'bold',
    },
});

export default HomeScreen;