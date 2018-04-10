var async = require('async');
var pug = require('pug');
module.exports = function (conn) {
    return new Object({
			getProductsByArtikul: function (data, callback){
				conn.query('SELECT * FROM products WHERE providers_artikul=?', [data.artikul], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getProductsByVin: function (data, callback){
				conn.query('SELECT * FROM products WHERE vin=?', [data.vin], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getAllUniqVins :function (callback){
				conn.query('SELECT DISTINCT `vin` FROM `products`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getAllUniqProvArtikuls :function (callback){
				conn.query('SELECT DISTINCT `providers_artikul` FROM `products`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			saveData: function (data, main_callback){
			var me = this;
				var saveTask = [
						function (callback) {
							me.insertSails(data,function(res){
								callback(null, res);
							});	
						},	
						function (sail_id, callback) {
							me.insertProductsToSail(data.products,sail_id,function(res){
								callback(null, sail_id);
							});
						},
						function(sail_id, callback){
							me.updateStocks(data.stocks,function(res){
								callback(null, sail_id);
							});
						}
					];
				async.waterfall(saveTask, function (err, sail_id) {
					html = pug.renderFile('site/views/SeilInvoice_print.pug', {sail_id: sail_id, data: data});
					main_callback(html); 
				});
			},
			showPreview: function (data, callback){
                html = pug.renderFile('site/views/SeilInvoice_print.pug', {sail_id: "Спецификация", data: data});
                callback(html);
            },
			updateStocks: function(stocks, callback){
				conn.query('INSERT INTO products_to_departments (product_id,department_'+stocks.dep_id+') VALUES ? ON DUPLICATE KEY UPDATE department_'+stocks.dep_id+'=department_'+stocks.dep_id+'-VALUES(department_'+stocks.dep_id+')', [stocks.stock], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, results);
								}
				});		
			},
			insertSails: function(data, callback){
				inserts = {"department":data.department,"seil_sum":data.seil_sum,"manager_full_name":data.manager_full_name};
				conn.query('INSERT INTO saills SET ?',inserts, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results.insertId)
					}
				});	
			},
			insertProductsToSail: function(products,sail_id,callback){
				products.forEach(function(prod){
					prod.push(sail_id);
				});
				conn.query('INSERT INTO product_to_sail(product_id,product_name,product_vin,product_artikul,qty,price_uah,sail_id) VALUES ?',[products], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results.insertId)
					}
				});	
			},
			getProductInfo :function (data, callback){
				conn.query('SELECT pTd.*, `products`.`product_name`, `products`.`vin`,`products`.`providers_artikul`,IF(`currencies`.`rateToUAH`<`receives`.`rate`,tbl.`price`*`receives`.`rate`,tbl.`price`*`currencies`.`rateToUAH`) as price,IF(`currencies`.`rateToUAH`<`receives`.`rate`,tbl.`seil_price`*`receives`.`rate`,tbl.`seil_price`*`currencies`.`rateToUAH`) as seil_price, tbl.`receive_id` FROM `products_to_departments` as pTd LEFT JOIN `products` ON pTd.product_id=`products`.`id` LEFT JOIN (SELECT `receive_id`, `product_id`,`price`,`seil_price` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id`= tbl.`receive_id` LEFT JOIN `currencies` ON `receives`.`currency_id`=`currencies`.`id` WHERE pTd.product_id=?', [data.product_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			}
			
        }
    );

};