require('dotenv').config()
const {sendMessage,sendMessageSteps}  = require ("../utils/messages")


//funcion verificar api
const apiVerification = async (req, res) => {
    try {
        const {
            "hub.mode": mode,
            "hub.verify_token": token,
            "hub.challenge": challenge
        } = req.query

        if (mode && token && mode == "subscribe" && token == process.env.VERIFY_TOKEN) {
            return res.status(200).send(challenge)

        } else {
            return res.status(403).send("unauthorized")
        }

    } catch (error) {
        console.log("ocurrio un error al verificar la api", error)
    }

}


const messageInfo = async (req, res) => {
    console.log("body", JSON.stringify(req.body.entry))

    const body = req.body.entry[0].changes[0]

    const { 
        value: { messages } 
    } = body

    if (!messages) return res.status (200).send()    
    
    
    const {
        from: phoneNumber,
        id:messageId,
        text: { body: messageText}
    } = messages[0]


    let unFormarNumber = phoneNumber;
    let strNumber = unFormarNumber.toString();
    let position = strNumber.indexOf('92');
     let result2 = strNumber.slice(0, position + 2) + '9' + strNumber.slice(position + 2);
    const finalNumber = Number(result2);
    
   const formatMessage =  messageText.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

     await sendMessageSteps(formatMessage,finalNumber,messageId)
 
    return res.status(200).send()
}

module.exports = { apiVerification, messageInfo }