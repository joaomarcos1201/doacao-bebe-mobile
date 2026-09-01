import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Linking, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { checkoutApi, getApiErrorMessage, productApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import StatusBadge from '../components/StatusBadge';
import { isProductAvailable, isProductOwner } from '../utils/productRules';

const imageUri = (value) => value ? `data:image/jpeg;base64,${value}` : null;
const digitsOnly = (value) => value.replace(/\D/g, '').slice(0, 8);
const formatCep = (value) => { const digits = digitsOnly(value); return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits; };
const money = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (value) => value.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
const addBusinessDays = (days) => { const result = new Date(); let added = 0; while (added < days) { result.setDate(result.getDate() + 1); const day = result.getDay(); if (day !== 0 && day !== 6) added += 1; } return result; };

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
    productApi.getById(productId).then((response) => { if (mounted) setProduct(response.data); }).catch((requestError) => { if (mounted) setError(getApiErrorMessage(requestError, 'Não foi possível carregar o produto.')); }).finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  }, [productId]);

  const isOwnProduct = product && isProductOwner(product, user);
  const isAvailable = isProductAvailable(product);
  const cepDigits = digitsOnly(cep);
  const selectedShipping = shippingOptions.find((option) => option.id === selectedShippingId) || shippingOptions[0];
  const previewFreight = selectedShipping?.value || 0;
  const previewTotal = Number(product?.preco || 0) + Number(previewFreight);

  useEffect(() => {
    if (cepDigits.length !== 8) return undefined;
    let cancelled = false;
    setAddressLoading(true);
    setAddress(null);
    setError('');
    fetch(`https://viacep.com.br/ws/${cepDigits}/json/`).then((response) => response.json()).then((data) => {
      if (cancelled) return;
      if (data.erro) { setError('CEP não encontrado. Verifique o CEP informado e tente novamente.'); return; }
      setAddress({ cep: data.cep || formatCep(cep), logradouro: data.logradouro, bairro: data.bairro, localidade: data.localidade, uf: data.uf });
    }).catch(() => { if (!cancelled) setError('Não foi possível validar o CEP no momento. Tente novamente em alguns instantes.'); }).finally(() => { if (!cancelled) setAddressLoading(false); });
    return () => { cancelled = true; };
  }, [cepDigits]);

  const resetCepState = (value) => { setCep(formatCep(value)); setAddress(null); setShippingOptions([]); setSelectedShippingId('pac'); setStage('address'); setError(''); };
  const openCorreios = async () => {
    const url = 'https://buscacepinter.correios.com.br/app/endereco/index.php';
    try { if (await Linking.canOpenURL(url)) await Linking.openURL(url); else setError('Não foi possível abrir a busca de CEP dos Correios.'); } catch { setError('Não foi possível abrir a busca de CEP dos Correios.'); }
  };
  const confirmAddress = async () => {
    if (!address || !address.logradouro || !addressNumber.trim() || !address.bairro || !address.localidade || !address.uf) { setError('Informe um endereço válido e o número do imóvel.'); return; }
    setError(''); setFreightLoading(true);
    try {
      const response = await checkoutApi.calculateShipping(product.id, cepDigits);
      const baseFreight = Number(response.data?.valorFrete || 0);
      setShippingOptions([{ id: 'pac', name: 'PAC', icon: '📦', days: 8, value: baseFreight }, { id: 'sedex', name: 'SEDEX', icon: '⚡', days: 3, value: baseFreight * 1.8 }]);
      setSelectedShippingId('pac'); setStage('summary');
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Erro ao calcular frete. Tente novamente.')); } finally { setFreightLoading(false); }
  };
  const confirmCheckout = async () => {
    if (checkoutLoading) return;
    setError(''); setCheckoutLoading(true);
    try {
      const response = await checkoutApi.checkout(product.id, cepDigits);
      if (!response.data?.pedidoId) throw new Error('A resposta do checkout não contém o pedido.');
      setCheckout(response.data); setPaymentStatus('PENDENTE'); setSimulationError(''); setStage('pending');
    } catch (requestError) { setError(getApiErrorMessage(requestError, 'Não foi possível iniciar o checkout.')); } finally { setCheckoutLoading(false); }
  };
  const simulatePayment = async () => {
    if (simulationLoading || paymentStatus === 'APROVADO') return;
    const paymentId = checkout?.pagamentoId;
    if (!paymentId) { setSimulationError('O checkout não retornou um identificador de pagamento.'); return; }
    if (!paymentId.startsWith('MOCK_')) { setSimulationError('A simulação está disponível apenas para pagamentos de desenvolvimento.'); return; }
    setSimulationLoading(true); setSimulationError('');
    try { await checkoutApi.simulatePayment(paymentId); setPaymentStatus('APROVADO'); } catch (requestError) { setSimulationError(getApiErrorMessage(requestError, 'Não foi possível simular o pagamento.')); } finally { setSimulationLoading(false); }
  };
  const renderAddress = () => <ScrollView contentContainerStyle={s.content}><ProductSummary product={product} styles={s} /><Text style={s.sectionTitle}>Endereço de entrega</Text><Text style={s.label}>CEP</Text><TextInput style={s.input} value={cep} onChangeText={resetCepState} keyboardType="number-pad" maxLength={9} placeholder="00000-000" placeholderTextColor={theme.textMuted} /><TouchableOpacity onPress={openCorreios} style={s.cepLink}><Text style={s.cepLinkText}>Não sei meu CEP</Text></TouchableOpacity>{addressLoading && <Text style={s.muted}>Buscando endereço...</Text>}{address && <View style={s.addressCard}><Text style={s.addressTitle}>📍 Endereço de entrega</Text><TextInput style={[s.input, s.readonly]} value={address.logradouro} editable={false} /><TextInput style={s.input} value={addressNumber} onChangeText={setAddressNumber} placeholder="Número *" placeholderTextColor={theme.textMuted} keyboardType="number-pad" /><TextInput style={s.input} value={complement} onChangeText={setComplement} placeholder="Complemento (opcional)" placeholderTextColor={theme.textMuted} /><Text style={s.addressText}>{address.bairro}</Text><Text style={s.addressText}>{address.localidade} - {address.uf}</Text><Text style={s.addressText}>CEP {address.cep}</Text></View>}{error && <Text style={s.error}>{error}</Text>}<TouchableOpacity style={[s.button, (!address || addressLoading || freightLoading) && s.disabled]} onPress={confirmAddress} disabled={!address || addressLoading || freightLoading}>{<Text style={s.buttonText}>{freightLoading ? 'Calculando frete...' : 'Confirmar Endereço'}</Text>}</TouchableOpacity></ScrollView>;
  const renderSummary = () => <ScrollView contentContainerStyle={s.content}><ProductSummary product={product} styles={s} /><View style={s.addressCard}><Text style={s.addressTitle}>📍 Endereço confirmado</Text><Text style={s.addressText}>{address.logradouro}, {addressNumber}</Text>{complement.trim() && <Text style={s.addressText}>{complement}</Text>}<Text style={s.addressText}>{address.bairro}</Text><Text style={s.addressText}>{address.localidade} - {address.uf} • CEP {address.cep}</Text></View><Text style={s.sectionTitle}>Escolha a entrega</Text>{shippingOptions.map((option) => <TouchableOpacity key={option.id} style={[s.shippingCard, selectedShippingId === option.id && s.shippingSelected]} onPress={() => setSelectedShippingId(option.id)}><Text style={s.radio}>{selectedShippingId === option.id ? '◉' : '○'}</Text><Text style={s.shippingIcon}>{option.icon}</Text><View style={s.shippingInfo}><Text style={s.shippingName}>{option.name}</Text><Text style={s.muted}>Até {option.days} dias úteis</Text><Text style={s.muted}>Receba até {formatDate(addBusinessDays(option.days))}</Text></View><Text style={s.shippingPrice}>{option.value === 0 ? 'Grátis' : money(option.value)}</Text></TouchableOpacity>)}<View style={s.summary}><Text style={s.sectionTitle}>Resumo do pedido</Text><Text style={s.row}>Produto <Text style={s.value}>{money(product.preco)}</Text></Text><Text style={s.row}>Frete <Text style={s.value}>{previewFreight === 0 ? 'Grátis' : money(previewFreight)}</Text></Text><Text style={s.total}>Total {money(previewTotal)}</Text></View>{error && <Text style={s.error}>{error}</Text>}<TouchableOpacity style={[s.button, checkoutLoading && s.disabled]} onPress={confirmCheckout} disabled={checkoutLoading}><Text style={s.buttonText}>{checkoutLoading ? 'Iniciando checkout...' : 'Confirmar compra'}</Text></TouchableOpacity><TouchableOpacity onPress={() => setStage('address')}><Text style={s.secondaryLink}>Alterar endereço</Text></TouchableOpacity></ScrollView>;
  const renderPending = () => <ScrollView contentContainerStyle={s.content}><View style={s.successCard}><Text style={s.successTitle}>Checkout iniciado</Text><Text style={s.muted}>Pedido #{checkout.pedidoId}</Text><StatusBadge status={paymentStatus} label={`Pagamento: ${paymentStatus}`} /><Text style={s.total}>{money(checkout.valorTotal)}</Text>{checkout.pagamentoId && <Text style={s.muted}>Pagamento: {checkout.pagamentoId}</Text>}{checkout.qrCodeBase64 && <Image source={{ uri: `data:image/png;base64,${checkout.qrCodeBase64}` }} style={s.qrCode} />}{checkout.pixCopiaCola && <View style={s.pixBox}><Text style={s.label}>PIX copia e cola</Text><Text selectable style={s.pixText}>{checkout.pixCopiaCola}</Text></View>}{paymentStatus === 'PENDENTE' && checkout.pagamentoId?.startsWith('MOCK_') && <TouchableOpacity style={[s.simulateButton, simulationLoading && s.disabled]} onPress={simulatePayment} disabled={simulationLoading}><Text style={s.simulateButtonText}>{simulationLoading ? 'Processando...' : '🧪 Simular Pagamento'}</Text></TouchableOpacity>}{simulationError && <Text style={s.error}>{simulationError}</Text>}{paymentStatus === 'APROVADO' && <Text style={s.approvedMessage}>Pagamento aprovado com sucesso.</Text>}</View></ScrollView>;
  const content = loading ? <View style={s.state}><ActivityIndicator size="large" color={theme.pink} /><Text style={s.muted}>Carregando produto...</Text></View> : error && !product ? <View style={s.state}><Text style={s.error}>{error}</Text></View> : !product ? <View style={s.state}><Text style={s.muted}>Produto não encontrado.</Text></View> : isOwnProduct ? <View style={s.state}><Text style={s.error}>Você não pode comprar seu próprio produto.</Text></View> : !isAvailable ? <View style={s.state}><Text style={s.error}>Este produto não está disponível para compra.</Text></View> : stage === 'pending' ? renderPending() : stage === 'summary' ? renderSummary() : renderAddress();
  return <View style={s.container}><ScreenHeader title="Checkout" onBack={onBack} />{content}</View>;
}

