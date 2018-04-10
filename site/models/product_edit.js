let async = require('async');
let pug = require('pug');
let fs = require('fs');
let JSFtp = require("jsftp");
let gm = require('gm').subClass({imageMagick: true});
let watermark = require('image-watermark');


module.exports = function (conn) {
    return new Object({
        	uploadFile: function (data, callback){
                let image = data.image;
                let me = this;
                if (data.name!=="") {
                    image = image.replace(/^data:image\/\w+;base64,/, '');
                    fs.writeFile('./public/'+data.name, image, {encoding: 'base64'}, function (err) {
                        if (err) {
                            console.log(err);
                        }
                        me.optimizePicture('./public/'+data.name,function(success,err){
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
                    });
                }else{
                    callback(null);
                }
            },

            optimizePicture:function(path,callback){
                let options = {
                    'text' : 'busdetal.biz',
                    'align' : 'dia1',
                    'color' : 'rgba(224, 224, 224, 0.4)',
                    'override-image' : true
                };

                gm(path).format(function(err, value){
                    this
                        .strip()
                        .samplingFactor(2,1)
                        //.interlace('Line')
                        .quality(85)
                        .resize(600,600)
                        .gravity('Center')
                        .extent(600, 600)
                        .noProfile()
                        .write(path, function (err) {
                            if (err) console.log(err);
                            watermark.embedWatermarkWithCb(path, options, function(err) {
                                if (err) {
                                    callback(false, err);
                                }else{
                                    callback(true, null);
                                }
                            });
                        });
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
            insertProduct: function (data, callback){
                conn.query("INSERT INTO `products` SET ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results.insertId);
                    }
                });
            },
            updateProduct: function (data, prod_id, callback){
                conn.query("UPDATE `products` SET ? WHERE `id`=?",[data,prod_id] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            insertNewEnginesToProduct: function (data, callback){
                conn.query("INSERT INTO `cars_to_products`(`engine_id`,`product_id`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            removeEnginesFromProduct: function (data, prod_id, callback){
                conn.query("DELETE FROM `cars_to_products` WHERE `engine_id` in (?) AND `product_id`=?",[data, prod_id] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            insertNewEquivalents: function (data, callback){
                conn.query("INSERT INTO `equivalents`(`equivalent_product_id`,`product_id`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            removeEquivalents: function (data, callback){
                conn.query("DELETE FROM `equivalents` WHERE `id` in (?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            insertNewCategories: function (data, callback){
                conn.query("INSERT INTO `category_to_products`(`category_id`,`product_id`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            updateCharack: function (data, callback){
                conn.query("INSERT INTO `products_fields` (`id`,`field_name`,`field_value`) VALUES ? ON DUPLICATE KEY UPDATE `field_name`=VALUES(`field_name`), `field_value`=VALUES(`field_value`)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            insertNewCharack: function (data, callback){
                conn.query("INSERT INTO `products_fields` (`field_name`,`field_value`,`product_id`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            removeCharack: function (data, callback){
                conn.query("DELETE FROM `products_fields` WHERE `id` in (?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            removeCategories: function (data, callback){
                conn.query("DELETE FROM `category_to_products` WHERE `id` in (?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            updatePictures: function (data, callback){
                conn.query("INSERT INTO `picture_to_products` (`id`,`picture_name`,`ordering`) VALUES ? ON DUPLICATE KEY UPDATE `picture_name`=VALUES(`picture_name`), `ordering`=VALUES(`ordering`)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            insertNewPictures: function (data, callback){
                conn.query("INSERT INTO `picture_to_products` (`picture_name`,`ordering`,`product_id`) VALUES ?",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            removePictures: function (data, callback){
                conn.query("DELETE FROM `picture_to_products` WHERE `id` in (?)",[data] ,function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback();
                    }
                });
            },
            saveTask:function(data, main_callback){
                let me = this;
                let saveTask = [
                    function (callback) {
                        async.each(data.imgToLoad, function(file, callback) {
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
                        if(data.cars_data.new_engines!=""){
                            me.insertNewEnginesToProduct(data.cars_data.new_engines,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.cars_data.removed_engines.length>0){
                            me.removeEnginesFromProduct(data.cars_data.removed_engines.split(','),data.product_id,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.equivalents_data.newAnalogs.length>0){
                            me.insertNewEquivalents(data.equivalents_data.newAnalogs,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.equivalents_data.deletedAnalogs.length>0){
                            me.removeEquivalents(data.equivalents_data.deletedAnalogs,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.categories_data.newCategories.length>0){
                            me.insertNewCategories(data.categories_data.newCategories,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.categories_data.deletedCategories.length>0){
                            me.removeCategories(data.categories_data.deletedCategories,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.charack_data.updatedCharack.length>0){
                            me.updateCharack(data.charack_data.updatedCharack,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.charack_data.deletedCharack.length>0){
                            me.removeCharack(data.charack_data.deletedCharack,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.charack_data.newCharack.length>0){
                            me.insertNewCharack(data.charack_data.newCharack,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.picture_data.updatedImages.length>0){
                            me.updatePictures(data.picture_data.updatedImages,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.picture_data.newImages.length>0){
                            me.insertNewPictures(data.picture_data.newImages,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.picture_data.deletedImages.length>0){
                            me.removePictures(data.picture_data.deletedImages,function(){
                                callback(null);
                            });
                        }else{
                            callback(null);
                        }
                    },
                    function (callback) {
                        if(data.imagesToDelete.length>0) {
                            async.each(data.imagesToDelete, function(file, callback) {
                                me.deleteFile(file,"products",function(res){
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
                        }else{
                            callback(null);
                        }
                    }
                ];
                async.parallel(saveTask, function (err) {
                    main_callback('done');
                });
            },
            saveProductData: function (data, callback){
                let me = this;
                if(data.product_id=='new'){
                    me.insertProduct(data.main_info,function(res){
                        data.categories_data.newCategories = me.addInsertedIdToData(data.categories_data.newCategories,res);
                        data.charack_data.newCharack = me.addInsertedIdToData(data.charack_data.newCharack,res);
                        data.equivalents_data.newAnalogs = me.addInsertedIdToData(data.equivalents_data.newAnalogs,res);
                        data.picture_data.newImages = me.addInsertedIdToData(data.picture_data.newImages,res);
                        data.cars_data.new_engines = me.addInsertedIdToData(data.cars_data.new_engines.split(','),res);
                        data.product_id=res;
                        me.saveTask(data,function(result){
                            callback(data.product_id)
                        });
                    });
                }else{
                    me.updateProduct(data.main_info,data.product_id,function(){
                        data.cars_data.new_engines = me.addInsertedIdToData(data.cars_data.new_engines.split(','),data.product_id);
                        me.saveTask(data,function(result){
                            callback(data.product_id)
                        });
                    });
                }

            },
            addInsertedIdToData:function(data, insertedId){
                return data.map(function (val) {
                    if(Array.isArray(val)){
                        val.push(insertedId);
                        return val;
                    }else{
                        if (val!=""){
                            return [val,insertedId];
                        }else{
                            return "";
                        }
                    }

                });
            },
            getEnginesByPackageId: function (package_id, callback){
                conn.query("SELECT * FROM `engine_to_package` WHERE `package_id`=?", package_id, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getPackagesByModelId: function (model_id, callback){
                conn.query("SELECT `id`,`build_years` FROM `car_package` WHERE `model_id`=?", model_id, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getModelsByBrandId: function (brand_id, callback){
                conn.query("SELECT `id`,`model_name` FROM `car_models` LEFT JOIN `car_model_to_brands` ON `car_model_to_brands`.`model_id`=`id` WHERE `car_model_to_brands`.`brand_id`=?", brand_id, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
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
            getModels: function (callback){
                conn.query("SELECT `car_models`.`id`, `car_models`.`model_name`, `car_model_to_brands`.`brand_id` FROM `car_models` LEFT JOIN `car_model_to_brands` ON `car_model_to_brands`.`model_id`=`id`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getPackages: function (callback){
                conn.query("SELECT `id`,`model_id`,`build_years` FROM `car_package`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getEngines: function (callback){
                conn.query("SELECT * FROM `engine_to_package`", function (error, results, fields) {
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
            getGroups: function (callback){
                conn.query("SELECT `id`,`category_name` FROM `products_category`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getManufacturers: function (callback){
                conn.query("SELECT `id`,`name` FROM `manufacturers`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
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
            getEquivalents: function (data, callback){
                conn.query("SELECT tbl.*,pic.`picture_name`,`products`.`product_name`,`products`.`info`,`products`.`providers_artikul` FROM(SELECT `id`,if(`equivalent_product_id`=?,`product_id`,`equivalent_product_id`) as equivalen_product FROM `equivalents` WHERE `product_id`=? or `equivalent_product_id`=?)tbl LEFT JOIN (SELECT `picture_name`,`product_id` FROM `picture_to_products` WHERE `ordering` = (SELECT MIN(`ordering`) FROM `picture_to_products` as p WHERE p.`product_id` = `picture_to_products`.`product_id`))pic ON pic.`product_id`=equivalen_product LEFT JOIN `products` ON `products`.`id`=equivalen_product",[data,data,data], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
            getProductToCars: function (data=null, callback){
                let me =this;
                sql = 'SELECT `cars_to_products`.`id` as cars_to_product_id, `engine_to_package`.`id`,`car_package`.`id` as car_package_id, `car_package`.`build_years`, `engine_to_package`.`engine`, `car_models`.`id` as model_id, `car_models`.`model_name`, `car_brands`.`id` as brand_id, `car_brands`.`brand_name` FROM `cars_to_products` LEFT JOIN `engine_to_package` ON `engine_to_package`.`id`=`cars_to_products`.`engine_id` LEFT JOIN `car_package` ON `car_package`.`id`=`engine_to_package`.`package_id` LEFT JOIN `car_model_to_brands` ON `car_model_to_brands`.`model_id`=`car_package`.`model_id` LEFT JOIN `car_models` ON `car_models`.`id`=`car_model_to_brands`.`model_id` LEFT JOIN `car_brands` ON `car_brands`.`id`=`car_model_to_brands`.`brand_id` WHERE `product_id`=?';
                sql = conn.format(sql);
                if(data!=="new" && data>0){
                    conn.query(sql,data, function (error, results, fields) {
                        if (error) {
                            console.log(error);
                        }else{
                            callback(me.ProductToCarsProperArray(results));
                        }
                    });
                }else{
                    callback({id:data});
                }
            },
            ProductToCarsProperArray: function (data){
                let me =this;
                let passedBrands = [];
                let result = [];
                for (let val of data){
                    if(passedBrands.indexOf(val.brand_id) === -1){
                        passedBrands.push(val.brand_id);
                        result.push({
                            brand_id: val.brand_id,
                            brand_name: val.brand_name,
                            models: me.getItemByCarsBrands(data, val.brand_id)
                        });
                    }
                }
                return result;
            },
            getItemByCarsBrands: function (data, brand_id){
                let me =this;
                let result = [];
                let passedModels = [];
                let brandsData = data.filter(function(i,n){return i.brand_id===brand_id});
                for (let val of brandsData){
                    if(passedModels.indexOf(val.model_id) === -1){
                        passedModels.push(val.model_id);
                        result.push({
                            model_id: val.model_id,
                            model_name: val.model_name,
                            car_packages: me.getItemByCarsModels(brandsData, val.model_id)
                        });
                    }
                }
                return result;
            },
            getItemByCarsModels: function (data, model_id){
                let me =this;
                let result = [];
                let passedPackages = [];
                let modelsData = data.filter(function(i,n){return i.model_id===model_id});
                for (let val of modelsData){
                    if(passedPackages.indexOf(val.car_package_id) === -1){
                        passedPackages.push(val.car_package_id);
                        result.push({
                            car_package_id: val.car_package_id,
                            build_years: val.build_years,
                            car_engines: me.getItemByCarsPackages(modelsData, val.car_package_id)
                        });
                    }
                }
                return result;
            },
            searchProdForEquivalent:function (data, callback){
                let regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT(`product_name`, IF(ISNULL(`vin`),'',`vin`), `providers_artikul`, IF(ISNULL(`info`),'',`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT(`product_name`, IF(ISNULL(`vin`),'',`vin`),`providers_artikul`, IF(ISNULL(`info`),'',`info`))) LIKE ?";
                if(data.prod_id!='new') regexpstring=regexpstring+' AND `id`<>?';
                let sql = 'SELECT `products`.*,pic.picture_name FROM `products` LEFT JOIN (SELECT `picture_name`,`product_id` FROM `picture_to_products` WHERE `ordering` = (SELECT MIN(`ordering`) FROM `picture_to_products` as p WHERE p.`product_id` = `picture_to_products`.`product_id`))pic ON pic.`product_id`=`id` WHERE ' +regexpstring+ ' LIMIT 0, 200';
                sql = conn.format(sql);
                conn.query(sql, ["%"+data.search+"%",data.prod_id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        let html = pug.renderFile('site/views/product_edit_mixins/equivalent_search.pug', {data:results});
                        callback(html);
                    }
                });
            },

            getItemByCarsPackages: function (data, car_package_id){
                let result = [];
                let packagesData = data.filter(function(i,n){return i.car_package_id===car_package_id});
                for (let val of packagesData){
                    result.push({
                        id: val.id,
                        engine: val.engine,
                        cars_to_product_id: val.cars_to_product_id
                    });
                }
                return result;
            },
			getProductInfo: function (data=null, callback){
                let me =this;
                sql = 'SELECT `products`.*, `providers`.`providers_name`, GROUP_CONCAT(DISTINCT `picture_to_products`.`id`) as picture_row_ids, GROUP_CONCAT(DISTINCT `picture_to_products`.`picture_name` SEPARATOR "|") as picture_names, GROUP_CONCAT(DISTINCT `picture_to_products`.`ordering`) as picture_orderings,  GROUP_CONCAT(DISTINCT `products_fields`.`id`) as fields_row_ids, GROUP_CONCAT(DISTINCT `products_fields`.`field_name` SEPARATOR "|") as field_names, GROUP_CONCAT(DISTINCT `products_fields`.`field_value` SEPARATOR "|") as field_value, GROUP_CONCAT(DISTINCT `category_to_products`.`id`) as category_to_products_id, GROUP_CONCAT(DISTINCT `category_to_products`.`category_id`) as category_id  FROM `products` LEFT JOIN `providers` ON `providers`.`id`=`products`.`providers` LEFT JOIN `picture_to_products` ON `picture_to_products`.`product_id`=`products`.`id` LEFT JOIN `products_fields` ON `products_fields`.`product_id` = `products`.`id` LEFT JOIN `category_to_products` ON `category_to_products`.`product_id`=`products`.`id` WHERE `products`.`id`=? GROUP BY `products`.`id`';
                sql = conn.format(sql);
                if(data!=="new" && data>0){
                    conn.query(sql,data, function (error, results, fields) {
                        if (error) {
                            console.log(error);
                        }else{
                            callback(results[0]);
                        }
                    });
                }else{
                    callback({id:data});
                }

			},
        }
    );
};