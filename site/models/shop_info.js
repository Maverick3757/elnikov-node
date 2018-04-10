let async = require('async');
let pug = require('pug');
let fs = require('fs');
let JSFtp = require("jsftp");
let Serialize=require("php-serialize");

module.exports = function (conn) {
    return new Object({
        	uploadFile: function (data, callback){
                let image = data.image;
                if (data.name!=="") {
                    image = image.replace(/^data:image\/\w+;base64,/, '');
                    fs.writeFile('./public/'+data.name, image, {encoding: 'base64'}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        let ftp = new JSFtp({
                            host:"ftp.basezilla.com",
                            user:"elnikov@busdetal.biz",
                            pass:"NOX+cE%nvoij"
                        });
                        ftp.put('./public/'+data.name,'/public/img/'+data.name, err => {
                            if (!err) {
                                fs.unlinkSync('./public/'+data.name);
                            }
                            if(data.hasOwnProperty('ex_name')){
                                ftp.raw('DELE','/public/img/'+data.ex_name, (err, ftp_data) => {
                                    if (err) {
                                        console.error(err);
                                    }
                                    ftp.raw("quit", (err, ftp_data) => {
                                        if (err) {
                                            console.error(err);
                                        }
                                        callback(null);
                                    });
                                });
                            }else {
                                ftp.raw("quit", (err, data) => {
                                    if (err) {
                                        console.error(err);
                                    }
                                    callback(null);
                                });
                            }
                        });
                    });
                }else{
                    callback(null);
                }
            },
            updateStaticInfo: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        if(data.hasOwnProperty('picture')){
                            me.uploadFile(data.picture,function(res){
                                delete data.picture;
                                callback(null);
                            });
                        }else {
                            callback(null);
                        }
                    },
                    function (callback) {
                        data.contacts = Serialize.serialize(data.contacts);
                        conn.query("UPDATE `static_info` SET ?",[data] ,function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            }else{
                                callback(null);
                            }
                        });
                    }
                ];
                async.waterfall(saveTask, function (err) {
                    main_callback('done');
                });
            },



            getStaticInfo: function (callback){
				conn.query("SELECT * FROM `static_info`", function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
                        results[0].contacts = Serialize.unserialize(results[0].contacts);
						callback(results[0]);
					}
				});	
			},
        }
    );
};