function ProductSummary({ product, styles: s }) {
  return <View style={s.productCard}>{imageUri(product?.foto) ? <Image source={{ uri: imageUri(product.foto) }} style={s.productImage} /> : <Text style={s.imageEmoji}>🎁</Text>}<View style={s.productInfo}><Text style={s.productName}>{product?.nome}</Text><Text style={s.price}>{money(product?.preco)}</Text></View></View>;
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' }, content: { padding: 16, gap: 12 }, state: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 }, muted: { color: theme.textMuted, fontSize: 13 }, error: { color: '#ef4444', textAlign: 'center', fontWeight: '600' }, sectionTitle: { color: theme.text, fontSize: 17, fontWeight: '800', marginTop: 4 }, productCard: { flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 16 }, productImage: { width: 84, height: 84, borderRadius: 12 }, imageEmoji: { width: 84, height: 84, textAlign: 'center', textAlignVertical: 'center', fontSize: 36, backgroundColor: theme.pinkLight, borderRadius: 12 }, productInfo: { flex: 1, gap: 6 }, productName: { color: theme.text, fontSize: 17, fontWeight: '800' }, price: { color: theme.pink, fontSize: 22, fontWeight: '900' }, label: { color: theme.text, fontSize: 13, fontWeight: '700' }, input: { backgroundColor: theme.input || theme.card, color: theme.text, borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 13, fontSize: 15 }, readonly: { opacity: 0.8 }, cepLink: { alignSelf: 'flex-start', paddingVertical: 3 }, cepLinkText: { color: theme.pink, fontSize: 13, fontWeight: '700' }, addressCard: { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 16, gap: 9 }, addressTitle: { color: theme.pink, fontSize: 15, fontWeight: '800' }, addressText: { color: theme.text, fontSize: 14 }, shippingCard: { flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 14 }, shippingSelected: { borderColor: theme.pink, borderWidth: 2, backgroundColor: theme.pinkLight }, radio: { color: theme.pink, fontSize: 20 }, shippingIcon: { fontSize: 24 }, shippingInfo: { flex: 1, gap: 3 }, shippingName: { color: theme.text, fontSize: 15, fontWeight: '800' }, shippingPrice: { color: theme.pink, fontSize: 15, fontWeight: '900' }, summary: { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 16, padding: 16, gap: 10 }, row: { color: theme.textMuted, fontSize: 14 }, value: { color: theme.text, fontWeight: '700' }, total: { color: theme.pink, fontSize: 23, fontWeight: '900', marginTop: 3 }, button: { backgroundColor: theme.pink, borderRadius: 12, padding: 15, alignItems: 'center', marginTop: 4 }, buttonText: { color: '#fff', fontSize: 15, fontWeight: '800' }, disabled: { opacity: 0.5 }, secondaryLink: { color: theme.pink, textAlign: 'center', fontWeight: '700', padding: 8 }, successCard: { backgroundColor: theme.card, borderColor: theme.border, borderWidth: 1, borderRadius: 20, padding: 20, gap: 12, alignItems: 'center' }, successTitle: { color: theme.text, fontSize: 22, fontWeight: '900' }, qrCode: { width: 220, height: 220, marginVertical: 8 }, pixBox: { width: '100%', backgroundColor: theme.bgSecondary || theme.bg, borderRadius: 12, padding: 12, gap: 8 }, pixText: { color: theme.text, fontSize: 12, lineHeight: 18 }, simulateButton: { width: '100%', borderWidth: 2, borderStyle: 'dashed', borderColor: '#ff9800', borderRadius: 14, padding: 14, alignItems: 'center' }, simulateButtonText: { color: '#ff9800', fontSize: 15, fontWeight: '800' }, approvedMessage: { color: '#4caf50', fontWeight: '700', textAlign: 'center' },
});
