var async = require('async');
var passwordHash = require('password-hash');

module.exports = function (conn) {
    return new Object({
			updatedUser:function(data,main_callback){
				var departments = "";
				var me = this;
				if(data.userValues.hasOwnProperty("departments")){
					var departments  = data.userValues.departments;
					delete data.userValues['departments'];
				}
				var updateTask = [
						function (callback) {
							conn.query('UPDATE `managers` SET ? WHERE id=?',[data.userValues,data.id], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null);
								}
							});	
						},
						function (callback) {
							if(departments!=""){
								inserts = me.gerDepArray(departments,data.id);
								conn.query("DELETE FROM `departments_to_managers` WHERE manager_id = ?;INSERT INTO `departments_to_managers`(manager_id,department_id) VALUES ?", [data.id,inserts], function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null)
									}
								});	
							}else{
								callback(null)
							}
						}
					];
				async.parallel(updateTask, function (err) {
					main_callback('done'); 
				});
			},
			сhangePassword: function (data, main_callback){
				var сhangeTask = [
						function (callback) {
							conn.query("SELECT password FROM `managers` WHERE id = ?", data.id, function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null,results[0].password)
								}
							});	
						},
						function (password, callback) {
							if(passwordHash.verify(data.old_pass, password)){
								data['new_pass'] = passwordHash.generate(data.new_pass,{algorithm:"sha512",saltLength:4,iterations:2});
								conn.query("UPDATE `managers` SET password=? WHERE id=?", [data.new_pass, data.id], function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback('done',null)
									}
								});	
							}else{
								callback('error',null)
							}
						}
					];
				async.waterfall(сhangeTask, function (res, err) {
					main_callback(res); 
				});
			},
			deleteUser: function (data, callback){
				
				conn.query("DELETE FROM `managers` WHERE id = ?;",data,function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			gerUsersRole: function (callback){
				conn.query("SELECT * FROM `roles`", function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getUsers: function (callback){
				conn.query("SELECT `managers`.*, `roles`.`role` as role_name, GROUP_CONCAT(`departments`.`name` SEPARATOR ', ') as departments, CONCAT(`managers`.`name`,' ',IF(ISNULL(`family_name`),'',`family_name`)) as full_name FROM `managers` LEFT JOIN `roles` ON `roles`.`id` = `managers`.`role` LEFT JOIN `departments_to_managers` as dpm ON dpm.`manager_id` =  `managers`.`id` LEFT JOIN `departments` ON `departments`.`id` = dpm.`department_id` GROUP BY  `managers`.`id`", function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			checkLogin: function (data, callback){
				params=[data.login];
				and = "";
				if(data.isSelf){
							and = 'AND id<>?';
							params.push(data.id);
						}
				
				conn.query("SELECT `login` FROM `managers` WHERE `login` = ? "+and,params ,function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						if(results.length>0){
							callback('error');
						}else{
							callback('done');
						}					
					}
				});	
				
				
			},
			addUser: function (data, main_callback){
			var me = this;
			var departments = "";
			var hashedPassword = passwordHash.generate(data.password,{algorithm:"sha512",saltLength:4,iterations:2});
			data.password = hashedPassword;
			if(data.hasOwnProperty("departments")){
				departments  = data.departments;
				delete data['departments'];
			}
				var saveTask = [
						function (callback) {
							conn.query("INSERT INTO `managers` SET ?", data, function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null,results.insertId)
								}
							});	
						},
						function (user_id, callback) {
							if(departments!=""){
								inserts = me.gerDepArray(departments,user_id);
								conn.query("INSERT INTO `departments_to_managers`(manager_id,department_id) VALUES ?", [inserts], function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null)
									}
								});	
							}else{
								callback(null)
							}
						}
					];
				async.waterfall(saveTask, function (err) {
					main_callback('done'); 
				});
			},
			gerDepArray: function (data, user_id){
				result=[];
				data.forEach(function(item){
					result.push([user_id,item]);
				});
				return result;
			}

        }
    );

};