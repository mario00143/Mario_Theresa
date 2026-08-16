/** Formats a whole-rupee amount for display, e.g. formatCurrency(125000) -> "₹1,25,000". */
export function formatCurrency(amount: number, currency: string = 'INR'): string {
  const formatted = Math.round(amount).toLocaleString('en-IN');
  return currency === 'INR' ? `₹${formatted}` : `${currency} ${formatted}`;
}
