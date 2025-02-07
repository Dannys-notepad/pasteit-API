const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { allPastes, createPaste, viewPaste, updatePaste, deletePaste } = require('../controllers/api.controller')
const { check } = require ('../middlewares/checkForQueries')

router.get('/all', allPastes)
router.get('/view/:id', check, viewPaste)

router.post('/create', [
  body('mock_title').isLength({min: 3, max: 100}).withMessage('mock_title cannot be more than 100 letters or lesser than 3 letters'),
  body('title').isLength({min: 3, max: 100}).withMessage('title cannot be more than 100 letters or lesser than 3 letters'),
  body('content').isLength({min: 3}).withMessage('content cannot be lower than 3 letters'),
  body('decryption_key').isLength({min: 4, max: 4}).withMessage('key must be four alphanumeric characters'),
  body('panic_word').isLength({min: 2, max: 50}).withMessage('panic_word can\'t be more than 50 or less than 2 characters'),
  body('burn').isLength({min: 4, max: 5}).withMessage('burn can only accept true or false')
], createPaste)

router.patch('/update/:id', check, [
  body('title').isLength({min: 3, max: 255}).withMessage('title cannot be more than 255 letters or lesser than 3 letters'),
  body('content').isLength({min: 3}).withMessage('content cannot be lower than 3 letters')
], updatePaste)

router.delete('/delete/:id', check, deletePaste)

module.exports = router