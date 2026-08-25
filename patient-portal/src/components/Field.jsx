// Admin panel (DoctorCreate.jsx va h.k.) dagi Field naqshiga mos — majburiy
// maydon belgisi (*) va xato matnini bitta joyda standartlashtiradi.
// `icon` ixtiyoriy — berilsa, input chap tomoniga ikonka qo'shiladi (Login/Register/
// Profile'dagi ikonka-prefiksli inputlar uchun, DoctorProfile'dagi BookField o'rnini bosadi).
export default function Field({ label, required, error, icon: Icon, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      {Icon ? (
        <div className="relative">
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {children}
        </div>
      ) : children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}
