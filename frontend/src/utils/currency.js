export const formatCurrency = (n, opts = {}) =>
  `${Number(n || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    ...opts,
  })} MMK`;
