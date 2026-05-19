// Format date as DD/MM/YYYY
export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Format date as DD / Mon / YYYY
export const formatDateWithShortMonth = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, '0');
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = monthNames[d.getMonth()];
  const year = d.getFullYear();
  return `${day} / ${month} / ${year}`;
};

// Format price in Indian Rupee
export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(price);
};

// Get expiry status
export const getExpiryStatus = (expiryDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const thirtyDaysLater = new Date(today);
  thirtyDaysLater.setDate(thirtyDaysLater.getDate() + 30);

  if (expiry < today) {
    return { status: 'EXPIRED', color: 'red', text: 'Expired' };
  } else if (expiry < thirtyDaysLater) {
    return { status: 'EXPIRING_SOON', color: 'orange', text: 'Expiring Soon' };
  } else {
    return { status: 'VALID', color: 'green', text: 'Valid' };
  }
};
