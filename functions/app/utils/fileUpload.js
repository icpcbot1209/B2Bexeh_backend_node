var config = require('../config/config').get('default');




var AWS = require('aws-sdk');
AWS.config.update({
    accessKeyId: config.AWS_KEY.ACCESS_KEY_ID, // fetched from config file based on the environment
    secretAccessKey: config.AWS_KEY.SECRET_ACCESS_KEY
});
var s3 = new AWS.S3();

module.exports = {
    listBuckets,
    uploadProductImage,
    uploadCompanyImage,
    uploadBulkUploadImage,
    uploadProfileImage
}

function listBuckets() {
    return new Promise((resolve, reject) => {
        var params = {};
        s3.listBuckets(params, function (err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else console.log('bucket list', data);
        })
    })

}

function uploadProductImage(buffer_string, file_name, path) {
    console.log('inside s3 upload', file_name)
    return new Promise((resolve, reject) => {
        if (buffer_string) {
            var base64Data = buffer_string;
            var data = {
                Key: "products/" + file_name,
                // Key: file_name,
                Body: base64Data,
                Bucket: config.AWS_KEY.bucket,
                // Bucket: 'b2bexch',
                // ACL: 'public-read',
                ContentType: 'image/jpg',
                CacheControl: 'no-cache'
            };
            s3.upload(data, function (err, res) {
                if (err) {
                    console.log(err, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    reject(0);
                } else {
                    console.log('fileUrl', res)
                    let params = {
                        'url': res.Location,
                        'bucket': res.Bucket,
                    };
                    console.log('params', params)

                    resolve(params);
                }
            });

        } else {
            reject(0);
        }

    });
}


function uploadProductImage(buffer_string, file_name, path) {
    console.log('inside s3 upload', file_name)
    return new Promise((resolve, reject) => {
        if (buffer_string) {
            var base64Data = buffer_string;
            var data = {
                Key: "products/" + file_name,
                // Key: file_name,
                Body: base64Data,
                Bucket: config.AWS_KEY.bucket,
                // Bucket: 'b2bexch',
                // ACL: 'public-read',
                ContentType: 'image/jpg',
                CacheControl: 'no-cache'
            };
            s3.upload(data, function (err, res) {
                if (err) {
                    console.log(err, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    reject(0);
                } else {
                    console.log('fileUrl', res)
                    let params = {
                        'url': res.Location,
                        'bucket': res.Bucket,
                    };
                    resolve(params);
                }
            });

        } else {
            reject(0);
        }

    });
}


function uploadCompanyImage(buffer_string, file_name, path) {
    console.log('inside s3 upload', file_name)
    return new Promise((resolve, reject) => {
        if (buffer_string) {
            var base64Data = buffer_string;
            var data = {
                Key: "company/" + file_name,
                Body: base64Data,
                Bucket: config.AWS_KEY.bucket,
                // Bucket: 'b2bexch',
                // ACL: 'public-read',
                ContentType: 'image/jpg',
                CacheControl: 'no-cache'
            };
            s3.upload(data, function (err, res) {
                if (err) {
                    console.log(err, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    reject(0);
                } else {
                    console.log('fileUrl', res)
                    let params = {
                        'url': res.Location,
                        'bucket': res.Bucket,
                    };
                    resolve(params);
                }
            });

        } else {
            reject(0);
        }

    });
}


function uploadBulkUploadImage(buffer_string, file_name, path) {
    console.log('inside s3 upload', file_name)
    return new Promise((resolve, reject) => {
        if (buffer_string) {
            var base64Data = buffer_string;
            var data = {
                Key: "bulkupload/" + file_name,
                // Key: file_name,
                Body: base64Data,
                Bucket: config.AWS_KEY.bucket,
                // Bucket: 'b2bexch',
                // ACL: 'public-read',
                ContentType: 'application/octet-stream',
                CacheControl: 'no-cache'
            };
            s3.upload(data, function (err, res) {
                if (err) {
                    console.log(err, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    reject(0);
                } else {
                    console.log('fileUrl', res)
                    let params = {
                        'url': res.Location,
                        'bucket': res.Bucket,
                        'key':res.key
                    };
                    resolve(params);
                }
            });

        } else {
            reject(0);
        }

    });
}



function uploadProfileImage(buffer_string, file_name, path) {
    console.log('inside s3 upload', file_name)
    return new Promise((resolve, reject) => {
        if (buffer_string) {
            var base64Data = buffer_string;
            var data = {
                Key: "profile/" + file_name,
                // Key: file_name,
                Body: base64Data,
                Bucket: config.AWS_KEY.bucket,
                // Bucket: 'b2bexch',
                // ACL: 'public-read',
                ContentType: 'image/jpg',
                CacheControl: 'no-cache'
            };
            s3.upload(data, function (err, res) {
                if (err) {
                    console.log(err, 'errrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr')
                    reject(0);
                } else {
                    console.log('fileUrl', res)
                    let params = {
                        'url': res.Location,
                        'bucket': res.Bucket,
                    };
                    resolve(params);
                }
            });

        } else {
            reject(0);
        }

    });
}
/**
 * 1) donot remove from the product list when added to cart.
 * 2) Add validation
 * 3) change the quantity to editable in the cart
 * 4) change name to create offer from checkout
 *
 */

/**
 * 1) Remove from new listing and product page when added to cart -Done
 * 2) Modification create bid api to add isaddtocart flag - Done
 * 3) Modification in delete add to cart api to change the status of the isaddtocart flag- Done
 * 4) configure s3 AWS SDK and listbucket name -Done
 * 5) Work on client feedback - In progress
 * 6) title
 */