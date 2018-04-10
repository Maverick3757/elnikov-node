var async = require('async');
var pug = require('pug');
var fs = require('fs');
var JSFtp = require("jsftp");

module.exports = function (conn) {
    return new Object({

            getOrders: function (callback){
                conn.query("SELECT `orders`.*,DATE_FORMAT(`created_at`,'%d-%m-%Y') as `date`, `orders_status`.`status` FROM `orders` INNER JOIN `orders_status` ON `orders_status`.`id` = .`orders`.`order_status` ORDER BY `created_at` DESC LIMIT 10 OFFSET 0;SELECT count(`id`) as max_qty FROM `orders`" , function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(results);
                    }
                });
			},
            getStatuses: function (callback){
                conn.query("SELECT * FROM `orders_status`" , function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        callback(results);
                    }
                });
            },
            getOrdersFilter: function (data, callback) {
                let search = "WHERE CONCAT(REGEXP_REPLACE(CONCAT( `user_name`, `user_telephone`, `user_email`),'[,%`^:./\><&(//)-/ +/[=]',''),CONCAT( `user_name`, `user_telephone`, `user_email`)) LIKE ?";
                let search_data = [data.searched_text];
                if(data.statuses.length>0){
                    search = search+' AND order_status in (?)';
                    search_data.push(data.statuses);
                }
                if(data.selectedDates.length==2){
                    search = search+' AND created_at BETWEEN ? AND ?';
                    search_data.push(data.selectedDates[0],data.selectedDates[1]);
                }
                let sql = "SELECT `orders`.*,DATE_FORMAT(`created_at`,'%d-%m-%Y') as `date`, `orders_status`.`status` FROM `orders` INNER JOIN `orders_status` ON `orders_status`.`id` = .`orders`.`order_status` "+search+" ORDER BY `created_at` DESC LIMIT "+data.pag_qty+" OFFSET "+data.pag_offset;
                sql = conn.format(sql);
                conn.query(sql,search_data, function (error, results, fields) {
                    if (error) {
                        console.log(error);
                    } else {
                        let html = pug.renderFile('site/views/orders/orders_content.pug', {data:{orders:[results]}});
                        callback(html);
                    }
                });
            }
        }
    );
};