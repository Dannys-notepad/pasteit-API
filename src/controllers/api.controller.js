const { validationResult } = require('express-validator')
const cryptic = require('../utils/cryptic')
const { paste } = require('../models/api.model')
const Pastes = new paste()

//VIEW ALL PASTES
//@METHOD GET
//ENDPOINT /api/v1/paste /all
const allPastes = async (req, res) => {
  try {
    let allPastes = []
    let all = await Pastes.fetchAll()
    all.forEach((p) => {
      allPastes.push({
        id: p.id
        title: p.title,
        body: p.body
      })
    })
    return res.json({
      statusCode: 200,
      allPastes
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
}


//VIEW THE COMPLETE CONTENT OF A PASTE
//@METHOD GET
//ENDPOINT /api/v1/paste  /view/:id?decryption_key={key-from-user}
const viewPaste = async (req, res) => {
  try {
    const { id } = await req.params
    const { decryption_key } = await req.query
    let data = {
      key: decryption_key,
      id
    }
    
    let found = await Pastes.fetchById(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with such id ${data.id} do not exist`
      })
    }
    
    if(data.key !== found.decryption_key){
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
      })
    }
    
    let body = await cryptic.decrypt(Buffer.from(found.body, 'hex'), Buffer.from(found.keyy, 'hex'), Buffer.from(found.iv, 'hex'))
    
    return res.json({
      statusCode: 200,
      paste: {
        id: found.id
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

//CREATE PASTE
//@METHOD POST
//ENDPOINT /api/v1/paste /create
const createPaste = async (req, res) => {
  try {
    let errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({
        statusCode: 400,
        errors 
      })
    }
    
    const { title, body, decryption_key} = await req.body
    let data = await cryptic.encrypt(body)
    let dbSchema = {
      id: data.id,
      iv: data.iv,
      key: data.key,
      decrypt: decryption_key,
      title,
      body: data.encryptedString
    }
    
    let added = await Pastes.add(dbSchema)
    return res.status(201).json({
      statusCode: 201,
      msg: 'successfully added paste',
      decryptionKey: dbSchema.decrypt
    })
  } catch (e) {
    console.error(e)
    return res.status(500).json({
      statusCode: 500,
      msg: 'an error occurred, try again later'
    })
  }
}


//UPDATE A PASTE
//@METHOD PATCH
//ENDPOINT /api/v1/paste /update/:id?decryption_key={key-from-user}
const updatePaste = async (req, res) => {
  try {
    let errors = validationResult(req)
    if(!errors.isEmpty()){
      return res.status(400).json({
        statusCode: 400,
        errors 
      })
    }
    
    const { id } = await req.params
    const { decryption_key } = await req.query
    let data = {
      key: decryption_key,
      id
    }
    
    let found = await Pastes.fetchByid(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with such id ${data.id} do not exist`
      })
    }
    
    if(data.key !== found.decryption_key){
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
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
    return res.status(200).json({
      statusCode: 200,
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

//DELETE A PASTE
//@METHOD DELETE
//ENDPOINT /api/v1/paste  /delete/:id?decryption_key={key-from-user}
const deletePaste = async (req, res) => {
  try {
    const { id } = await req.params
    const { decryption_key } = await req.query
    let data = {
      key: decryption_key,
      id
    }
    
    let found = await Pastes.fetchByid(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with such id ${data.id} do not exist`
      })
    }
    
    if(data.key !== found.decryption_key){
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
      })
    }
    
    let delete = Pastes.deleteById(data.id)
    return res.json({
      statusCode: 200,
      msg: 'paste deleted'
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
  viewPaste,
  createPaste,
  updatePaste,
  deletePaste
}