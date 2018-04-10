let express = require('express');
let app = express();
let bodyParser = require('body-parser');
let fs = require("fs");
let route_data = require('./site/config/router.json');
let session = require('express-session');
let helmet = require('helmet');


let router_pathes=Object.keys(route_data.router);

let pug = require('pug');
let mySQL = require('./MysqlConnection');



app.set('trust proxy', 1);// trust first proxy
app.use( session({
   secret : 'scatbas2108',
   name : 'SSUID',
  cookie: { 
            httpOnly: true,
            expires: false
          }
  })
);


app.use(helmet());		
app.use(bodyParser.json({limit:'20mb'}));
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/site')); 	
app.set("views", __dirname + '/site/views');
app.set('view engine', 'pug');
	connection = new mySQL;
	connection.init(function(conn){
		
			app.get(router_pathes,function(req, res){
				uri = req._parsedOriginalUrl.pathname;
				if(!req.session.user && uri != '/login'){
					res.redirect('/login');
				}else{
					let scripts = route_data.router[uri].scripts;
					let router= require('./site/controllers/'+route_data.router[uri].controller);
					let view = route_data.router[uri].view;
					controller = new router(conn, req.query);
					controller.init(function(result){		
						res.render(view, { pageTitle: 'Ельников', data: result, scripts: scripts, user:req.session.user, session:req.session});
					});	
				}
			});
			app.post(router_pathes, function (request, response) {
				let models = require('./site/models/'+route_data.router[request.originalUrl].methods);
				let methods = new models(conn);
				if(!request.body) return response.sendStatus(400);
				methods[request.body.method](request.body.data, function(result){
					if(request.body.method=='userVerify' && result!='error'){
						request.session.user = result;
						result = 'done';
					}
						response.json(result);
				});
			});		
	});	
	 



    
app.listen(8080);

