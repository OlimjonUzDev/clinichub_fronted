import { Children, cloneElement, isValidElement } from 'react';

// Label'ni real input elementiga dasturiy bog'lash uchun (a11y: htmlFor/id) —
// `children` bitta input bo'lishi ham, input + yordamchi elementlar (masalan
// pastki hint matni) massivi bo'lishi ham mumkin. Shu ikkala holatda ham
// birinchi input/select/textarea'ni topib, unga (agar hali `id` yo'q bo'lsa)
// berilgan id'ni beradi — Field.jsx va DoctorProfile.jsx'dagi BookField shu
// yordamchidan foydalanadi.
const FIELD_TAGS = ['input', 'select', 'textarea'];

export function withFieldId(children, id) {
  let assigned = false;
  return Children.map(children, (child) => {
    if (!assigned && isValidElement(child) && typeof child.type === 'string' && FIELD_TAGS.includes(child.type)) {
      assigned = true;
      return child.props.id ? child : cloneElement(child, { id });
    }
    return child;
  });
}
