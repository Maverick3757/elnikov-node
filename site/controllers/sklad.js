let async = require('async');
let dbMethods = require('../models/sklad');
let base = require('../models/base');

module.exports = function (conn,data) {
    let methods = new dbMethods(conn);
    let baseFunc = new base(conn);
    return new Object({		
			init: function (main_callback){
                let taskNamed = {
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
						sklad: function (callback) {
							methods.getSklad(data,function(result){
								callback(null, result);
							});
						},
						newOrders: function (callback) {
							baseFunc.getNewOrderss(function(result){
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