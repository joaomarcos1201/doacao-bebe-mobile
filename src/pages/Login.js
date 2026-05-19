import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

export default function Login({ navigation, setUser }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert('Atenção', 'Preencha email e senha');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), senha }),
      });

      const data = await response.text();

      if (response.ok) {
        const json = JSON.parse(data);
        await AsyncStorage.setItem('token', json.token);
        setUser({ id: json.id, email: json.email, nome: json.nome, isAdmin: json.isAdmin });
        navigation.replace(json.isAdmin ? 'Admin' : 'Home');
      } else {
        if (data.includes('Conta inativa')) {
          Alert.alert('Conta inativa', 'Sua conta foi desativada. Entre em contato conosco.');
        } else {
          Alert.alert('Erro', data || 'Email ou senha incorretos');
        }
      }
    } catch {
      Alert.alert('Erro', 'Não foi possível conectar ao servidor');
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <View style={styles.header}>
            <Image
              source={require('../../assets/icon.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Além do Positivo</Text>
            <Text style={styles.subtitle}>Faça login para continuar</Text>
          </View>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="seu@email.com"
            placeholderTextColor="#aaa"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Senha</Text>
          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#aaa"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry
          />

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
          </TouchableOpacity>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Cadastro')}>
              <Text style={styles.linkPrimary}>Não tem conta? Cadastre-se</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('RecuperarSenha')}>
              <Text style={styles.linkSecondary}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f5f6' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  card: {
    backgroundColor: '#fff', borderRadius: 20, padding: 32,
    borderWidth: 1, borderColor: '#f0e6e8',
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 20, elevation: 4,
  },
  header: { alignItems: 'center', marginBottom: 28 },
  logo: { width: 64, height: 64, borderRadius: 32, borderWidth: 2, borderColor: '#e8a0a8', marginBottom: 12 },
  title: { fontSize: 22, fontWeight: '700', color: '#2d1518', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#999' },
  label: { fontSize: 13, fontWeight: '600', color: '#555', marginBottom: 6 },
  input: {
    backgroundColor: '#fdf8f8', borderWidth: 1, borderColor: '#e8d0d4',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#333', marginBottom: 16,
  },
  button: {
    backgroundColor: '#c0606a', borderRadius: 10, padding: 14,
    alignItems: 'center', marginTop: 4, marginBottom: 16,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  footer: { borderTopWidth: 1, borderTopColor: '#f0e6e8', paddingTop: 20, alignItems: 'center', gap: 10 },
  linkPrimary: { color: '#c0606a', fontSize: 14, fontWeight: '500' },
  linkSecondary: { color: '#aaa', fontSize: 13 },
});
