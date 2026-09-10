import React, { useCallback } from 'react';
import {
  ActivityIndicator, Image, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import ScreenHeader from '../components/ScreenHeader';
import { useAnnounceForm } from '../hooks/useAnnounceForm';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

const CONDITION_ICONS = { Novo: 'sparkles-outline', 'Semi-novo': 'thumbs-up-outline', Usado: 'cube-outline' };

export default function DonationScreen({ onBack, onProductCreated }) {
  const { theme } = useTheme();
  const s = styles(theme);

  const {
    nome, setNome,
    categoria, setCategoria,
    descricao, setDescricao,
    conservacao, setConservacao,
    marca, setMarca,
    preco, setPreco,
    cep, handleCepChange,
    photos, addPhotos, removePhoto,
    cepLoading, cepError, cepData,
    categories, categoriesLoading,
    CONDITIONS, MAX_PHOTOS,
    analyzing, analysisResults, analysisError, analyzePhotos,
    submitting, submitError, setSubmitError, success,
    submit, reset,
  } = useAnnounceForm({ onSuccess: onProductCreated });

  const pickImages = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      setSubmitError('Permissão para acessar a galeria é necessária.');
      return;
    }
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: remaining,
      allowsEditing: false,
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length > 0) {
      addPhotos(result.assets);
    }
  }, [photos.length, MAX_PHOTOS, addPhotos, setSubmitError]);

  const handleAnalyze = useCallback(async () => {
    setSubmitError('');
    await analyzePhotos(photos);
  }, [analyzePhotos, photos, setSubmitError]);

  const handleSubmit = useCallback(async () => {
    setSubmitError('');
    await submit();
  }, [submit, setSubmitError]);

  if (success) {
    return (
      <View style={s.successContainer}>
        <View style={s.successIconWrap}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
        </View>
        <Text style={s.successTitle}>Anúncio enviado!</Text>
        <Text style={s.successSubtitle}>
          Seu produto foi enviado para análise. O administrador irá revisar e aprovar em breve.
        </Text>
        <Pressable style={({ pressed }) => [s.successBtn, pressed && { opacity: 0.85 }]} onPress={() => { reset(); onBack?.(); }}>
          <Text style={s.successBtnText}>Voltar para o início</Text>
        </Pressable>
        <Pressable style={({ pressed }) => [s.successBtnOutline, pressed && { opacity: 0.7 }]} onPress={reset}>
          <Text style={s.successBtnOutlineText}>Criar outro anúncio</Text>
        </Pressable>
      </View>
    );
  }

  const hasRejected = analysisResults.some((r) => !r.approved);
  const allAnalyzed = analysisResults.length === photos.length && photos.length > 0;
  const allApproved = allAnalyzed && !hasRejected;

  return (
    <KeyboardAvoidingView style={s.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScreenHeader title="Anunciar Produto" onBack={onBack} backLabel="Voltar" />
      <ScrollView
        contentContainerStyle={s.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── DADOS DO PRODUTO ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="megaphone-outline" size={22} color={colors.primary} />
            <View style={s.flex1}>
              <Text style={s.cardTitle}>Dados do produto</Text>
              <Text style={s.cardSubtitle}>Preencha as informações do item que deseja anunciar</Text>
            </View>
          </View>

          {/* Nome */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Nome do produto *</Text>
            <View style={s.inputWrap}>
              <Ionicons name="cube-outline" size={15} color={theme.textMuted} />
              <TextInput
                style={s.input}
                value={nome}
                onChangeText={setNome}
                placeholder="Ex: Macacão azul 6 meses"
                placeholderTextColor={colors.textPlaceholder}
                maxLength={100}
              />
            </View>
          </View>

          {/* Categoria */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Categoria *</Text>
            {categoriesLoading ? (
              <ActivityIndicator size="small" color={colors.primary} style={{ alignSelf: 'flex-start' }} />
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.chipsRow}>
                {categories.map((c) => (
                  <Pressable
                    key={c.id}
                    style={({ pressed }) => [s.chip, categoria === c.id && s.chipActive, pressed && { opacity: 0.8 }]}
                    onPress={() => setCategoria(c.id)}
                  >
                    <Ionicons name={c.icon} size={13} color={categoria === c.id ? '#fff' : theme.textMuted} />
                    <Text style={[s.chipText, categoria === c.id && s.chipTextActive]}>{c.nome}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>

          {/* Descrição */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Descrição *</Text>
            <TextInput
              style={[s.inputWrap, s.textarea]}
              value={descricao}
              onChangeText={setDescricao}
              placeholder="Descreva o produto: tamanho, cor, estado, motivo da venda..."
              placeholderTextColor={colors.textPlaceholder}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              maxLength={1000}
            />
          </View>

          {/* Estado de conservação */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Estado do produto *</Text>
            <View style={s.conditionsRow}>
              {CONDITIONS.map((c) => (
                <Pressable
                  key={c}
                  style={({ pressed }) => [s.conditionBtn, conservacao === c && s.conditionBtnActive, pressed && { opacity: 0.8 }]}
                  onPress={() => setConservacao(c)}
                >
                  <Ionicons name={CONDITION_ICONS[c]} size={16} color={conservacao === c ? colors.primary : theme.textMuted} />
                  <Text style={[s.conditionText, conservacao === c && s.conditionTextActive]}>{c}</Text>
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
                <TextInput
                  style={s.input}
                  value={marca}
                  onChangeText={setMarca}
                  placeholder="Ex: Hering"
                  placeholderTextColor={colors.textPlaceholder}
                  maxLength={60}
                />
              </View>
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Preço (R$) *</Text>
              <View style={s.inputWrap}>
                <Text style={[s.inputPrefix, { color: theme.textMuted }]}>R$</Text>
                <TextInput
                  style={s.input}
                  value={preco}
                  onChangeText={setPreco}
                  placeholder="0,00"
                  placeholderTextColor={colors.textPlaceholder}
                  keyboardType="decimal-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </View>
        </View>

        {/* ── LOCALIZAÇÃO ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="location-outline" size={22} color={colors.primary} />
            <View style={s.flex1}>
              <Text style={s.cardTitle}>Localização</Text>
              <Text style={s.cardSubtitle}>Informe o CEP de origem do produto</Text>
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>CEP de origem *</Text>
            <View style={[s.inputWrap, cepError ? s.inputError : null]}>
              <Ionicons name="location-outline" size={15} color={cepError ? colors.error : theme.textMuted} />
              <TextInput
                style={s.input}
                value={cep}
                onChangeText={handleCepChange}
                placeholder="00000-000"
                placeholderTextColor={colors.textPlaceholder}
                keyboardType="numeric"
                maxLength={9}
              />
              {cepLoading && <ActivityIndicator size="small" color={colors.primary} />}
              {!cepLoading && cepData && (
                <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              )}
            </View>
            {!!cepError && (
              <Text style={s.fieldError}>{cepError}</Text>
            )}
            {!!cepData && (
              <View style={s.cepResult}>
                <Ionicons name="map-outline" size={14} color={colors.primary} />
                <Text style={s.cepResultText}>
                  {[cepData.logradouro, cepData.bairro, cepData.localidade, cepData.uf]
                    .filter(Boolean).join(', ')}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* ── FOTOS ── */}
        <View style={s.card}>
          <View style={s.cardHeader}>
            <Ionicons name="camera-outline" size={22} color={colors.primary} />
            <View style={s.flex1}>
              <Text style={s.cardTitle}>Fotos do produto</Text>
              <Text style={s.cardSubtitle}>
                Adicione até {MAX_PHOTOS} fotos. A primeira será a imagem principal.
              </Text>
            </View>
          </View>

          {/* Grid de fotos */}
          <View style={s.photosGrid}>
            {photos.map((photo, i) => {
              const result = analysisResults[i];
              const isRejected = result && !result.approved;
              const isApproved = result && result.approved;
              return (
                <View key={photo.uri} style={s.photoItem}>
                  <Image source={{ uri: photo.uri }} style={[s.photoPreview, isRejected && s.photoRejected]} />
                  {i === 0 && (
                    <View style={s.photoPrimaryBadge}>
                      <Text style={s.photoPrimaryText}>Principal</Text>
                    </View>
                  )}
                  {isRejected && (
                    <View style={s.photoStatusBadge}>
                      <Ionicons name="close-circle" size={14} color="#fff" />
                      <Text style={s.photoStatusText}>Rejeitada</Text>
                    </View>
                  )}
                  {isApproved && (
                    <View style={[s.photoStatusBadge, s.photoApprovedBadge]}>
                      <Ionicons name="checkmark-circle" size={14} color="#fff" />
                    </View>
                  )}
                  <Pressable onPress={() => removePhoto(i)} style={s.removePhoto}>
                    <Ionicons name="close" size={14} color="#fff" />
                  </Pressable>
                  {isRejected && !!result.reason && (
                    <Text style={s.rejectedReason} numberOfLines={2}>{result.reason}</Text>
                  )}
                </View>
              );
            })}
            {photos.length < MAX_PHOTOS && (
              <Pressable
                style={({ pressed }) => [s.addPhotoBtn, pressed && { opacity: 0.7 }]}
                onPress={pickImages}
              >
                <Ionicons name="add" size={28} color={theme.textMuted} />
                <Text style={s.addPhotoText}>Adicionar</Text>
              </Pressable>
            )}
          </View>

          {/* Botão de análise de IA */}
          {photos.length > 0 && !allApproved && (
            <Pressable
              style={({ pressed }) => [s.analyzeBtn, (analyzing || submitting) && s.btnDisabled, pressed && { opacity: 0.85 }]}
              onPress={handleAnalyze}
              disabled={analyzing || submitting}
            >
              {analyzing ? (
                <>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text style={s.analyzeBtnText}>Analisando fotos...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="scan-outline" size={18} color={colors.primary} />
                  <Text style={s.analyzeBtnText}>Analisar fotos com IA</Text>
                </>
              )}
            </Pressable>
          )}

          {allApproved && (
            <View style={s.approvedBanner}>
              <Ionicons name="checkmark-circle" size={18} color={colors.success} />
              <Text style={s.approvedBannerText}>Todas as fotos foram aprovadas!</Text>
            </View>
          )}

          {!!analysisError && (
            <View style={s.errorBox}>
              <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
              <Text style={s.errorText}>{analysisError}</Text>
            </View>
          )}
        </View>

        {/* ── ERRO GERAL ── */}
        {!!submitError && (
          <View style={s.errorBox}>
            <Ionicons name="alert-circle-outline" size={14} color={colors.error} />
            <Text style={s.errorText}>{submitError}</Text>
          </View>
        )}

        {/* ── BOTÃO ENVIAR ── */}
        <Pressable
          style={({ pressed }) => [s.submitBtn, (submitting || analyzing) && s.btnDisabled, pressed && { opacity: 0.85 }]}
          onPress={handleSubmit}
          disabled={submitting || analyzing}
        >
          {submitting ? (
            <>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={s.submitBtnText}>Enviando anúncio...</Text>
            </>
          ) : (
            <>
              <Ionicons name="send-outline" size={18} color="#fff" />
              <Text style={s.submitBtnText}>Publicar Anúncio</Text>
            </>
          )}
        </Pressable>

        {/* ── COMO FUNCIONA ── */}
        <View style={s.howCard}>
          <Text style={s.howTitle}>Como funciona?</Text>
          {[
            'Preencha os dados e adicione fotos do produto',
            'As fotos são analisadas automaticamente pela IA',
            'Aguarde a aprovação do administrador',
            'Compradores poderão encontrar e adquirir seu produto',
          ].map((text, i) => (
            <View key={i} style={s.howStep}>
              <View style={s.howNum}>
                <Text style={s.howNumText}>{i + 1}</Text>
              </View>
              <Text style={s.howStepText}>{text}</Text>
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
  cardTitle: { fontSize: typography.button, fontWeight: typography.extrabold, color: theme.textTitle, letterSpacing: -0.3 },
  cardSubtitle: { fontSize: typography.label, color: theme.textMuted, marginTop: 2 },

  fieldGroup: { gap: spacing.xs },
  label: { fontSize: typography.label, fontWeight: typography.semibold, color: theme.text },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: theme.input, borderWidth: 1.5, borderColor: theme.inputBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: 11,
  },
  inputError: { borderColor: colors.error },
  input: { flex: 1, fontSize: typography.body, color: theme.text, paddingVertical: 0 },
  inputPrefix: { fontSize: typography.body, fontWeight: typography.semibold },
  textarea: { alignItems: 'flex-start', paddingVertical: spacing.sm, minHeight: 90 },
  fieldError: { fontSize: typography.support, color: colors.error, marginTop: 2 },

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
    borderWidth: 1.5, borderColor: theme.border, backgroundColor: theme.input,
  },
  conditionBtnActive: { borderColor: colors.primary, backgroundColor: theme.pinkLight },
  conditionText: { fontSize: typography.label, color: theme.textMuted, fontWeight: typography.medium },
  conditionTextActive: { color: colors.primary, fontWeight: typography.bold },

  row: { flexDirection: 'row', gap: spacing.md },
  flex1: { flex: 1 },

  cepResult: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: theme.pinkLight, borderRadius: radius.xs,
    paddingHorizontal: spacing.sm, paddingVertical: 6,
  },
  cepResultText: { fontSize: typography.support, color: colors.primary, flex: 1 },

  photosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  photoItem: { position: 'relative', marginBottom: spacing.xs },
  photoPreview: { width: 90, height: 90, borderRadius: radius.sm },
  photoRejected: { opacity: 0.5, borderWidth: 2, borderColor: colors.error },
  photoPrimaryBadge: {
    position: 'absolute', bottom: 4, left: 4,
    backgroundColor: colors.primary, borderRadius: radius.xs,
    paddingHorizontal: 5, paddingVertical: 2,
  },
  photoPrimaryText: { color: '#fff', fontSize: 9, fontWeight: typography.bold },
  photoStatusBadge: {
    position: 'absolute', top: 4, left: 4,
    backgroundColor: colors.error, borderRadius: radius.xs,
    flexDirection: 'row', alignItems: 'center', gap: 2,
    paddingHorizontal: 4, paddingVertical: 2,
  },
  photoApprovedBadge: { backgroundColor: colors.success },
  photoStatusText: { color: '#fff', fontSize: 9, fontWeight: typography.bold },
  removePhoto: {
    position: 'absolute', top: 4, right: 4,
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.65)', alignItems: 'center', justifyContent: 'center',
  },
  rejectedReason: {
    width: 90, fontSize: 9, color: colors.error,
    marginTop: 2, textAlign: 'center',
  },
  addPhotoBtn: {
    width: 90, height: 90, borderRadius: radius.sm,
    borderWidth: 2, borderColor: theme.inputBorder, borderStyle: 'dashed',
    alignItems: 'center', justifyContent: 'center', gap: 4,
  },
  addPhotoText: { fontSize: 10, color: theme.textMuted },

  analyzeBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    paddingVertical: 12, borderRadius: radius.sm,
    borderWidth: 1.5, borderColor: colors.primary,
    backgroundColor: theme.pinkLight,
  },
  analyzeBtnText: { color: colors.primary, fontSize: typography.label, fontWeight: typography.bold },

  approvedBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    backgroundColor: colors.successBg, borderWidth: 1, borderColor: colors.successBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  approvedBannerText: { color: colors.successText, fontSize: typography.label, fontWeight: typography.semibold },

  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.xs,
    backgroundColor: colors.errorBg, borderWidth: 1, borderColor: colors.errorBorder,
    borderRadius: radius.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
  },
  errorText: { color: colors.errorText, fontSize: typography.label, flex: 1 },

  submitBtn: {
    backgroundColor: colors.primary, paddingVertical: 16,
    borderRadius: radius.md, flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    ...shadows.cta,
  },
  btnDisabled: { opacity: 0.6 },
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
    alignItems: 'center', justifyContent: 'center',
    gap: spacing.md, padding: spacing.xxxl,
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
  successBtnOutline: {
    paddingHorizontal: spacing.xxxl, paddingVertical: 12,
    borderRadius: radius.pill, borderWidth: 1.5, borderColor: colors.primary,
  },
  successBtnOutlineText: { color: colors.primary, fontWeight: typography.bold, fontSize: typography.button },
});
