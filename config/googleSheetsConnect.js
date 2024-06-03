require('dotenv').config()
const { google } = require('googleapis');

const authGoogleSheets = async () => {
    try {

        const auth = new google.auth.GoogleAuth({
            keyFile: "credentialSheets.json",
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });

        const client = await auth.getClient();

        const googleSheets = google.sheets({
            version: "v4",
            auth: client,
        });

        const spreadsheetsId = process.env.SPREED_SHEETS_ID;

        return { auth, client, googleSheets, spreadsheetsId };
    } catch (error) {
        console.error('error en la utentificacion de googleSheets', error);
    }
};

module.exports = authGoogleSheets;