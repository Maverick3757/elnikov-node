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
                                fs.exists('./public/'+data.name,function(exists){
                                    if(exists) fs.unlinkSync('./public/'+data.name);
                                });
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
            insertModel: function (data, callback){
                conn.query("INSERT INTO `car_models` SET ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results.insertId);
                    }
                });
            },
            insertCarModelDependency: function (brand_id, model_id, callback){
                conn.query("INSERT INTO `car_model_to_brands` SET brand_id=?, model_id=?",[brand_id, model_id] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            insertCarPackages: function (data, callback){
                conn.query("INSERT INTO `car_package` (`model_id`,`build_years`,`picture_name`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results.insertId);
                    }
                });
            },
            insertEnginesToPackage: function (data, callback){
                conn.query("INSERT INTO `engine_to_package` (`package_id`,`engine`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            removeEngines: function (data, callback){
                conn.query("DELETE FROM `engine_to_package` WHERE `id` in(?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            removePackages: function (data, callback){
                conn.query("DELETE FROM `car_package` WHERE `id` in(?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            updateModels: function (setData, id, callback){
                conn.query("UPDATE `car_models` SET ? WHERE `id`=?",[setData, id] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            updateCarPackages: function (data, callback){
                conn.query("INSERT INTO `car_package` (`id`,`build_years`,`picture_name`) VALUES ? ON DUPLICATE KEY UPDATE `build_years`=VALUES(`build_years`), `picture_name`=VALUES(`picture_name`)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            updateCarEngines: function (data, callback){
                conn.query("INSERT INTO `engine_to_package` (`id`,`engine`) VALUES ? ON DUPLICATE KEY UPDATE `engine`=VALUES(`engine`)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(null);
                    }
                });
            },
            addModelData: function (data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        async.each(data.images, function(file, callback) {
                            me.uploadFile(file,function(res){
                                callback();
                            });
                        }, function(err){
                            if( err ) {
                                console.log('A file failed to process');
                            } else {
                                console.log('All files have been processed successfully');
                                callback(null)
                            }
                        });
                    },
                    function (callback) {
                        if(data.model_id==='new') {
                            me.insertModel(me.getModelData(data), function (res) {
                                data.model_id=res;
                                me.insertCarModelDependency(data.car_brand, res, function () {
                                    callback(null);
                                });
                            });
                        }else{
                            me.updateModels(me.getModelData(data),data.model_id, function () {
                                callback(null);
                            });
                        }
                    },
                    function (callback) {
                        if(data.new_years.length>0) {
                            me.insertCarPackages(me.getNewCarPackages(data), function (res) {
                                if(me.getNewEngines(data,res).length>0){
                                    me.insertEnginesToPackage(me.getNewEngines(data,res), function () {
                                        callback(null);
                                    });
                                }else{
                                    callback(null);
                                }
                            });
                        }else{
                            if(me.getNewEngines(data).length>0){
                                me.insertEnginesToPackage(me.getNewEngines(data), function () {
                                    callback(null);
                                });
                            }else{
                                callback(null);
                            }
                        }
                    },
                    function (callback) {
                        if(me.getUpdatedEngines(data).length>0) {
                            me.updateCarEngines(me.getUpdatedEngines(data), function () {
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(me.getUpdatedCarPackeges(data).length>0) {
                            me.updateCarPackages(me.getUpdatedCarPackeges(data), function () {
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(me.getRemovedEngines(data).length>0) {
                            me.removeEngines(me.getRemovedEngines(data), function () {
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        let removeData = me.getRemovedPackages(data);
                        if(removeData.result.length>0) {
                            me.removePackages(removeData.result, function () {
                                async.each(removeData.pictureToRemove, function(file, callback) {
                                    me.deleteFile(file,"car_packing",function(res){
                                        callback();
                                    });
                                }, function(err){
                                    if( err ) {
                                        console.log('A file failed to process');
                                    } else {
                                        console.log('All files have been processed successfully');
                                        callback(null)
                                    }
                                });
                            });
                        }else{
                            callback(null);
                        }
                    }
                ];
                async.waterfall(saveTask, function (err) {
                    main_callback('done');
                });
            },


            getRemovedPackages: function(data){
                let result=[];
                let pictureToRemove=[];
                for(let val of data.removed_years){
                    result.push(val.id);
                    pictureToRemove.push(val.picture);
                }
                return {
                    result:result,
                    pictureToRemove:pictureToRemove
                };
            },
            getRemovedEngines: function(data){
                let result=[];
                for(let val of data.updated_years){
                    for (let engine of val.removed_engines){
                        result.push(engine);
                    }
                }
                return result;
            },
            getUpdatedCarPackeges: function(data){
                let result=[];
                for(let val of data.updated_years){
                    result.push([val.packing_id, val.year, val.picture_name]);
                }
                return result;
            },
            getUpdatedEngines: function (data){
                let result=[];
                for(let val of data.updated_years){
                    for (let engine of val.engines){
                        result.push(engine);
                    }
                }
                return result;
            },
            getNewEngines: function (data, res=null){
                let result=[];
                for(let val of data.new_years){
                    for (let engine of val.engines){
                        result.push([res,engine]);
                    }
                    res = res+1;
                }
                for(let val of data.updated_years){
                    for (let engine of val.new_engines){
                        result.push([val.packing_id,engine]);
                    }
                }
                return result;
            },
            getNewCarPackages: function (data){
                let result=[];
                for(let val of data.new_years){
                    result.push([data.model_id,val.year,val.picture_name]);
                }
                return result;
            },
            getModelData: function (data){
                return {
                    model_name: data.model_name,
                    picture_name: data.picture_name,
                    meta_keywords: data.keywords,
                    meta_description: data.meta_discription
                }
            },
            getBrands: function (callback){
                conn.query("SELECT * FROM `car_brands`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getEngineArray: function (data){
               let result={};
               for (let val of data){
                   if(result.hasOwnProperty(val.package_id)){
                       result[val.package_id].push({id:val.id,engine:val.engine})
                   }else{
                       result[val.package_id]=[{id:val.id,engine:val.engine}];
                   }
               }
               return result;
            },
			getModelInfo: function (data=null, callback){
                let me =this;
                sql = 'SET SESSION group_concat_max_len = 100000000;SELECT `car_models`.*,GROUP_CONCAT(`car_package`.`build_years` SEPARATOR "|||") as build_years, GROUP_CONCAT(IF(ISNULL(`car_package`.`picture_name`),"",`car_package`.`picture_name`) SEPARATOR "|||") as package_pictures,GROUP_CONCAT(`car_package`.`id` SEPARATOR "|||") as packages_id FROM `car_models` LEFT JOIN `car_package` ON `car_package`.`model_id` = `car_models`.`id` WHERE `car_models`.`id`=?';
                sql = conn.format(sql);
                if(data!=="new" && data>0){
                    conn.query(sql,data, function (error, results, fields) {
                        if (error) {
                            console.log(error);
                        }else{
                            if (results[1][0].packages_id!==null) {
                                conn.query('SELECT * FROM `engine_to_package` WHERE package_id in(?)', [results[1][0].packages_id.split("|||")], function (error, results2, fields) {
                                    if (error) {
                                        console.log(error);
                                    } else {
                                        let send = {
                                            model: results[1][0],
                                            engines: me.getEngineArray(results2)
                                        };
                                        callback(send);
                                    }
                                });
                            }else{
                                let send = {
                                    model: results[1][0],
                                    engines: null
                                };
                                callback(send);
                            }
                        }
                    });
                }else{
                    callback({id:data});
                }

			},
        }
    );
};