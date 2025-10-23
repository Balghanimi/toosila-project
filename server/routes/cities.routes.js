const express = require('express');
const router = express.Router();
const { getCities, addCity } = require('../controllers/cities.controller');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validate');

// Public route - anyone can get cities
router.get('/', getCities);

// Public route - anyone can add a city (will be added when they search/post)
router.post('/', [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('City name must be between 2 and 100 characters'),
  handleValidationErrors
], addCity);

module.exports = router;
