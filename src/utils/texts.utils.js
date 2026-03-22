export const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s/g, '_')
    .replace(/[^a-zA-Z0-9_().-]/g, '');
};
