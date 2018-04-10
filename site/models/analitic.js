var async = require('async');
var pug = require('pug');
var fs = require('fs');

module.exports = function (conn) {
    return new Object({
			getAnalytic: function (callback){
				conn.query("SELECT date, SUM(dohod) as dohod, SUM(earnings) as earnings, def_date, SUM(res_sum) as res_sum FROM((SELECT date,dohod,earnings,def_date, 0 as res_sum FROM (SELECT `product_to_sail`.*,date as def_date,SUM(`product_to_sail`.`qty`*`product_to_sail`.`price_uah`) as dohod,DATE_FORMAT(`saills`.`date`,'%d.%m.%Y') as date,SUM(tbl.earnings_k*`product_to_sail`.`qty`) as earnings FROM `product_to_sail` LEFT JOIN `saills` ON `saills`.`id`=`sail_id`LEFT JOIN (SELECT *,avg_seilPrice-avg_price as earnings_k FROM (SELECT `products_to_receives`.`product_id`,Sum( IF(ISNULL(`receives`.`sum_uah`),`price`*`receives`.`rate`,`price`)) as price_uah,sum(`qty`) as qty,Sum(  IF(ISNULL(`receives`.`sum_uah`),`price`*`receives`.`rate`*`qty`,`price`*`qty`))/sum(`qty`) as avg_price,sail.avg_seilPrice,sail.sailed_qty FROM `products_to_receives` LEFT JOIN `receives` ON `receives`.`id`=`receive_id` LEFT JOIN (SELECT `product_id`,Sum(`price_uah`*`qty`)/Sum(`qty`) as avg_seilPrice,Sum(`qty`) as sailed_qty FROM `product_to_sail` GROUP BY `product_id`)sail ON sail.product_id = `products_to_receives`.`product_id` GROUP BY `products_to_receives`.`product_id`)tbl)tbl ON tbl.product_id=`product_to_sail`.`product_id` GROUP BY YEAR(date), MONTH(date), DAY(date))tbl) UNION (SELECT date, dohod, earnings, def_date, SUM(res_sum) as res_sum FROM((SELECT DATE_FORMAT(`date`,'%d.%m.%Y') as date, 0 as dohod, 0 as earnings, `date` as def_date, SUM(`sum`) as res_sum FROM `deductions`GROUP BY YEAR(`date`),MONTH(`date`), DAY(`date`)) UNION (SELECT DATE_FORMAT(`date`,'%d.%m.%Y') as date, 0 as dohod, 0 as earnings, `date` as def_date, SUM(`sum`*`rate`) as res_sum FROM `providers_charge` GROUP BY YEAR(`date`), MONTH(`date`), DAY(`date`)))tbl GROUP BY date))tbl GROUP BY date ORDER BY def_date", function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(JSON.stringify(results));
					}
				});	
			},
			getOnHandValue: function(callback){
				conn.query('SELECT dohod-charge_sum+ded_sum as onHand FROM (SELECT IF(ISNULL(SUM(`sum`*`rate`)),0,SUM(`sum`*`rate`) ) as charge_sum FROM `providers_charge`)charge JOIN (SELECT IF(ISNULL(SUM(`sum`)),0,SUM(`sum`)) as ded_sum FROM `deductions`)deduct JOIN (SELECT SUM(`seil_sum`) as dohod FROM `saills`)dohod', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getAllProvidersWithDetails: function (callback){
				conn.query('SELECT *,totals_charges-totals_res as balance FROM(SELECT `providers`.*, IF(ISNULL(recvs.totals_res),0,recvs.totals_res) as totals_res, IF(ISNULL(charges.total_charges),0,charges.total_charges) as totals_charges FROM `providers` LEFT JOIN (SELECT IF(ISNULL(`sum_uah`),SUM(`sum`*`currencies`.`rateToUAH`),SUM(`sum_uah`)) as totals_res, `providers_id` FROM `receives` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` WHERE `providers_id` <> 0 GROUP BY `providers_id`)recvs ON recvs.`providers_id` = `providers`.`id` LEFT JOIN (SELECT `providers_id`, SUM(`sum`*`currencies`.`rateToUAH`) as total_charges FROM `providers_charge` LEFT JOIN `currencies` ON `currencies`.`id`=`currency_id` GROUP BY `providers_id`)charges ON charges.`providers_id` = `providers`.`id`)tbl', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			setAnalyticFilter: function (data, callback){
				conn.query("SELECT date, SUM(dohod) as dohod, SUM(earnings) as earnings, def_date, SUM(res_sum) as res_sum FROM((SELECT date,dohod,earnings,def_date, 0 as res_sum FROM (SELECT `product_to_sail`.*,date as def_date,SUM(`product_to_sail`.`qty`*`product_to_sail`.`price_uah`) as dohod,DATE_FORMAT(`saills`.`date`,'%d.%m.%Y') as date,SUM(tbl.earnings_k*`product_to_sail`.`qty`) as earnings FROM `product_to_sail` LEFT JOIN `saills` ON `saills`.`id`=`sail_id`LEFT JOIN (SELECT *,avg_seilPrice-avg_price as earnings_k FROM (SELECT `products_to_receives`.`product_id`,Sum( IF(ISNULL(`receives`.`sum_uah`),`price`*`receives`.`rate`,`price`)) as price_uah,sum(`qty`) as qty,Sum(  IF(ISNULL(`receives`.`sum_uah`),`price`*`receives`.`rate`*`qty`,`price`*`qty`))/sum(`qty`) as avg_price,sail.avg_seilPrice,sail.sailed_qty FROM `products_to_receives` LEFT JOIN `receives` ON `receives`.`id`=`receive_id` LEFT JOIN (SELECT `product_id`,Sum(`price_uah`*`qty`)/Sum(`qty`) as avg_seilPrice,Sum(`qty`) as sailed_qty FROM `product_to_sail` GROUP BY `product_id`)sail ON sail.product_id = `products_to_receives`.`product_id` GROUP BY `products_to_receives`.`product_id`)tbl)tbl ON tbl.product_id=`product_to_sail`.`product_id` GROUP BY YEAR(date), MONTH(date), DAY(date))tbl) UNION (SELECT date, dohod, earnings, def_date, SUM(res_sum) as res_sum FROM((SELECT DATE_FORMAT(`date`,'%d.%m.%Y') as date, 0 as dohod, 0 as earnings, `date` as def_date, SUM(`sum`) as res_sum FROM `deductions`GROUP BY YEAR(`date`),MONTH(`date`), DAY(`date`)) UNION (SELECT DATE_FORMAT(`date`,'%d.%m.%Y') as date, 0 as dohod, 0 as earnings, `date` as def_date, SUM(`sum`*`rate`) as res_sum FROM `providers_charge` GROUP BY YEAR(`date`), MONTH(`date`), DAY(`date`)))tbl GROUP BY date))tbl WHERE def_date BETWEEN ? AND ? GROUP BY date ORDER BY def_date",data, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						data={data:{analyticData:JSON.stringify(results)}};
						html = pug.renderFile('site/views/analitic_rows.pug', data);
						send={html:html,data:results};
						callback(send);
					}
				});	
			},
	
        }
    );
};