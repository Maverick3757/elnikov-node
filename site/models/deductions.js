var pug = require('pug');
module.exports = function (conn) {
    return new Object({
					
			getDeductions: function (callback){
				conn.query('SELECT `deductions`.*,DATE_FORMAT(date,"%d.%m.%Y") as prop_date, `deductions_type`.`type`, tbl.total_sum FROM `deductions` LEFT JOIN `deductions_type` ON `deductions_type`.`id`=`type_id` JOIN (SELECT SUM(`sum`) as total_sum FROM `deductions`)tbl', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getDeductionsTypes: function (callback){
				conn.query('SELECT * FROM `deductions_type`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			setNewNameForDeduct: function (data, callback){
				conn.query('UPDATE `deductions` SET `name`=? WHERE `id`=?',[data.name, data.id], function (error, results, fields) {
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
					result = result+val.sum;
				}
				return result;
			},
			
			saveDeduction: function (data, callback){
				sql = conn.format('INSERT INTO `deductions` SET ?');
				conn.query(sql, data, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);
					}
				});	
				
			},
			setDeductionsFilter: function (data, callback){
				var me=this;
				var searchString="";
				params=[];
				if(data.deductions_type.length>0){
					data.deductions_type.forEach(function(item){
								searchString =  searchString+'type_id = ? OR ';
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
				sql = conn.format('SELECT `deductions`.*,DATE_FORMAT(date,"%d.%m.%Y") as prop_date, `deductions_type`.`type` FROM `deductions` LEFT JOIN `deductions_type` ON `deductions_type`.`id`=`type_id`'+searchString+' ORDER BY ?? '+data.order.direction+';');
				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						sum = me.arraySum(results);
						results = results.slice(data.limits.offset,data.limits.offset+data.limits.qty);
						data={data:{deductions:results}};
						html = pug.renderFile('site/views/deductions_rows.pug', data);
						send={html:html,sum:sum};
						callback(send);
					}
				});	
			}
        }
    );

};