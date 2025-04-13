import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import * as multer from 'multer';

export const multerConfig = {
  storage: multer.diskStorage({
    destination: './uploads', // Fayllar saqlanadigan joy
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${uuidv4()}`;
      const fileExt = extname(file.originalname); // Asl kengaytmani olish
      cb(null, `${uniqueSuffix}${fileExt}`);
    },
  }),
};
