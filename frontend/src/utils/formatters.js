// Date formatting
export function formatDate(date, options = {}) {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const defaultOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  return d.toLocaleDateString('en-US', defaultOptions);
}

export function formatDateTime(date) {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDate(date) {
  if (!date) return '-';
  
  const d = new Date(date);
  if (isNaN(d.getTime())) return '-';

  const now = new Date();
  const diffInDays = Math.floor((d - now) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) return 'Today';
  if (diffInDays === 1) return 'Tomorrow';
  if (diffInDays === -1) return 'Yesterday';
  if (diffInDays > 1) return `In ${diffInDays} days`;
  return `${Math.abs(diffInDays)} days ago`;
}

// Currency formatting
export function formatCurrency(amount, currency = 'INR') {
  if (amount === null || amount === undefined || isNaN(amount)) return '-';

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

  // For large amounts, show in Lakhs
  if (amount >= 100000) {
    const lakhs = (amount / 100000).toFixed(1);
    return `₹${lakhs} LPA`;
  }

  return formatter.format(amount);
}

// Number formatting
export function formatNumber(num, decimals = 0) {
  if (num === null || num === undefined || isNaN(num)) return '-';

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined || isNaN(value)) return '-';

  return `${value.toFixed(decimals)}%`;
}

// String formatting
export function truncateString(str, maxLength = 50) {
  if (!str) return '-';
  if (str.length <= maxLength) return str;

  return str.substring(0, maxLength) + '...';
}

export function capitalizeFirst(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

export function formatStatus(status) {
  if (!status) return '-';
  
  return status
    .split('_')
    .map(word => capitalizeFirst(word))
    .join(' ');
}

// File size formatting
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Phone number formatting
export function formatPhoneNumber(phone) {
  if (!phone) return '-';
  
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Format as Indian mobile number
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{5})(\d{5})/, '$1-$2');
  }
  
  return phone;
}

// Duration formatting
export function formatDuration(minutes) {
  if (!minutes || minutes <= 0) return '-';

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}
