const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const logger = require('../config/logger');

/**
 * Secure file upload middleware
 * Implements strict file validation, size limits, and safe storage
 */

// Allowed file types (whitelist approach)
const ALLOWED_IMAGE_TYPES = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp'
};

const ALLOWED_DOCUMENT_TYPES = {
  'application/pdf': '.pdf',
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png'
};

// File size limits (in bytes)
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validate file type using magic numbers (file signatures)
 * This prevents users from bypassing MIME type checks by renaming files
 */
const validateFileSignature = (buffer, mimeType) => {
  const signatures = {
    'image/jpeg': [[0xFF, 0xD8, 0xFF]],
    'image/png': [[0x89, 0x50, 0x4E, 0x47]],
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]]
  };

  const fileSignatures = signatures[mimeType];
  if (!fileSignatures) return false;

  return fileSignatures.some(signature => {
    return signature.every((byte, index) => buffer[index] === byte);
  });
};

/**
 * Generate secure random filename
 */
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname).toLowerCase();
  const randomName = crypto.randomBytes(16).toString('hex');
  return `${randomName}${ext}`;
};

/**
 * Storage configuration for secure file uploads
 */
const createSecureStorage = (uploadPath) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      // Store files outside web root for security
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      // Generate secure random filename
      const secureFilename = generateSecureFilename(file.originalname);
      cb(null, secureFilename);
    }
  });
};

/**
 * File filter for images
 */
const imageFileFilter = (req, file, cb) => {
  if (!ALLOWED_IMAGE_TYPES[file.mimetype]) {
    logger.warn('Rejected file upload - invalid image type', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      userId: req.user?.id,
      ip: req.ip
    });
    return cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
  cb(null, true);
};

/**
 * File filter for documents
 */
const documentFileFilter = (req, file, cb) => {
  if (!ALLOWED_DOCUMENT_TYPES[file.mimetype]) {
    logger.warn('Rejected file upload - invalid document type', {
      mimetype: file.mimetype,
      originalname: file.originalname,
      userId: req.user?.id,
      ip: req.ip
    });
    return cb(new Error('Only PDF and image documents are allowed'), false);
  }
  cb(null, true);
};

/**
 * Middleware to validate file after upload using magic numbers
 */
const validateUploadedFile = (allowedTypes) => {
  return (req, res, next) => {
    if (!req.file && !req.files) {
      return next();
    }

    const files = req.files ? req.files : [req.file];

    for (const file of files) {
      if (!file) continue;

      // Read first few bytes to check file signature
      const fs = require('fs');
      const buffer = Buffer.alloc(8);
      const fd = fs.openSync(file.path, 'r');
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);

      // Validate file signature
      if (!validateFileSignature(buffer, file.mimetype)) {
        // Delete the file
        fs.unlinkSync(file.path);

        logger.warn('Rejected file upload - invalid file signature', {
          mimetype: file.mimetype,
          originalname: file.originalname,
          userId: req.user?.id,
          ip: req.ip
        });

        return res.status(400).json({
          error: 'Invalid file',
          message: 'File type does not match its content'
        });
      }
    }

    next();
  };
};

/**
 * Image upload middleware
 */
const uploadImage = (uploadPath = './uploads/images') => {
  return multer({
    storage: createSecureStorage(uploadPath),
    fileFilter: imageFileFilter,
    limits: {
      fileSize: MAX_IMAGE_SIZE,
      files: 5 // Maximum 5 files per request
    }
  });
};

/**
 * Document upload middleware
 */
const uploadDocument = (uploadPath = './uploads/documents') => {
  return multer({
    storage: createSecureStorage(uploadPath),
    fileFilter: documentFileFilter,
    limits: {
      fileSize: MAX_DOCUMENT_SIZE,
      files: 3 // Maximum 3 documents per request
    }
  });
};

/**
 * Error handler for multer errors
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    logger.warn('File upload error', {
      error: error.message,
      code: error.code,
      userId: req.user?.id,
      ip: req.ip
    });

    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'The uploaded file exceeds the size limit'
      });
    }

    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        error: 'Too many files',
        message: 'You can only upload a limited number of files at once'
      });
    }

    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        error: 'Unexpected file',
        message: 'Unexpected file field'
      });
    }

    return res.status(400).json({
      error: 'Upload failed',
      message: error.message
    });
  }

  if (error) {
    logger.error('File upload error', {
      error: error.message,
      userId: req.user?.id,
      ip: req.ip
    });

    return res.status(400).json({
      error: 'Upload failed',
      message: error.message
    });
  }

  next();
};

/**
 * Scan uploaded file for malware (placeholder for future integration)
 * In production, integrate with ClamAV or similar antivirus solution
 */
const scanForMalware = async (req, res, next) => {
  // TODO: Integrate with antivirus scanner in production
  // For now, just log that scanning should be done
  if (req.file || req.files) {
    logger.info('File uploaded - malware scanning recommended', {
      userId: req.user?.id,
      files: req.files ? req.files.map(f => f.filename) : [req.file?.filename]
    });
  }
  next();
};

/**
 * Clean up old uploaded files
 * Should be run as a scheduled job
 */
const cleanupOldFiles = async (uploadPath, maxAge = 30 * 24 * 60 * 60 * 1000) => {
  const fs = require('fs').promises;
  const files = await fs.readdir(uploadPath);

  let deletedCount = 0;
  for (const file of files) {
    const filePath = path.join(uploadPath, file);
    const stats = await fs.stat(filePath);

    if (Date.now() - stats.mtimeMs > maxAge) {
      await fs.unlink(filePath);
      deletedCount++;
    }
  }

  logger.info('Cleaned up old files', {
    uploadPath,
    deletedCount
  });

  return deletedCount;
};

module.exports = {
  uploadImage,
  uploadDocument,
  validateUploadedFile,
  handleUploadError,
  scanForMalware,
  cleanupOldFiles,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_DOCUMENT_TYPES,
  MAX_IMAGE_SIZE,
  MAX_DOCUMENT_SIZE
};
