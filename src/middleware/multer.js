import multer from 'multer';

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024,
  },
  fileFilter(req, file, callback) {
    const isImageMime = file.mimetype && file.mimetype.startsWith('image/');
    const isImageExt = file.originalname.match(/\.(jpg|jpeg|png|webp|gif)$/i);

    if (!isImageMime && !isImageExt) {
      callback(new Error('Bad file type'));
      return;
    }

    callback(null, true);
  },
});

export const uploadAvatar = upload.single('avatar');
export const uploadPhoto = upload.single('photo');