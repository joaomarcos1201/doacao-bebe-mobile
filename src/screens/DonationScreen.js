import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, Image,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

const maskCPF = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
};

const maskPhone = (v) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d.replace(/(\d{2})(\d)/, '($1) $2').replace(/(\d{5})(\d{1,4})$/, '$1-$2');
};

const CATEGORIES = ['Roupas', 'Brinquedos', 'Móveis', 'Acessórios', 'Alimentação', 'Outros'];
const CONDITIONS = ['Novo', 'Semi-novo', 'Usado'];

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
  const [errorMessage, setErrorMessage] = useState(null);
  const s = styles(theme);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return;
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setPhoto(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('nome', productName);
      formData.append('descricao', description);
      formData.append('categoria', category);
      formData.append('marca', 'Sem marca');
      formData.append('conservacao', condition);
      formData.append('preco', '0');
      formData.append('peso', '0');
      formData.append('altura', '0');
      formData.append('largura', '0');
      formData.append('comprimento', '0');
      formData.append('cepOrigem', '00000-000');
      if (photo) {
        const uriParts = photo.split('/');
        const name = uriParts[uriParts.length - 1];
        formData.append('imagem', {
          uri: photo,
          type: 'image/jpeg',
          name,
        });
      }

      await api.post('/api/products', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(true);
    } catch (error) {
      console.log('[Donation] submit error', error);
      const apiErr = error?.apiError;
      if (apiErr?.status === 401) {
        setErrorMessage('Autenticação necessária. Faça login novamente.');
      } else if (apiErr?.status === 400) {
        setErrorMessage(apiErr?.message || 'Dados inválidos. Verifique os campos obrigatórios.');
      } else {
        setErrorMessage('Não foi possível enviar o anúncio. Tente novamente.');
      }
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
      <View style={s.navbar}>
        <TouchableOpacity onPress={onBack} activeOpacity={0.7}>
          <Text style={s.navBack}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={s.navTitle}>Anunciar</Text>
        <TouchableOpacity onPress={toggleTheme} style={s.themeBtn} activeOpacity={0.7}>
          <Text style={s.themeBtnText}>{theme.isDark ? 'Modo Claro' : 'Modo Escuro'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

        {/* Seção: Produto */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Sobre o produto</Text>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Nome do produto</Text>
            <TextInput
              style={s.input}
              value={productName}
              onChangeText={setProductName}
              placeholder="Ex: Macacão azul 3-6 meses"
              placeholderTextColor={theme.textMuted}
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Descrição</Text>
            <TextInput
              style={[s.input, s.textarea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Descreva o produto: tamanho, cor, estado de conservação..."
              placeholderTextColor={theme.textMuted}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Categoria</Text>
            <View style={s.chipsWrap}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.chip, category === c && s.chipActive]}
                  onPress={() => setCategory(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipText, category === c && s.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Estado do produto</Text>
            <View style={s.chipsWrap}>
              {CONDITIONS.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[s.chip, condition === c && s.chipActive]}
                  onPress={() => setCondition(c)}
                  activeOpacity={0.7}
                >
                  <Text style={[s.chipText, condition === c && s.chipTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Divisor */}
        <View style={s.divider} />

        {/* Seção: Contato */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Seus dados</Text>

          <View style={s.fieldGroup}>
            <Text style={s.label}>Nome completo</Text>
            <TextInput
              style={s.input}
              value={donorName}
              onChangeText={setDonorName}
              placeholder="Seu nome"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="words"
            />
          </View>

          <View style={s.row}>
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
        </View>

        {/* Foto em destaque */}
        <TouchableOpacity style={s.photoBanner} onPress={pickImage} activeOpacity={0.8}>
          {photo ? (
            <Image source={{ uri: photo }} style={s.photoBannerImage} />
          ) : (
            <View style={s.photoBannerPlaceholder}>
              <Text style={s.photoBannerIcon}>📷</Text>
              <Text style={s.photoBannerText}>Toque para adicionar uma foto</Text>
            </View>
          )}
        </TouchableOpacity>

        {errorMessage ? <Text style={s.errorText}>{errorMessage}</Text> : null}

        <TouchableOpacity
          style={[s.submitBtn, loading && s.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={s.submitBtnText}>{loading ? 'Enviando...' : 'Enviar Doação'}</Text>
        </TouchableOpacity>

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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.isDark ? '#0f0f0f' : '#f9f5f6' },

  navbar: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12,
    backgroundColor: theme.bg, borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  navBack: { color: theme.pink, fontSize: 15, fontWeight: '600', width: 60 },
  navTitle: { fontSize: 16, fontWeight: '700', color: theme.text },
  themeBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: theme.pinkLight, borderWidth: 1, borderColor: theme.border },
  themeBtnText: { color: theme.pink, fontSize: 12, fontWeight: '600' },

  scroll: { padding: 16, gap: 16 },

  // Foto banner
  photoBanner: {
    borderRadius: 16, overflow: 'hidden',
    borderWidth: 2, borderColor: theme.border, borderStyle: 'dashed',
  },
  photoBannerImage: { width: '100%', height: 200 },
  photoBannerPlaceholder: {
    height: 160, alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2', gap: 6,
  },
  photoBannerIcon: { fontSize: 36 },
  photoBannerText: { fontSize: 14, fontWeight: '600', color: theme.text },
  photoBannerHint: { fontSize: 11, color: theme.textMuted },

  // Seções
  section: {
    backgroundColor: theme.card, borderRadius: 20, padding: 20,
    gap: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: theme.pink },
  divider: { height: 0 },

  fieldGroup: { gap: 6 },
  label: { fontSize: 13, fontWeight: '600', color: theme.text },
  input: {
    backgroundColor: theme.isDark ? '#1a1a1a' : '#fdf0f2',
    borderWidth: 1, borderColor: theme.isDark ? '#333' : '#e8d0d4',
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: theme.text,
  },
  textarea: { minHeight: 90, paddingTop: 12 },
  row: { flexDirection: 'row', gap: 12 },
  flex1: { flex: 1 },

  // Chips
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1.5, borderColor: theme.border,
    backgroundColor: theme.bg,
  },
  chipActive: { borderColor: theme.pink, backgroundColor: 'rgba(232,96,122,0.1)' },
  chipText: { fontSize: 13, color: theme.textMuted, fontWeight: '500' },
  chipTextActive: { color: theme.pink, fontWeight: '700' },

  // Botão submit
  submitBtn: {
    backgroundColor: theme.pink, paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
    shadowColor: theme.pink, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  submitBtnDisabled: { opacity: 0.7 },
  submitBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  // Como funciona
  howCard: {
    backgroundColor: theme.card, borderRadius: 20, padding: 20,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
    gap: 14,
  },
  howTitle: { fontSize: 15, fontWeight: '700', color: theme.text },
  howStep: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  howNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: theme.pink, alignItems: 'center', justifyContent: 'center', flexShrink: 0,
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
  errorText: { color: '#e05555', textAlign: 'center', marginBottom: 8 },
});
