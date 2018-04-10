var async = require('async');
var pug = require('pug');
var fs = require('fs');
var JSFtp = require("jsftp");

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
                        ftp.put('./public/'+data.name,'/public/img/'+data.path+'/'+data.name, err => {
                            if (!err) {
                                fs.unlinkSync('./public/'+data.name);
                            }
                            if(data.hasOwnProperty('ex_name')){
                                ftp.raw('DELE','/public/img/'+data.path+'/'+data.ex_name, (err, ftp_data) => {
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
            addLabel: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        me.uploadFile(data.picture,function(res){
                            callback(null);
                        });
                    },
                    function (callback) {
                        conn.query("INSERT INTO `product_labels` SET ?",[data.row] ,function (error, results, fields) {
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
            deleteFile: function (image, path, callback){
                if (image!=="") {
                    let ftp = new JSFtp({
                        host:"ftp.basezilla.com",
                        user:"elnikov@busdetal.biz",
                        pass:"NOX+cE%nvoij"
                    });
                    ftp.raw('DELE','/public/img/'+path+'/'+image, (err, ftp_data) => {
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
                }else{
                    callback(null);
                }
            },
            deleteLabel: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        me.deleteFile(data.picture.name,data.picture.path,function(res){
                            callback(null);
                        });
                    },
                    function (callback) {
                        conn.query("DELETE FROM `product_labels` WHERE id=?",data.id ,function (error, results, fields) {
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
            updateLabel: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        if(data.hasOwnProperty('picture')){
                            me.uploadFile(data.picture,function(res){
                                callback(null);
                            });
                        }else {
                            callback(null);
                        }
                    },
                    function (callback) {
                        conn.query("UPDATE `product_labels` SET ? WHERE `id`=?",[data.row,data.id] ,function (error, results, fields) {
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



            getLabels: function (callback){
				conn.query("SELECT * FROM `product_labels`", function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);
					}
				});	
			},
        }
    );
};