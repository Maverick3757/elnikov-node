var pug = require('pug');
var async = require('async');
module.exports = function (conn) {
    return new Object({
					
			getSails: function (callback){
				conn.query('SET SESSION group_concat_max_len = 1000000;SELECT * FROM (SELECT `saills`.*, GROUP_CONCAT(ps.`product_name` SEPARATOR "|||") as product_name, GROUP_CONCAT(ps.`product_vin` SEPARATOR "|||") as product_vin, GROUP_CONCAT(ps.`product_id` SEPARATOR "|||") as product_id, GROUP_CONCAT(ps.`product_artikul` SEPARATOR "|||") as product_artikul, GROUP_CONCAT(ps.`qty` SEPARATOR "|||") as qty, GROUP_CONCAT(ps.`price_uah` SEPARATOR "|||") as price_uah, `departments`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date FROM `saills` LEFT JOIN `product_to_sail` as ps ON ps.`sail_id`=`saills`.`id` LEFT JOIN `departments` ON `departments`.`id`=`saills`.`department` GROUP BY `saills`.`id`)tbl JOIN (SELECT SUM(`seil_sum`) as total FROM `saills`) tbl2', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results[1])
					}
				});	
			},
			productBack: function (data, main_callback){
			var me = this;
				var productBack = [
						function (callback) {
							params = [];
							if(data.deleteSails){
								sql = "DELETE FROM `saills` WHERE `id`=?";
								params.push(data.sail_id);
							}else{
								sql = "UPDATE `saills` SET `seil_sum` = ? WHERE `id`=?";
								params.push(data.newTotal);
								params.push(data.sail_id);
							}
								conn.query(sql, params, function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null)
									}
								});	
	
						},	
						function (callback) {
							params = [];
							if(!data.deleteSails){
								if(data.deleteProduct){
									sql = "DELETE FROM `product_to_sail` WHERE `sail_id`=? AND product_id=?";
									params.push(data.sail_id);
									params.push(data.product_id);
								}else{
									sql = "UPDATE `product_to_sail` SET `qty` = ? WHERE `sail_id`=? AND product_id=?";
									params.push(data.newQty);
									params.push(data.sail_id);
									params.push(data.product_id);
								}
								conn.query(sql, params, function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null);
									}
								});	
							}else{
								callback(null);
							}
						},
						function(callback){
							conn.query("INSERT INTO `products_to_departments` (`product_id`,`department_"+data.department+"`) VALUES (?,?) ON DUPLICATE KEY UPDATE department_"+data.department+"=department_"+data.department+"+VALUES(department_"+data.department+")", [data.product_id,data.backQty], function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null);
									}
								});	
						}
					];
				async.waterfall(productBack, function (err) {
					main_callback('done'); 
				});
			},
			arraySum: function(array){
				var result = 0;
				for (key in array) {
					var val = array[key];
					result = result+val.seil_sum;
				}
				return result;
			},
			setSailsFilter: function (data, callback){
				var me=this;
				var searchString="";
				var providersString="";
				params=[];
				params.push(data.search_string);
				if(data.departments.length>0){
					data.departments.forEach(function(item){
								searchString =  searchString+'department = ? OR ';
								params.push(Number(item));
							});
					searchString = searchString.slice(0,-3);
					if(data.hasOwnProperty("date")){
						searchString = searchString+" AND ";
					}
				}
				if(data.hasOwnProperty("date")){
					searchString = searchString+"`date` between ? and ?";
					params.push(data.date['from']);
					params.push(data.date.to);
				}
				
				if (searchString!=""){
					searchString = ' WHERE '+searchString;
				}
				var params2 = params;				
				params.push(data.order.name);			
				/* params.push(data.limits.qty);
				params.push(data.limits.offset); */	
				regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT(ps.`product_name`, IF(ISNULL(ps.`product_vin`),'',ps.`product_vin`), ps.`product_artikul`),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT(ps.`product_name`, IF(ISNULL(ps.`product_vin`),'',ps.`product_vin`), ps.`product_artikul`))";
				sql = conn.format("SET SESSION group_concat_max_len = 1000000;SELECT * FROM (SELECT `saills`.*, GROUP_CONCAT(ps.`product_name` SEPARATOR '|||') as product_name, GROUP_CONCAT(ps.`product_vin`  SEPARATOR '|||') as product_vin, GROUP_CONCAT(ps.`product_artikul`  SEPARATOR '|||') as product_artikul, GROUP_CONCAT(ps.`product_id`  SEPARATOR '|||') as product_id, GROUP_CONCAT(ps.`qty`  SEPARATOR '|||') as qty, GROUP_CONCAT(ps.`price_uah`  SEPARATOR '|||') as price_uah, `departments`.`name`, DATE_FORMAT(date,'%d.%m.%Y') as prop_date FROM `saills` LEFT JOIN `product_to_sail` as ps ON ps.`sail_id`=`saills`.`id` LEFT JOIN `departments` ON `departments`.`id`=`saills`.`department` WHERE "+regexpstring+" LIKE ? GROUP BY `saills`.`id`)tbl "+searchString+" ORDER BY ?? "+data.order.direction+";");
				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						sum = me.arraySum(results[1]);
						results = results.slice(data.limits.offset,data.limits.offset+data.limits.qty)
						data={data:{sails:results[1]}};
						html = pug.renderFile('site/views/seils_rows.pug', data);
						send={html:html,sum:sum};
						callback(send);
					}
				});	
			}
        }
    );

};