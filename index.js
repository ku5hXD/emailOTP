const express = require('express')
const mongoose = require("mongoose");
const app = express()
var AWS = require("aws-sdk");
const dotenv = require("dotenv");
const port = 3070;
const otpGenerator = require('otp-generator')
const otpTemplate = require("./template/otpTemplate");
const connectionURL = "mongodb+srv://ku5h:ku5h@cluster0.4walf.mongodb.net/otpDatabase?retryWrites=true&w=majority";;
var otpCollection = require("./models/otp");

dotenv.config({
    path: "./config.env",
});


// Mongoose Connection Code

mongoose.connect(connectionURL, { useNewUrlParser: true });
var conn = mongoose.connection;
conn.on('connected', function () {
    console.log('database is connected successfully');
});
conn.on('disconnected', function () {
    console.log('database is disconnected successfully');
})
conn.on('error', console.error.bind(console, 'connection error:'));




// verifying credentials of aws
AWS.config.getCredentials(function (err) {
    if (err) console.log(err.stack);
    // credentials not loaded
    else {
        console.log("Access key:", AWS.config.credentials.accessKeyId);
    }
});

app.use(express.json());

// for updating the region to current region as per aws console
AWS.config.update({ region: "us-east-1" });

const ses = new AWS.SES();

// ses.createTemplate(otpTemplate, (err, data) => {
//     if (err) console.log(err, err.stack);
//     // an error occurred
//     else console.log("data: ", data); // successful response
// });

var params = {
    TemplateName: 'otpTemplate' /* required */
};
// ses.deleteTemplate(params, function (err, data) {
//     if (err) console.log(err, err.stack); // an error occurred
//     else console.log(data);           // successful response
// });



app.post('/emailOTP', (req, res) => {

    // for sending email to user

    try {

        let OTP = otpGenerator.generate(6, { upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

        let templateData = `{ "OTP": ${OTP} }`;
        console.log(templateData);
        // const emailId = req.body.emailId;
        console.log(req.body.emailId);
        var params = {
            Source: "no-message@acadio.in" /* required */,
            Destination: {
                ToAddresses: [req.body.emailId],
            },
            Template: "otpTemplate" /* required */,
            TemplateData: templateData,
            ReplyToAddresses: [
                "kushparmar4@gmail.com",
                /* more items */
            ],
        };

        // Create the promise and SES service object
        var sendPromise = new AWS.SES({ apiVersion: "2010-12-01" })
            .sendTemplatedEmail(params)
            .promise();

        // Handle promise's fulfilled/rejected states
        sendPromise
            .then(function (data) {
                console.log(data.MessageId);


                // store otp in database code..
                otpCollection.countDocuments({ emailId: req.body.emailId }, (err, count) => {

                    if (count === 0) {
                        var newUser = new otpCollection({ emailId: req.body.emailId, otp: OTP, createdAt: new Date() });
                        newUser.save(function (err, otpData) {
                            if (err) return console.error(err);
                            else return console.log(otpData);
                            // console.log(level.uid + " saved to level collection.");  
                        });
                    }
                    else {
                        otpCollection.findOneAndUpdate({ emailId: req.body.emailId }, { otp: OTP, createdAt: new Date() }, { upsert: true }, function (err, otpData) {
                            if (err) return console.error(err);
                            else return console.log(otpData);
                        });
                    }

                })


                res.status(200).json({
                    status: true,
                    data: data,
                });
            })
            .catch(function (err) {
                console.error(err, err.stack);
                res.status(200).json({
                    status: fail,
                    data: err,
                });
            });
    } catch (err) {
        console.log(err);
        res.send(err);
    }

})


app.post('/otpCheck', (req, res) => {

    let userEmailId = req.body.emailId;
    let userOTP = req.body.otp;

    otpCollection.findOne({ emailId: userEmailId, otp: userOTP })
        .then((data) => {
            // console.log(data)
            if (!data) {
                // not found

                res.status(404).json({
                    status: 'fail'
                })
            }

            else {
                let date = data.createdAt;
                let currentDate = new Date();
                let differenceOfDate = currentDate - date;
                if (differenceOfDate > 600000) {
                    res.status(400).json({
                        status: 'otp deprecated, get new otp!!'
                    })
                }
                else {
                    res.status(200).json({
                        status: 'OTP Matched!! Welcome!!'
                    })
                }
                // console.log(data.createdAt.getDate());
                // res.status(200).json({
                //     status: 'success'
                // })
            }

        })
        .catch((e) => {
            console.log(e)
            res.status(200).json({
                status: 'fail',
                data: e,
            });
        })
})



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})