var async = require('async');
var dbMethods = require('../models/managers');
var base = require('../models/base');

module.exports = function (conn) {
	var methods = new dbMethods(conn);
	var baseFunc = new base(conn);
    return new Object({		
			init: function (main_callback){
				var taskNamed = {
						providers: function (callback) {
							baseFunc.getAllProviders(function(result){
							callback(null, result);
							});
						},	
						departments: function (callback) {
							baseFunc.getAllDepartments(function(result){
							callback(null, result);
							});
						},
						newOrders: function (callback) {
							baseFunc.getNewOrderss(function(result){
								callback(null, result);
							});
						},
						users: function (callback) {
							methods.getUsers(function(result){
							callback(null, result);
							});
						},
						users_role: function (callback) {
							methods.gerUsersRole(function(result){
							callback(null, result);
							});
						},
						notReceivedData: function (callback) {
							baseFunc.getNotReceivedTable(function(result){
							callback(null, result);
							});
						},
						todayRate: function (callback) {
							baseFunc.getTodayRate(function(result){
							callback(null, result);
							});
						}
						
					};

				async.parallel(taskNamed, function (err, results) {
					results.notReceivedData = baseFunc.getPropNotReceivedData(results.notReceivedData, results.departments);
					main_callback(results); 
				});		
			}			
        }
    );

};