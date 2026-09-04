import { useId } from 'react';
import { withFieldId } from '../lib/withFieldId';

// Admin panel (DoctorCreate.jsx va h.k.) dagi Field naqshiga mos — majburiy
// maydon belgisi (*) va xato matnini bitta joyda standartlashtiradi.
// `icon` ixtiyoriy — berilsa, input chap tomoniga ikonka qo'shiladi (Login/Register/
// Profile'dagi ikonka-prefiksli inputlar uchun, DoctorProfile'dagi BookField o'rnini bosadi).
// Label ekran o'quvchilari uchun input'ga `htmlFor`/`id` orqali dasturiy
// bog'lanadi (withFieldId — children ichidagi input/select/textarea'ga id beradi).
export default function Field({ label, required, error, icon: Icon, children }) {
  const inputId = useId();
  const content = withFieldId(children, inputId);

  return (
    <div>
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700 mb-1.5">
        {required && <span className="text-red-500 mr-0.5" aria-hidden="true">*</span>}
        {label}
      </label>
      {Icon ? (
        <div className="relative">
          <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          {content}
        </div>
      ) : content}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}
