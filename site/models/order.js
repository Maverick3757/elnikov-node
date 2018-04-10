let async = require('async');
let pug = require('pug');
let fs = require('fs');
let JSFtp = require("jsftp");

module.exports = function (conn) {
    return new Object({
            getStatuses: function (callback){
                conn.query("SELECT * FROM `orders_status`" , function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(results);
                    }
                });
            },
			getOrderData: function (order_id, callback){
                let sql = 'select `products_to_orders`.`product_id`,`products_to_orders`.`price`,`products_to_orders`.`id` as `products_to_orders_id`,DATE_FORMAT(`orders`.`created_at`,"%d-%m-%Y") as `date`,`orders`.*, sum(`products_to_orders`.`qty`) as `qty`,`products`.`product_name`,`products`.`vin`,`products`.`providers_artikul`,`products`.`info`,pic.picture_name from `products_to_orders` left join `products` on `products`.`id` = `products_to_orders`.`product_id` left join (SELECT `picture_name`,`product_id` FROM `picture_to_products` WHERE `ordering` = (SELECT MIN(`ordering`) FROM `picture_to_products` as p WHERE p.`product_id` = `picture_to_products`.`product_id`))pic on `pic`.`product_id` = `products`.`id` LEFT JOIN `orders` ON `orders`.`id` = `products_to_orders`.`order_id` WHERE `order_id`=? GROUP BY `products_to_orders`.`product_id`';
                sql = conn.format(sql);
                conn.query(sql, order_id, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(results);
                    }
                });
			},
            searchProdForEquivalent:function (data, callback){
                let regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT(`product_name`, IF(ISNULL(`vin`),'',`vin`), `providers_artikul`, IF(ISNULL(`info`),'',`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT(`product_name`, IF(ISNULL(`vin`),'',`vin`),`providers_artikul`, IF(ISNULL(`info`),'',`info`))) LIKE ?";
                if(data.prod_id!='new') regexpstring=regexpstring+' AND `id`<>?';
                let sql = 'SELECT `products`.*,pic.picture_name,IF(`currencies`.`rateToUAH`<`receives`.`rate`,tbl.`seil_price`*`receives`.`rate`,tbl.`seil_price`*`currencies`.`rateToUAH`) as seil_price FROM `products` LEFT JOIN (SELECT `picture_name`,`product_id` FROM `picture_to_products` WHERE `ordering` = (SELECT MIN(`ordering`) FROM `picture_to_products` as p WHERE p.`product_id` = `picture_to_products`.`product_id`))pic ON pic.`product_id`=`id` LEFT JOIN (SELECT `receive_id`, `product_id`,`price`,`seil_price` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id`= tbl.`receive_id` LEFT JOIN `currencies` ON `receives`.`currency_id`=`currencies`.`id` WHERE ' +regexpstring+ ' LIMIT 0, 200';
                sql = conn.format(sql);
                conn.query(sql, ["%"+data.search+"%",data.prod_id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        let html = pug.renderFile('site/views/orders/new_products.pug', {data:results});
                        callback(html);
                    }
                });
            },
            deleteOrder:function(data,callback){
                conn.query("DELETE FROM `orders` WHERE `id`=?" ,data, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(results);
                    }
                });
            },
            saveOrder:function(data,main_callback){
                let moveTask = {
                    del:function (callback) {
                        if(data.deletedProducts.length>0) {
                            conn.query('DELETE FROM products_to_orders WHERE order_id=? AND product_id in(?)', [data.order_id, data.deletedProducts], function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    callback(null, results);
                                }
                            });
                        }else{
                            callback(null, null);
                        }
                    },
                    insert:function (callback) {
                        if(data.newProducts.length>0) {
                            conn.query('INSERT INTO products_to_orders (order_id,product_id,qty,price,params) VALUES ?', [data.newProducts], function (error, results, fields) {
                                if (error) {
                                    console.log(error);
                                } else {
                                    callback(null, results);
                                }
                            });
                        }else{
                            callback(null, null);
                        }
                    },
                    update:function (callback) {
                        conn.query('UPDATE orders SET ? WHERE id=?', [data.order_data,data.order_id], function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            } else {
                                callback(null, results);
                            }
                        });
                    }
                };

                async.parallel(moveTask, function (err, result) {
                    main_callback('done');
                });
            }
        }
    );
};