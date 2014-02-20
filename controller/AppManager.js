//AppManager.js

var appDb = require('../model/appModel.js');
var mongoose = require('mongoose');

module.exports = AppManager;

function AppManager(httpServer, expressApp) {

	var self = this;
	this.io = require('socket.io').listen(httpServer);
	this.io.set('log level', 1);
	this.appManagerSocket = this.io.of('/appManager');
	this.serviceManagerSocket = this.io.of('/serviceManager');
	this.expressApp = expressApp;
	this.httpServer = httpServer;
        var mongoUri = process.env.MONGOLAB_URI ||
          process.env.MONGOHQ_URL ||
          'mongodb://localhost/mydb';
	this.dbConn = mongoose.connect(mongoUri);
	this.icons = {};
	this.appModels = {};
	this.serviceModels = {};

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// LOGGING
	//
	
	this.info = function(message) {
		console.log("INFO " + message);
	}
	
	this.error = function(message) {
		console.log("ERROR " + message);
	}
	
	this.warn = function(message) {
		console.log("WARN " + message);
	}
	
	this.debug = function(message) {
		console.log("DEBUG " + message);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// MONGO GENERIC ENTITY REQUESTS
	//
	
	this.findByIdRequest = function(req, res, Model) {

		self.debug('findByIdRequest: modelName = ' + Model.modelName + ' req = ' + JSON.stringify(req.body));
		
		Model.findOne({_id: req.params.id}, function(err, instance) {
			
			if (err) {
				self.error('findAbrTemplateByIdRequest: err = ' + err);
				res.send(404,err.toString());
				return;
			}
			
			self.debug('findAbrTemplateByIdRequest: data = ' + JSON.stringify(instance));
			res.send(200,instance);
		});
	}


	this.findAllRequest = function(req, res, Model) {

		self.debug('findAllRequest: modelName = ' + Model.modelName + ' req = ' + JSON.stringify(req.body));
		
		Model.find( function(err, instances) { 
			
			if (err) {
				self.error('findAllRequest: err = ' + err);
				res.send(500,err.toString());
				return;
			}

			self.debug('findAllRequest: instances = ' + JSON.stringify(instances));
			res.send(200,instances);
		});
	}
	
	this.findAll = function(Model, callback) {

		self.debug('findAll: modelName = ' + Model.modelName);
		
		Model.find( function(err, instances) { 
			
			if (err) {
				self.error('findAll: err = ' + err);
				callback(err);
				return;
			}

			self.debug('findAll: instances = ' + JSON.stringify(instances));
			callback(null, instances);
		});
	}
	
	this.insertRequest = function(req, res, Model) {

		self.debug('insertRequest: modelName = ' + Model.modelName + ' req = ' + JSON.stringify(req.body));
		var instance = req.body;
		
		new Model(instance).save( function(err, instance) {

			if (err) {
				self.error('insertRequest: err = ' + err);
				res.send(500,err.toString());
				return;
			}

			Model.findOne({name: instance.name}, function(err2, insertData) {

				if (err2) {
					self.error('insertRequest: err2 = ' + err2);
					res.send(500,err2.toString());
					return;
				}
				
				self.debug('insertRequest: insertData = ' + JSON.stringify(insertData));
				res.send(201,insertData);
			});
		});
	}

	this.updateRequest = function(req, res, Model) {

		self.debug('updateRequest: modelName = ' + Model.modelName + ' req = ' + JSON.stringify(req.body));
		var instance = req.body;

		Model.findOne({_id: req.params.id}, function(err, data) {

			for(var p in instance) {
				
				if(instance.hasOwnProperty(p)) {
					// TODO: SHOULD WE ONLY TRANSFER CERTAIN TYPES OF PROPERTIES?
					var v = instance[p];
					data[p] = v;
				}
			}

			data.save( function(err, updateResult) {

				if (err) {
					self.error('updateRequest: err = ' + err);
					res.send(500,err.toString());
					return;
				}
				
				self.debug('updateRequest: insertData = ' + JSON.stringify(updateResult));
				res.send(200,updateResult);	
			}); 
		});
	}

	this.deleteRequest = function(req, res, Model) {

		self.debug('deleteRequest: modelName = ' + Model.modelName + ' req = ' + JSON.stringify(req.body));
   		Model.remove({ _id: req.params.id },  function(err) {
	
   			if (err) {
				self.error('deleteRequest: err = ' + err);
				res.send(500,err.toString());
				return;
   			}

			res.send(200);
    	});
	}

	this.removeExisting = function(Model, callback) {
	
		self.debug('removeExisting: modelName = ' + Model.modelName);
		var errors;
		
		Model.remove({}, function(err) {

			if (err) {
				self.debug('removeExisting: err = ' + err);
				if (errors) errors.push(err); else errors = [err];
			}

		});
			
		callback(errors);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// INITIALIZATION
	//
	
	this.init = function(callback) {
		
		self.resetApps( function(errors) {
			
			if (errors) {
				self.error('init: errors = ' + errors);
				callback(errors);
				return;
			}

			self.resetServices( function(errors) {

				if (errors) {
					self.error('init: errors = ' + errors);
					callback(errors);
					return;
				}

				// RECEIVE A CALLBACK WHEN APP INSTANCES ARE CHANGED IN THE DB.

				appDb.registerAppMiddleWare({
					'save': self.onAppSave,
					'remove': self.onAppSave
				});

				appDb.registerServiceMiddleWare({
					'save': self.onServiceSave,
					'remove': self.onServiceSave
				});

				self.resetCharts();
				
				self.resetResources( function() {
					self.mapExposedServiceRequests();
					callback();
				});
			});
		});
	};

	// RESET CHART DATA COLLECTION
	
	this.resetCharts = function() {
		
		self.epoch = new Date().getTime();
	
		self.chartData = {
			activeRecordings: [],
			activePlaybacks: [],
			archivedRecordings: []
		};
	}
	
	// RESET DATA REQUEST.
	
	this.reset = function(callback) {
		
		self.resetApps( function(errors) {
			
			if (errors) {
				self.error('init: errors = ' + errors);
				res.send(500,errors.toString());
				return;
			}

			self.resetServices( function(errors) {

				if (errors) {
					self.error('init: errors = ' + errors);
					res.send(500,errors.toString());
					return;
				}

				// RECEIVE A CALLBACK WHEN APP INSTANCES ARE CHANGED IN THE DB.

				self.resetCharts();
				self.resetResources( function() {
					res.send(200);
				})
			});
		});
	}
	
	// RESET REQUEST
	
	this.resetRequest = function(req, res) {
		
		self.resetApps( function(errors) {
			
			if (errors) {
				self.error('init: errors = ' + errors);
				res.send(500,errors.toString());
				return;
			}

			self.resetServices( function(errors) {

				if (errors) {
					self.error('init: errors = ' + errors);
					res.send(500,errors.toString());
					return;
				}

				// RECEIVE A CALLBACK WHEN APP INSTANCES ARE CHANGED IN THE DB.

				self.resetCharts();
				res.send(200);
			});
		});
	}
	
	// START THE HEARTBEAT FOR GATHERING CHART DATA.
	
	this.startHeartbeat = function() {	
		setTimeout(self.chartDataHeartbeat,3000);
	}
	
	// MAP THE EXPOSED SERVICE REQUEsTS
	
	this.mapExposedServiceRequests = function() {
		
		self.expressApp.get('/reset', self.resetRequest);

		self.expressApp.get('/app/:type/instance/:id', self.findAppByIdRequest);
		self.expressApp.get('/app/:type/instance', self.findAppsByTypeRequest);
		self.expressApp.post('/app/:type/instance', self.insertAppRequest);
		self.expressApp.put('/app/:type/instance/:id', self.updateAppRequest);
		self.expressApp.delete('/app/:type/instance/:id', self.deleteAppRequest);
		self.expressApp.get('/app/instance', self.findAppsRequest);
		self.expressApp.get('/app', self.findAppTypeRequest);
	
		self.expressApp.get('/apps/:type/instances/:id', self.findAppByIdRequest);
		self.expressApp.get('/apps/:type/instances', self.findAppsByTypeRequest);
		self.expressApp.post('/apps/:type/instances', self.insertAppRequest);
		self.expressApp.put('/apps/:type/instances/:id', self.updateAppRequest);
		self.expressApp.delete('/apps/:type/instances/:id', self.deleteAppRequest);
		self.expressApp.get('/apps/instances', self.findAppsRequest);
		self.expressApp.get('/instances', self.findAppsRequest);
		self.expressApp.get('/apps', self.findAppTypeRequest);
	
		self.expressApp.get('/service/:type/instance/:id', self.findServiceByIdRequest);
		self.expressApp.get('/service/:type/instance', self.findServicesByTypeRequest);
		self.expressApp.post('/service/:type/instance', self.insertServiceRequest);
		self.expressApp.put('/service/:type/instance/:id', self.updateServiceRequest);
		self.expressApp.delete('/service/:type/instance/:id', self.deleteServiceRequest);
		self.expressApp.get('/service/instance', self.findServicesRequest);
		self.expressApp.get('/service', self.findServiceTypesRequest);
		
		self.expressApp.get('/summaryData', self.getSummaryDataRequest);
		self.expressApp.get('/chartData', self.chartDataRequest);

		self.expressApp.get('/abrTemplate/:id', self.findAbrTemplateByIdRequest);
		self.expressApp.get('/abrTemplate', self.findAbrTemplatesRequest);
		self.expressApp.post('/abrTemplate', self.insertAbrTemplateRequest);
		self.expressApp.put('/abrTemplate/:id', self.updateAbrTemplateRequest);
		self.expressApp.delete('/abrTemplate/:id', self.deleteAbrTemplateRequest);
		
		self.expressApp.get('/drmTemplate/:id', self.findDrmTemplateByIdRequest);
		self.expressApp.get('/drmTemplate', self.findDrmTemplatesRequest);
		self.expressApp.post('/drmTemplate', self.insertDrmTemplateRequest);
		self.expressApp.put('/drmTemplate/:id', self.updateDrmTemplateRequest);
		self.expressApp.delete('/drmTemplate/:id', self.deleteDrmTemplateRequest);
		
		self.expressApp.get('/contentVolume/:id', self.findContentVolumeByIdRequest);
		self.expressApp.get('/contentVolume', self.findContentVolumesRequest);
		self.expressApp.post('/contentVolume', self.insertContentVolumeRequest);
		self.expressApp.put('/contentVolume/:id', self.updateContentVolumeRequest);
		self.expressApp.delete('/contentVolume/:id', self.deleteContentVolumeRequest);
		
		self.expressApp.get('/archivePolicy/:id', self.findArchivePolicyByIdRequest);
		self.expressApp.get('/archivePolicy', self.findArchivePolicysRequest);
		self.expressApp.post('/archivePolicy', self.insertArchivePolicyRequest);
		self.expressApp.put('/archivePolicy/:id', self.updateArchivePolicyRequest);
		self.expressApp.delete('/archivePolicy/:id', self.deleteArchivePolicyRequest);
		
		self.expressApp.get('/storagePolicy/:id', self.findStoragePolicyByIdRequest);
		self.expressApp.get('/storagePolicy', self.findStoragePolicysRequest);
		self.expressApp.post('/storagePolicy', self.insertStoragePolicyRequest);
		self.expressApp.put('/storagePolicy/:id', self.updateStoragePolicyRequest);
		self.expressApp.delete('/storagePolicy/:id', self.deleteStoragePolicyRequest);
		
		self.expressApp.get('/channel/:id', self.findChannelByIdRequest);
		self.expressApp.get('/channel', self.findChannelsRequest);
		self.expressApp.post('/channel', self.insertChannelRequest);
		self.expressApp.put('/channel/:id', self.updateChannelRequest);
		self.expressApp.delete('/channel/:id', self.deleteChannelRequest);
		
		self.expressApp.get('/channelLineup/:id', self.findChannelLineupByIdRequest);
		self.expressApp.get('/channelLineup', self.findChannelLineupsRequest);
		self.expressApp.post('/channelLineup', self.insertChannelLineupRequest);
		self.expressApp.put('/channelLineup/:id', self.updateChannelLineupRequest);
		self.expressApp.delete('/channelLineup/:id', self.deleteChannelLineupRequest);
		
		self.expressApp.get('/resource', self.getResourcesRequest);
		self.expressApp.get('/resourceType', self.getResourceTypesRequest);
		
		self.expressApp.get('/transcodeJob/:name', self.startTranscodeJob);
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// APP TYPES AND INSTANCES
	//
	
	this.resetApps = function(callback) {
		
		self.removeExistingAppInstances( function(errors) {

			if (errors) {
				callback(errors);
				return;
			}

			// NOW REMOVE EXISTING APP TYPES
			
			appDb.appModel.remove({}, function(err) { 

				if (err) {
					self.error('reset: err = ' + err.toString());
					callback([err]);
					return;
				}

				// INITIALIZE THE APP TYPES.

				var apps = [{
						name: 'Transcode',
						description: 'Cloud transcoding instance.',
						type:'transcode',
						picture: 'Transcode.png'
					},{
						name: 'Capture',
						description: 'Cloud capture instance.',
						type:'capture',
						picture: 'Capture.png'
					},{
						name: 'Play',
						description: 'Playback from Cloud',
						type:'play', 
						picture: 'Play.png'
					},{
						name: 'Store',
						description: 'Storage instance',
						type:'store', 
						picture: 'S3.png'
					}];
					

				self.appModels = {};
				
				for (var i = 0; i < apps.length; i++) {
					
					var a = apps[i];
					self.icons[a.type] = a.picture;
					var app = new appDb.appModel(a);
					app.save();
					self.appModels[a.type] = appDb.createAppModel(a.type);
				}
				
				// var apps = [{
				// 	name: "Recnyc90", 
				// 	type: "capture", 
				//	subType: 10,
				// 	minWorkers: 3,
				// 	maxWorkers: 5,
				// 	activeRecordings: null,
				// 	scheduledRecordings: null,
				// 	archivedRecordings: null,
				// 	activePlaybacks: null,
				// 	storageUsed: null,
				// 	storageCapacity: null,
				// 	cpuPercent: null,
				// 	memoryPercent: null,
				// 	bandwidthPercent: null,
				// 	runstatus: 0
				// },{
				// 	name: "Playnyc61", 
				// 	type: "play", 
				//	subType: 10,
				// 	minWorkers: 1,
				// 	maxWorkers: 20,
				// 	activeRecordings: null,
				// 	scheduledRecordings: null,
				// 	archivedRecordings: null,
				// 	activePlaybacks: null,
				// 	storageUsed: null,
				// 	storageCapacity: null,
				// 	cpuPercent: null,
				// 	memoryPercent: null,
				// 	bandwidthPercent: null,
				// 	runstatus: 0
				// },{
				// 	name: "S3-virginia-12", 
				// 	type: "store", 
				//	subType: 10,
				// 	minWorkers: 1,
				// 	maxWorkers: 5,
				// 	activeRecordings: null,
				// 	scheduledRecordings: null,
				// 	archivedRecordings: null,
				// 	activePlaybacks: null,
				// 	storageUsed: null,
				// 	storageCapacity: null,
				// 	cpuPercent: null,
				// 	memoryPercent: null,
				// 	bandwidthPercent: null,
				// 	runstatus: 0
				// }];
				
				var apps = [];
				
				for (var i = 0; i < apps.length; i++) {
					
					self.insertApp(apps[i]);
					// var ai = apps[i];
					// ai.icon = self.icons[ai.type];
					// self.debug('reset: apps['  + i + '] = ' + JSON.stringify(ai));
					// var App = self.appModels[ai.type];
					// var app = new App(ai);
					// app.save();
				}
				
				callback();
			});
		});
	}
	
	this.findAppTypeRequest = function(req, res) {

		appDb.appModel.find( function(err, apps) { 
			
			if (err) {
				console.log('findAllAppsRequest: err = ' + err);
				res.send(500,err.toString());
				return;
			}
			res.send(200,apps);
		});
	}
	
	this.insertAppRequest = function(req, res) {

		var instanceType = req.params.type;
		var instance = req.body;
		instance.icon = self.icons[instanceType];
		instance.workers = 1;
		
		if(instance.subType == null) {
			instance.subType = 10;
		}
		
		self.insertRequest(req, res, self.appModels[instanceType]);
	}

	this.insertApp = function(instance, callback) {
		
		instance.icon = self.icons[instance.type];
		instance.workers = 1;
		
		if(instance.subType == null) {
			instance.subType = 10;
		}
		
		var App = self.appModels[instance.type];
		
		new App(instance).save( function(err) {

			if (err) {
				self.error('insertApp: err = ' + err);
			}

			if(callback) callback(err);
		});
	}
	
	this.insertAppWorker = function(instance, callback) {
		
		var worker = {
			name: instance.name + '-' + (instance.workers + 1),
			type: instance.type,
			subType: 30,
			icon: instance.icon,
			minWorkers: 1,
			workers: 1,
			maxWorkers: 1,
			encoding: instance.encoding,
			activeRecordings: 0,
			scheduledRecordings: 0,
			archivedRecordings: 0,
			activePlaybacks: 0,
			storageUsed: 0,
			storageCapacity: 0,
			cpuPercent: 0,
			memoryPercent: 0,
			bandwidthPercent: 0,
			runstatus: 1
		};
		
		var App = self.appModels[worker.type];
		new App(worker).save( function(err) {

			if (err) {
				self.error('insertAppWorker: err = ' + err);
			}

			if(callback) callback(err);
		});
	}
	
	this.updateAppRequest = function(req, res) {

		var instanceType = req.params.type;
		var instance = req.body;
		self.updateRequest(req, res, self.appModels[instanceType]);
	}

	this.deleteAppRequest = function(req, res) {

 		var instanceType = req.params.type;
    	self.deleteRequest(req, res, self.appModels[instanceType]);
	}

	this.deleteApp = function(instance) {
		
    	self.appModels[instance.type].remove({ _id: instance._id },  function(err) {
   			if (err) self.error('deleteApp: err = ' + err);
    	});
	}
	
	this.findAppByIdRequest = function(req, res) {

		var instanceType = req.params.type;
		self.findByIdRequest(req, res, self.appModels[instanceType]);
	}

	this.findAppsByTypeRequest = function(req, res) {

		var instanceType = req.params.type;
		self.findAllRequest(req, res, self.appModels[instanceType]);
	}

	this.getAppData = function(callback) {
	
		var types = [];
		var typeIx = 0;
		var results = [];
		var errors;
		
		appDb.appModel.find( function(err, apps) { 
			
			if (err) {
				self.error('getAppData: err = ' + err);
				if (errors) errors.push(err); else errors = [err];
				callback(errors,results);
				return;
			}

			for(var i = 0; i < apps.length; i++) {
				types.push(apps[i].type);
			}
			
			getInstances();
		});

		function getInstances() {

			while (typeIx < types.length) {
				
				var App = self.appModels[types[typeIx++]];
				
				if (App) {

					App.find( function(err, instances) {

						if (err) {
							self.error('getInstances: err = ' + err);
							if (errors) errors.push(err); else errors = [err];
						} else {
							results.push(instances);
						}

						getInstances();
					});
				
					return;
				}
			}
			
			callback(errors, Array.prototype.concat.apply(results[0], results.slice(1)));
		}
	}
	
	this.removeExistingAppInstances = function(callback) {
	
		self.debug('removeExistingAppInstances');
		var appModels = [];
		var modelIx = 0;
		var errors;
		
		appDb.appModel.find( function(err, apps) { 
			
			if (err) {
				self.debug('removeExistingAppInstances: err = ' + err);
				if (errors) errors.push(err); else errors = [err];
				callback(errors);
				return;
			}

			for (var i = 0; i < apps.length; i++) {
				self.debug('removeExistingAppInstances: apps[' + i + '].type = ' + apps[i].type);
				appModels.push(appDb.createAppModel(apps[i].type));
			}

			removeInstances();
		});

		function removeInstances() {

			while (modelIx < appModels.length) {
				
				appModels[modelIx++].remove({}, function(err) {

					if (err) {
						self.debug('removeInstances: err = ' + err);
						if (errors) errors.push(err); else errors = [err];
					}

					removeInstances();
				});
			
				return;
			}
			
			callback(errors);
		}
	}
	
	this.findAppsRequest = function(req, res) {

		self.debug('findAppsRequest: req = ' + JSON.stringify(req.body));
		
		self.getAppData( function(errors,results) {	
			self.debug('findAppsRequest: results = ' + JSON.stringify(results));
			res.send(200,results);
		});
	}

	// HEARTBEAT FUNCTION THAT GATHERS CHART DATA AT 10 SECOND INTERVALS.
	
	this.chartDataHeartbeat = function(callback) {
		
		var time = new Date().getTime();

		self.getSummaryData( function(errors,results) {
			
			if (errors) {
				return;
			}
			
			function numeric(val) {
				if(val == null) return 0;
				var n = Number(val);
				if (typeof n == 'number') return n;
				return 0;
			}
			
			var t = Math.round((time - self.epoch) / 1000);
			self.chartData.activeRecordings.push([ t, numeric(results.total.activeRecordings) ]);
			self.chartData.archivedRecordings.push([ t, numeric(results.total.archivedRecordings) ]);
			self.chartData.activePlaybacks.push([ t, numeric(results.total.activePlaybacks) ]);		
				
			self.onSummaryDataChange(results);
		});
		
		setTimeout(self.chartDataHeartbeat,3000);
	}

	// GET CHART DATA REQUEST.
	this.chartDataRequest = function(req, res) {

		self.debug('getChartData: req = ' + JSON.stringify(req.body));
		res.send(200, self.chartData);
	}

	// GET SUMMARY DATA (RAW).
	
	this.getSummaryData = function(callback) {
		
		var numberOf = {};
		var statusFields = [
			"prelaunch",
			"launch",
			"crashed",
			"configure",
			"crashed",
			"initialize",
			"crashed",
			"active"
		];
		var status = {
			prelaunch: 0,
			launch: 0,
			configure: 0,
			initialize: 0,
			active: 0,
			crashed: 0
		};
		var serviceStatus = {
			prelaunch: 0,
			launch: 0,
			configure: 0,
			initialize: 0,
			active: 0,
			crashed: 0
		};
		var total = {}; 
		var totalFields = [
			"activeRecordings",
			"scheduledRecordings",
			"archivedRecordings",
			"activePlaybacks",
			"cpuPercent",
			"memoryPercent",
			"bandwidthPercent",
			"storageUsed",
			"storageCapacity",
		];
		var average = {};
		var averageFields = [
			"cpuPercent",
			"memoryPercent",
			"bandwidthPercent"
		];
		
		self.getAppData( function(errors,instances) {
			
			if (errors) {
				callback(errors);
				return;
			}
			
			for(var i = 0; i < instances.length; i++) {
				
				var instance = instances[i];
		
				if (numberOf[instance.type] !== undefined) {
					numberOf[instance.type]++;
				} else {
					numberOf[instance.type] = 1;
				}

				for (var j in totalFields) {
				
					var f = totalFields[j];
					var v = instance[f];
				
					if (v != null) {
						if (total[f]) {
							total[f] += v;
						} else {
							total[f] = v;
						}
					}
				}
			
				if (instance.runstatus !== undefined) {
					status[statusFields[instance.runstatus]]++;
				} else {
					status.active++;
				}
			}

			for(var j in averageFields) {
				var f = averageFields[j];
				average[f]=Math.round(total[f]/instances.length);
			}
			
			self.getServiceData( function(errors,instances) {
				
				if (errors) {
					callback(errors);
					return;
				}
			
				for(var i = 0; i < instances.length; i++) {
				
					var instance = instances[i];
		
					if (numberOf[instance.type] !== undefined) {
						numberOf[instance.type]++;
					} else {
						numberOf[instance.type] = 1;
					}

					for (var j in totalFields) {
					
						var f = totalFields[j];
						var v = instance[f];
					
						if (v != null) {
							if (total[f]) {
								total[f] += v;
							} else {
								total[f] = v;
							}
						}
					}
				
					if (instance.runstatus !== undefined) {
						serviceStatus[statusFields[instance.runstatus]]++;
					} else {
						serviceStatus.active++;
					}
				}

				for(var j in averageFields) {
					var f = averageFields[j];
					average[f]=Math.round(total[f]/instances.length);
					delete total[f];
				}
			
				var results = {total: total, average: average, instances: numberOf, runstatus: status, servicerunstatus: serviceStatus}; 
				callback(errors,results);
			});
		});
	}
	
	// GET SUMMARY DATA REQUEST.
	
	this.getSummaryDataRequest = function(req, res) {
		
		self.debug('getSummaryDataRequest: req = ' + JSON.stringify(req.body));
		
		self.getSummaryData( function(errors,results) {
			
			if (errors) {
				res.send(500,errors.toString());
				return;
			}
			
			self.debug('getSummaryDataRequest: results = ' + JSON.stringify(results));
			res.send(200,results)
		});
	}

	// THIS IS WHERE WE GET THE CALLBACKS WHEN DB RECORDS ARE SAVED.
	
	this.onSummaryDataChange = function(summaryData) {
		self.debug('onSummaryDataChange: summaryData = ' + JSON.stringify(summaryData));
		self.appManagerSocket.emit('summarydata.update',summaryData)
	}
	
	// THIS IS WHERE WE GET THE CALLBACKS WHEN DB RECORDS ARE SAVED.
	
	this.onAppSave = function(instanceRecord) {
		self.debug('onAppSave: instanceRecord = ' + JSON.stringify(instanceRecord));
		self.appManagerSocket.emit('appinstance.update',instanceRecord)
	}
	
	// THIS IS WHERE WE GET THE CALLBACKS WHEN DB RECORDS ARE REMOVED.
	
	this.onAppRemove = function(instanceRecord) {
		self.debug('onAppRemove: instanceRecord = ' + JSON.stringify(instanceRecord));
		self.appManagerSocket.emit('appinstance.remove',instanceRecord)
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// SERVICE TYPES AND INSTANCES
	//
	
	this.resetServices = function(callback) {
		
		// REMOVE EXISTING SERVICE INSTANCES
		
		self.removeExistingServiceInstances( function(errors) {

			if (errors) {
				callback(errors);
				return;
			}

			// NOW REMOVE EXISTING SERVICE TYPES

			appDb.serviceModel.remove({}, function(err) { 

				if (err) {
					self.error('reset: err = ' + err.toString());
					callback([err]);
					return;
				}

				var services = [{
						name: 'cDVR',
						description: 'cDVR Service.',
						type:'cdvr',
						picture: 'CDVR.png'
					},{
						name: 'VOD',
						description: 'VOD Service.',
						type:'vod',
						picture: 'VOD.png'
					},{
						name: 'TSTV',
						description: 'TSTV Service.',
						type:'tstv',
						picture: 'TSTV.png'
					},{
						name: 'Live',
						description: 'Live Service',
						type:'live', 
						picture: 'Live.png'
					}];
					
					
				for (var i = 0; i < services.length; i++) {
					
					var s = services[i];
					self.icons[s.type] = s.picture;
					var service = new appDb.serviceModel(s);
					service.save();
					self.serviceModels[s.type] = appDb.createServiceModel(s.type);
				}
				
				// services = [{
				// 	name: "CDVR1", 
				// 	type: "cdvr",
				// 	size: 1, 
				//storagePolicy: 0,
				//	archivePolicy: 0,
				//	abrProfile: 0,
				//	drmProfile: 0,
				//	channelLineup: 0,
				// 	captureInstances: [],
				// 	storeInstances: [],
				// 	playInstances: [],
				// 	transcodeInstances: [],
				// 	runstatus: 0
				// }];
				
				services = [];
				
				for (var i = 0; i < services.length; i++) {

					self.insertService(services[i]);
					
					// var si = services[i];
					// si.icon = self.icons[si.type];
					// self.debug('reset: services['  + i + '] = ' + JSON.stringify(si));
					// var Service = self.serviceModels[si.type];
					// var service = new Service(si);
					// service.save();
				}
				
				callback();
			});
		});
	}
	
	this.findServiceTypesRequest = function(req, res) {

		appDb.serviceModel.find( function(err, services) { 
			
			if (err) {
				res.send(500,err.toString());
				return;
			}
			res.send(200,services);
		});
	}
	
	this.findServicesRequest = function(req, res) {

		self.debug('findServicesRequest: req = ' + JSON.stringify(req.body));
		appDb.serviceModel.find( function(err, services) { 
			
			if (err) {
				self.error('findServicesRequest: err = ' + err);
				res.send(500,err.toString());
				return;
			}

			self.debug('findServicesRequest: services = ' + JSON.stringify(services));
			res.send(200,service);
		});
	}
	
	this.insertServiceRequest = function(req, res) {

		self.debug('insertServiceRequest: req = ' + JSON.stringify(req.body));
		var instanceType = req.params.type;
		var instance = req.body;
		instance.icon = self.icons[instanceType];
		var Service = self.serviceModels[instanceType]; 
		var service = new Service(instance);
		
		self.insertServiceApps(instance);
		service.save( function(err, instance) {

			if (err) {
				self.error('insertServiceRequest: err = ' + err);
				res.send(500,err.toString());
				return;
			}

			Service.findOne({name: instance.name}, function(err2, insertData) {

				if (err2) {
					self.error('insertServiceRequest: err2 = ' + err2);
					res.send(500,err2.toString());
					return;
				}
				
				self.debug('insertServiceRequest: insertData = ' + JSON.stringify(insertData));
				res.send(201,insertData);
			});
		});
	}

	this.insertService = function(instance, callback) {
		
		instance.icon = self.icons[instance.type];
		var Service = self.serviceModels[instance.type];
		var service = new Service(instance);
		self.insertServiceApps(instance);
		service.save( function(err) {

			if (err) {
				self.error('insertService: err = ' + err);
			}

			if(callback) callback(err);
		});
	}
	
	this.insertServiceApps = function(instance) {
		
		self.debug('insertServiceApps: instance.type = ' + instance.type + ' instance.size = ' + instance.size);
		
		if(instance.type == 'cdvr') {
		
			var numberOfApps = [ 0, 1, 3, 5 ][instance.size];
			var appInstances = [];
			instance.captureInstances = [];
			instance.playInstances = [];
			instance.storeInstances = [];
			var name;
			
			for(var i = 0; i < numberOfApps; i++) {
				
				name = instance.name.toUpperCase() + "-CAP-" + i;
				instance.captureInstances.push(name);
				appInstances.push({
					name: name, 
					type: "capture",
					subType: 0,
					minWorkers: 1,
					workers: 1,
					maxWorkers: 5,
					encoding: '',
					activeRecordings: null,
					scheduledRecordings: null,
					archivedRecordings: null,
					activePlaybacks: null,
					storageUsed: null,
					storageCapacity: null,
					cpuPercent: null,
					memoryPercent: null,
					bandwidthPercent: null,
					runstatus: 0
				});
				
				name = instance.name.toUpperCase() + "-PLY-" + i;
				instance.playInstances.push(name);
				appInstances.push({
					name: name, 
					type: "play", 
					subType: 0,
					minWorkers: 1,
					workers: 1,
					maxWorkers: 20,
					encoding: '',
					activeRecordings: null,
					scheduledRecordings: null,
					archivedRecordings: null,
					activePlaybacks: null,
					storageUsed: null,
					storageCapacity: null,
					cpuPercent: null,
					memoryPercent: null,
					bandwidthPercent: null,
					runstatus: 0
				});
				
				name = instance.name.toUpperCase() + "-STO-" + i;
				instance.storeInstances.push(name);
				appInstances.push({
					name: name, 
					type: "store", 
					subType: 0,
					minWorkers: 1,
					workers: 1,
					maxWorkers: 5,
					encoding: '',
					activeRecordings: null,
					scheduledRecordings: null,
					archivedRecordings: null,
					activePlaybacks: null,
					storageUsed: null,
					storageCapacity: null,
					cpuPercent: null,
					memoryPercent: null,
					bandwidthPercent: null,
					runstatus: 0
				});
			}
		}
		
		for (var i = 0; i < appInstances.length; i++) {
			self.insertApp(appInstances[i]);
		}
	}
	
	this.updateServiceRequest = function(req, res) {

		self.debug('updateServiceRequest: req = ' + JSON.stringify(req.body));
		var instanceType = req.params.type;
		var instance = req.body;
		var Service = self.serviceModels[instanceType];

		self.debug('updateServiceRequest: req = ' + JSON.stringify(req.body));

		Service.findOne({_id: req.params.id}, function(err, data) {

			data.minWorkers = instance.minWorkers;
			data.maxWorkers = instance.maxWorkers;

			data.save( function(err, updateResult) {

				if (err) {
					self.error('updateServiceRequest: err = ' + err);
					res.send(500,err.toString());
					return;
				}
				
				self.debug('updateServiceRequest: insertData = ' + JSON.stringify(updateResult));
				res.send(200,updateResult);	
			}); 
		});
	}

	this.deleteServiceRequest = function(req, res) {

		self.debug('deleteServiceRequest: req = ' + JSON.stringify(req.body));
 		var instanceType = req.params.type;
    	var Service = self.serviceModels[instanceType];

   		Service.remove({ _id: req.params.id },  function(err) {
	
   			if (err) {
				self.error('deleteServiceRequest: err = ' + err);
				res.send(500,err.toString());
				return;
   			}

			res.send(200);
    	});
	}

	this.deleteService = function(instance) {
		
		self.debug('deleteService: instance._id = ' + instance._id);
    	self.serviceModels[instance.type].remove({ _id: instance._id },  function(err) {
   			if (err) self.error('deleteService: err = ' + err);
    	});
	}
	
	this.findServiceByIdRequest = function(req, res) {

		self.debug('findServiceByIdRequest: req = ' + JSON.stringify(req.body));
		var instanceType = req.params.type;
		var Service = self.serviceModels[instanceType];

		Service.findOne({_id: req.params.id}, function(err, instance) {
			
			if (err) {
				self.error('findServiceByIdRequest: err = ' + err);
				res.send(404,err.toString());
				return;
			}
			
			self.debug('findServiceByIdRequest: data = ' + JSON.stringify(instance));
			res.send(200,instance);
		});
	}

	this.findServicesByTypeRequest = function(req, res) {

		self.debug('findServicesByTypeRequest: req = ' + JSON.stringify(req.body));
		var instanceType = req.params.type;
		var Service = self.serviceModels[instanceType];

		Service.find( function(err, instances) {

			if (err) {
				console.log('findServicesByTypeRequest: err = ' + err);
				res.send(404,err.toString());
				return;
			}
			
			self.debug('findServicesByTypeRequest: data = ' + JSON.stringify(instances));
			res.send(200,instances);
		});
	}

	this.getServiceData = function(callback) {
	
		var types = [];
		var typeIx = 0;
		var results = [];
		var errors;
		
		appDb.serviceModel.find( function(err, services) { 
			
			if (err) {
				self.error('getServiceData: err = ' + err);
				if (errors) errors.push(err); else errors = [err];
				callback(errors,results);
				return;
			}

			for(var i = 0; i < services.length; i++) {
				types.push(services[i].type);
			}
			
			getInstances();
		});

		function getInstances() {

			while (typeIx < types.length) {
				
				var Service = self.serviceModels[types[typeIx++]];
				
				if (Service) {

					Service.find( function(err, instances) {

						if (err) {
							self.error('getInstances: err = ' + err);
							if (errors) errors.push(err); else errors = [err];
						} else {
							results.push(instances);
						}

						getInstances();
					});
				
					return;
				}
			}
			
			callback(errors, Array.prototype.concat.apply(results[0], results.slice(1)));
		}
	}
	
	this.removeExistingServiceInstances = function(callback) {
	
		self.debug('removeExistingServiceInstances');
		var serviceModels = [];
		var modelIx = 0;
		var errors;
		
		appDb.serviceModel.find( function(err, services) { 
			
			if (err) {
				self.debug('removeExistingServiceInstances: err = ' + err);
				if (errors) errors.push(err); else errors = [err];
				callback(errors);
				return;
			}

			for (var i = 0; i < services.length; i++) {
				self.debug('removeExistingServiceInstances: services[' + i + '].type = ' + services[i].type);
				serviceModels.push(appDb.createServiceModel(services[i].type));
			}

			removeInstances();
		});

		function removeInstances() {

			while (modelIx < serviceModels.length) {
				
				serviceModels[modelIx++].remove({}, function(err) {

					if (err) {
						self.debug('removeInstances: err = ' + err);
						if (errors) errors.push(err); else errors = [err];
					}

					removeInstances();
				});
			
				return;
			}
			
			callback(errors);
		}
	}
	
	this.findServicesRequest = function(req, res) {

		self.debug('findServicesRequest: req = ' + JSON.stringify(req.body));
		
		self.getServiceData( function(errors,results) {	
			self.debug('findServicesRequest: results = ' + JSON.stringify(results));
			res.send(200,results);
		});
	}

	// THIS IS WHERE WE GET THE CALLBACKS WHEN DB RECORDS ARE SAVED.
	
	this.onServiceSave = function(instanceRecord) {
		self.debug('onServiceSave: instanceRecord = ' + JSON.stringify(instanceRecord));
		self.serviceManagerSocket.emit('serviceinstance.update',instanceRecord)
	}
	
	// THIS IS WHERE WE GET THE CALLBACKS WHEN DB RECORDS ARE REMOVED.
	
	this.onServiceRemove = function(instanceRecord) {
		self.debug('onServiceRemove: instanceRecord = ' + JSON.stringify(instanceRecord));
		self.serviceManagerSocket.emit('serviceinstance.remove',instanceRecord)
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// RESOURCES
	//
	
	this.resetResources = function(callback) {

		var data;
		var i;
		
		self.removeExisting(appDb.abrTemplateModel, function(errors) {
			
			if(errors) return;
			
			data =	[{ name: 'STB', mpegTS: true, hls: true, hds: false, hss: false, profiles: '1, 2, 4, 6' },
				{ name: 'Tablet', mpegTS: false, hls: true, hds: false, hss: false, profiles: '0.5, 1, 2, 4' },
				{ name: 'Mobile', mpegTS: false, hls: true, hds: false, hss: false, profiles: '0.2, 0.5, 1, 2' },
				{ name: 'Console', mpegTS: false, hls: true, hds: false, hss: false, profiles: '1, 2, 4, 6' },
				{ name: 'PC', mpegTS: false, hls: false, hds: true, hss: true, profiles: '1, 2, 4, 6' }];

			for (i = 0; i < data.length; i++) {
				new appDb.abrTemplateModel(data[i]).save();
			}
			
			self.removeExisting(appDb.drmTemplateModel, function(errors) {
			
				if(errors) return;
			
				data =	[{ name: 'playready', path: '1.2.3.4/pr/' },
					{ name: 'verimatrix', path: '1.2.3.4/pr/' }];

				for (i = 0; i < data.length; i++) {
					new appDb.drmTemplateModel(data[i]).save();
				}
			
				self.removeExisting(appDb.contentVolumeModel, function(errors) {
					
					if(errors) return;
			
					data =	[{ name: 'SWIFT', protocol: 'Swift', path: '1.2.3.4/mnt/ciscoswift', username: 'cosuser', password: '***'},
							{ name: 'FTP', protocol: 'FTP', path: '1.2.3.4/mnt/ftp', username: 'ftpuser', password: '' },
							{ name: 'HTTP', protocol: 'HTTP', path: '1.2.3.4/mnt/http', username: 'httpuser', password: '' },
							{ name: 'SMB', protocol: 'SMB', path: '1.2.3.4/mnt/smb', username: 'smbuser', password: '' },
							{ name: 'NFS', protocol: 'NFS', path: '1.2.3.4/mnt/nfs', username: 'Nfsuser', password: '' },
							{ name: 'S3', protocol: 'Swift', path: 'Amazon.com/vol/1234', username: 's3user', password: '' }];
					
					for (i = 0; i < data.length; i++) {
						new appDb.contentVolumeModel(data[i]).save();
					}
			
					self.removeExisting(appDb.archivePolicyModel, function(errors) {
						
						if(errors) return;
						
						data =	[{ name: 'Archive After 3', archiveInDays: 3, volume: 'SWIFT', drm: 'Playready' },
								{ name: 'Archive After 30', archiveInDays: 30, volume: 'S3', drm: 'Playready' }];
								
						for (i = 0; i < data.length; i++) {
							new appDb.archivePolicyModel(data[i]).save();
						}

						self.removeExisting(appDb.storagePolicyModel, function(errors) {
							
							data =	[{ name: 'HD Premium', retention: 1, drm: 'Playready', volume: 'SWIFT', archivePolicy: null},
									{ name: 'Movies', retention: 1, drm: 'Playready', volume: 'SWIFT', archivePolicy: null},
									{ name: 'Local', retention: 5, drm: 'Playready', volume: 'SWIFT', archivePolicy: 'ArchiveAfter3'}];
									
							for (i = 0; i < data.length; i++) {
								new appDb.storagePolicyModel(data[i]).save();
							}

							self.removeExisting(appDb.channelModel, function(errors) {
								
								data = [{ name: 'TLC', channelId: 10672, logo: 'tlc.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30},
										{ name: 'NBC', channelId: 10600, logo: 'nbc.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30},
										{ name: 'Discovery', channelId: 10653, logo: 'discovery.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30},
										{ name: 'Fox', channelId: 10507, logo: 'fox.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30},
										{ name: 'ESPN', channelId: 10641, logo: 'espn.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30},
										{ name: 'FOX29', channelId: 16374, logo: 'fox.png', abr: 'STB', storagePolicy: 'Local', playoutMpegTs: true, playoutABR: true, encryption: true, retentionDays: 30}]

								for (i = 0; i < data.length; i++) {
									new appDb.channelModel(data[i]).save();
								}

								self.removeExisting(appDb.channelLineupModel, function(errors) {
									
									data = [{ name: 'West100', channels: [ 'KRON', 'KNTV', 'KQED' ]}];

									for (i = 0; i < data.length; i++) {
										new appDb.channelLineupModel(data[i]).save();
									}

									callback()
								});
							});
						});
					});
				});
			});
		});
	}
	
	this.getResourcesRequest = function(req, res) {
		
		var results = {};

		self.findAll(appDb.abrTemplateModel, function(err, instances) {
			results.abrTemplate = instances;
			
			self.findAll(appDb.drmTemplateModel, function(err, instances) {
				results.drmTemplate = instances;
				
				self.findAll(appDb.contentVolumeModel, function(err, instances) {
					results.contentVolume = instances;
					
					self.findAll(appDb.archivePolicyModel, function(err, instances) {
						results.archivePolicy = instances;
						
						self.findAll(appDb.storagePolicyModel, function(err, instances) {
							results.storagePolicy = instances;
							
							self.findAll(appDb.channelModel, function(err, instances) {
								results.channel = instances;
								
								self.findAll(appDb.channelLineupModel, function(err, instances) {
									results.channelLineup = instances;
									res.send(200,results)
								});
							});
						});
					});
				});
			});
		});
	}
	
	this.getResourceTypesRequest = function(req, res) {
		
		res.send(200,[
			{ name: 'abrTemplate', description: 'ABR Template', picture: 'summary.png' },
			{ name: 'drmTemplate', description: 'DRM Template', picture: 'summary.png' },
			{ name: 'contentVolume', description: 'Content Volume', picture: 'resources.png' },
			{ name: 'archivePolicy', description: 'Archive Policy', picture: 'policies.png' },
			{ name: 'storagePolicy', description: 'Storage Policy', picture: 'policies.png' },
			{ name: 'channel', description: 'Channel', picture: 'channels.png' },
			{ name: 'channelLineup', description: 'Channel Lineup', picture: 'channels.png' }
		]);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// ABR TEMPLATE
	//
	
	this.findAbrTemplateByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.abrTemplateModel);
	}

	this.findAbrTemplatesRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.abrTemplateModel);
	}
	
	this.insertAbrTemplateRequest = function(req, res) {

		self.insertRequest(req, res, appDb.abrTemplateModel);
	}

	this.updateAbrTemplateRequest = function(req, res) {

		self.updateRequest(req, res, appDb.abrTemplateModel);
	}

	this.deleteAbrTemplateRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.abrTemplateModel);
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// DRM TEMPLATE
	//
	
	this.findDrmTemplateByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.drmTemplateModel);
	}

	this.findDrmTemplatesRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.drmTemplateModel);
	}
	
	this.insertDrmTemplateRequest = function(req, res) {

		self.insertRequest(req, res, appDb.drmTemplateModel);
	}

	this.updateDrmTemplateRequest = function(req, res) {

		self.updateRequest(req, res, appDb.drmTemplateModel);
	}

	this.deleteDrmTemplateRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.drmTemplateModel);
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// CONTENT VOLUME 
	//
	
	this.findContentVolumeByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.contentVolumeModel);
	}

	this.findContentVolumesRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.contentVolumeModel);
	}
	
	this.insertContentVolumeRequest = function(req, res) {

		self.insertRequest(req, res, appDb.contentVolumeModel);
	}

	this.updateContentVolumeRequest = function(req, res) {

		self.updateRequest(req, res, appDb.contentVolumeModel);
	}

	this.deleteContentVolumeRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.contentVolumeModel);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// ARCHIVE POLICY
	//
	
	this.findArchivePolicyByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.archivePolicyModel);
	}

	this.findArchivePolicysRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.archivePolicyModel);
	}
	
	this.insertArchivePolicyRequest = function(req, res) {

		self.insertRequest(req, res, appDb.archivePolicyModel);
	}

	this.updateArchivePolicyRequest = function(req, res) {

		self.updateRequest(req, res, appDb.archivePolicyModel);
	}

	this.deleteArchivePolicyRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.archivePolicyModel);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// STORAGE POLICY
	//
	
	this.findStoragePolicyByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.storagePolicySchema);
	}

	this.findStoragePolicysRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.storagePolicySchema);
	}
	
	this.insertStoragePolicyRequest = function(req, res) {

		self.insertRequest(req, res, appDb.storagePolicySchema);
	}

	this.updateStoragePolicyRequest = function(req, res) {

		self.updateRequest(req, res, appDb.storagePolicySchema);
	}

	this.deleteStoragePolicyRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.storagePolicySchema);
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// CHANNEL
	//
	
	this.findChannelByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.channelModel);
	}

	this.findChannelsRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.channelModel);
	}
	
	this.insertChannelRequest = function(req, res) {

		self.insertRequest(req, res, appDb.channelModel);
	}

	this.updateChannelRequest = function(req, res) {

		self.updateRequest(req, res, appDb.channelModel);
	}

	this.deleteChannelRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.channelModel);
	}

	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// CHANNEL LINEUP
	//
	
	this.findChannelLineupByIdRequest = function(req, res) {

		self.findByIdRequest(req, res, appDb.channelLineupModel);
	}

	this.findChannelLineupsRequest = function(req, res) {

		self.findAllRequest(req, res, appDb.channelLineupModel);
	}
	
	this.insertChannelLineupRequest = function(req, res) {

		self.insertRequest(req, res, appDb.channelLineupModel);
	}

	this.updateChannelLineupRequest = function(req, res) {

		self.updateRequest(req, res, appDb.channelLineupModel);
	}

	this.deleteChannelLineupRequest = function(req, res) {

		self.deleteRequest(req, res, appDb.channelLineupModel);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// TRANSCODE JOB
	//
	
	this.startTranscodeJob = function(req, res) {
		
		var name = req.params.name;
		self.debug('startTranscodeJob: name = ' + name );
		var Transcode = self.appModels['transcode'];

		Transcode.findOne({name: name}, function(err, instance) {

			if (err) {
				self.error('startTranscodeJob: err = ' + err);
				res.send(500,err.toString());
				return;
			}
			
			if (instance == null) {
				self.error('startTranscodeJob: instance not found, name = ' + name);
				res.send(500,'Instance ""' + name + '"" not found');
				return;
				
			}
			
			instance.subType = 20;
			instance.save();
			res.send(200);
		});
	}
}
