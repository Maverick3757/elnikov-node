let async = require('async');
let dbMethods = require('../models/shop_info.js');
let base = require('../models/base');


module.exports = function (conn) {
	let methods = new dbMethods(conn);
	let baseFunc = new base(conn);
    return new Object({		
			init: function (main_callback){
				let taskNamed = {
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
                    	static_info: function (callback) {
							methods.getStaticInfo(function(result){
								callback(null, result);
							});
						},
						providers: function (callback) {
							baseFunc.getAllProviders(function(result){
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