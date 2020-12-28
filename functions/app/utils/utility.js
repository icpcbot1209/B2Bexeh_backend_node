'use strict';
/*
 * Utility - utility.js
 * Author: smartData Enterprises
 * Date: 26 May 2018
 */

var fs = require("fs");
var bookshelf = __rootRequire('app/config/bookshelf');
var loader = __rootRequire('app/api/v1/loader');
var NotificationModel = loader.loadModel('/user/models/notification_models');
var path = require('path');
var crypto = require('crypto');
var utility = {};
const nodemailer = require("nodemailer");
var settingModel = require('../api/v1/modules/admin_settings/models/admin_setting_models');
var common_query = require('../utils/commonQuery');
var handlebars = require('handlebars');

utility.fileUpload = function (imagePath, buffer) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(path.resolve(imagePath), buffer, function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}

utility.unlinkFileUpload = function (imagePath) {
    return new Promise(function (resolve, reject) {
        fs.unlink(path.resolve(imagePath), function (err) {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
}
utility.randomValueHex = function (len) {
    return crypto.randomBytes(Math.ceil(len / 2))
        .toString('hex')
        .slice(0, len);
}
utility.readTemplateSendMailV2 = function (to, subject, myObjStr, templateFile, callback) {
    var filePath = path.join(__dirname, '/email_templates/' + templateFile + '.html');
    fs.readFile(filePath, {
        encoding: 'utf-8'
    }, function (err, data) {
        if (!err) {
            var template = data
                .replace(/{email}/g, myObjStr.email)
                // .replace(/{email}/g, myObjStr[0].email)
                // .replace(/{firstname}/g, utility.capitalize(userData.first_name))
                // .replace(/{password}/g, myObjStr[0].password)
                .replace(/{verifying_token}/g, myObjStr.verifying_token)

                // .replace(/{verifying_token}/g, myObjStr[0].verifying_token)
                .replace(/{baseUrl}/g, "http://54.190.192.105:5005/")
               if(myObjStr && myObjStr.template == 'contact_us'){
                 template = handlebars.compile(template);
                    var replacements = {
                        name: myObjStr.sendername,
                        message: myObjStr.sendermessage
                    };
                    template = template(replacements);
                }
            utility.sendmail(myObjStr.email, subject, template, function (mailErr, resp) {
                if (err)
                    callback(mailErr);
                else
                    callback(null, true);
            });
        } else
            callback(err);
    });
}
utility.sendmail = async function (to, subject, message, callback) {
    var cond = {
        isdeleted: false,
        settingname: 'smtpsetting'
    }

    const getStatus = await common_query.findAllData(settingModel, cond)
    let finalData = getStatus.data.toJSON()
    if (getStatus.code == 200) {
        var smtp = finalData[0].settingvalue;
        var smtpTransport = nodemailer.createTransport({
            service: smtp.service,
            host: smtp.host,
            port: smtp.port,
            secure: true,
            auth: {

                user: smtp.email,
                pass: smtp.password

            },
            tls: {
                secure: false,
                ignoreTLS: true,
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            to: to,
            from: smtp.email,
            subject: subject,
            html: message
        };
        smtpTransport.sendMail(mailOptions, function (err) {
            if (err) {
                console.log("err", err)
                callback(err);
            } else {
                console.log("mail sent....")
                callback(null, true);
            }
        });
    }
}

utility.addNotification = async function (data, callback) {
    console.log("add notification calling in  utility+++++")

    let sql = `select * from users where "id"= ${data.created_by} and "is_deleted"=false;`
    bookshelf.knex.raw(sql).then(async userdata => {
        var userData = userdata.rows[0];

        let notifdata = {
            created_by: data.created_by ? data.created_by : null,
            content: data.content ? userData.first_name + ' ' + userData.last_name+' '+ data.content : null,
            destnation_user_id: data.destnation_user_id ? data.destnation_user_id : null,
            is_deleted: false,
            is_read: false,

        }
        let notificationdata = await common_query.saveRecord(NotificationModel, notifdata);

        if (notificationdata.code == 200) {
            console.log('Notification added successfully')
            callback(null, true)
            //   return res.json(Response(constant.statusCode.ok, constant.messages.notificationAddSuccess, orderdata));
        } else {
            console.log('else in notification utility save error')
            callback(new Error('Notification save fail'))
            //   return res.json(Response(constant.statusCode.internalservererror, constant.validateMsg.internalError, result.req.body));
        }
    }).catch(err => {
        console.log('error in utility send notification', err)
        callback(err)
    });





}



module.exports = utility;
