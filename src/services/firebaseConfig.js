// src/services/firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyACR0VbEj2S_Qlf3CrDJLzyuX-9ED9d6yA",
    authDomain: "proyecto1-414de.firebaseapp.com",
    databaseURL: "https://proyecto1-414de-default-rtdb.firebaseio.com",
    projectId: "proyecto1-414de",
    storageBucket: "proyecto1-414de.firebasestorage.app",
    messagingSenderId: "197817200582",
    appId: "1:197817200582:web:e11fcd2fb0913a02f4ccc7",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const firestore = getFirestore(app);

// Obtener las tareas del usuario actual
export const getTasks = async (userId) => {
    try {
        const tasksRef = collection(firestore, 'tasks');
        const q = query(tasksRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error('Error getting tasks:', error);
        return [];
    }
};

// Agregar una tarea para el usuario actual
export const addTask = async (task, userId) => {
    try {
        await addDoc(collection(firestore, 'tasks'), {
            ...task,
            userId: userId, // Asociar la tarea al usuario
        });
        console.log('Task added to Firestore');
    } catch (error) {
        console.error('Error adding task:', error);
    }
};

// Actualizar una tarea
export const updateTask = async (id, task) => {
    try {
        await updateDoc(doc(firestore, 'tasks', id), task);
        console.log('Task updated in Firestore');
    } catch (error) {
        console.error('Error updating task:', error);
    }
};

// Eliminar una tarea
export const deleteTask = async (id) => {
    try {
        await deleteDoc(doc(firestore, 'tasks', id));
        console.log('Task deleted from Firestore');
    } catch (error) {
        console.error('Error deleting task:', error);
    }
};