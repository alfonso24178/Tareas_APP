// src/services/authService.js
export const login = async (email, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email === 'user@example.com' && password === 'password') {
          resolve({ success: true, token: 'fake-token' });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  };