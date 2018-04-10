var async = require('async');

module.exports = function (conn) {
    return new Object({
			updatedDep:function(data,callback){
				conn.query("UPDATE `departments` SET `name`= ? WHERE id = ?;",[data.name, data.id],function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},

			deleteDep: function (data, callback){
				
				conn.query("DELETE FROM `departments` WHERE id = ?;ALTER TABLE `products_to_departments` DROP ??",[data,'department_'+data],function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},



			addDep: function (data, main_callback){
				var saveTask = [
						function (callback) {
							conn.query("INSERT INTO `departments` SET `name`=?", data, function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null,results.insertId)
								}
							});	
						},
						function (dep_id, callback) {
							conn.query("ALTER TABLE `products_to_departments` ADD ?? INT NOT NULL DEFAULT '0'", 'department_'+dep_id, function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null)
								}
							});	
						}
					];
				async.waterfall(saveTask, function (err) {
					main_callback('done'); 
				});
			},
        }
    );

};