var pug = require('pug');
module.exports = function (conn) {
    return new Object({
					
			getCharges: function (callback){
				conn.query('SELECT providers_charge.`id`,`providers_name`,`sum`,`rate`,`description`,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date,tbl.sum_uah FROM `providers_charge` LEFT JOIN `currencies` on `currencies`.`id`=`providers_charge`.`currency_id` JOIN (SELECT SUM(`sum`*`rate`) as sum_uah FROM `providers_charge`)tbl', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			arraySum: function(array){
				var result = 0;
				for (let val of array) {
					result = result+val.sum_uah;
				}
				return result;
			},
        	changeChargeSum: function (data, callback){
                sql = conn.format('UPDATE `providers_charge` SET `sum`=? WHERE `id`=?');
                conn.query(sql, [data.sum,data.id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
        	changeChargeRate: function (data, callback){
                sql = conn.format('UPDATE `providers_charge` SET `rate`=? WHERE `id`=?');
                conn.query(sql, [data.rate,data.id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        callback(results);
                    }
                });
            },
			getProvidersCurrency: function (providers_id, callback){
				sql = conn.format('SELECT `date`, IF(ISNULL(`receives`.`sum_uah`),`currency_id`,1) as currency_id ,`currencies`.`name` FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` WHERE `date` = (SELECT MAX(`date`) FROM `receives` as p WHERE p.`providers_id` = ?) GROUP BY `providers_id`;SELECT totals_charges-totals_res as balance FROM(SELECT `providers`.*, IF(ISNULL(recvs.totals_res),0,recvs.totals_res) as totals_res, IF(ISNULL(charges.total_charges),0,charges.total_charges) as totals_charges FROM `providers` LEFT JOIN (SELECT IF(ISNULL(`sum_uah`),SUM(`sum`*`currencies`.`rateToUAH`),SUM(`sum_uah`)) as totals_res, `providers_id` FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` WHERE `providers_id` <> 0 GROUP BY `providers_id`)recvs ON recvs.`providers_id` = `providers`.`id` LEFT JOIN (SELECT `providers_id`, SUM(`sum`*`currencies`.`rateToUAH`) as total_charges FROM `providers_charge` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` GROUP BY `providers_id`)charges ON charges.`providers_id` = `providers`.`id`)tbl WHERE `id`=?');
				conn.query(sql, [providers_id,providers_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);
					}
				});	
				
			},
			saveCharge: function (data, callback){
				sql = conn.format('INSERT INTO `providers_charge` SET `providers_id`=?, `providers_name`=(SELECT `providers_name` FROM `providers` WHERE `id`=?), `currency_id`=?, `sum`=?, `rate`=?, `description`=?');
				conn.query(sql, [data.providers_id,data.providers_id,data.currency_id,data.sum/data.rate, data.rate, data.description], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);
					}
				});	
				
			},
			setChargesFilter: function (data, callback){
				var me=this;
				var searchString="";
				params=[];
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
				params.push(data.order.name);			
				/* params.push(data.limits.qty);
				params.push(data.limits.offset); */
				sql = conn.format('SELECT `providers_name`,`description`,`sum`,`rate`,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date, `sum`*`rate` as sum_uah FROM `providers_charge` LEFT JOIN `currencies` on `currencies`.`id`=`providers_charge`.`currency_id`'+searchString+' ORDER BY ?? '+data.order.direction+';');
				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						sum = me.arraySum(results);
						results = results.slice(data.limits.offset,data.limits.offset+data.limits.qty)
						data={data:{charges:results}};
						html = pug.renderFile('site/views/providers_charge_rows.pug', data);
						send={html:html,sum:sum};
						callback(send);
					}
				});	
			}
        }
    );

};