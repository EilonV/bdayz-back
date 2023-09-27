import * as nodemailer from 'nodemailer'


var transporter = nodemailer.createTransport({
    service: 'hotmail',
    auth: {
        user: 'bdayzsite@outlook.com',
        pass: 'zxcv3214!'
    }
});

var mailOptions = {
    from: 'Bdayz Reminders! <bdayzsite@outlook.com>',
    to: 'gayashayo@gmail.com',
    subject: 'You are such a kusit',
    text: 'Hey Gaya, it has come to our attention that you are a mega kusit. have a nice day.'
};

transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
        console.log(error);
    } else {
        console.log('Email sent: ' + info.response);
    }
});