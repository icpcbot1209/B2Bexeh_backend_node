// 'use strict';
const fs = require("fs");

let callbackObj = {
    code: '',
    data: '',
}

module.exports = {
    findAllData: findAllData,
    createDataFunction: createDataFunction,
    findAllAndCount: findAllAndCount,
    count: count,
    findAllAndCountAll: findAllAndCountAll,
    findOne: findOne,
    findAll: findAll,
    updateRecord: updateRecord,
    saveRecord: saveRecord,
    removeData: removeData,
    rollbackRecord: rollbackRecord,
    saveRecordOnCondition: saveRecordOnCondition,
    fileUpload: fileUpload
}

function findAllData(model, condition) {
    try {
        return new Promise((resolve, reject) => {
            new model().where(condition).fetchAll().then(function (data) {
                callbackObj.code = 200;
                callbackObj.data = data;
                resolve(callbackObj)
            })
                .catch(error => {
                    console.log('error on update record', error)
                    callbackObj.code = 500;
                    callbackObj.success = null;
                    callbackObj.error = error
                    reject(callbackObj)
                })



        })
    } catch (error) {
        console.log('body error on update', error)
        callbackObj.code = 400;
        callbackObj.success = null;
        return callbackObj
    }
}





function createDataFunction(model, data) {
    try {
        return new Promise((resolve, reject) => {
            model.create(data).then(data => {
                resolve(data);
            }).catch(err => {
                console.log('err on createDataFunction', err)
                reject(err);
            });
        });
    } catch (error) {
        return error
    }
}

function fileUpload(imagePath, buffer) {
    return new Promise((resolve, reject) => {
        try {
            let tempObj = {
                status: false
            }
            fs.writeFile(imagePath, buffer, function (err) {
                if (err) {
                    tempObj.error = err;
                    reject(err);
                } else {
                    tempObj.status = true;
                    tempObj.message = 'uploaded';
                    resolve(tempObj);
                }
            });
        } catch (e) {
            reject(e);
        }
    });
}


function findAllAndCount(model, condition) {
    try {
        return new Promise((resolve, reject) => {
            model.findAndCountAll(condition).then(count => {
                resolve(count);
            }).catch(error => {
                console.log('error on findAllAndCount', error)
                reject(error);
            })
        })
    } catch (error) {
        return error
    }
}

function count(model, condition) {
    try {
        return new Promise((resolve, reject) => {
            model.count(condition).then(count => {
                resolve(count);
            }).catch(error => {
                console.log('error in count common query', error)
                reject(error)
            })
        })
    } catch (error) {
        console.log('error on count', error)
        return error
    }
}

function findAllAndCountAll(model, condition) {
    console.log("find all noti calll")
    try {
        return new Promise((resolve, reject) => {
            model.findAndCountAll(condition).then(data => {
                callbackObj.code = 200;
                callbackObj.data = data;
                resolve(callbackObj)
            }).catch(error => {
                console.log('error on findAllAndCountAll', error)
                callbackObj.code = 400;
                callbackObj.data = [];
                reject(callbackObj)
            })
        })
    } catch (error) {
        console.log('body error on count and find all', error)
        callbackObj.code = 400;
        callbackObj.data = [];
        return callbackObj
    }
}

function findOne(model, condition) {
    try {
        return new Promise((resolve, reject) => {
            model.findOne(condition).then(data => {
                callbackObj.code = 200;
                callbackObj.data = data;
                resolve(callbackObj)
            }).catch(error => {
                console.log('error on findOne', error)
                callbackObj.code = 400;
                callbackObj.data = [];
                reject(callbackObj)
            })
        })
    } catch (error) {
        console.log('body error on findOne', error)
        callbackObj.code = 400;
        callbackObj.data = [];
        return callbackObj
    }
}

function findAll(model, condition) {
    try {
        return new Promise((resolve, reject) => {
            model.findAll(condition).then(data => {
                callbackObj.code = 200;
                callbackObj.data = data;
                resolve(callbackObj)
            }).catch(error => {
                console.log('error on findAll', error)
                callbackObj.code = 400;
                callbackObj.data = [];
                reject(callbackObj)
            })
        })
    } catch (error) {
        console.log('body error on findAll', error)
        callbackObj.code = 400;
        callbackObj.data = [];
        return callbackObj
    }
}

function updateRecord(model, data, condition) {
    try {
        return new Promise((resolve, reject) => {
            new model().off("updating").where(condition).save(data, { patch: true }).then(success => {
                callbackObj.code = 200;
                callbackObj.success = success;
                resolve(callbackObj)
            }).catch(error => {
                console.log('error on update record', error)
                callbackObj.code = 400;
                callbackObj.success = null;
                reject(callbackObj)
            })
        })
    } catch (error) {
        console.log('body error on update', error)
        callbackObj.code = 400;
        callbackObj.success = null;
        return callbackObj
    }
}
function saveRecordOnCondition(model, data, condition) {
 
    try { 
        return new Promise((resolve, reject) => {
            new model().where(condition).fetchAll().then(function (usersResult) { 
                if (usersResult[0] == undefined || usersResult[0] == null) { 
                    new model().off("creating").save(data, { transacting: 'transaction' }).then(success => {
                        callbackObj.code = 200;
                        callbackObj.success = success; 
                        resolve(callbackObj)
                    }).catch(error => {
                        console.log('error on update record', error)
                        callbackObj.code = 400;
                        callbackObj.success = null;
                        reject(callbackObj)
                    })
                } else {
                    callbackObj.code = 409;
                    callbackObj.success = null;
                    resolve(callbackObj)
                }



            }).catch(error => {
                console.log('error on fetch record', error)
                callbackObj.code = 400;
                callbackObj.success = null;
                reject(callbackObj)
            })

        })
    } catch (error) { 
        console.log('body error on update', error)
        callbackObj.code = 400;
        callbackObj.success = null;
        return callbackObj
    }
}
function saveRecord(model, data) {
    try {
        return new Promise((resolve, reject) => {
            new model().off("creating").save(data, { transacting: 'transaction' }).then(success => {
                callbackObj.code = 200;
                callbackObj.success = success;
                resolve(callbackObj)
            }).catch(error => {
                console.log('error on update record', error)
                callbackObj.code = 400;
                callbackObj.success = null;
                reject(callbackObj)
            })
        })
    } catch (error) {
        console.log('body error on update', error)
        callbackObj.code = 400;
        callbackObj.success = null;
        return callbackObj
    }
}



function removeData(model, condition, data) {
    const destroyObject = {}
    try {
        return new Promise((resolve, reject) => {
            //    new model().off("destroying").destroy(condition).then(success => {
            new model().off("destroying").where(condition).destroy(data, { patch: true }).then(success => {

                destroyObject.code = 200;
                destroyObject.success = success;
                resolve(destroyObject)
            },
            ).catch(error => {
                destroyObject.code = 400;
                destroyObject.success = null;
                reject(destroyObject)
                console.log('error on update record....', error)

            })
        })
    } catch (error) {
        destroyObject.code = 400;
        destroyObject.success = null;
        return destroyObject
    }
}

function rollbackRecord(model, condition) {
    const destroyObject = {}
    try {
        return new Promise((resolve, reject) => {
            model.destroy(condition).then(success => {
                destroyObject.code = 200;
                destroyObject.success = success;
                resolve(destroyObject)
            }).catch(error => {
                destroyObject.code = 400;
                destroyObject.success = null;
                reject(destroyObject)
            })
        })
    } catch (error) {
        destroyObject.code = 400;
        destroyObject.success = null;
        return destroyObject
    }
}
