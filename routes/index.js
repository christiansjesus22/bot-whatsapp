const router = require ("express").Router()

const {apiVerification,messageInfo} = require ("../controllers/message.js")

router.get("/bot/webhook",apiVerification)
router.post("/bot/webhook",messageInfo)




module.exports = router