// Bemor va doktorni masofaviy (video/ovozli/chat) bog'laydigan qabul xonasi.
// Jitsi Meet — bepul, ro'yxatdan o'tishsiz, backend o'zgarishisiz ishlaydi.
// Xona nomi backend generatsiya qilgan tasodifiy `video_room_token`dan (UUID)
// hosil qilinadi — appointment id + boshlanish vaqtidan hisoblanmaydi, chunki
// bular oldindan taxmin qilinishi mumkin edi (masalan ochiq busy-slots
// endpointi orqali), bu esa begona odamga xonani "hisoblab topish" imkonini
// berardi. `video_room_token` backendda read-only va faqat shu appointment'ga
// tegishli ikkala tomon (bemor va doktor) o'z javobida oladi.
export function jitsiRoomFor(appointment) {
  return `ClinicHub-Appt-${appointment.video_room_token}`;
}

export function jitsiUrlFor(appointment) {
  return `https://meet.jit.si/${jitsiRoomFor(appointment)}`;
}
