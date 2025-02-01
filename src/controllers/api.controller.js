const { validationResult } = require('express-validator')
const cryptic = require('../utils/cryptic')
const { paste } = require('../models/api.model')
const Pastes = new paste()

const allPastes = async (req, res) => {
  try {
    let allPaste = []
    let all = await Pastes.fetchAll()
    let paste = all.forEach((p) => {
      allPaste.push({
        title: p.title,
        body: p.body
      })
    })
    return res.json({
      statusCode: 200,
      allPaste
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
}

const addToDB = async (req, res) => {
  try {
    let errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({
        statusCode: 400,
        errors 
      })
    }
    
    const { title, body} = await req.body
    let data = await cryptic.encrypt(body)
    let dbSchema = {
      id: data.id,
      iv: data.iv,
      key: data.key,
      decrypt: data.decrypt,
      title,
      body: data.encryptedString
    }
    
    let added = await Pastes.add(dbSchema)
    return res.status(201).json({
      statusCode: 201,
      msg: 'successfully added paste',
      decryptKey: dbSchema.decrypt
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
  
}

const viewPaste = async (req, res) => {
  try {
    const { decryption_key } = await req.query
    let key = decryption_key
    
    let found = await Pastes.fetchByKey(key)
    if(!found || found === []){
      return res.status(400).json({
        statusCode: 400,
        msg: 'incorrect key'
      })
    }
    
    let body = await cryptic.decrypt(Buffer.from(found.body, 'hex'), Buffer.from(found.keyy, 'hex'), Buffer.from(found.iv, 'hex'))
    //let body = await cryptic.decrypt(found.body, found.keyy, found.iv)
    return res.json({
      statusCode: 200,
      paste: {
        title: found.title,
        body
      }
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
  
}

const updatePaste = async (req, res) => {
  try {
    let errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({
        statusCode: 400,
        errors 
      })
    }
    
    const { decryption_key } = await req.query
    let found = await Pastes.fetchByKey(decryption_key)
    if(!found || found === []){
      return res.status(400).json({
        statusCode: 400,
        msg: 'incorrect key'
      })
    }
    
    const { title, body} = await req.body
    let data = await cryptic.encrypt(body)
    let dbSchema = {
      iv: data.iv,
      key: data.key,
      decrypt: decryption_key,
      title,
      body: data.encryptedString
    }
    
    let added = await Pastes.edit(dbSchema)
    return res.status(201).json({
      statusCode: 201,
      msg: 'successfully updated a paste',
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
  
}

const deletePaste = async (req, res) => {
  try {
    const { decryption_key } = await req.query
    let key = decryption_key
    
    let deleted = await Pastes.deleteByKey(key)
    if(!deleted){
      return res.status(400).json({
        statusCode: 400,
        msg: 'incorrect key'
      })
    }
    
    return res.json({
      statusCode: 200,
      msg: 'you deleted a paste'
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
  
}

module.exports = {
  allPastes,
  addToDB,
  viewPaste,
  updatePaste,
  deletePaste
}