let async = require('async');
let dbMethods = require('../models/providers_details');
let base = require('../models/base');

module.exports = function (conn, data) {
	let methods = new dbMethods(conn);
	let baseFunc = new base(conn);
    return new Object({		
			init: function (main_callback){
				let taskNamed = {
					//base
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
						charges: function (callback) {
							methods.getCharges(data.id, function(result){
							callback(null, result);
							});
						},
						balance: function (callback) {
							methods.getProvidersBalance(data.id, function(result){
								callback(null, result);
							});
						},
						providerCurrency: function (callback) {
							methods.getProvidersCurrency(data.id, function(result){
								callback(null, result);
							});
						},
						providerName: function (callback) {
							methods.getProviderName(data.id, function(result){
								callback(null, result);
							});
						},
						//base
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
					results['providers_id']=data.id;
					main_callback(results); 
				});		
			}			
        }
    );

};