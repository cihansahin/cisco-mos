
module.exports = GUIManager;

function GUIManager( expressApp ) {

    var appd = require('./routes/apps');
	var app = expressApp;

	app.get('/app', appd.find);
	app.get('/app/:id', appd.findById);
	app.post('/app', appd.addApp);
	app.put('/app/:id', appd.updateApp);
	app.delete('/app/:id', appd.deleteApp);

	app.get('/app/:type/instance/:id', appd.findInstanceById);
	app.get('/app/:type/instance', appd.findInstancesByType);
	app.post('/app/:type/instance', appd.insertAppInstance);
	app.put('/app/:type/instance/:id', appd.updateInstance);
	app.delete('/app/:type/instance/:id', appd.deleteAppInstance);
}
