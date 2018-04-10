var async = require('async');
var pug = require('pug');
module.exports = function (conn) {
    return new Object({
			saveProducts:function(data,main_callback){
				var me = this;
				var saveTask = [
						function (callback) {
						console.log(data);
							conn.query('INSERT  `products`(`product_name`, `providers`,`providers_artikul`,`vin`,`info`) VALUES ?',[data], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, me.createArrayFromRange(results.insertId,results.affectedRows));
								}
							});	
						},	
						function (newProdId, callback) {
							conn.query('INSERT  `products_to_departments`(`product_id`) VALUES ?',[newProdId], function (error, results, fields) {
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
			createArrayFromRange:function(start,num){
				result = [];
				for(i=start;i<start+num;i++){
					result.push([i]);
				}
				return result;
			}

        }
    );

};

