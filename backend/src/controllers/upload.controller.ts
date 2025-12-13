import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

// File Filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only images are allowed (jpeg, jpg, png, gif)!'));
    }
};

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: fileFilter
});

export const uploadMiddleware = upload.single('image');

export const uploadImage = (req: Request, res: Response): void => {
    if (!req.file) {
        res.status(400).json({ message: 'No file uploaded' });
        return;
    }

    // Return the URL to access the file
    // Assumes the server serves the 'uploads' directory statically at /uploads
    const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({
        message: 'File uploaded successfully',
        url: fileUrl,
        filename: req.file.filename
    });
};

export const uploadMultipleMiddleware = upload.array('images', 10); // Max 10 images

export const uploadMultipleImages = (req: Request, res: Response): void => {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        res.status(400).json({ message: 'No files uploaded' });
        return;
    }

    const files = req.files as Express.Multer.File[];
    const fileUrls = files.map(file => ({
        url: `${req.protocol}://${req.get('host')}/uploads/${file.filename}`,
        filename: file.filename
    }));

    res.status(200).json({
        message: 'Files uploaded successfully',
        files: fileUrls
    });
};
