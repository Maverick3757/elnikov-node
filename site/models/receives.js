var pug = require('pug');
module.exports = function (conn) {
    return new Object({
					
			getSails: function (callback){
				conn.query('SET SESSION group_concat_max_len = 1000000;SELECT * FROM (SELECT `receives`.*,`currencies`.`name`,DATE_FORMAT(date,"%d.%m.%Y") as prop_date,`providers`.`providers_name`, GROUP_CONCAT(`products`.`product_name` SEPARATOR "|||") as product_name, GROUP_CONCAT(`products`.`vin` SEPARATOR "|||") as product_vin, GROUP_CONCAT(`products`.`providers_artikul` SEPARATOR "|||") as product_artikul, GROUP_CONCAT(`qty` SEPARATOR "|||") as qty, GROUP_CONCAT(`price` SEPARATOR "|||") as price FROM `receives` LEFT JOIN `products_to_receives` as pr ON pr.`receive_id`= `receives`.`id` LEFT JOIN `products` ON `products`.`id`=pr.`product_id` LEFT JOIN `currencies` ON `currencies`.`id`=`receives`.`currency_id` LEFT JOIN `providers` ON `providers`.`id` = `receives`.`providers_id` WHERE `receive_id`<>0 GROUP BY `receives`.`id`)tbl JOIN (SELECT SUM(IF(ISNULL(`sum_uah`),`sum`*`currencies`.`rateToUAH`,`sum_uah`)) as total_uah FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id`) tbl2', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results[1])
					}
				});	
			},
			arraySum: function(array){
				var result = 0;
				for (let val of array) {
					if(val.sum_uah>0){
                        result = result + val.sum_uah;
					}else {
                        result = result + val.sum * val.rateToUAH;
                    }
				}
				return result;
			},
			setSailsFilter: function (data, callback){
				var me=this;
				var searchString="";
				var providersString="";
				params=[];
				params.push(data.search_string);
				if(data.providers.length>0){
					data.providers.forEach(function(item){
								searchString =  searchString+'providers_id = ? OR ';
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
				regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT(`products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT(`products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)))";
				sql = conn.format('SET SESSION group_concat_max_len = 1000000;SELECT * FROM (SELECT `receives`.*,`currencies`.`name`,`currencies`.`rateToUAH`,DATE_FORMAT(date,"%d.%m.%Y") as prop_date,`providers`.`providers_name`, GROUP_CONCAT(`products`.`product_name` SEPARATOR "|||") as product_name, GROUP_CONCAT(`products`.`vin` SEPARATOR "|||") as product_vin, GROUP_CONCAT(`products`.`providers_artikul` SEPARATOR "|||") as product_artikul, GROUP_CONCAT(`qty` SEPARATOR "|||") as qty, GROUP_CONCAT(`price` SEPARATOR "|||") as price FROM `receives` LEFT JOIN `products_to_receives` as pr ON pr.`receive_id`= `receives`.`id` LEFT JOIN `products` ON `products`.`id`=pr.`product_id` LEFT JOIN `currencies` ON `currencies`.`id`=`receives`.`currency_id` LEFT JOIN `providers` ON `providers`.`id` = `receives`.`providers_id` WHERE `receive_id`<>0 AND '+regexpstring+' LIKE ? GROUP BY `receives`.`id`)tbl'+searchString+' ORDER BY ?? '+data.order.direction+';');

				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						sum = me.arraySum(results[1]);
						results = results.slice(data.limits.offset,data.limits.offset+data.limits.qty)
						data={data:{sails:results[1]}};
						html = pug.renderFile('site/views/receives_rows.pug', data);
						send={html:html,sum:sum};
						callback(send);
					}
				});	
			}
        }
    );

};