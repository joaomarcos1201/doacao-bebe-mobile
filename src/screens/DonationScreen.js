import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, productApi } from '../services/api';

const CATEGORIES = [
  { label: 'Roupas', icon: '👕' },
  { label: 'Brinquedos', icon: '🧸' },
  { label: 'Móveis', icon: '🪑' },
  { label: 'Acessórios', icon: '🎒' },
  { label: 'Alimentação', icon: '🍼' },
  { label: 'Outros', icon: '📦' },
];

const CONDITIONS = [
  { label: 'Novo', icon: '✨' },
  { label: 'Semi-novo', icon: '👍' },
  { label: 'Usado', icon: '📦' },
];

const HOW_STEPS = [
  { num: '1', text: 'Preencha o formulário com os dados do produto' },
  { num: '2', text: 'Aguarde a aprovação da nossa equipe' },
  { num: '3', text: 'Interessados entram em contato via WhatsApp' },
];

export default function DonationScreen({ onBack, onProductCreated }) {
  const { theme, toggleTheme } = useTheme();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [originZip, setOriginZip] = useState('');
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 4,
      allowsEditing: false,
      quality: 0.7,
    });
    if (!result.canceled) setPhotos(result.assets.slice(0, 4));
  };

  const removePhoto = (index) => setPhotos((current) => current.filter((_, i) => i !== index));

  const handleSubmit = async () => {
    const numericPrice = Number(price.replace(',', '.'));
    if (!productName.trim() || !description.trim() || !category || !brand.trim() || !condition || !originZip.trim()) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!Number.isFinite(numericPrice) || numericPrice < 0) {
      setError('Informe um preço válido.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      [['nome', productName], ['descricao', description], ['categoria', category], ['marca', brand], ['conservacao', condition], ['preco', numericPrice.toFixed(2)], ['cepOrigem', originZip.replace(/\D/g, '')]].forEach(([key, value]) => formData.append(key, value));
      photos.forEach((photo, index) => formData.append(index === 0 ? 'imagem' : `imagem_${index}`, { uri: photo.uri, name: photo.fileName || `produto-${index + 1}.jpg`, type: photo.mimeType || 'image/jpeg' }));
      await productApi.create(formData);
      try { await onProductCreated?.(); } catch { /* The announcement was already created successfully. */ }
      setProductName('');
      setCategory('');
      setDescription('');
      setCondition('');
      setBrand('');
      setPrice('');
      setOriginZip('');
      setPhotos([]);
      setSuccess(true);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Não foi possível enviar o anúncio.'));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={s.successContainer}>
        <Text style={s.successIcon}>✅</Text>
        <Text style={s.successTitle}>Doação enviada!</Text>
        <Text style={s.successSubtitle}>Aguarde a aprovação da nossa equipe.</Text>
        <TouchableOpacity style={s.successBtn} onPress={onBack} activeOpacity={0.8}>
          <Text style={s.successBtnText}>Voltar para o início</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Card formulário */}
        <View style={s.card}>
          <Text style={s.cardTitle}>🎁 Fazer uma doação</Text>
          <Text style={s.cardSubtitle}>Preencha os dados do produto que deseja doar</Text>

          {/* Grid: Nome + Categoria */}
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Nome do produto</Text>
              <TextInput
                style={s.input}
                value={productName}
                onChangeText={setProductName}
                placeholder="Ex: Macacão azul"
                placeholderTextColor={theme.textMuted}
              />
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Categoria</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.selectScroll}>
                {CATEGORIES.map((c) => (
                  <TouchableOpacity
                    key={c.label}
                    style={[s.selectChip, category === c.label && s.selectChipActive]}
                    onPress={() => setCategory(c.label)}
                    activeOpacity={0.7}
                  >
                    <Text style={s.selectChipText}>{c.icon} {c.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Descrição */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Descrição</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o produto, tamanho, cor, estado..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Grid: Condição + Marca */}
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Estado do produto</Text>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c.label}
                  style={[s.radioRow, condition === c.label && s.radioRowActive]}
                  onPress={() => setCondition(c.label)}
                  activeOpacity={0.7}
                >
                  <View style={[s.radio, condition === c.label && s.radioActive]} />
                  <Text style={[s.radioLabel, condition === c.label && { color: theme.pink }]}>
                    {c.icon} {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Marca</Text>
              <TextInput
                style={s.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Ex: Hering"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          </View>

          {/* Preço e origem */}
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Preço</Text>
              <TextInput
                style={s.input}
                value={price}
                onChangeText={setPrice}
                placeholder="0,00"
                placeholderTextColor={theme.textMuted}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>CEP de origem</Text>
              <TextInput
                style={s.input}
                value={originZip}
                onChangeText={setOriginZip}
                placeholder="00000-000"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Upload de foto */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Fotos do produto (até 4, opcional)</Text>
            <TouchableOpacity style={s.photoBtn} onPress={pickImage} activeOpacity={0.8}>
              {photos.length === 0 ? (
                <View style={s.photoPlaceholder}>
                  <Text style={s.photoPlaceholderIcon}>📷</Text>
                  <Text style={s.photoPlaceholderText}>Toque para adicionar foto</Text>
                </View>
              ) : <View style={s.photosRow}>{photos.map((item, index) => <View key={item.uri} style={s.photoItem}><Image source={{ uri: item.uri }} style={s.photoPreview} /><TouchableOpacity onPress={() => removePhoto(index)} style={s.removePhoto}><Text style={s.removePhotoText}>×</Text></TouchableOpacity></View>)}{photos.length < 4 && <View style={s.addPhoto}><Text style={s.photoPlaceholderIcon}>＋</Text></View>}</View>}
            </TouchableOpacity>
          </View>

          {!!error && <Text style={s.errorText}>{error}</Text>}

          <TouchableOpacity
            style={[s.submitBtn, loading && s.submitBtnDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={s.submitBtnText}>{loading ? 'Enviando...' : 'Enviar Doação'}</Text>
          </TouchableOpacity>
        </View>

        {/* Card como funciona */}
        <View style={s.howCard}>
          <Text style={s.howTitle}>Como funciona?</Text>
          {HOW_STEPS.map((step) => (
            <View key={step.num} style={s.howStep}>
              <View style={s.howNum}>
                <Text style={s.howNumText}>{step.num}</Text>
              </View>
              <Text style={s.howStepText}>{step.text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },

  // Navbar
  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  backBtn: { color: theme.pink, fontSize: 15, fontWeight: '600' },
  navTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  themeBtn: { fontSize: 20 },

  scroll: { padding: 16, gap: 16 },

  // Card
  card: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    gap: 16,
  },
  cardTitle: { fontSize: 18, fontWeight: '800', color: theme.text },
  cardSubtitle: { fontSize: 13, color: theme.textMuted, marginTop: -8 },

  // Campos
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },
  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text },
  input: {
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    borderWidth: 1, borderColor: theme.isDark ? '#333' : '#e8d0d4',
    borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10,
    fontSize: 13, color: theme.text,
  },
  textarea: { minHeight: 80, paddingTop: 10 },

  // Select chips (categoria)
  selectScroll: { marginTop: 2 },
  selectChip: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16,
    borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: theme.bg, marginRight: 6,
  },
  selectChipActive: { borderColor: theme.pink, backgroundColor: 'rgba(232,96,122,0.1)' },
  selectChipText: { fontSize: 12, color: theme.text },

  // Radio condição
  radioRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingVertical: 6, paddingHorizontal: 8, borderRadius: 8,
    borderWidth: 1, borderColor: theme.border, marginBottom: 4,
  },
  radioRowActive: { borderColor: theme.pink, backgroundColor: 'rgba(232,96,122,0.08)' },
  radio: {
    width: 14, height: 14, borderRadius: 7,
    borderWidth: 2, borderColor: theme.border,
  },
  radioActive: { borderColor: theme.pink, backgroundColor: theme.pink },
  radioLabel: { fontSize: 12, color: theme.text },

  // Foto
  photoBtn: { alignSelf: 'flex-start' },
  photosRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  photoItem: { position: 'relative' },
  photoPreview: { width: 120, height: 120, borderRadius: 12 },
  removePhoto: { position: 'absolute', top: 4, right: 4, width: 26, height: 26, borderRadius: 13, backgroundColor: 'rgba(0,0,0,0.7)', alignItems: 'center', justifyContent: 'center' },
  removePhotoText: { color: '#fff', fontSize: 20, lineHeight: 22 },
  addPhoto: { width: 120, height: 120, borderRadius: 12, borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  photoPlaceholder: {
    width: 120, height: 120, borderRadius: 12,
    borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed',
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  photoPlaceholderIcon: { fontSize: 28 },
  photoPlaceholderText: { fontSize: 10, color: theme.textMuted, textAlign: 'center' },

  // Botão submit
  submitBtn: {
    backgroundColor: theme.pink, paddingVertical: 14,
    borderRadius: 12, alignItems: 'center',
    shadowColor: theme.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: '#c44150', fontSize: 13, textAlign: 'center' },

  // Card como funciona
  howCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07, shadowRadius: 12, elevation: 4,
    gap: 14,
  },
  howTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  howNumText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  howStepText: { flex: 1, fontSize: 13, color: theme.textMuted, lineHeight: 20, paddingTop: 4 },

  // Sucesso
  successContainer: {
    flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6',
    alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32,
  },
  successIcon: { fontSize: 64 },
  successTitle: { fontSize: 22, fontWeight: '800', color: theme.pink },
  successSubtitle: { fontSize: 14, color: theme.textMuted, textAlign: 'center' },
  successBtn: {
    marginTop: 8, backgroundColor: theme.pink,
    paddingHorizontal: 32, paddingVertical: 12, borderRadius: 22,
  },
  successBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
