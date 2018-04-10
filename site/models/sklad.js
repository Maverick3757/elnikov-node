let async = require('async');
let pug = require('pug');
module.exports = function (conn) {
    return new Object({
			updateProduct:function(data,callback){
				conn.query('UPDATE products SET ? WHERE id=?',[data.product_data,data.product_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);
					}
				});	
			},
			
			getSklad: function (data, callback){
			    let qty = data.hasOwnProperty('qty')?Number(data.qty):10;
			    let offset = data.hasOwnProperty('offset')?Number(data.offset):0;
			    let order_name = data.hasOwnProperty('sort_col')?data.sort_col:"product_name";
                let order_direction = data.hasOwnProperty('sort_direction')?data.sort_direction:"ASC";
                let searchString = data.hasOwnProperty('search_string')?'WHERE search_string LIKE "%' + data.search_string+'%"':"";
			    let regexpstring = '';
			    if(data.hasOwnProperty('search_string')){
                    regexpstring = ", CONCAT(REGEXP_REPLACE( CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`))) as search_string";
                }
                let providersString = '';
                if(data.hasOwnProperty('providers')){
                    providersString =data.providers!=''?'WHERE providers in ('+data.providers+')':"";
                }


                conn.query('SELECT GROUP_CONCAT(`COLUMN_NAME` SEPARATOR "+") as dep_name FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_NAME`="products_to_departments" AND `COLUMN_NAME` LIKE "%department_%"', function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        let prod_total_stock=results[0]['dep_name']+" as prod_total_stock";
                        let queryCount = 'SELECT count(product_name)  as max_qty FROM(SELECT pTd.*,'+prod_total_stock+',`products`.`product_name`,`currencies`.`symbol` as currency,`products`.`providers`, `products`.`vin`,`products`.`providers_artikul`,`products`.`info`, `providers`.`providers_name`,tbl.`price`,tbl.`seil_price`' + regexpstring + ' FROM `products_to_departments` as pTd LEFT JOIN `products` ON pTd.product_id=`products`.`id` LEFT JOIN `providers` ON `providers`.`id` = `products`.`providers` LEFT JOIN (SELECT `product_id`,`price`,`seil_price`,`receive_id` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id` = tbl.`receive_id` LEFT JOIN `currencies` ON `currencies`.`id`=`receives`.`currency_id` ' + providersString + ') tbl ' + searchString;

                        conn.query('SELECT * FROM(SELECT pTd.*,'+prod_total_stock+',`products`.`product_name`,`currencies`.`symbol` as currency,`products`.`providers`, `products`.`vin`,`products`.`providers_artikul`,`products`.`info`, `providers`.`providers_name`,tbl.`price`,tbl.`seil_price`' + regexpstring + ' FROM `products_to_departments` as pTd LEFT JOIN `products` ON pTd.product_id=`products`.`id` LEFT JOIN `providers` ON `providers`.`id` = `products`.`providers` LEFT JOIN (SELECT `product_id`,`price`,`seil_price`,`receive_id` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id` = tbl.`receive_id` LEFT JOIN `currencies` ON `currencies`.`id`=`receives`.`currency_id` ' + providersString + ') tbl ' + searchString + ' ORDER BY ?? ' + order_direction + ' LIMIT ? OFFSET ?;'+queryCount,[order_name,qty,offset], function (error, results, fields) {
                            if (error) {
                                console.log(error);
                            }else{
                                results.data = results;
                                if(data.hasOwnProperty('qty')) results.fillter = data;
                                callback(results)
                            }
                        });
                    }
                });

			},
			setSkladFilter: function (data, callback) {
                let searchString = "";
                let providersString = "";
                params = [];
                if (Object.keys(data.search).length != 0) {
                    for (key in data.search) {
                        if (key == 'providers') {
                            providersString = 'WHERE ';
                            data.search[key].forEach(function (item) {
                                providersString = providersString + key + '= ? OR ';
                                params.push(Number(item));
                            });
                            providersString = providersString.slice(0, -3);
                        } else {
                            searchString = ' WHERE ' + key + ' LIKE ?';
                            params.push(data.search[key]);
                        }

                    }

                }
                params.push(data.order.name);
                params.push(data.limits.qty);
                params.push(data.limits.offset);
                regexpstring = " CONCAT(REGEXP_REPLACE( CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`))) as search_string";
                conn.query('SELECT GROUP_CONCAT(`COLUMN_NAME` SEPARATOR "+") as dep_name FROM `INFORMATION_SCHEMA`.`COLUMNS` WHERE `TABLE_NAME`="products_to_departments" AND `COLUMN_NAME` LIKE "%department_%"', function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
						prod_total_stock=results[0]['dep_name']+" as prod_total_stock";
						sql = conn.format('SELECT * FROM(SELECT pTd.*,'+prod_total_stock+',`products`.`product_name`,`currencies`.`symbol` as currency,`products`.`providers`, `products`.`vin`,`products`.`providers_artikul`,`products`.`info`, `providers`.`providers_name`,tbl.`price`,tbl.`seil_price`, ' + regexpstring + ' FROM `products_to_departments` as pTd LEFT JOIN `products` ON pTd.product_id=`products`.`id` LEFT JOIN `providers` ON `providers`.`id` = `products`.`providers` LEFT JOIN (SELECT `product_id`,`price`,`seil_price`,`receive_id` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id` = tbl.`receive_id` LEFT JOIN `currencies` ON `currencies`.`id`=`receives`.`currency_id` ' + providersString + ') tbl ' + searchString + ' ORDER BY ?? ' + data.order.direction + ' LIMIT ? OFFSET ?;SELECT * FROM departments');
						conn.query(sql, params, function (error, results, fields) {
							if (error) {
								console.log(error);
							} else {
								sklad = [];
								sklad.push(results[0]);
								data = {data: {sklad: {data:sklad}, departments: results[1]}};
								html = pug.renderFile('site/views/sklad_rows.pug', data);
								callback(html);
							}
						});
					}
				});
			}
        }
    );

};