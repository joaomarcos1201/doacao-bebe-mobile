import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, SafeAreaView, StyleSheet, View } from 'react-native';
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
  const {
    user,
    loading: authLoading,
    login,
    register,
    logout,
    hasAnnouncements,
    sellerLoading,
    refreshSellerStatus,
  } = useAuth();

  const [screen, setScreen] = useState('home');
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedSale, setSelectedSale] = useState(null);
  const [exploreSearch, setExploreSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pendingScreen, setPendingScreen] = useState(null);

  useEffect(() => {
    const privateScreens = ['profile', 'favorites', 'orders', 'orderDetail', 'sales', 'saleDetail', 'wallet', 'checkout'];
    if (!user && privateScreens.includes(screen)) {
      setScreen('home');
      setActiveTab('home');
    }
  }, [screen, user]);

  const goToLogin = (nextScreen = null) => {
    setPendingScreen(nextScreen);
    setScreen('login');
  };

  const requireAuth = (nextScreen = null) => {
    Alert.alert(
      'Entrar na conta',
      'Você precisa entrar na sua conta para usar essa função.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Entrar', onPress: () => goToLogin(nextScreen) },
      ],
    );
  };

  const handleLoginSuccess = async (email, password) => {
    await login(email, password);
    const nextScreen = pendingScreen || 'home';
    setScreen(nextScreen);
    setActiveTab(nextScreen === 'explore' ? 'explore' : nextScreen === 'donation' ? 'donate' : 'home');
    setPendingScreen(null);
  };

  const handleSellerFeature = (feature) => {
    if (!user) {
      requireAuth(feature === 'Minhas Vendas' ? 'sales' : 'wallet');
      return;
    }
    if (feature === 'Minhas Vendas') setScreen('sales');
    else if (feature === 'Carteira') setScreen('wallet');
    else Alert.alert('Em breve', 'Esta área será integrada em uma próxima fase.');
  };

  const handleTabPress = (tab) => {
    setActiveTab(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'explore') {
      setExploreSearch('');
      setScreen('explore');
    }
    if (tab === 'donate') {
      if (!user) {
        setActiveTab('home');
        requireAuth('donation');
        return;
      }
      setScreen('donation');
    }
  };

  if (authLoading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
        <View style={styles.loading}>
          <ActivityIndicator size="large" color={theme.pink} />
        </View>
      </SafeAreaView>
    );
  }

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
          onRegister={async (...args) => {
            await register(...args);
            setScreen('home');
          }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'profile') {
    if (!user) {
      requireAuth('profile');
      return null;
    }
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
    if (!user) {
      requireAuth('favorites');
      return null;
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <FavoritesScreen
          onBack={() => setScreen('home')}
          onProductPress={(productId) => {
            setSelectedProduct(productId);
            setScreen('productDetail');
          }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'orders') {
    if (!user) {
      requireAuth('orders');
      return null;
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <OrdersScreen
          onBack={() => setScreen('home')}
          onOrderPress={(orderId) => {
            setSelectedOrder(orderId);
            setScreen('orderDetail');
          }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'orderDetail') {
    if (!user) {
      requireAuth('orders');
      return null;
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <OrderDetailScreen orderId={selectedOrder} onBack={() => setScreen('orders')} />
      </SafeAreaView>
    );
  }

  if (screen === 'sales') {
    if (!user) {
      requireAuth('sales');
      return null;
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <SalesScreen
          onBack={() => setScreen('home')}
          onSalePress={(saleId) => {
            setSelectedSale(saleId);
            setScreen('saleDetail');
          }}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'saleDetail') {
    if (!user) {
      requireAuth('sales');
      return null;
    }
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }]}>
        <SaleDetailScreen saleId={selectedSale} onBack={() => setScreen('sales')} />
      </SafeAreaView>
    );
  }

  if (screen === 'wallet') {
    if (!user) {
      requireAuth('wallet');
      return null;
    }
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
          onBuy={() => {
            if (!user) {
              requireAuth('checkout');
              return;
            }
            setScreen('checkout');
          }}
          productId={selectedProduct}
        />
      </SafeAreaView>
    );
  }

  if (screen === 'checkout') {
    if (!user) {
      requireAuth('checkout');
      return null;
    }
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
          onDonate={() => {
            if (!user) {
              requireAuth('donation');
              return;
            }
            setScreen('donation');
          }}
          onViewProducts={() => setScreen('home')}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.bg }]}>
      {screen !== 'explore' && screen !== 'donation' && (
        <Navbar
          user={user}
          onLogin={() => goToLogin()}
          onLogout={async () => {
            await logout();
            setScreen('home');
            setActiveTab('home');
          }}
          onSearch={(q) => {
            setExploreSearch(q);
            setScreen('explore');
            setActiveTab('explore');
          }}
        />
      )}
      <View style={styles.content}>
        {screen === 'explore' ? (
          <ExploreScreen
            initialSearch={exploreSearch}
            onProductPress={(productId) => {
              setSelectedProduct(productId);
              setScreen('productDetail');
            }}
          />
        ) : screen === 'donation' ? (
          <DonationScreen
            onBack={() => {
              setScreen('home');
              setActiveTab('home');
            }}
            onProductCreated={refreshSellerStatus}
          />
        ) : (
          <HomeScreen
            onDonate={() => {
              if (!user) {
                requireAuth('donation');
                return;
              }
              setScreen('donation');
            }}
            onProductPress={(productId) => {
              setSelectedProduct(productId);
              setScreen('productDetail');
            }}
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
        isAuthenticated={Boolean(user)}
        isAdmin={user?.isAdmin}
        hasAnnouncements={hasAnnouncements}
        sellerLoading={sellerLoading}
        onLogin={() => goToLogin()}
        onRegister={() => setScreen('register')}
        onHome={() => setScreen('home')}
        onExplore={() => setScreen('explore')}
        onDonate={() => {
          if (!user) {
            requireAuth('donation');
            return;
          }
          setScreen('donation');
        }}
        onProfile={() => {
          if (!user) {
            requireAuth('profile');
            return;
          }
          setScreen('profile');
        }}
        onOrders={() => {
          if (!user) {
            requireAuth('orders');
            return;
          }
          setScreen('orders');
        }}
        onFavorites={() => {
          if (!user) {
            requireAuth('favorites');
            return;
          }
          setScreen('favorites');
        }}
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
