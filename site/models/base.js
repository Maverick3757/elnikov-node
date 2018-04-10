var async = require('async');
var pug = require('pug');
module.exports = function (conn) {
    return new Object({
		//base
			 getAllProviders: function (callback){
				conn.query('SELECT * FROM providers', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getNewOrderss: function (callback){
                conn.query('SELECT COUNT(id) as qty FROM orders WHERE order_status=1', function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results[0].qty)
                    }
                });
            },
			getQuickSerchProducts :function (search, callback){
				regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)))";
				conn.query('SELECT pTd.*, `products`.`product_name`,`products`.`info`, `products`.`vin`,`products`.`providers_artikul`,IF(`currencies`.`rateToUAH`<`receives`.`rate`,tbl.`seil_price`*`receives`.`rate`,tbl.`seil_price`*`currencies`.`rateToUAH`) as seil_price, tbl.`receive_id` FROM `products_to_departments` as pTd LEFT JOIN `products` ON pTd.product_id=`products`.`id` LEFT JOIN (SELECT `receive_id`, `product_id`,`price`,`seil_price` FROM `products_to_receives` WHERE `receive_id` = (SELECT MAX(`receive_id`) FROM `products_to_receives` as p WHERE p.`product_id` = `products_to_receives`.`product_id`))tbl ON tbl.`product_id`=`products`.`id` LEFT JOIN `receives` ON `receives`.`id`= tbl.`receive_id` LEFT JOIN `currencies` ON `receives`.`currency_id`=`currencies`.`id` WHERE ' +regexpstring+ ' LIKE ?;SELECT * FROM departments' , [search], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						data={data:{products:results[0],departments:results[1]}};
						html = pug.renderFile('site/views/quick_search_rows.pug', data);
						callback(html);
					}
				});	
			},
			setTodayRate: function (data, callback){
				conn.query('UPDATE `currencies` SET `rateToUAH`=? WHERE `id`=?',[data.rate, data.currency_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			//base
			moveFromTmpProducts:function(data,main_callback){
				var me=this;
				var moveTask = {
						del:function (callback) {
							conn.query('DELETE FROM products_to_dep_tmp WHERE ? AND ?', [{"receive_id":data.res_id},{"department_id":data.dep_id}], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, results);
								}
							});	
						},	
						update:function (callback) {
							conn.query('INSERT INTO products_to_departments (product_id,department_'+data.dep_id+') VALUES ? ON DUPLICATE KEY UPDATE department_'+data.dep_id+'=VALUES(department_'+data.dep_id+')', [data.products], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, results);
								}
							});	
						}						
					};

				async.parallel(moveTask, function (err, result) {
					main_callback('done'); 
				});		
			},
			//base
			getArrayUniq: function (modelProduct,uniqCol){
				var result = [];
				for (key in modelProduct) {
					var val = modelProduct[key];
					if (result.indexOf(val[uniqCol])==-1) result.push(val[uniqCol]);
				}
				return result;
			},
			//base
			getPropNotReceivedData: function (productData, deparmentData){
				var me=this;
				var result={};
				for (key in deparmentData) {
					var val = deparmentData[key];
					var modelsProduct = productData.filter(
					   (it) => {
						 return it.department_id === val.id;
					   }
					);
					result[val.id]={};
					receiveisInDep = me.getArrayUniq(modelsProduct,'receive_id');
					receiveisInDep.forEach(function(receive){
						productsInReceive = modelsProduct.filter(
							(it) => {
								return it.receive_id === receive;
							}
						);
					result[val.id][receive]=productsInReceive;
					});
				}
				return result;
			},	
			//base
			getNotReceivedTable:function(callback){
				conn.query('SELECT `products_to_departments`.*, m.qty, m.receive_id, m.`product_id` as cor_id, m.department_id, products.product_name, products.info, products.providers_artikul, DATE_FORMAT(receives.date,"%d.%m.%Y") as date FROM products_to_dep_tmp as m LEFT JOIN receives ON receives.id=receive_id LEFT JOIN products ON m.product_id=products.id LEFT JOIN `products_to_departments` on `products_to_departments`.`product_id`=m.`product_id`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getTodayRate: function (callback){
				conn.query('SELECT * FROM `currencies` ORDER by id', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			//base
			getAllDepartments: function (callback){
				conn.query('SELECT * FROM departments', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
        }
    );

};