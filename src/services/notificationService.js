// src/services/notificationService.js
import * as Notifications from 'expo-notifications';

export const configureNotifications = async () => {
  // Solicita permisos para notificaciones
  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== 'granted') {
    alert('No se otorgaron permisos para notificaciones.');
    return;
  }

  // Configura el manejador de notificaciones
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
};

export const scheduleNotification = async (task) => {
  const { title, dueDate } = task;

  // Programa la notificación
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Recordatorio de tarea',
      body: `La tarea "${title}" vence pronto.`,
    },
    trigger: {
      date: new Date(dueDate.getTime() - 15 * 60000), // 15 minutos antes de la fecha de vencimiento
    },
  });
};