const db = require('../config/db')

class paste{
  
  async add(data){
    const [result] = await db.execute('INSERT INTO pastes(id, iv, keyy, decryption_key, title, body) VALUES (?, ?, ?, ?, ?, ?)', [data.id, data.iv, data.key, data.decrypt, data.title, data.body])
    return result.insertId
  }
  
  async fetchAll(){
    const [result] = await db.execute('SELECT * FROM pastes')
    return result
  }
  
  async fetchByKey(key){
    const [result] = await db.execute('SELECT * FROM pastes WHERE decryption_key = ?', [key])
    return result[0]
  }
  
  async edit(data){
    const [result] = await db.execute('UPDATE pastes SET iv = ?, keyy = ?, title = ?, body = ? WHERE decryption_key = ?', [data.iv, data.key, data.title, data.body, data.decrypt])
    return result.affectedRows
  }
  
  async deleteByKey(key){
    const [result] = await db.execute('DELETE FROM pastes WHERE decryption_key = ?', [key])
    return result.affectedRows
  }
}

module.exports = { paste }