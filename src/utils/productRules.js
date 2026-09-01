const BUYABLE_ANNOUNCEMENT_STATUSES = ['DISPONIVEL', 'ATIVO', 'APROVADO'];

export const isProductAvailable = (product) => {
  const announcementStatus = String(product?.statusAnuncio || '').trim().toUpperCase();
  const visibilityStatus = String(product?.statusVisibilidade || '').trim().toUpperCase();

  return BUYABLE_ANNOUNCEMENT_STATUSES.includes(announcementStatus)
    && visibilityStatus !== 'REMOVIDO';
};

export const isProductOwner = (product, user) => {
  const sellerId = product?.vendedor?.id;
  const userId = user?.id;

  return sellerId != null && userId != null && String(sellerId) === String(userId);
};
