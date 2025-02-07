const { validationResult } = require('express-validator')
const cryptic = require('../utils/cryptic')
const { bin } = require('../models/api.model')
const Bin = new bin()

//VIEW ALL PASTES
//@METHOD GET
//ENDPOINT /api/v1/paste /all
const allPastes = async (req, res) => {
  try {
    let allPastes = []
    let all = await Bin.fetchAll()
    all.forEach((p) => {
      allPastes.push({
        id: p.id,
        title: atob(p.mock_title),
        body: p.content
      })
    })
    
    let final = allPastes.length === 0 ? null: allPastes;
    //let code = final === null ? 204: 200;
    
    return res.status(200).json({
      statusCode: 200,
      pastes: final ?? 'no pastes yet'
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
    
    let found = await Bin.fetchById(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with such id ${data.id} do not exist`
      })
    }
    
    if(data.key !== atob(found.decryption_key)){
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
      })
    }
    
    let title = await cryptic.decrypt(Buffer.from(atob(found.title), 'hex'), Buffer.from(atob(found.keyy), 'hex'), Buffer.from(atob(found.hive), 'hex'))
    
    let content = await cryptic.decrypt(Buffer.from(atob(found.content), 'hex'), Buffer.from(atob(found.keyy), 'hex'), Buffer.from(atob(found.hive), 'hex'))
    
    if(atob(found.burn) === 'true'){
      let del = await Bin.deleteById(found.id)
    }
    
    return res.json({
      statusCode: 200,
      paste: {
        title,
        content
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
    
    let { mock_title, title, content, decryption_key, burn, panic_word} = await req.body
    let data = await cryptic.encrypt(content)
    title = await cryptic.encrypt2(title, Buffer .from(data.key, 'hex'), Buffer.from(data.iv, 'hex'))
    let dbSchema = {
      id: data.id,
      iv: btoa(data.iv),
      key: btoa(data.key),
      decrypt: btoa(decryption_key),
      mock: btoa(mock_title),
      title: btoa(title),
      content: btoa(data.encryptedString),
      burn: btoa(burn),
      panic_word
    }
    if(panic_word === '//'){
      let create = await Bin.addP(dbSchema)
      return res.status(201).json({
      statusCode: 201,
      msg: 'successfully added paste',
      id: dbSchema.id,
      decryptionKey: atob(dbSchema.decrypt)
      })
    }
    dbSchema.panic_word = btoa(dbSchema.panic_word)
    let added = await Bin.add(dbSchema)
    return res.status(201).json({
      statusCode: 201,
      msg: 'successfully added paste',
      id: dbSchema.id,
      decryptionKey: atob(dbSchema.decrypt)
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
    
    let found = await Bin.fetchById(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with such id ${data.id} do not exist`
      })
    }
    
    if(data.key !== atob(found.decryption_key)){
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
      })
    }
    
    let { title, content} = await req.body
    data = await cryptic.encrypt(content)
    title = await cryptic.encrypt2(title, Buffer .from(data.key, 'hex'), Buffer.from(data.iv, 'hex'))
    let dbSchema = {
      iv: btoa(data.iv),
      key: btoa(data.key),
      decrypt: btoa(decryption_key),
      title: btoa(title),
      content: btoa(data.encryptedString)
    }
    
    let added = await Bin.edit(dbSchema)
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
    
    let found = await Bin.fetchById(data.id)
    if(!found){
      return res.status(400).json({
        statusCode: 400,
        msg: `a paste with id ${data.id} do not exist`
      })
    }
    
    if(data.key !== atob(found.decryption_key) && data.key !== atob(found.panic_word)){
      console.log(found)
      return res.status(401).json({
        statusCode: 401,
        msg: `incorrect decryption key`
      })
    }
    
    let deleteBin = Bin.deleteById(data.id)
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
