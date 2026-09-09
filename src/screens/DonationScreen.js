import React, { useState } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { getApiErrorMessage, productApi } from '../services/api';
import ScreenHeader from '../components/ScreenHeader';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const CATEGORIES = [
  { label: 'Roupas', icon: 'shirt-outline' },
  { label: 'Brinquedos', icon: 'game-controller-outline' },
  { label: 'Móveis', icon: 'bed-outline' },
  { label: 'Acessórios', icon: 'bag-outline' },
  { label: 'Alimentação', icon: 'nutrition-outline' },
  { label: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

const CONDITIONS = [
  { label: 'Novo', icon: 'sparkles-outline' },
  { label: 'Semi-novo', icon: 'thumbs-up-outline' },
  { label: 'Usado', icon: 'cube-outline' },
];

const HOW_STEPS = [
  { num: '1', text: 'Preencha o formulário com os dados do produto' },
  { num: '2', text: 'Aguarde a aprovação da nossa equipe' },
  { num: '3', text: 'Interessados entrarão em contato via WhatsApp' },
];

export default function DonationScreen({ onBack, onProductCreated }) {
  const { theme } = useTheme();
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

  const removePhoto = (index) => setPhotos((curr) => curr.filter((_, i) => i !== index));

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
    setLoading(true); setError('');
    try {
      const formData = new FormData();
      [['nome', productName], ['descricao', description], ['categoria', category], ['marca', brand], ['conservacao', condition], ['preco', numericPrice.toFixed(2)], ['cepOrigem', originZip.replace(/\D/g, '')]].forEach(([k, v]) => formData.append(k, v));
      photos.forEach((photo, i) => formData.append(i === 0 ? 'imagem' : `imagem_${i}`, { uri: photo.uri, name: photo.fileName || `produto-${i + 1}.jpg`, type: photo.mimeType || 'image/jpeg' }));
      await productApi.create(formData);
      try { await onProductCreated?.(); } catch { /* ok */ }
      setProductName(''); setCategory(''); setDescription(''); setCondition('');
      setBrand(''); setPrice(''); setOriginZip(''); setPhotos([]);
      setSuccess(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Não foi possível enviar o anúncio.'));
    } finally { setLoading(false); }
  };

  if (success) {
    return (
      <View style={s.successContainer}>
        <View style={s.successIconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <Text style={s.successTitle}>Anúncio enviado!</Text>
        <Text style={s.successSubtitle}>Seu produto foi enviado para análise. O administrador irá revisar e aprovar em breve.</Text>
        <Pressable style={({ pressed }) => [s.successBtn, pressed && { opacity: 0.85 }]} onPress={onBack}>
          <Text style={s.successBtnText}>Voltar para o início</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenHeader title="Anunciar Produto" onBack={onBack} backLabel="Voltar" />
      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Card formulário */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="megaphone-outline" size={22} color={colors.primary} />
            <View>
              <Text style={s.cardTitle}>🎁 Fazer uma doação</Text>
              <Text style={s.cardSubtitle}>Ajude outras famílias compartilhando o que você não usa mais</Text>
            </View>
          </View>

          {/* Nome */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Nome do produto *</Text>
            <View style={s.inputWrap}>
              <Ionicons name="cube-outline" size={15} color={theme.textMuted} />
              <TextInput style={s.input} value={productName} onChangeText={setProductName} placeholder="Ex: Macacão azul" placeholderTextColor={colors.textPlaceholder} />
            </View>
          </View>

          {/* Categoria */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Categoria *</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
              {CATEGORIES.map((c) => (
                <Pressable
                  key={c.label}
                  style={({ pressed }) => [s.chip, category === c.label && s.chipActive, pressed && { opacity: 0.8 }]}
                  onPress={() => setCategory(c.label)}
                >
                  <Ionicons name={c.icon} size={13} color={category === c.label ? '#fff' : theme.textMuted} />
                  <Text style={[s.chipText, category === c.label && s.chipTextActive]}>{c.label}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* Descrição */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Descrição *</Text>
            <TextInput
              style={[s.inputWrap, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o produto, tamanho, cor, estado..."
              placeholderTextColor={colors.textPlaceholder}
              multiline numberOfLines={3} textAlignVertical="top"
            />
          </View>

          {/* Estado */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Estado do produto *</Text>
            <View style={s.conditionsRow}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c.label}
                  style={({ pressed }) => [s.conditionBtn, condition === c.label && s.conditionBtnActive, pressed && { opacity: 0.8 }]}
                  onPress={() => setCondition(c.label)}
                >
                  <Ionicons name={c.icon} size={16} color={condition === c.label ? colors.primary : theme.textMuted} />
                  <Text style={[s.conditionText, condition === c.label && s.conditionTextActive]}>{c.label}</Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* Marca e Preço */}
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Marca *</Text>
              <View style={s.inputWrap}>
                <Ionicons name="pricetag-outline" size={15} color={theme.textMuted} />
                <TextInput style={s.input} value={brand} onChangeText={setBrand} placeholder="Ex: Hering" placeholderTextColor={colors.textPlaceholder} />
              </View>
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Preço (R$) *</Text>
              <View style={s.inputWrap}>
                <Text style={[s.inputPrefix, { color: theme.textMuted }]}>R$</Text>
                <TextInput style={s.input} value={price} onChangeText={setPrice} placeholder="0,00" placeholderTextColor={colors.textPlaceholder} keyboardType="decimal-pad" />
              </View>
            </View>
          </View>

          {/* CEP */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>CEP de origem *</Text>
            <View style={s.inputWrap}>
              <Ionicons name="location-outline" size={15} color={theme.textMuted} />
              <TextInput style={s.input} value={originZip} onChangeText={setOriginZip} placeholder="00000-000" placeholderTextColor={colors.textPlaceholder} keyboardType="numeric" />
            </View>
          </View>

          {/* Fotos */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Fotos do produto (até 4)</Text>
            <Pressable style={({ pressed }) => [s.photoArea, pressed && { opacity: 0.8 }]} onPress={pickImage}>
              {photos.length === 0 ? (
                <View style={s.photoPlaceholder}>
                  <Ionicons name="camera-outline" size={28} color={colors.primaryMedium} />
                  <Text style={s.photoPlaceholderText}>Toque para adicionar foto</Text>
                </View>
              ) : (
                <View style={s.photosRow}>
                  {photos.map((item, i) => (
                    <View key={item.uri} style={s.photoItem}>
                      <Image source={{ uri: item.uri }} style={s.photoPreview} />
                      <Pressable onPress={() => removePhoto(i)} style={s.removePhoto}>
                        <Ionicons name="close" size={14} color="#fff" />
                      </Pressable>
                    </View>
                  ))}
                  {photos.length < 4 && (
                    <View style={s.addPhotoBtn}>
                      <Ionicons name="add" size={24} color={theme.textMuted} />
                    </View>
                  )}
                </View>
              )}
            </Pressable>
          </View>

          {!!error && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => [s.submitBtn, loading && s.btnDisabled, pressed && { opacity: 0.85 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            <Ionicons name={loading ? 'reload-outline' : 'send-outline'} size={18} color="#fff" />
            <Text style={s.submitBtnText}>{loading ? 'Enviando...' : 'Enviar Doação'}</Text>
          </Pressable>
        </View>

        {/* Como funciona */}
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

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  scroll: { padding: spacing.lg, gap: spacing.lg },

  card: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.lg,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardTitle: { fontSize: typography.cardTitle, fontWeight: typography.extrabold, color: theme.textTitle, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: typography.label, color: theme.textMuted, marginTop: 2 },

  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 11,
  },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },
  inputPrefix: { fontSize: typography.body, fontWeight: typography.semibold },
  textarea: { alignItems: 'flex-start', paddingVertical: spacing.sm, minHeight: 80 },

  chipsRow: { gap: spacing.sm, paddingVertical: 2 },
  chip: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: spacing.md, paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
    borderWidth: 1.5, borderColor: theme.border,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  chipTextActive: { color: '#fff', fontWeight: typography.bold },

  conditionsRow: { flexDirection: 'row', gap: spacing.sm },
  conditionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    paddingVertical: 10, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: theme.input,
  },
  conditionBtnActive: { borderColor: colors.primary, backgroundColor: theme.pinkLight },
  conditionText: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  conditionTextActive: { color: colors.primary, fontWeight: typography.bold },

  row: { flexDirection: 'row', gap: spacing.md },
  flex1: { flex: 1 },

  photoArea: { borderRadius: radius.md },
  photoPlaceholder: {
    height: 120, borderRadius: radius.md,
    borderWidth: 2, borderColor: theme.inputBorder, borderStyle: 'dashed',
    backgroundColor: theme.input, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
  },
  photoPlaceholderText: { fontSize: typography.label, color: theme.textMuted },
  photosRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  photoItem: { position: 'relative' },
  photoPreview: { width: 100, height: 100, borderRadius: radius.sm },
  removePhoto: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  addPhotoBtn: {
    width: 100, height: 100, borderRadius: radius.sm,
    borderWidth: 2, borderColor: theme.inputBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center',
  },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },

  submitBtn: {
    backgroundColor: colors.primary, paddingVertical: 15,
    borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.cta,
  },
  btnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },

  howCard: {
    backgroundColor: theme.card, borderRadius: radius.xl,
    padding: spacing.xl, gap: spacing.md,
    borderWidth: 1, borderColor: theme.cardBorder, ...shadows.light,
  },
  howTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  howNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  howNumText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.support },
  howStepText: { flex: 1, fontSize: typography.label, color: theme.textMuted, lineHeight: 20, paddingTop: 4 },

  successContainer: {
    flex: 1, backgroundColor: theme.bg,
    alignItems: 'center', justifyContent: 'center', gap: spacing.md, padding: spacing.xxxl,
  },
  successIconWrap: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: colors.successBg, alignItems: 'center', justifyContent: 'center',
  },
  successTitle: { fontSize: typography.successTitle, fontWeight: typography.extrabold, color: colors.primary, letterSpacing: -0.5 },
  successSubtitle: { fontSize: typography.body, color: theme.textMuted, textAlign: 'center', lineHeight: 22 },
  successBtn: {
    marginTop: spacing.sm, backgroundColor: colors.primary,
    paddingHorizontal: spacing.xxxl, paddingVertical: 14,
    borderRadius: radius.pill, ...shadows.cta,
  },
  successBtnText: { color: '#fff', fontWeight: typography.bold, fontSize: typography.button },
});
