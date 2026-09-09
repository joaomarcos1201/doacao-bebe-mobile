import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator, Image, Linking, ScrollView,
  StyleSheet, Text, TextInput, Pressable, View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { checkoutApi, getApiErrorMessage, productApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import { isProductAvailable, isProductOwner } from '../utils/productRules';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const digitsOnly = (value) => value.replace(/\D/g, '').slice(0, 8);
const formatCep = (value) => { const d = digitsOnly(value); return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d; };
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (value) => value.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const addBusinessDays = (days) => {
  const result = new Date(); let added = 0;
  while (added < days) { result.setDate(result.getDate() + 1); const day = result.getDay(); if (day !== 0 && day !== 6) added += 1; }
  return result;
};

export default function CheckoutScreen({ onBack, productId }) {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [cep, setCep] = useState('');
  const [address, setAddress] = useState(null);
  const [addressNumber, setAddressNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [shippingOptions, setShippingOptions] = useState([]);
  const [selectedShippingId, setSelectedShippingId] = useState('pac');
  const [checkout, setCheckout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [addressLoading, setAddressLoading] = useState(false);
  const [freightLoading, setFreightLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState('PENDENTE');
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState('');
  const [stage, setStage] = useState('address');
  const [error, setError] = useState('');
  const s = styles(theme);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    productApi.getById(productId)
      .then((res) => { if (mounted) setProduct(res.data); })
      .catch((err) => { if (mounted) setError(getApiErrorMessage(err, 'Não foi possível carregar o produto.')); })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [productId]);

  const isOwnProduct = product && isProductOwner(product, user);
  const isAvailable = isProductAvailable(product);
  const cepDigits = digitsOnly(cep);
  const selectedShipping = shippingOptions.find((o) => o.id === selectedShippingId) || shippingOptions[0];
  const previewFreight = selectedShipping?.value || 0;
  const previewTotal = Number(product?.preco || 0) + Number(previewFreight);

  useEffect(() => {
    if (cepDigits.length !== 8) return;
    let cancelled = false;
    setAddressLoading(true); setAddress(null); setError('');
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        if (data.erro) { setError('CEP não encontrado. Verifique o CEP informado e tente novamente.'); return; }
        setAddress({ cep: data.cep || formatCep(cep), logradouro: data.logradouro, bairro: data.bairro, localidade: data.localidade, uf: data.uf });
      })
      .catch(() => { if (!cancelled) setError('Não foi possível validar o CEP no momento. Tente novamente em alguns instantes.'); })
      .finally(() => { if (!cancelled) setAddressLoading(false); });
    return () => { cancelled = true; };
  }, [cepDigits]);

  const resetCep = (value) => { setCep(formatCep(value)); setAddress(null); setShippingOptions([]); setSelectedShippingId('pac'); setStage('address'); setError(''); };

  const openCorreios = async () => {
    const url = 'https://buscacepinter.correios.com.br/app/endereco/index.php';
    try { if (await Linking.canOpenURL(url)) await Linking.openURL(url); else setError('Não foi possível abrir a busca de CEP.'); } catch { setError('Não foi possível abrir a busca de CEP.'); }
  };

  const confirmAddress = async () => {
    if (!address || !address.logradouro || !addressNumber.trim()) { setError('Informe um endereço válido e o número do imóvel.'); return; }
    setError(''); setFreightLoading(true);
    try {
      const response = await checkoutApi.calculateShipping(product.id, cepDigits);
      const base = Number(response.data?.valorFrete || 0);
      setShippingOptions([
        { id: 'pac', name: 'PAC', icon: 'cube-outline', days: 8, value: base },
        { id: 'sedex', name: 'SEDEX', icon: 'flash-outline', days: 3, value: base * 1.8 },
      ]);
      setSelectedShippingId('pac'); setStage('summary');
    } catch (err) { setError(getApiErrorMessage(err, 'Erro ao calcular frete. Tente novamente.')); }
    finally { setFreightLoading(false); }
  };

  const confirmCheckout = async () => {
    if (checkoutLoading) return;
    setError(''); setCheckoutLoading(true);
    try {
      const response = await checkoutApi.checkout(product.id, cepDigits);
      if (!response.data?.pedidoId) throw new Error('A resposta do checkout não contém o pedido.');
      setCheckout(response.data); setPaymentStatus('PENDENTE'); setSimulationError(''); setStage('pending');
    } catch (err) { setError(getApiErrorMessage(err, 'Não foi possível iniciar o checkout.')); }
    finally { setCheckoutLoading(false); }
  };

  const simulatePayment = async () => {
    if (simulationLoading || paymentStatus === 'APROVADO') return;
    const paymentId = checkout?.pagamentoId;
    if (!paymentId) { setSimulationError('O checkout não retornou um identificador de pagamento.'); return; }
    if (!paymentId.startsWith('MOCK_')) { setSimulationError('A simulação está disponível apenas para pagamentos de desenvolvimento.'); return; }
    setSimulationLoading(true); setSimulationError('');
    try { await checkoutApi.simulatePayment(paymentId); setPaymentStatus('APROVADO'); }
    catch (err) { setSimulationError(getApiErrorMessage(err, 'Não foi possível simular o pagamento.')); }
    finally { setSimulationLoading(false); }
  };

  const ProductSummary = () => (
    <View style={s.productCard}>
      {imageUri(product?.foto)
        ? <Image source={{ uri: imageUri(product.foto) }} style={s.productImage} />
        : <View style={[s.productImage, s.productImagePlaceholder]}><Ionicons name="gift-outline" size={32} color={colors.primaryMedium} /></View>
      }
      <View style={s.productInfo}>
        <Text style={s.productName}>{product?.nome}</Text>
        <Text style={s.productPrice}>{money(product?.preco)}</Text>
        <Text style={s.productMeta}>+ frete calculado abaixo</Text>
      </View>
    </View>
  );

  const renderAddress = () => (
    <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
      <ProductSummary />
      <Text style={s.sectionTitle}>Informe seu endereço de entrega:</Text>

      <View style={s.fieldGroup}>
        <Text style={s.label}>CEP</Text>
        <View style={s.inputWrap}>
          <Ionicons name="location-outline" size={16} color={theme.textMuted} />
          <TextInput
            style={s.input} value={cep} onChangeText={resetCep}
            keyboardType="number-pad" maxLength={9} placeholder="00000-000"
            placeholderTextColor={colors.textPlaceholder}
          />
        </View>
        <Pressable onPress={openCorreios}>
          <Text style={s.cepLink}>Não sei meu CEP</Text>
        </Pressable>
      </View>

      {addressLoading && (
        <View style={s.inlineLoading}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={s.muted}>Buscando endereço...</Text>
        </View>
      )}

      {address && (
        <View style={s.addressCard}>
          <View style={s.addressHeader}>
            <Ionicons name="location" size={16} color={colors.primary} />
            <Text style={s.addressTitle}>Endereço de entrega</Text>
          </View>
          <View style={s.inputWrap}>
            <Ionicons name="home-outline" size={16} color={theme.textMuted} />
            <TextInput style={[s.input, { opacity: 0.7 }]} value={address.logradouro} editable={false} />
          </View>
          <View style={s.inputWrap}>
            <Ionicons name="keypad-outline" size={16} color={theme.textMuted} />
            <TextInput
              style={s.input} value={addressNumber} onChangeText={setAddressNumber}
              placeholder="Número *" placeholderTextColor={colors.textPlaceholder} keyboardType="number-pad"
            />
          </View>
          <View style={s.inputWrap}>
            <Ionicons name="text-outline" size={16} color={theme.textMuted} />
            <TextInput
              style={s.input} value={complement} onChangeText={setComplement}
              placeholder="Complemento (opcional)" placeholderTextColor={colors.textPlaceholder}
            />
          </View>
          <Text style={s.addressLine}>{address.bairro}</Text>
          <Text style={s.addressLine}>{address.localidade} - {address.uf}</Text>
          <Text style={s.addressLine}>CEP {address.cep}</Text>
        </View>
      )}

      {!!error && (
        <View style={s.errorBox}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [s.primaryBtn, (!address || addressLoading || freightLoading) && s.btnDisabled, pressed && { opacity: 0.85 }]}
        onPress={confirmAddress}
        disabled={!address || addressLoading || freightLoading}
      >
        {freightLoading
          ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.primaryBtnText}>Calculando frete...</Text></>
          : <Text style={s.primaryBtnText}>Confirmar Endereço</Text>
        }
      </Pressable>
    </ScrollView>
  );

  const renderSummary = () => (
    <ScrollView contentContainerStyle={s.content}>
      <ProductSummary />

      <View style={s.addressCard}>
        <View style={s.addressHeader}>
          <Ionicons name="checkmark-circle" size={16} color={colors.successAlt} />
          <Text style={[s.addressTitle, { color: colors.successAlt }]}>✓ CEP salvo para a compra</Text>
        </View>
        <Text style={s.addressLine}>{address.logradouro}, {addressNumber}</Text>
        {complement.trim() && <Text style={s.addressLine}>{complement}</Text>}
        <Text style={s.addressLine}>{address.bairro}</Text>
        <Text style={s.addressLine}>{address.localidade} - {address.uf} · CEP {address.cep}</Text>
      </View>

      <Text style={s.sectionTitle}>Escolha a entrega</Text>
      {shippingOptions.map((option) => (
        <Pressable
          key={option.id}
          style={({ pressed }) => [s.shippingCard, selectedShippingId === option.id && s.shippingCardActive, pressed && { opacity: 0.9 }]}
          onPress={() => setSelectedShippingId(option.id)}
        >
          <View style={[s.radioCircle, selectedShippingId === option.id && s.radioCircleActive]}>
            {selectedShippingId === option.id && <View style={s.radioDot} />}
          </View>
          <Ionicons name={option.icon} size={22} color={selectedShippingId === option.id ? colors.primary : theme.textMuted} />
          <View style={s.shippingInfo}>
            <Text style={s.shippingName}>{option.name}</Text>
            <Text style={s.muted}>Até {option.days} dias úteis</Text>
            <Text style={s.muted}>Receba até {formatDate(addBusinessDays(option.days))}</Text>
          </View>
          <Text style={s.shippingPrice}>{option.value === 0 ? 'Grátis' : money(option.value)}</Text>
        </Pressable>
      ))}

      <View style={s.summaryCard}>
        <Text style={s.sectionTitle}>Resumo do pedido</Text>
        <View style={s.summaryRow}><Text style={s.summaryLabel}>Produto</Text><Text style={s.summaryValue}>{money(product.preco)}</Text></View>
        <View style={s.summaryRow}><Text style={s.summaryLabel}>Frete</Text><Text style={s.summaryValue}>{previewFreight === 0 ? 'Grátis' : money(previewFreight)}</Text></View>
        <View style={[s.summaryRow, { marginTop: spacing.xs }]}>
          <Text style={[s.summaryLabel, { color: theme.text, fontWeight: typography.extrabold }]}>Total</Text>
          <Text style={s.totalAmount}>{money(previewTotal)}</Text>
        </View>
        <Text style={s.freightNote}>Frete: {money(previewFreight)} · Total: {money(previewTotal)}</Text>
      </View>

      {!!error && (
        <View style={s.errorBox}>
          <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
          <Text style={s.errorText}>{error}</Text>
        </View>
      )}

      <Pressable
        style={({ pressed }) => [s.primaryBtn, checkoutLoading && s.btnDisabled, pressed && { opacity: 0.85 }]}
        onPress={confirmCheckout}
        disabled={checkoutLoading}
      >
        {checkoutLoading
          ? <><ActivityIndicator size="small" color="#fff" /><Text style={s.primaryBtnText}>Iniciando checkout...</Text></>
          : <Text style={s.primaryBtnText}>Confirmar compra</Text>
        }
      </Pressable>

      <Pressable onPress={() => setStage('address')} style={s.secondaryLink}>
        <Text style={s.secondaryLinkText}>Alterar endereço</Text>
      </Pressable>
    </ScrollView>
  );

  const renderPending = () => (
    <ScrollView contentContainerStyle={s.content}>
      <View style={s.successCard}>
        <View style={s.successIconWrap}>
          <Ionicons name="checkmark-circle" size={48} color={paymentStatus === 'APROVADO' ? colors.success : colors.warning} />
        </View>
        <Text style={s.successTitle}>Checkout iniciado</Text>
        <Text style={s.muted}>Pedido #{checkout.pedidoId}</Text>
        <StatusBadge status={paymentStatus} label={`Pagamento: ${paymentStatus}`} />
        <Text style={s.totalAmount}>{money(checkout.valorTotal)}</Text>

        {checkout.pagamentoId && <Text style={s.muted}>Pagamento: {checkout.pagamentoId}</Text>}

        {checkout.qrCodeBase64 && (
          <Image source={{ uri: `data:image/png;base64,${checkout.qrCodeBase64}` }} style={s.qrCode} />
        )}

        {checkout.pixCopiaCola && (
          <View style={s.pixBox}>
            <Text style={s.label}>PIX copia e cola</Text>
            <Text selectable style={s.pixText}>{checkout.pixCopiaCola}</Text>
          </View>
        )}

        {paymentStatus === 'PENDENTE' && checkout.pagamentoId?.startsWith('MOCK_') && (
          <Pressable
            style={({ pressed }) => [s.simulateBtn, simulationLoading && s.btnDisabled, pressed && { opacity: 0.8 }]}
            onPress={simulatePayment}
            disabled={simulationLoading}
          >
            <Ionicons name="flask-outline" size={16} color={colors.warning} />
            <Text style={s.simulateBtnText}>{simulationLoading ? 'Processando...' : 'Simular Pagamento'}</Text>
          </Pressable>
        )}

        {!!simulationError && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={s.errorText}>{simulationError}</Text>
          </View>
        )}

        {paymentStatus === 'APROVADO' && (
          <View style={s.approvedBox}>
            <Ionicons name="checkmark-circle" size={16} color={colors.successAlt} />
            <Text style={s.approvedText}>Pagamento aprovado!</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );

  const renderContent = () => {
    if (loading) return <View style={s.stateWrap}><ActivityIndicator size="large" color={colors.primary} /><Text style={s.muted}>Carregando produto...</Text></View>;
    if (error && !product) return <View style={s.stateWrap}><Ionicons name="alert-circle-outline" size={40} color={colors.error} /><Text style={s.errorText}>{error}</Text></View>;
    if (!product) return <View style={s.stateWrap}><Text style={s.muted}>Produto não encontrado.</Text></View>;
    if (isOwnProduct) return <View style={s.stateWrap}><Ionicons name="information-circle-outline" size={40} color={theme.textMuted} /><Text style={s.muted}>Você não pode comprar seu próprio produto.</Text></View>;
    if (!isAvailable) return <View style={s.stateWrap}><Ionicons name="close-circle-outline" size={40} color={colors.error} /><Text style={s.errorText}>Este produto não está disponível para compra.</Text></View>;
    if (stage === 'pending') return renderPending();
    if (stage === 'summary') return renderSummary();
    return renderAddress();
  };

  return (
    <View style={s.container}>
      <ScreenHeader title="Checkout" onBack={onBack} backLabel="Voltar" />
      {renderContent()}
    </View>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  stateWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl, gap: spacing.sm },
  muted: { color: theme.textMuted, fontSize: typography.label },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },

  productCard: {
    flexDirection: 'row', gap: spacing.md, alignItems: 'center',
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: radius.xl, padding: spacing.lg, ...shadows.light,
  },
  productImage: { width: 84, height: 84, borderRadius: radius.md },
  productImagePlaceholder: { backgroundColor: theme.pinkLight, alignItems: 'center', justifyContent: 'center' },
  productInfo: { flex: 1, gap: spacing.xs },
  productName: { color: theme.text, fontSize: typography.button, fontWeight: typography.extrabold, letterSpacing: -0.2 },
  productPrice: { color: colors.primary, fontSize: typography.cardPrice, fontWeight: typography.black },
  productMeta: { color: theme.textMuted, fontSize: typography.support },

  sectionTitle: { color: theme.textTitle, fontSize: typography.button, fontWeight: typography.extrabold, letterSpacing: -0.2 },

  fieldGroup: { gap: spacing.xs },
  label: { color: theme.text, fontSize: typography.label, fontWeight: typography.semibold },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 12,
  },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },
  cepLink: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold, marginTop: 4 },

  inlineLoading: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },

  addressCard: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, ...shadows.light,
  },
  addressHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  addressTitle: { color: colors.primary, fontSize: typography.button, fontWeight: typography.extrabold },
  addressLine: { color: theme.text, fontSize: typography.body },

  shippingCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.card, borderWidth: 1.5, borderColor: theme.cardBorder,
    borderRadius: radius.lg, padding: spacing.md, ...shadows.light,
  },
  shippingCardActive: { borderColor: colors.primary, backgroundColor: theme.pinkLight },
  radioCircle: {
    width: 20, height: 20, borderRadius: 10,
    borderWidth: 2, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  radioCircleActive: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  shippingInfo: { flex: 1, gap: 2 },
  shippingName: { color: theme.text, fontSize: typography.button, fontWeight: typography.extrabold },
  shippingPrice: { color: colors.primary, fontSize: typography.button, fontWeight: typography.black },

  summaryCard: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, ...shadows.light,
  },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryLabel: { color: theme.textMuted, fontSize: typography.label },
  summaryValue: { color: theme.text, fontSize: typography.label, fontWeight: typography.bold },
  totalAmount: { color: colors.primary, fontSize: typography.cardPrice, fontWeight: typography.black },
  freightNote: { color: theme.textMuted, fontSize: typography.support, marginTop: spacing.xs },

  primaryBtn: {
    backgroundColor: colors.primary, borderRadius: radius.md,
    paddingVertical: 15, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.cta,
  },
  primaryBtnText: { color: '#fff', fontSize: typography.button, fontWeight: typography.extrabold },
  btnDisabled: { opacity: 0.5 },
  secondaryLink: { alignItems: 'center', paddingVertical: spacing.sm },
  secondaryLinkText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.label },

  successCard: {
    backgroundColor: theme.card, borderWidth: 1, borderColor: theme.cardBorder,
    borderRadius: radius.xl, padding: spacing.xl, gap: spacing.md,
    alignItems: 'center', ...shadows.light,
  },
  successIconWrap: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { color: theme.textTitle, fontSize: typography.cardTitle, fontWeight: typography.extrabold, letterSpacing: -0.3 },
  qrCode: { width: 200, height: 200, marginVertical: spacing.sm },
  pixBox: {
    width: '100%', backgroundColor: theme.input,
    borderRadius: radius.md, padding: spacing.md, gap: spacing.sm,
  },
  pixText: { color: theme.text, fontSize: 12, lineHeight: 18 },
  simulateBtn: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    width: '100%', borderWidth: 2, borderStyle: 'dashed',
    borderColor: colors.warning, borderRadius: radius.md,
    padding: spacing.md, justifyContent: 'center',
  },
  simulateBtnText: { color: colors.warning, fontSize: typography.button, fontWeight: typography.extrabold },
  approvedBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
    width: '100%', justifyContent: 'center',
  },
  approvedText: { color: colors.successText, fontWeight: typography.bold, fontSize: typography.label },
});
