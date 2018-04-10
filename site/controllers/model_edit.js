let async = require('async');
let dbMethods = require('../models/model_edit.js');
let base = require('../models/base');


module.exports = function (conn, data) {
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
						model: function (callback) {
							methods.getModelInfo(data.id, function(result){
								if(data.hasOwnProperty('car_brand')){
                                    result['car_brand']=data.car_brand;
								}else{
                                    result['car_brand']=undefined;
								}
								callback(null, result);
							});
						},
						newOrders: function (callback) {
							baseFunc.getNewOrderss(function(result){
								callback(null, result);
							});
						},
						car_brands: function (callback) {
							methods.getBrands(function(result){
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