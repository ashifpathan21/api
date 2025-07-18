const nodemailer = require("nodemailer");
require('dotenv').config()
//working
const mailSender = async (email, title, body) => {
    try{
            let transporter = nodemailer.createTransport({
                host:process.env.MAIL_HOST,
                auth:{
                    user: process.env.MAIL_USER,
                    pass: process.env.MAIL_PASS,
                }
            })
            //// console.log('sending otp')
            let info = await transporter.sendMail({
                from: 'ACE OF SPADES',
                to:`${email}`,
                subject: `${title}`,
                html: `${body}`,
            })
            //// console.log(info);
            return info;
    }catch(error) {
        //console.log('an error occured' , error ,  error.message);
    }
}


 
module.exports = mailSender;