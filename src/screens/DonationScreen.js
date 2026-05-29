import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';

const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

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

export default function DonationScreen({ onBack }) {
  const { theme, toggleTheme } = useTheme();
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [condition, setCondition] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [donorName, setDonorName] = useState('');
  const [cpf, setCpf] = useState('');
  const [photo, setPhoto] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const s = styles(theme);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1500);
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
      {/* Navbar */}
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.backBtn}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Doar Produto</Text>
        <TouchableOpacity onPress={toggleTheme} activeOpacity={0.7}>
          <Text style={s.themeBtn}>{theme.isDark ? '☀️' : '🌙'}</Text>
        </TouchableOpacity>
      </View>

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

          {/* Grid: Condição + WhatsApp */}
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
              <Text style={s.label}>WhatsApp</Text>
              <TextInput
                style={s.input}
                value={whatsapp}
                onChangeText={(v) => setWhatsapp(maskPhone(v))}
                placeholder="(00) 00000-0000"
                placeholderTextColor={theme.textMuted}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Grid: Nome + CPF */}
          <View style={s.row}>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>Seu nome</Text>
              <TextInput
                style={s.input}
                value={donorName}
                onChangeText={setDonorName}
                placeholder="Nome completo"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="words"
              />
            </View>
            <View style={[s.fieldGroup, s.flex1]}>
              <Text style={s.label}>CPF</Text>
              <TextInput
                style={s.input}
                value={cpf}
                onChangeText={(v) => setCpf(maskCPF(v))}
                placeholder="000.000.000-00"
                placeholderTextColor={theme.textMuted}
                keyboardType="numeric"
              />
            </View>
          </View>

          {/* Upload de foto */}
          <View style={s.fieldGroup}>
            <Text style={s.label}>Foto do produto (opcional)</Text>
            <TouchableOpacity style={s.photoBtn} onPress={pickImage} activeOpacity={0.8}>
              {photo ? (
                <Image source={{ uri: photo }} style={s.photoPreview} />
              ) : (
                <View style={s.photoPlaceholder}>
                  <Text style={s.photoPlaceholderIcon}>📷</Text>
                  <Text style={s.photoPlaceholderText}>Toque para adicionar foto</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

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
  photoPreview: { width: 120, height: 120, borderRadius: 12 },
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
