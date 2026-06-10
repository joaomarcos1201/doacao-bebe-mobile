import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Telas ativas
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonationScreen from './src/screens/DonationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';
import ChatScreen from './src/screens/ChatScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

// Telas preservadas (ocultas da navegação principal)
// import ExploreScreen from './src/screens/ExploreScreen';

// Componentes preservados (ocultos da navegação principal)
// import Navbar from './src/components/Navbar';
// import BottomBar from './src/components/BottomBar';
// import DrawerMenu from './src/components/DrawerMenu';

function AppContent() {
  const { theme } = useTheme();
  const [screen, setScreen] = useState('login');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('home');
  };

  const handleNavigate = (key) => {
    setScreen(key);
  };

  const bg = { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' };

  if (screen === 'login') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <LoginScreen
          onBack={() => setScreen('login')}
          onLoginSuccess={handleLoginSuccess}
          onRegister={() => setScreen('register')}
          onForgotPassword={() => {}}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'register') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <RegisterScreen
          onBack={() => setScreen('login')}
          onLoginRedirect={() => setScreen('login')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'donation') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <DonationScreen onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  if (screen === 'profile') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <ProfileScreen
          onBack={() => setScreen('home')}
          user={user}
          onProductPress={(product) => { setSelectedProduct(product); setScreen('productDetail'); }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'productDetail') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <ProductDetailScreen onBack={() => setScreen('profile')} product={selectedProduct} />
      </SafeAreaView>
    );
  }

  if (screen === 'about') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <AboutScreen
          onBack={() => setScreen('home')}
          onDonate={() => setScreen('donation')}
          onViewProducts={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'chat') {
    return (
      <SafeAreaView style={[styles.safe, bg]}>
        <ChatScreen user={user} onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  // Home principal
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      <HomeScreen onNavigate={handleNavigate} />
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
