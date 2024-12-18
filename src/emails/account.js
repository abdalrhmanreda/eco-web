const nodemailer = require('nodemailer');


let transporter = nodemailer.createTransport({
    service: 'Gmail',                                               
    auth: {
        user:  process.env.UserMail , 
        pass:  process.env.SecretPass  
    }
});


function sendEmail(toEmail,name) {
    let mailOptions = {
        from: 'mohs14166@gmail.com', 
        to: toEmail, 
        subject: 'Thanks for joining in!',
        text: `Welcome ${name} in our application`
    }

     transporter.sendMail(mailOptions   //, function(error, info){
    //     if (error) {
    //         console.log(error);
    //     } else {
    //         console.log('Email sent to ' + toEmail + ': ' + info.response);
    //     }
    // }
    )
}

function sendCanelationEmail(toEmail , name) {
    let mailOptions = {
        from: 'mohs14166@gmail.com', 
        to: toEmail, 
        subject: 'Soory! to see you go',
        text: `Thanks ${name} for using our application  we under your serve at any time`
    };

    
    transporter.sendMail(mailOptions)         
}



module.exports = {sendEmail,sendCanelationEmail}