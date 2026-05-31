import React, { useState } from 'react';
import { StyleSheet, SafeAreaView, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import Navbar from './src/components/Navbar';
import DrawerMenu from './src/components/DrawerMenu';
import BottomBar from './src/components/BottomBar';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import DonationScreen from './src/screens/DonationScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import AboutScreen from './src/screens/AboutScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import ExploreScreen from './src/screens/ExploreScreen';

function AppContent() {
  const { theme } = useTheme();
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [exploreSearch, setExploreSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    setScreen('home');
    setActiveTab('home');
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'explore') { setExploreSearch(''); setScreen('explore'); }
    if (tab === 'donate') setScreen('donation');
  };

  // Telas sem BottomBar
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

  if (screen === 'profile') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
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
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <ProductDetailScreen onBack={() => setScreen('profile')} product={selectedProduct} />
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

  // Tela principal com BottomBar
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {screen !== 'explore' && screen !== 'donation' && (
        <Navbar
          user={user}
          onLogin={() => setScreen('login')}
          onLogout={() => setUser(null)}
          onSearch={(q) => { setExploreSearch(q); setScreen('explore'); setActiveTab('explore'); }}
        />
      )}
      <View style={styles.content}>
        {screen === 'explore' ? (
          <ExploreScreen initialSearch={exploreSearch} />
        ) : screen === 'donation' ? (
          <DonationScreen onBack={() => { setScreen('home'); setActiveTab('home'); }} />
        ) : (
          <HomeScreen onDonate={() => setScreen('donation')} />
        )}
      </View>
      <BottomBar
        activeTab={activeTab}
        onTabPress={handleTabPress}
        onMenuOpen={() => setDrawerOpen(true)}
      />
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
  content: { flex: 1 },
});
