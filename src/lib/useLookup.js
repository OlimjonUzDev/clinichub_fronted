import { useEffect, useState } from 'react';
import api from '../api/axios';

// Backend often returns a foreign key as a bare ID instead of a nested object.
// This fetches the referenced list once and builds an id -> item map so pages
// can resolve names locally, regardless of whether the API later starts
// returning nested objects (resolveRef handles both shapes).
export function useLookup(url, token) {
  const [map, setMap] = useState({});

  useEffect(() => {
    if (!url || !token) return;
    api.get(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const m = {};
        (res.data || []).forEach(item => { m[item.id] = item; });
        setMap(m);
      })
      .catch(() => {});
  }, [url, token]);

  return map;
}

// val may already be a nested object (future-proof) or a bare FK id.
export function resolveRef(val, map) {
  if (val && typeof val === 'object') return val;
  return map[val] || null;
}

export function resolveName(val, map, lang) {
  const obj = resolveRef(val, map);
  if (!obj) return null;
  return lang === 'ru' ? (obj.name_ru || obj.name_uz) : obj.name_uz;
}
