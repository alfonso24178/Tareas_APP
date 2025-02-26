import React, { useState } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, database } from '../services/firebaseConfig';
import { ref, set } from 'firebase/database';

const SignUpScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { colors } = useTheme();

  const handleSignUp = async () => {
    if (!email || !password || !name) {
      alert('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await set(ref(database, `users/${user.uid}`), {
        name: name,
        email: email,
      });
      alert('Usuario registrado correctamente.');
      navigation.navigate('Login');
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Image
        source={require('../assets/logo.png')} // Cambia por la ruta de tu logo
        style={styles.logo}
      />
      <Text style={[styles.title, { color: colors.text }]}>Registro</Text>
      <TextInput
        label="Nombre"
        value={name}
        onChangeText={setName}
        style={[styles.input, { backgroundColor: colors.surface }]}
        mode="outlined"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={[styles.input, { backgroundColor: colors.surface }]}
        mode="outlined"
        keyboardType="email-address"
        autoCapitalize="none"
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
      />
      <TextInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        style={[styles.input, { backgroundColor: colors.surface }]}
        mode="outlined"
        secureTextEntry
        outlineColor={colors.primary}
        activeOutlineColor={colors.primary}
        textColor={colors.text}
      />
      <Button
        mode="contained"
        onPress={handleSignUp}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        Registrarse
      </Button>
      <Text style={[styles.signUpText, { color: colors.text }]}>¿Ya tienes una cuenta?</Text>
      <Button
        mode="text"
        onPress={() => navigation.navigate('Login')}
        style={styles.button}
      >
        Inicia sesión
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
  },
  logo: {
    width: 150,
    height: 150,
    alignSelf: 'center',
    marginBottom: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  signUpText: {
    textAlign: 'center',
    marginTop: 16,
  },
});

export default SignUpScreen;