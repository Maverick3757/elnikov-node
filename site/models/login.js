let passwordHash = require('password-hash');

module.exports = function (conn) {
    return new Object({

			userVerify: function (data, callback){
				conn.query("SELECT `managers`.*, GROUP_CONCAT(`departments_to_managers`.`department_id`) as departments FROM `managers` LEFT JOIN `departments_to_managers` ON `departments_to_managers`.`manager_id`=`id` WHERE login = ?", [data.login], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						if(passwordHash.verify(data.password, results[0].password)){
							delete results[0]['password'];
							callback(results[0]);
						}else{
							callback('error');
						}
					}
				});	
			},			
        }
    );
};