import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, SafeAreaView, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider } from './src/context/FavoritesContext';
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
import FavoritesScreen from './src/screens/FavoritesScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import SalesScreen from './src/screens/SalesScreen';
import SaleDetailScreen from './src/screens/SaleDetailScreen';
import WalletScreen from './src/screens/WalletScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';

function AppContent() {
  const { theme } = useTheme();
  const { user, loading: authLoading, login, register, logout, hasAnnouncements, sellerLoading, refreshSellerStatus } = useAuth();
  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [exploreSearch, setExploreSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const handleLoginSuccess = async (email, password) => {
    await login(email, password);
    setScreen('home');
    setActiveTab('home');
  };
  const handleSellerFeature = (feature) => {
    if (feature === 'Minhas Vendas') setScreen('sales');
    else if (feature === 'Carteira') setScreen('wallet');
    else Alert.alert('Em breve', 'Esta área será integrada em uma próxima fase.');
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'explore') { setExploreSearch(''); setScreen('explore'); }
    if (tab === 'donate') setScreen('donation');
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={styles.loading}><ActivityIndicator size="large" color={theme.pink} /></View>
      </SafeAreaView>
    );
  }

  if (!user && screen !== 'register') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <LoginScreen
          onRegister={() => setScreen('register')}
          onLoginSuccess={handleLoginSuccess}
          onForgotPassword={() => {}}
        />
      </SafeAreaView>
    );
  }

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
          onRegister={async (...args) => { await register(...args); setScreen('home'); }}
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
          hasAnnouncements={hasAnnouncements}
          sellerLoading={sellerLoading}
          onSellerFeature={handleSellerFeature}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'favorites') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <FavoritesScreen
          onBack={() => setScreen('home')}
          onProductPress={(productId) => { setSelectedProduct(productId); setScreen('productDetail'); }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'orders') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <OrdersScreen
          onBack={() => setScreen('home')}
          onOrderPress={(orderId) => { setSelectedOrder(orderId); setScreen('orderDetail'); }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'orderDetail') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <OrderDetailScreen orderId={selectedOrder} onBack={() => setScreen('orders')} />
      </SafeAreaView>
    );
  }

  if (screen === 'sales') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <SalesScreen
          onBack={() => setScreen('home')}
          onSalePress={(saleId) => { setSelectedSale(saleId); setScreen('saleDetail'); }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'saleDetail') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <SaleDetailScreen saleId={selectedSale} onBack={() => setScreen('sales')} />
      </SafeAreaView>
    );
  }

  if (screen === 'wallet') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <WalletScreen onBack={() => setScreen('home')} />
      </SafeAreaView>
    );
  }

  if (screen === 'productDetail') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
          <ProductDetailScreen onBack={() => setScreen('home')} onBuy={() => setScreen('checkout')} productId={selectedProduct} />
      </SafeAreaView>
    );
  }

  if (screen === 'checkout') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <CheckoutScreen onBack={() => setScreen('productDetail')} productId={selectedProduct} />
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
          onLogout={logout}
          onSearch={(q) => { setExploreSearch(q); setScreen('explore'); setActiveTab('explore'); }}
        />
      )}
      <View style={styles.content}>
        {screen === 'explore' ? (
          <ExploreScreen initialSearch={exploreSearch} onProductPress={(productId) => { setSelectedProduct(productId); setScreen('productDetail'); }} />
        ) : screen === 'donation' ? (
      <DonationScreen onBack={() => { setScreen('home'); setActiveTab('home'); }} onProductCreated={refreshSellerStatus} />
        ) : (
          <HomeScreen onDonate={() => setScreen('donation')} onProductPress={(productId) => { setSelectedProduct(productId); setScreen('productDetail'); }} />
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
        hasAnnouncements={hasAnnouncements}
        sellerLoading={sellerLoading}
        onDonate={() => setScreen('donation')}
        onProfile={() => setScreen('profile')}
        onOrders={() => setScreen('orders')}
        onFavorites={() => setScreen('favorites')}
        onSellerFeature={handleSellerFeature}
        onAbout={() => setScreen('about')}
      />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <FavoritesProvider>
          <AppContent />
        </FavoritesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1 },
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
