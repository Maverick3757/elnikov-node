var async = require('async');
var pug = require('pug');
var fs = require('fs');
var JSFtp = require("jsftp");

module.exports = function (conn) {
    return new Object({
            getBrands: function (callback){
                conn.query("SELECT * FROM `car_brands`", function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },

            getModels: function (data=null, callback){
                let where_clause = "";
                if(data!==null && data.hasOwnProperty('car_brand')) {
                   where_clause =  " WHERE `car_brands`.`id`=?;SELECT `id`,`brand_name` FROM `car_brands` WHERE `id` = ?";
                }else{
                    data.car_brand=null;
                }
                conn.query("SELECT `car_models`.*, `car_brands`.`id` as brand_id, `car_brands`.`brand_name` FROM `car_model_to_brands` INNER JOIN `car_models` ON `car_models`.`id`=`model_id` INNER JOIN `car_brands` ON `car_brands`.`id`=`brand_id`"+where_clause,[data.car_brand,data.car_brand] , function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {

                        if(data.car_brand!==null) {
                            send=results[0];
                            send.car_brand=results[1][0];
                        }else{
                            send=results;
                            send.car_brand={id:0, brand_name:"Все"};
                        }

                        callback(send);
                    }
                });
			},
        }
    );
};