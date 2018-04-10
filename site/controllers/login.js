
module.exports = function (conn) {
    return new Object({		
			init: function (main_callback){
				main_callback('login'); 	
			}			
        }
    );

};