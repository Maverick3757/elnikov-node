var async = require('async');
var pug = require('pug');
module.exports = function (conn) {
    return new Object({
			 getAllProviders: function (callback){
				conn.query('SELECT * FROM providers', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			moveFromTmpProducts:function(data,main_callback){
				var me=this;
				var moveTask = {
						del:function (callback) {
							conn.query('DELETE FROM products_to_dep_tmp WHERE ? AND ?', [{"receive_id":data.res_id},{"department_id":data.dep_id}], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, results);
								}
							});	
						},	
						update:function (callback) {
							conn.query('INSERT INTO products_to_departments (product_id,department_'+data.dep_id+') VALUES ? ON DUPLICATE KEY UPDATE department_'+data.dep_id+'=VALUES(department_'+data.dep_id+')', [data.products], function (error, results, fields) {
								if (error) {
									console.log(error);
								}else{
									callback(null, results);;
								}
							});	
						}						
					};

				async.parallel(moveTask, function (err, result) {
					console.log(result);
					main_callback('done'); 
				});		
			},
			
			
			getProductsByArtikulRangeAndProviders: function (data, callback){
				var me = this;
				conn.query('SELECT * FROM products LEFT JOIN products_to_departments ON products_to_departments.product_id=id  WHERE providers_artikul in (?);SELECT * FROM departments', [data.exData.artikuls], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						html = pug.renderFile('site/views/exported_row.pug', {
							exData: results[0],
							xlData: data.xlData,
							departments: results[1],
							currency: data.currency,
							marga: (100+data.marga)/100,
							rate: data.rate,
							winHeight:data.winHeight,
							trHeight:data.trHeight,
							art_array: me.JSON_column(results[0],'providers_artikul')});
						callback(html)
					}
				});	
			},
			
			
			 JSON_column: function(json,col){
				let result=[];
				for (let i of json) {
					if(i.hasOwnProperty(col)){
						if(result.indexOf(i[col])==-1) result.push(i[col]);
					}
				}
				return result;
			},
			
			saveData: function (data, main_callback){
			var me = this;
				var saveTask = [
						function (callback) {
							if(data.new_products.length>0){
								me.insertNewProduct(data,function(new_data){
									data = new_data;
									callback(null);
								});	
							}else{
								callback(null);
							}
						},
						function (callback) {
							me.insertReceives(data,function(res){
								callback(null, res);
							});	
						},	
						function (res_id, callback) {
							me.insertProductsToReceives(me.getOrderProductArray(data,res_id),function(res){
								callback(null,res_id);
							});
						},
						function (res_id, callback) {	
							products = me.getProductToDepTmpArray(data,res_id);
							if(products.def_products.length>0){
								me.insertProductToDepTmp(products.def_products,function(res){
									callback(null, products.undef_products);
								});
							}else{
								callback(null, products.undef_products);
							}	
						},
						function (undef_products, callback) {
							if(undef_products.length>0){
								conn.query('INSERT INTO products_to_departments (product_id,department_1) VALUES ? ON DUPLICATE KEY UPDATE department_1=department_1+VALUES(department_1)', [undef_products], function (error, results, fields) {
									if (error) {
										console.log(error);
									}else{
										callback(null);
									}
								});	
							}else{
								callback(null);
							}
						}		
						
					];
				async.waterfall(saveTask, function (err) {
					main_callback('done'); 
				});
			},
			getProductToDepTmpArray:function(data, receive_id){
				var result = {};
				result["def_products"]=[];
				result["undef_products"]=[];
				data.products.forEach(function(val){
					for (key2 in val.prod_to_dep) {
						val2 = val.prod_to_dep[key2];
						if (val2>0 && key2!=1){
							object=[];
							object.push(val.product_id,receive_id,key2,val2);
							result["def_products"].push(object);
						}else if(val2>0 && key2==1){
							result["undef_products"].push([val.product_id,val2]);	
						}	
					}
				});
				return result;
			},
			getPropNotReceivedData: function (productData, deparmentData){
				var me=this;
				var result={};
				for (key in deparmentData) {
					var val = deparmentData[key];
					var modelsProduct = productData.filter(
					   (it) => {
						 return it.department_id === val.id;
					   }
					);
					result[val.id]={};
					receiveisInDep = me.getArrayUniq(modelsProduct,'receive_id');
					receiveisInDep.forEach(function(receive){
						productsInReceive = modelsProduct.filter(
							(it) => {
								return it.receive_id === receive;
							}
						);
					result[val.id][receive]=productsInReceive;
					});
				}
				return result;
			},			
			getArrayUniq: function (modelProduct,uniqCol){
				var result = [];
				for (key in modelProduct) {
					var val = modelProduct[key];
					if (result.indexOf(val[uniqCol])==-1) result.push(val[uniqCol]);
				}
				return result;
			},
			getOrderProductArray:function(data, receive_id){
				var result = [];
				data.products.forEach(function(val){
					object=[];
					object.push(receive_id,val.product_id,val.qty,val.price,val.seil_price);
					result.push(object);
				});
				return result;
			},
			insertProductToDepTmp: function(inserts, callback){
				conn.query('INSERT INTO products_to_dep_tmp (product_id,receive_id,department_id,qty) VALUES ?', [inserts], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback('done');
					}
				});	
			},
			
			insertNewProduct: function(data, callback){
				inserts=[];
				data.new_products.forEach(function(i){
					inserts.push([i.name,i.oe,data.providers_id,i.artikul,i.info]);
				});
				conn.query('INSERT INTO products (product_name,vin,providers,providers_artikul,info) VALUES ?',[inserts], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						
						curId = 0;
						data.new_products.forEach(function(i){
							i['product_id']=results.insertId+curId;
							curId++;
						});
						data.products=data.products.concat(data.new_products);
						delete data["new_products"];
						callback(data);
					}
				});	
			},
			
			
			insertReceives: function(data, callback){
				inserts = {"providers_id":data.providers_id,"currency_id":data.currency_id,"rate":data.rate,"sum":data.sum};
                if(data.hasOwnProperty('sum_uah')){
                    inserts['sum_uah']=data.sum_uah;
                }
				conn.query('INSERT INTO receives SET ?',inserts, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results.insertId)
					}
				});	
			},
			insertProductsToReceives: function(inserts, callback){
				conn.query('INSERT INTO products_to_receives (receive_id,product_id,qty,price,seil_price) VALUES ?', [inserts], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback('done');
					}
				});	
			},
			getNotReceivedTable:function(callback){
				conn.query('SELECT `products_to_departments`.*, m.qty, m.receive_id, m.department_id, products.product_name, DATE_FORMAT(receives.date,"%d.%m.%Y") as date FROM products_to_dep_tmp as m LEFT JOIN receives ON receives.id=receive_id LEFT JOIN products ON m.product_id=products.id LEFT JOIN `products_to_departments` on `products_to_departments`.`product_id`=m.`product_id`', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getProvidersProducts: function (data, callback){
				conn.query('SELECT * FROM products WHERE providers=?', data.provider_id, function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},

			getProductsByArtikulProviders: function (data, callback){
				conn.query('SELECT * FROM products WHERE providers_artikul=? AND providers=?', [data.artikul, data.providers], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			
			getAllDepartments: function (callback){
				conn.query('SELECT * FROM departments', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getDepartmentsResiduesByProduct: function (data, callback){
				conn.query('SELECT * FROM products_to_departments WHERE product_id=?', [data.product_id], function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			},
			getAllCurrencies: function (callback){
				conn.query('SELECT * FROM currencies', function (error, results, fields) {
					if (error) {
						console.log(error);
					}else{
						callback(results)
					}
				});	
			}
        }
    );

};