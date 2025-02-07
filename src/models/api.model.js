const db = require('../config/db')

class bin{
  
  async add(data){
    const [result] = await db.execute('INSERT INTO textBin(id, hive, keyy, decryption_key, mock_title, title, content, burn, panic_word) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', [data.id, data.iv, data.key, data.decrypt, data.mock, data.title, data.content, data.burn, data.panic_word])
    return result.insertId
  }
  
  async addP(data){
    const [result] = await db.execute('INSERT INTO textBin(id, iv, keyy, decryption_key, mock_title, title, content, burn) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.id, data.iv, data.key, data.decrypt, data.mock, data.title, data.content, data.burn])
    return result.insertId
  }
  
  async fetchAll(){
    const [result] = await db.execute('SELECT * FROM textBin')
    return result
  }
  
  async fetchById(id){
    const [result] = await db.execute('SELECT * FROM textBin WHERE id = ?', [id])
    return result[0]
  }
  
  async edit(data){
    const [result] = await db.execute('UPDATE textBin SET hive = ?, keyy = ?, title = ?, content = ? WHERE decryption_key = ?', [data.iv, data.key, data.title, data.content, data.decrypt])
    return result.affectedRows
  }
  
  async deleteById(id){
    const [result] = await db.execute('DELETE FROM textBin WHERE id = ?', [id])
    return result.affectedRows
  }
}

module.exports = { bin }