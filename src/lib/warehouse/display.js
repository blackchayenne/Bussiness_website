export function normalizeFolderName(name) {
  if (!name) return name
  const normalized = name.trim().toLowerCase().replace(/\s+/g, ' ')

  if (
    normalized === 'products' ||
    normalized === 'product' ||
    normalized === 'in stock' ||
    normalized === 'in stocks' ||
    normalized === 'ds antik slabs stock'
  ) {
    return 'Products'
  }

  return name
}
