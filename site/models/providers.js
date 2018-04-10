module.exports = function (conn) {
    return new Object({
			updatedDep:function(data,callback){
				id = data.id;
				delete data['id'];
				conn.query("UPDATE `providers` SET ? WHERE id = ?;",[data,id],function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},

			deleteDep: function (data, callback){
				
				conn.query("DELETE FROM `providers` WHERE id = ?",data,function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},



			addDep: function (data, callback){
				conn.query("INSERT INTO `providers` SET ?;",[data],function (error, results, fields) {
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
        }
    );

};