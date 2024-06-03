const router2 = require ("express").Router()
const {getByvalue} = require ("../controllers/googleSheets")

router2.get("/bot/getValue:value",getByvalue)

 

module.exports = router2