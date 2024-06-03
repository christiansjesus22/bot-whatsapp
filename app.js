const express = require ('express')
//importando cors para evitar errores de origen cruzado
const cors = require ('cors')
const http = require ('http')
require('dotenv').config()


const app = express()
//importando rutas
const router = require("./routes/index")
const router2 = require("./routes/googleSheets")

//definimos el puerto
const port = process.env.PORT

//configurando servidor para recibir peticiones en formato json y apis externas
app.use(express.json())
app.use(cors()) 

//llamamos a express para visulizar los archivos estaticos en la  carpeta mediaFiles
app.use('/mediaFiles',express.static(__dirname +'/mediaFiles'))

//cargando rutas
app.use (router)
app.use (router2)

const server = http.Server(app)

server.listen(port, ()=>{
    console.log (`escuchando en el puerto http://localhost:${port}`)
})