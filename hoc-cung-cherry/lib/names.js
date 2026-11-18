// Chuẩn hoá họ tên để so khớp khi đăng nhập
export const normName = s => String(s || '').normalize('NFC').toLowerCase().replace(/\s+/g, ' ').trim();
export const plainName = s => normName(s).normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd');
export const cleanName = s => String(s || '').normalize('NFC').replace(/\s+/g, ' ').trim();
