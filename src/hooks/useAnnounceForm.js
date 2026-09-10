import { useCallback, useEffect, useRef, useState } from 'react';
import { analyzeApi, categoryApi, cepApi, getApiErrorMessage, productApi } from '../services/api';

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 1;

const FALLBACK_CATEGORIES = [
  { id: 'Roupas', nome: 'Roupas', icon: 'shirt-outline' },
  { id: 'Brinquedos', nome: 'Brinquedos', icon: 'game-controller-outline' },
  { id: 'Móveis', nome: 'Móveis', icon: 'bed-outline' },
  { id: 'Acessórios', nome: 'Acessórios', icon: 'bag-outline' },
  { id: 'Outros', nome: 'Outros', icon: 'ellipsis-horizontal-outline' },
];

export const CONDITIONS = ['Novo', 'Semi-novo', 'Usado'];

export function useAnnounceForm({ onSuccess } = {}) {
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('');
  const [descricao, setDescricao] = useState('');
  const [conservacao, setConservacao] = useState('');
  const [marca, setMarca] = useState('');
  const [preco, setPreco] = useState('');
  const [cep, setCep] = useState('');
  const [photos, setPhotos] = useState([]);

  const [cepLoading, setCepLoading] = useState(false);
  const [cepError, setCepError] = useState('');
  const [cepData, setCepData] = useState(null);

  const [categories, setCategories] = useState(FALLBACK_CATEGORIES);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState([]);
  const [analysisError, setAnalysisError] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [success, setSuccess] = useState(false);

  const cepTimerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    setCategoriesLoading(true);
    categoryApi.list()
      .then((res) => {
        if (!mounted) return;
        const data = Array.isArray(res.data) ? res.data : [];
        if (data.length > 0) {
          setCategories(data.map((c) => ({
            id: c.id || c.nome || c.name,
            nome: c.nome || c.name || c.label,
            icon: c.icon || 'pricetag-outline',
          })));
        }
      })
      .catch(() => {})
      .finally(() => { if (mounted) setCategoriesLoading(false); });
    return () => { mounted = false; };
  }, []);

  const lookupCep = useCallback(async (digits) => {
    setCepLoading(true);
    setCepError('');
    try {
      const res = await cepApi.lookup(digits);
      if (res.data?.erro) {
        setCepData(null);
        setCepError('CEP não encontrado.');
      } else {
        setCepData(res.data);
      }
    } catch {
      setCepData(null);
      setCepError('Não foi possível consultar o CEP.');
    } finally {
      setCepLoading(false);
    }
  }, []);

  const handleCepChange = useCallback((value) => {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    const masked = digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
    setCep(masked);
    setCepData(null);
    setCepError('');
    clearTimeout(cepTimerRef.current);
    if (digits.length === 8) {
      cepTimerRef.current = setTimeout(() => lookupCep(digits), 600);
    }
  }, [lookupCep]);

  const addPhotos = useCallback((assets) => {
    setPhotos((prev) => [...prev, ...assets].slice(0, MAX_PHOTOS));
    setAnalysisResults([]);
    setAnalysisError('');
  }, []);

  const removePhoto = useCallback((index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setAnalysisResults((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const analyzePhotos = useCallback(async (currentPhotos) => {
    const target = currentPhotos || photos;
    if (target.length === 0) return true;
    setAnalyzing(true);
    setAnalysisError('');
    setAnalysisResults([]);
    try {
      const formData = new FormData();
      target.forEach((photo, i) => {
        formData.append(i === 0 ? 'imagem' : `imagem_${i}`, {
          uri: photo.uri,
          name: photo.fileName || `foto-${i + 1}.jpg`,
          type: photo.mimeType || 'image/jpeg',
        });
      });
      const res = await analyzeApi.analyzeImages(formData);
      const results = Array.isArray(res.data?.results) ? res.data.results : [];
      const mapped = target.map((photo, i) => ({
        uri: photo.uri,
        approved: results[i]?.approved !== false,
        reason: results[i]?.reason || '',
      }));
      setAnalysisResults(mapped);
      const allApproved = mapped.every((r) => r.approved);
      if (!allApproved) {
        setAnalysisError('Algumas fotos foram rejeitadas. Remova-as e tente novamente.');
      }
      return allApproved;
    } catch (err) {
      const status = err.response?.status;
      if (!status || status === 404 || status === 405) {
        setAnalysisResults(target.map((p) => ({ uri: p.uri, approved: true, reason: '' })));
        return true;
      }
      if (err.code === 'ECONNABORTED') {
        setAnalysisError('A análise das fotos demorou muito. Tente novamente.');
      } else {
        setAnalysisError(getApiErrorMessage(err, 'Erro ao analisar as fotos. Tente novamente.'));
      }
      return false;
    } finally {
      setAnalyzing(false);
    }
  }, [photos]);

  const validate = useCallback(() => {
    if (!nome.trim() || nome.trim().length < 3) return 'O nome deve ter pelo menos 3 caracteres.';
    if (!categoria) return 'Selecione uma categoria.';
    if (!descricao.trim() || descricao.trim().length < 10) return 'A descrição deve ter pelo menos 10 caracteres.';
    if (!conservacao) return 'Selecione o estado do produto.';
    if (!marca.trim()) return 'Informe a marca do produto.';
    const numericPreco = Number(preco.replace(',', '.'));
    if (!preco.trim() || !Number.isFinite(numericPreco) || numericPreco < 0) return 'Informe um preço válido.';
    if (cep.replace(/\D/g, '').length !== 8) return 'Informe um CEP válido com 8 dígitos.';
    if (cepError) return cepError;
    if (photos.length < MIN_PHOTOS) return `Adicione pelo menos ${MIN_PHOTOS} foto do produto.`;
    if (analysisResults.some((r) => !r.approved)) return 'Remova as fotos rejeitadas antes de continuar.';
    return null;
  }, [nome, categoria, descricao, conservacao, marca, preco, cep, cepError, photos, analysisResults]);

  const submit = useCallback(async () => {
    const validationError = validate();
    if (validationError) { setSubmitError(validationError); return false; }

    if (analysisResults.length === 0 && photos.length > 0) {
      const approved = await analyzePhotos(photos);
      if (!approved) return false;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      const formData = new FormData();
      formData.append('nome', nome.trim());
      formData.append('descricao', descricao.trim());
      formData.append('categoria', categoria);
      formData.append('marca', marca.trim());
      formData.append('conservacao', conservacao);
      formData.append('preco', Number(preco.replace(',', '.')).toFixed(2));
      formData.append('cepOrigem', cep.replace(/\D/g, ''));
      photos.forEach((photo, i) => {
        formData.append(i === 0 ? 'imagem' : `imagem_${i}`, {
          uri: photo.uri,
          name: photo.fileName || `produto-${i + 1}.jpg`,
          type: photo.mimeType || 'image/jpeg',
        });
      });
      await productApi.create(formData);
      setSuccess(true);
      onSuccess?.();
      return true;
    } catch (err) {
      setSubmitError(getApiErrorMessage(err, 'Não foi possível criar o anúncio. Tente novamente.'));
      return false;
    } finally {
      setSubmitting(false);
    }
  }, [validate, analysisResults, photos, analyzePhotos, nome, descricao, categoria, marca, conservacao, preco, cep, onSuccess]);

  const reset = useCallback(() => {
    setNome(''); setCategoria(''); setDescricao(''); setConservacao('');
    setMarca(''); setPreco(''); setCep(''); setPhotos([]);
    setCepData(null); setCepError('');
    setAnalysisResults([]); setAnalysisError('');
    setSubmitError(''); setSuccess(false);
  }, []);

  return {
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
    CONDITIONS,
    MAX_PHOTOS,
    analyzing, analysisResults, analysisError, analyzePhotos,
    submitting, submitError, setSubmitError, success,
    submit, reset,
  };
}
