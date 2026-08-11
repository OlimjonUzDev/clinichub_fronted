// Bemor va doktorni masofaviy (video/ovozli/chat) bog'laydigan qabul xonasi.
// Jitsi Meet — bepul, ro'yxatdan o'tishsiz, backend o'zgarishisiz ishlaydi.
// Xona nomi appointment id + boshlanish vaqtidan hosil qilinadi — shu appointment'ga
// tegishli ikkala tomon (bemor va doktor) bir xil xonaga tushadi.
export function jitsiRoomFor(appointment) {
  const started = new Date(appointment.start_time).getTime();
  return `ClinicHub-Appt-${appointment.id}-${started}`;
}

export function jitsiUrlFor(appointment) {
  return `https://meet.jit.si/${jitsiRoomFor(appointment)}`;
}
