var async = require('async');
var dbMethods = require('../models/receive_add');
var base = require('../models/base');

module.exports = function (conn) {
	var methods = new dbMethods(conn);
	var baseFunc = new base(conn);
    return new Object({		
			init: function (main_callback){
				var taskNamed = {
						providers: function (callback) {
							methods.getAllProviders(function(result){
							callback(null, result);
							});
						},	
						departments: function (callback) {
							methods.getAllDepartments(function(result){
							callback(null, result);
							});
						},
						newOrders: function (callback) {
							baseFunc.getNewOrderss(function(result){
								callback(null, result);
							});
						},
						currencies: function (callback) {
							methods.getAllCurrencies(function(result){
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
					results.notReceivedData = methods.getPropNotReceivedData(results.notReceivedData, results.departments);
					main_callback(results); 
				});		
			}			
        }
    );

};