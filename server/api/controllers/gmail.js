const { google } = require('googleapis');
const nodemailer = require('nodemailer');

const CLIENT_ID = process.env.CLIENT_ID
const CLIENT_SECRET = process.env.CLIENT_SECRET
const REDIRECT_URL = 'https://developers.google.com/oauthplayground'
const REFRESH_TOKEN = process.env.REFRESH_TOKEN

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
oAuth2Client.setCredentials({refresh_token: REFRESH_TOKEN});

async function sendEmail() {
    try{
        const accessToken = await oAuth2Client.getAccessToken()

        const transport = nodemailer.createTransport({
            service: 'gmail',
            auth: {
            type: 'OAuth2',
            user: 'drizzomand@gmail.com', // Your Gmail address
            clientId: CLIENT_ID,
            clientSecret: CLIENT_SECRET,
            refreshToken: REFRESH_TOKEN,
            accessToken: accessToken,
            },
        })
        const mailOptions = {
            from: 'drizzomand@gmail.com',
            to: 'adriankadyalunda@gmail.com',
            subject: 'Test Email via OAuth2',
            text: 'This is a test email sent using Gmail API and OAuth2.',
        };

        const result = transport.sendMail(mailOptions)
        return result

        }
        catch (error){
            return error
        }
}

sendEmail().then((result) => console.log('Email sent...', result))
             .catch((error) => console.log(error.message))