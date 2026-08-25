// Admin panel (src/components/DataTable.jsx) dagi StatusBadge rang xaritasiga mos —
// bir xil holat (masalan "confirmed") ikkala loyihada ham bir xil rangda ko'rinsin.
export const STATUS_COLORS = {
  pending: 'text-yellow-600 border-yellow-500 bg-yellow-50',
  confirmed: 'text-blue-600 border-blue-400 bg-blue-50',
  completed: 'text-green-600 border-green-500 bg-green-50',
  cancelled: 'text-red-500 border-red-400 bg-red-50',
  paid: 'text-green-600 border-green-500 bg-green-50',
  failed: 'text-red-500 border-red-400 bg-red-50',
  refunded: 'text-purple-600 border-purple-400 bg-purple-50',
  active: 'text-green-600 border-green-500 bg-green-50',
  inactive: 'text-gray-500 border-gray-400 bg-gray-50',
  draft: 'text-gray-500 border-gray-400 bg-gray-50',
};

export function statusBadgeCls(status) {
  const color = STATUS_COLORS[status] || STATUS_COLORS.draft;
  return `text-xs font-medium px-2.5 py-1 rounded-full border ${color}`;
}
