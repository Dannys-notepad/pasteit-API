const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { allPastes, createPaste, viewPaste, updatePaste, deletePaste } = require('../controllers/api.controller')
const { check } = require ('../middlewares/checkForQueries')

router.get('/all', allPastes)
router.get('/view/:id', check, viewPaste)

router.post('/create', [
  body('title').isLength({min: 3, max: 255}).withMessage('title cannot be more than 255 letters or lesser than 3 letters'),
  body('body').isLength({min: 3}).withMessage('body cannot be lower than 3 letters'),
  body('decryption_key').isLength({min: 4, max: 4}).withMessage('key must be four alphanumeric characters')
], createPaste)

router.patch('/update/:id', check, [
  body('title').isLength({min: 3, max: 255}).withMessage('title cannot be more than 255 letters or lesser than 3 letters'),
  body('body').isLength({min: 3}).withMessage('body cannot be lower than 3 letters')
], updatePaste)

router.delete('/delete/:id', check, deletePaste)

module.exports = router