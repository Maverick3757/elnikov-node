var pug = require('pug');
module.exports = function (conn) {
    return new Object({
					
			getCharges: function (providers_id, callback){
				conn.query('SELECT * FROM(SELECT providers_charge.`id`,`sum`,`rate`,`description`,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date, date FROM `providers_charge` LEFT JOIN `currencies` on `currencies`.`id`=`providers_charge`.`currency_id` WHERE providers_id=? UNION SELECT "order" as id,`sum`,`rate`,CONCAT("Накладная №","",`receives`.`id`) as description,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date, date FROM `receives` LEFT JOIN `currencies` on `currencies`.`id`=`receives`.`currency_id` WHERE `providers_id`=?)tbl ORDER by date DESC',[providers_id,providers_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getProvidersBalance: function (providers_id, callback){
				conn.query('SELECT totals_charges-totals_res as balance FROM(SELECT `providers`.*, IF(ISNULL(recvs.totals_res),0,recvs.totals_res) as totals_res, IF(ISNULL(charges.total_charges),0,charges.total_charges) as totals_charges FROM `providers` LEFT JOIN (SELECT IF(ISNULL(`sum_uah`),SUM(`sum`*`currencies`.`rateToUAH`),SUM(`sum_uah`)) as totals_res, `providers_id` FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` WHERE `providers_id` <> 0 GROUP BY `providers_id`)recvs ON recvs.`providers_id` = `providers`.`id` LEFT JOIN (SELECT `providers_id`, SUM(`sum`*`currencies`.`rateToUAH`) as total_charges FROM `providers_charge` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` GROUP BY `providers_id`)charges ON charges.`providers_id` = `providers`.`id`)tbl WHERE `id`=?',[providers_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results[0].balance)
					}
				});
			},
			getProvidersCurrency: function (providers_id, callback){
				sql = conn.format('SELECT `date`, IF(ISNULL(`receives`.`sum_uah`),`currency_id`,1) as currency_id ,IF(ISNULL(`receives`.`sum_uah`),`currencies`.`name`,"UAH") as name, IF(ISNULL(`receives`.`sum_uah`),`currencies`.`rateToUAH`,1) as rateToUAH, IF(ISNULL(`receives`.`sum_uah`),`currencies`.`symbol`,"₴") as symbol FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` WHERE `date` = (SELECT MAX(`date`) FROM `receives` as p WHERE p.`providers_id` = ?) GROUP BY `providers_id`');
				conn.query(sql, [providers_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results[0]);
					}
				});

			},
			getProviderName: function (providers_id, callback){
				conn.query("SELECT `providers_name` FROM `providers` WHERE `id`=?",[providers_id],function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results[0].providers_name)
					}
				});
			},
			arraySum: function(array){
				let result = 0;
				for (let val of array) {
					result = result+val.sum_uah;
				}
				return result;
			},
        	changeChargeSum: function (data, callback){
				let me = this;
                sql = conn.format('UPDATE `providers_charge` SET `sum`=? WHERE `id`=?');
                conn.query(sql, [data.sum,data.id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                    	me.getProvidersBalance(data.providers_id,function(res){
                            callback(res);
                    	});
                    }
                });
            },
        	changeChargeRate: function (data, callback){
                let me = this;
                sql = conn.format('UPDATE `providers_charge` SET `rate`=? WHERE `id`=?');
                conn.query(sql, [data.rate,data.id], function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    }else{
                        me.getProvidersBalance(data.providers_id,function(res){
                            callback(res);
                        });
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
				let me=this;
				let searchString="";
				params=[];
                params.push(data.providers);
                params.push(data.providers);
				if(data.hasOwnProperty("date")){
					searchString = searchString+"WHERE `date` between ? and ?";
					params.push(data.date['from']);
					params.push(data.date.to);
				}
				params.push(data.order.name);			
				/* params.push(data.limits.qty);
				params.push(data.limits.offset); */
				sql = conn.format('SELECT * FROM(SELECT providers_charge.`id`,`sum`,`rate`,`description`,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date, date FROM `providers_charge` LEFT JOIN `currencies` on `currencies`.`id`=`providers_charge`.`currency_id` WHERE providers_id=? UNION SELECT "order" as id,`sum`,`rate`,CONCAT("Накладная №","",`receives`.`id`) as description,`currencies`.`name`, DATE_FORMAT(date,"%d.%m.%Y") as prop_date, date FROM `receives` LEFT JOIN `currencies` on `currencies`.`id`=`receives`.`currency_id` WHERE `providers_id`=?)tbl '+searchString+' ORDER BY ?? '+data.order.direction+';');
				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						results = results.slice(data.limits.offset,data.limits.offset+data.limits.qty)
						data={data:{charges:results}};
						html = pug.renderFile('site/views/providers_details_rows.pug', data);
						send={html:html};
						callback(send);
					}
				});	
			}
        }
    );

};