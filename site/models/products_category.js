let async = require('async');
let pug = require('pug');
let fs = require('fs');
let JSFtp = require("jsftp");

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
            addСategory: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        me.uploadFile(data.picture,function(res){
                            callback(null);
                        });
                    },
                    function (callback) {
                        conn.query("INSERT INTO `products_category` SET ?",[data.row] ,function (error, results, fields) {
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
            changeOrder: function (data, callback){
                conn.query("INSERT INTO `products_category` (`id`,`order`) VALUES ? ON DUPLICATE KEY UPDATE `order`=VALUES(`order`)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            updateСategory: function (data, main_callback){
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
                        conn.query("UPDATE `products_category` SET ? WHERE `id`=?",[data.row,data.id] ,function (error, results, fields) {
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



            getCategories: function (callback){
				conn.query("SELECT * FROM `products_category`", function (error, results, fields) {
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