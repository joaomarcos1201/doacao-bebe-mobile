const BUYABLE_ANNOUNCEMENT_STATUSES = ['DISPONIVEL', 'ATIVO', 'APROVADO'];
const SOLD_ANNOUNCEMENT_STATUSES = ['VENDIDO', 'SOLD', 'CONCLUIDO', 'FINALIZADO'];
const VISIBLE_STATUSES = [...BUYABLE_ANNOUNCEMENT_STATUSES, ...SOLD_ANNOUNCEMENT_STATUSES, 'RESERVADO'];

export const isProductAvailable = (product) => {
  const announcementStatus = String(product?.statusAnuncio || '').trim().toUpperCase();
  const visibilityStatus = String(product?.statusVisibilidade || '').trim().toUpperCase();

  return BUYABLE_ANNOUNCEMENT_STATUSES.includes(announcementStatus)
    && visibilityStatus !== 'REMOVIDO';
};

export const isProductSold = (product) => {
  const announcementStatus = String(product?.statusAnuncio || '').trim().toUpperCase();
  return SOLD_ANNOUNCEMENT_STATUSES.includes(announcementStatus);
};

export const isProductVisible = (product) => {
  const announcementStatus = String(product?.statusAnuncio || '').trim().toUpperCase();
  const visibilityStatus = String(product?.statusVisibilidade || '').trim().toUpperCase();
  return VISIBLE_STATUSES.includes(announcementStatus) && visibilityStatus !== 'REMOVIDO';
};

export const isProductOwner = (product, user) => {
  const sellerId = product?.vendedor?.id;
  const userId = user?.id;

  return sellerId != null && userId != null && String(sellerId) === String(userId);
};
