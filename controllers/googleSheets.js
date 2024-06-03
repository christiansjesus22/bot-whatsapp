require('dotenv').config()
//importando conexion con googleSheets
const authGoogleSheets= require("../config/googleSheetsConnect")


//funcion de filtrado de valores
  function searchValue(value, data) {
    //valores filtrados
    const matchValue = []
    for (let i = 1; i < data.length; i++) {
      // Comprueba si el valor ingresado coincide con el valor en la posición actual
      if (data[i][1] === value) {
        // Si hay una coincidencia, agrega el array a la lista matchValue
        matchValue.push( data[i]);
      }

      if (matchValue.length === 0) {
        throw new Error(`No se encontro ningun cpf que coincida con el valor: ${value}`);
      }
    }

    //filtrando que informacion mostrar y dando formato
    const matchfilter = matchValue.map(subArray => [
      `*numero de processo*: ${subArray[2]}`,
      `*demandado*: ${subArray[3]}`,
      `*estado del proceso*: ${subArray[4]}`
    ]);


    return matchfilter;
  }
  
//obteniendo por valor del id 
const getByvalue = async (value) =>{

    try {
        //verificando que llegue el valor
        if (!value) {
            console.log('El valor de búsqueda es requerido');
        }

        
        const { googleSheets, auth, spreadsheetsId } = await authGoogleSheets();

        const getRows = await googleSheets.spreadsheets.values.get({ auth, spreadsheetId: spreadsheetsId,range: "Hoja 1"});
        const filterRows =  getRows.data.values
       
         const filterValue= await searchValue(value, filterRows)

        return filterValue;
    } catch (error) {
        console.error('Error obteniendo valor por CPF', error.message);
        throw error;
    }

} 


module.exports = {getByvalue} 
