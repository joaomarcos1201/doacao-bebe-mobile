import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { FavoritesProvider, useFavorites } from './src/context/FavoritesContext';
import AuthGateModal from './src/components/AuthGateModal';
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

// Screens that require authentication
const PROTECTED_SCREENS = ['donation', 'profile', 'favorites', 'orders', 'orderDetail', 'sales', 'saleDetail', 'wallet', 'checkout'];

const ACTION_TYPE_MAP = {
  donation: 'announce',
  favorites: 'favorite',
  checkout: 'buy',
  orders: 'orders',
  profile: 'profile',
};

function AppContent() {
  const { theme } = useTheme();
  const { user, loading: authLoading, login, register, logout, hasAnnouncements, sellerLoading, refreshSellerStatus } = useAuth();
  const { setAuthRequiredHandler, loadFavoriteIds } = useFavorites();

  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [exploreSearch, setExploreSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auth gate state
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authActionType, setAuthActionType] = useState('default');
  const [pendingScreen, setPendingScreen] = useState(null); // screen to navigate after login

  // Register the auth-required handler in FavoritesContext
  useEffect(() => {
    setAuthRequiredHandler((actionType) => {
      setAuthActionType(actionType || 'default');
      setPendingScreen(null); // favorite: stay on current screen
      setAuthModalVisible(true);
    });
    return () => setAuthRequiredHandler(null);
  }, [setAuthRequiredHandler]);

  // Navigate to a screen, requiring auth if protected
  const navigateTo = useCallback((targetScreen, opts = {}) => {
    if (!user && PROTECTED_SCREENS.includes(targetScreen)) {
      setAuthActionType(ACTION_TYPE_MAP[targetScreen] || 'default');
      setPendingScreen({ screen: targetScreen, ...opts });
      setAuthModalVisible(true);
      return;
    }
    if (opts.product !== undefined) setSelectedProduct(opts.product);
    if (opts.order !== undefined) setSelectedOrder(opts.order);
    if (opts.sale !== undefined) setSelectedSale(opts.sale);
    if (opts.search !== undefined) setExploreSearch(opts.search);
    setScreen(targetScreen);
  }, [user]);

  const handleAuthSuccess = useCallback(async () => {
    setAuthModalVisible(false);
    await refreshSellerStatus();
    await loadFavoriteIds();
    if (pendingScreen) {
      const { screen: target, product, order, sale, search } = pendingScreen;
      if (product !== undefined) setSelectedProduct(product);
      if (order !== undefined) setSelectedOrder(order);
      if (sale !== undefined) setSelectedSale(sale);
      if (search !== undefined) setExploreSearch(search);
      setScreen(target);
      setPendingScreen(null);
    }
  }, [pendingScreen, refreshSellerStatus, loadFavoriteIds]);

  const handleAuthClose = useCallback(() => {
    setAuthModalVisible(false);
    setPendingScreen(null);
  }, []);

  const handleLoginSuccess = useCallback(async (email, password) => {
    await login(email, password);
    setScreen('home');
    setActiveTab('home');
  }, [login]);

  const handleSellerFeature = useCallback((feature) => {
    if (feature === 'Minhas Vendas') navigateTo('sales');
    else if (feature === 'Carteira') navigateTo('wallet');
  }, [navigateTo]);

  const handleTabPress = useCallback((tab) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'explore') { setExploreSearch(''); setScreen('explore'); }
    if (tab === 'donate') navigateTo('donation');
  }, [navigateTo]);

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={styles.loading}><ActivityIndicator size="large" color={theme.pink} /></View>
      </SafeAreaView>
    );
  }

  // Full-screen auth flows (when user explicitly navigates to login/register)
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

  // Protected full-screen routes
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
        <ProductDetailScreen
          onBack={() => setScreen('home')}
          onBuy={() => navigateTo('checkout', { product: selectedProduct })}
          productId={selectedProduct}
          onAuthRequired={(actionType) => {
            setAuthActionType(actionType || 'buy');
            setPendingScreen({ screen: 'checkout', product: selectedProduct });
            setAuthModalVisible(true);
          }}
        />
        <AuthGateModal
          visible={authModalVisible}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          actionType={authActionType}
        />
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
          onDonate={() => navigateTo('donation')}
          onViewProducts={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'donation') {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <DonationScreen
          onBack={() => { setScreen('home'); setActiveTab('home'); }}
          onProductCreated={refreshSellerStatus}
        />
      </SafeAreaView>
    );
  }

  // Main marketplace layout with BottomBar (public)
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {screen !== 'explore' && (
        <Navbar
          user={user}
          onLogin={() => setScreen('login')}
          onLogout={logout}
          onSearch={(q) => { setExploreSearch(q); setScreen('explore'); setActiveTab('explore'); }}
        />
      )}
      <View style={styles.content}>
        {screen === 'explore' ? (
          <ExploreScreen
            initialSearch={exploreSearch}
            onProductPress={(productId) => { setSelectedProduct(productId); setScreen('productDetail'); }}
          />
        ) : (
          <HomeScreen
            onDonate={() => navigateTo('donation')}
            onProductPress={(productId) => { setSelectedProduct(productId); setScreen('productDetail'); }}
          />
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
        onDonate={() => navigateTo('donation')}
        onProfile={() => navigateTo('profile')}
        onOrders={() => navigateTo('orders')}
        onFavorites={() => navigateTo('favorites')}
        onSellerFeature={handleSellerFeature}
        onAbout={() => setScreen('about')}
      />

      {/* Global auth gate modal — handles favorites and other inline actions */}
      <AuthGateModal
        visible={authModalVisible}
        onClose={handleAuthClose}
        onSuccess={handleAuthSuccess}
        actionType={authActionType}
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
