const express = require('express')
const router = express.Router()
const { body } = require('express-validator')
const { allPastes, addToDB, viewPaste, updatePaste, deletePaste } = require('../controllers/api.controller')
const { check } = require ('../middlewares/checkForQueries')

router.get('/all', allPastes)
router.get('/view', check, viewPaste)

router.post('/add', [
  body('title').isLength({min: 3, max: 255}).withMessage('title cannot be more than 255 letters or lesser than 3 letters'),
  body('body').isLength({min: 3}).withMessage('body cannot be lower than 3 letters')
], addToDB)

router.patch('/update', check, [
  body('title').isLength({min: 3, max: 255}).withMessage('title cannot be more than 255 letters or lesser than 3 letters'),
  body('body').isLength({min: 3}).withMessage('body cannot be lower than 3 letters')
], updatePaste)

router.delete('/delete', check, deletePaste)

module.exports = router