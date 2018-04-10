let async = require('async');
let dbMethods = require('../models/product_edit.js');
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
						product: function (callback) {
							methods.getProductInfo(data.id, function(result){
                                result['product_id']=data.id;
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
						car_models: function (callback) {
							methods.getModels(function(result){
								callback(null, result);
							});
						},
						car_packages: function (callback) {
							methods.getPackages(function(result){
								callback(null, result);
							});
						},
						parts_groups: function (callback) {
							methods.getGroups(function(result){
								callback(null, result);
							});
						},
						car_engines: function (callback) {
							methods.getEngines(function(result){
								callback(null, result);
							});
						},
                    	product_to_cars: function (callback) {
                            if(data.id!='new') {
								methods.getProductToCars(data.id, function(result){
									callback(null, result);
								});
                            }else{
                                callback(null, {});
                            }
                        },
						manufacturers: function (callback) {
                            methods.getManufacturers(function(result){
                                callback(null, result);
                            });
                        },
						labels: function (callback) {
							methods.getLabels(function(result){
								callback(null, result);
							});
						},
						equivalents: function (callback) {
							if(data.id!='new') {
                                methods.getEquivalents(data.id, function (result) {
                                    callback(null, result);
                                });
                            }else{
                                callback(null, {});
							}
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