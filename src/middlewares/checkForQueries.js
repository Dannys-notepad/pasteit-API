const check = (req, res, next) => {
  if(!req.query){
    return res.json({
      statusCode: 400,
      msg: 'a query argument is needed to visit this route'
    })
  }
  
  if(!req.query.decryption_key){
    return res.json({
      statusCode: 400,
      msg: "the query argument must be 'decryption_key'"
    })
  }
  
  next()
}

module.exports = {
  check
}