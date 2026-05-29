import React, { useState } from 'react';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Navbar from './src/components/Navbar';
import DrawerMenu from './src/components/DrawerMenu';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonationScreen from './src/screens/DonationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';

function AppContent() {
  const { theme } = useTheme();
  const [screen, setScreen] = useState('home'); // 'home' | 'login' | 'register' | 'donation' | 'profile' | 'about'
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('home');
  };

  if (screen === 'login') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <LoginScreen
          onBack={() => setScreen('home')}
          onLoginSuccess={handleLoginSuccess}
          onRegister={() => setScreen('register')}
          onForgotPassword={() => {}}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <RegisterScreen
          onBack={() => setScreen('login')}
          onLoginRedirect={() => setScreen('login')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'donation') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <DonationScreen onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  if (screen === 'profile') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <ProfileScreen onBack={() => setScreen('home')} user={user} />
      </SafeAreaView>
    );
  }

  if (screen === 'about') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <AboutScreen
          onBack={() => setScreen('home')}
          onDonate={() => setScreen('donation')}
          onViewProducts={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <Navbar
        user={user}
        onLogin={() => setScreen('login')}
        onLogout={() => setUser(null)}
        onMenuOpen={() => setDrawerOpen(true)}
      />
      <HomeScreen onDonate={() => setScreen('donation')} />
      <DrawerMenu
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        isAdmin={user?.isAdmin}
        onDonate={() => setScreen('donation')}
        onProfile={() => setScreen('profile')}
        onAbout={() => setScreen('about')}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
