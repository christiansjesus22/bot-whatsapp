require('dotenv').config()
const axios = require('axios');
//importando flujo de respuestas
const stepResponses =  require ("../helpers/response.json")
//importando redis
const {redisClient} = require ("../config/redis");
//importando controlador de excel-search
const {getByvalue}= require ("../controllers/googleSheets")


const sendMessage = async (options) => {
    const {
        text,
        phoneNumber,
        messageId,
        reply = false,
        hasUrl = false,
        type,
        document,
        contact,
        location,
        listPayload,
        buttonPayload
    } = options;
    try {
        const url = `https://graph.facebook.com/${process.env.API_VERSION}/${process.env.BOT_NUMBER_ID}/messages`;
        const body = {
            messaging_product: 'whatsapp',
            recipient_type: 'individual',
            to: phoneNumber,
        }
        if(reply && messageId){
            body.context = {
                message_id: messageId
            }
        }
        switch (type) {
            case 'text':
                body.type = 'text';
                body.text = {
                    preview_url: hasUrl,
                    body: text
                }
                break;
            case 'reaction':
                body.type = 'reaction';
                body.reaction = {
                    message_id: messageId,
                    emoji: text //'✅'
                }
                break;
            case 'image':
                body.type = 'image';
                body.image = {
                    link: text
                }
                break;
            case 'audio':
                body.type = 'audio';
                body.audio = {
                    link: text
                }
                break;
            case 'document':
                body.type = 'document';
                body.document = document;
                document.caption = text;
                break;
            case 'sticker':
                body.type = 'sticker',
                body.sticker = {
                    id: text
                }
                break;
            case 'video':
                body.type = 'video';
                body.video = {
                    link: text
                } 
                break;
            case 'contacts':
                body.type = 'contacts';
                body.contacts = contact;
                break;
            case 'location':
                body.type = 'location';
                body.location = location;
                break;
            case 'list':
                body.type = 'interactive';
                body.interactive = listPayload;
                break;
            case 'button':
                body.type = 'interactive';
                body.interactive = buttonPayload;
                break;
           
            default:
                break;
        }
        const config = { headers: { 'Authorization': `Bearer ${process.env.META_TOKEN}`, 'Content-Type': 'application/json' } };
        const result = await axios.post(url, body, config);
        console.log('result',result.data);
        return result
    } catch (error) {
        console.log('error', error?.response?.data);
        throw new Error(error?.response?.data?.error?.message)
    }
}


const sendMessageSteps = async (message, phoneNumber, messageId) => {
 
    const redis = await redisClient();
    const stepKeys = `${phoneNumber}:steps`;
    const inputKey = `${phoneNumber}:input`;
   
    let step = await redis.get(stepKeys) || 0;

    if (message == 'menu') {
        await redis.del(stepKeys);
        step = 0
    } else {
        step = await redis.get(stepKeys) || 0;
    }


    try {
        // Capturar entrada del usuario en el step 4
        if (step == "4") {
            //capturando texto ingresado por el usuario
            await redis.set(inputKey, message);
            step = "4.1";
            // Actualizar el step a 4.1
            await redis.set(stepKeys, step); 
        }


        const key = stepResponses.find(item =>
            item.keywords.map(k => k.toLowerCase()).includes(message.toLowerCase()) &&
            Number(item.previousStep) === Number(step)
        );

        if (!key && Number(step) !== 4.1) {
            return null;
        }

        let response, type, document, location;
        
        const userInput2 = await redis.get(inputKey);
          redis.del(inputKey);

        if (step == "4.1") {
            // Obtener el valor de inputKey
            
            await redis.set(inputKey, message);
           

            const  userInput = userInput2
            const key41 = stepResponses.find(item => item.step === "4.1");
            response = key41.response;


    
            // Llamada a la función getByValue para obtener el valor del archivo de Google Sheets
            try {
                const searchResult = await getByvalue(userInput);
                response[0] = response[0].replace("{{cpfNumber}}", userInput);
    
                // Formatear la información de los procesos
                const stringsFormateadas = searchResult.map(arr => arr.join(', ')).join('\n');
                response = [`Los procesos que pertenecen a este CPF son:\n${stringsFormateadas}\nEscribe *menu* para regresar al menú`];
    
                // Limpiar la caché de entrada
                await redis.del(inputKey);
            } catch (error) {
                // Manejar el error al obtener los detalles del proceso
                response = ["Error al obtener los detalles del proceso. Por favor, ingrese un CPF válido."];                
                console.log(error);
                console.log( "mi input error ",userInput)

            }
            type = key41.type;
            // Limpiar la respuesta después de enviar los procesos
            response.join("\n")
        } else {
            ({ response, type, document, location } = key);
        }

        const options = {
            text: response.join('\n'),
            type: type,
            phoneNumber: phoneNumber,
            document: document,
            location: location,
            messageId: messageId
        };

        await sendMessage(options);    

        // Actualizar el paso después de enviar el mensaje
        if (Number(step) !== 4.1) {
            await redis.set(stepKeys, key.step);
        }
        redis.expire(stepKeys, 40000);

        return null;
    } catch (error) {
        console.error("Error completo:", error);
        console.log("error", error?.response?.data);
        throw new Error(error?.response?.data?.error?.message);
    }
};

module.exports = {sendMessageSteps}