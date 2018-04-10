var pug = require('pug');
module.exports = function (conn) {
    return new Object({
			updateProducts:function (data, callback) {
				sql = 'INSERT INTO products_to_departments (product_id,'+data.departments.join(',')+')';
				sql2 = 'ON DUPLICATE KEY UPDATE '+data.keyUpdate.join(',');
				sql = conn.format(sql+' VALUES ? '+sql2);
				conn.query(sql, [data.products], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results);;
					}
				});	
			},
			
			
			getDistributions: function (callback){
				conn.query('SELECT * FROM `products_to_departments` LEFT JOIN `products` ON `products`.`id`=`product_id` ORDER BY product_name ASC  LIMIT 10 OFFSET 0;SELECT COUNT(product_id) as max_qty FROM `products_to_departments`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			setDistributionFilter: function (data, callback){
				params=[];
				params.push(data.search_string);		
				params.push(data.limits_qty);
				params.push(data.limits_offset);
                regexpstring = "CONCAT(REGEXP_REPLACE( CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT( `products`.`product_name`, IF(ISNULL(`products`.`vin`),'',`products`.`vin`), `products`.`providers_artikul`, IF(ISNULL(`products`.`info`),'',`products`.`info`)))";
				sql = conn.format('SELECT * FROM (SELECT *,'+regexpstring+' as search_string FROM `products_to_departments` LEFT JOIN `products` ON `products`.`id`=`product_id`)tbl WHERE search_string LIKE ? ORDER BY product_name '+data.direction+' LIMIT ? OFFSET ?');
				conn.query(sql, params, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						distributions=[];
						distributions.push(results);
						data={data:{distributions:distributions, tabindex: data.tabindex}};
						html = pug.renderFile('site/views/distributions_rows.pug', data);
						callback(html);
					}
				});	
			}
        }
    );

};