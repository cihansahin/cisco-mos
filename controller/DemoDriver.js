
// DemoDriver.js

module.exports = DemoDriver;

function in1SecondFrom(now) {
	return now + 1000.0;
}

function in2SecondsOrSoFrom(now) {
	return now + (2 + Math.random() * 2) * 1000;
}

function in5SecondsOrSoFrom(now) {
	return now + (5 + Math.random() * 8) * 1000;
}

function in10SecondsOrSoFrom(now) {
	return now + (10 + Math.random() * 15) * 1000;
}

function in30SecondsOrSoFrom(now) {
	return now + (15 + Math.random() * 20) * 1000;
}

function in15SecondsFrom(now) {
	return now + 15 * 1000;
}

function decelarateTo(target, delta, value, min, max) {
	target = target - delta + delta * 2 * Math.random();
	var v2 = Math.round(value + (target - value) * Math.random() * 0.5);
	if (v2 < min) v2 = min;
	if (v2 > max) v2 = max;
	return v2;
}

function advanceTo(target, wobble, value, min, max, delta) {
	target = target - wobble + wobble * 2 * Math.random();
	var v2 = Math.round(value + delta * Math.random());
	if (v2 < min) v2 = min;
	if (v2 > max) v2 = max;
	return v2;
}

function DemoDriver(appManager) {
	
	var self = this;
	this.MAX_SPAWNED_INSTANCES = 40;
	this.MAX_DEMO_TIME = 1800;
	this.appManager = appManager;
	this.nextTouch = {};
	this.epoch = new Date().getTime();
	this.now = this.epoch;
	this.canSpawn = false;
	
	
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
		//console.log("DEBUG " + message);
	}
	
	////////////////////////////////////////////////////////////////////////////////////////////
	//
	// HEARTBEAT
	//
	
	this.heartbeat = function() {
	
		self.now = new Date().getTime();
		//self.debug('heartbeat: now = ' + self.now);


		// if ((self.now - self.epoch) / 1000 > self.MAX_DEMO_TIME) {
		// 	
		// 	//self.debug('Reset due to timeout');
		// 	self.nextTouch = {};
		// 	self.epoch = new Date().getTime();
		// 	self.now = this.epoch;
		// 	self.canSpawn = false;
		// 	
		// 	self.appManager.reset( function() {						
		// 		setTimeout(self.heartbeat, 1000);
		// 	});
		// 	
		// 	return;	
		// }
		
		appManager.getAppData( function(errors, appInstances) {
		
			if(!errors) {
			
				// if (appInstances.length >= self.MAX_SPAWNED_INSTANCES) {
				// 	
				// 		//self.debug('Reset due to maximum number of instances.');
				// 		self.nextTouch = {};
				// 		self.epoch = new Date().getTime();
				// 		self.now = this.epoch;
				// 		self.canSpawn = true;
				// 		
				// 		self.appManager.reset( function() {						
				// 			setTimeout(self.heartbeat, 1000);
				// 		});
				// 		
				// 		return;	
				// }
				
				for(var i = 0; i < appInstances.length; i++) {
			
					var ai = appInstances[i];
					var next = self.nextTouch[ai._id];
			
					if (next === undefined) {
						//self.debug('heartbeat: _id = ' + ai._id + ' next is undefined');
						self.nextTouch[ai._id] = self.whatNextForApp(ai);
					} else {
						if(self.now >= next.time) {
							//self.debug('heartbeat: _id = ' + ai._id + ' touch = ' + next.comment);
							self.nextTouch[ai._id] = next.touch(ai);
						} else {
							//self.debug('heartbeat: _id = ' + ai._id + ' not time for touch');
						}
					}
				
					// var nt = self.nextTouch[ai._id];
					// if(nt) self.debug('heartbeat: _id = ' + ai._id + ' when = ' + (nt.time - self.now) / 1000 + ' what = ' + nt.comment);
				}
			}
		});

		appManager.getServiceData( function(errors, serviceInstances) {

			if(!errors) {
		
				for(var i = 0; i < serviceInstances.length; i++) {
		
					var si = serviceInstances[i];
					var next = self.nextTouch[si._id];
					//self.debug('heartbeat: si.name = ' + si.name + ' si._id = ' + si._id + ' next = ' + next);
		
					if (next === undefined) {
						//self.debug('heartbeat: _id = ' + si._id + ' next is undefined');
						self.nextTouch[si._id] = self.whatNextForService(si);
					} else {
						if(self.now >= next.time) {
							//self.debug('heartbeat: _id = ' + si._id + ' touch = ' + next.comment);
							self.nextTouch[si._id] = next.touch(si);
						} else {
							//self.debug('heartbeat: _id = ' + si._id + ' not time for touch');
						}
					}
			
					// var nt = self.nextTouch[si._id];
					// if(nt) self.debug('heartbeat: _id = ' + si._id + ' when = ' + (nt.time - self.now) / 1000 + ' what = ' + nt.comment);
				}
			}
		});
		
		setTimeout(self.heartbeat, 1000);
	};
	
	this.startHeartbeat = function() {
		setTimeout(self.heartbeat, 1000);
	};
	
	this.whatNextForApp = function(ai) {
		
		var when;
		var what;
		
		switch(ai.runstatus) {
	
			case 0: // PRELAUNCH - IN 7 OR SO SECONDS LEVEL UP THE LAUNCH
				when = ai.type != 'transcode' ? in5SecondsOrSoFrom(self.now) : in2SecondsOrSoFrom(self.now);
				what = self.nowLaunchApp;
				comment = 'nowLaunchApp';
				break;
			
			case 1: // LAUNCH - IN 20 OR SO SECONDS LEVEL UP TO CONFIGURE
				when = ai.type != 'transcode' ? in10SecondsOrSoFrom(self.now) : in2SecondsOrSoFrom(self.now);
				what = self.nowConfigureApp;
				comment = 'nowConfigureApp';
				break;
		
			case 3: // CONFIGURE - IN 20 OR SO SECONDS LEVEL UP TO INITIALIZE
			
				when = ai.type != 'transcode' ? in10SecondsOrSoFrom(self.now) : in2SecondsOrSoFrom(self.now);

				if(ai.type != 'manage') {
					what = self.nowInitializeApp;
					comment = 'nowInitializeApp';
				} else {
					what = self.nowCrashApp;
					comment = 'nowCrashApp';
				}
				
				break;
		
			case 5: // INITIALIZE - IN 20 OR SO SECONDS LEVEL UP TO ACTIVE
				when = ai.type != 'transcode' ? in10SecondsOrSoFrom(self.now) : in2SecondsOrSoFrom(self.now);
				what = self.nowActiveApp;
				comment = 'nowActiveApp';
				break;
	
			case 7: // ACTIVE
			default:
			
				switch(ai.type) {
					case 'transcode': return self.whatNextTranscode(ai);
					case 'package': return self.whatNextPackage(ai);
					case 'capture': return self.whatNextCapture(ai);
					case 'play':  return self.whatNextPlay(ai);
					case 'manage': return self.whatNextManage(ai);
					case 'navigate': return self.whatNextNavigate(ai);
					case 'store': return self.whatNextS3(ai);
					case 'rackspace': return self.whatNextRackspace(ai);
				}
				
				self.warn('whatNextForApp: UNKNOWN TYPE, ai.type = ' + ai.type);
				when = Math.Infinity;
				what = null;
				comment = 'ERROR';
				break;
				
			case 2: // CRASHED
			case 4:
			case 6:
				when = in15SecondsFrom(self.now);
				what = self.cleanupApp;
				comment = 'cleanupApp';
				break;
		}
		
		//self.debug('whatNextForApp: ai.name = ' + ai.name + ' when = ' + when + ' what = ' + comment);
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextTranscode = function(ai) {
		
		var when;
		var what;
		var comment;

		switch(ai.subType) {
			
		case 20: // GENERATE WORKERS
		
			if(ai.workers < ai.maxWorkers) {
				appManager.insertAppWorker(ai);
				ai.workers++;
				when = in1SecondFrom(self.now)
				what = self.runningTranscode;
				comment = 'running transcode - generating workers'
			} else {
				ai.subType = 10;
				when = in10SecondsOrSoFrom(self.now)
				what = self.runningTranscode;
				comment = 'running transcode - back to normal instance'
			}

			ai.save( function(err) {
				if (err) {
					self.error('whatNextTranscode: err = ' + err);
				}
			});
			
			break;
						
		case 30: // ACTIVE WORKER
		
			when = in10SecondsOrSoFrom(self.now);
			what = self.cleanupApp;
			comment = 'cleanupApp';
			// when = in10SecondsOrSoFrom(self.now)
			// what = self.nowCrashApp;
			// comment = 'running transcode worker - terminate in 10 seconds or so'
			break;
			
		default:
			when = in10SecondsOrSoFrom(self.now)
			what = self.runningTranscode;
			comment = 'running transcode'
			break;
		}
		
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextPackage = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningPackage;
		var comment = 'running package'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextCapture = function(ai) {
		
		var when = in5SecondsOrSoFrom(self.now)
		var what = self.runningCapture;
		var comment = 'running capture'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextPlay = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningPlay;
		var comment = 'running play'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextManage = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now);
		var what = self.runningManage;
		var comment = 'UNDEFINED'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextNavigate = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningNavigate;
		var comment = 'running navigate'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextS3 = function(ai) {
		
		var when = in5SecondsOrSoFrom(self.now)
		var what = self.runningS3;
		var comment = 'running s3'
		return {time: when, touch: what, comment: comment};
	};
		
	this.whatNextRackspace = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningRackspace;
		var comment = 'running rackspace'
		return {time: when, touch: what, comment: comment};
	};

	this.nowLaunchApp = function(instance) {
		
		instance.runstatus = 1;
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(25, 25, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(10, 10, instance.bandwidthPercent, 0, 100);
		
		instance.save( function(err) {
			if (err) self.error('nowLaunchApp: err = ' + err);
		});
		
		return self.whatNextForApp(instance);	
	}
	
	this.nowConfigureApp = function(instance) {
		
		instance.runstatus = 3;
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(25, 25, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(10, 10, instance.bandwidthPercent, 0, 100);
		
		instance.save( function(err) {
			if (err) self.error('nowConfigureApp: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.nowInitializeApp = function(instance) {
		
		instance.runstatus = 5;
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(25, 25, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(10, 10, instance.bandwidthPercent, 0, 100);
		
		instance.save( function(err) {
			if (err) self.error('nowInitializeApp: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.nowActiveApp = function(instance) {
		
		instance.runstatus = 7;
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(25, 25, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(10, 10, instance.bandwidthPercent, 0, 100);
		
		instance.save( function(err) {
			if (err) g('nowActiveApp: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}

	this.nowCrashApp = function(instance) {
		
		switch(instance.runstatus) {
			case 0:
			case 1:		instance.runstatus = 2; break;
			case 3:		instance.runstatus = 4; break;
			default:	instance.runstatus = 6; break;
		}

		instance.cpuPercent = 0;
		instance.memoryPercent = 0;
		instance.bandwidthPercent = 0;
		
		instance.save( function(err) {
			if (err) self.error('nowCrashApp: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.cleanupApp = function(instance) {
		appManager.deleteApp(instance);
		return null;
	}
	
	this.runningTranscode = function(instance) {
		
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(90, 10, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(40, 35, instance.bandwidthPercent, 0, 100);

		instance.save( function(err) {
			if (err) self.error('runningTranscode: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningCapture = function(instance) {
		
		instance.cpuPercent = decelarateTo(40, 35, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(90, 10, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(90, 10, instance.bandwidthPercent, 0, 100);
		var prevActiveRecordings = instance.activeRecordings;
		instance.activeRecordings = advanceTo(900, 90, instance.activeRecordings, 0, 1000, 50);
		instance.scheduledRecordings = advanceTo(1800, 180, instance.scheduledRecordings, 0, 2000, 25);
		instance.archivedRecordings = advanceTo(200, 20, instance.archivedRecordings, 0, 500, 10);

		instance.save( function(err) {
			if (err) self.error('runningCapture: err = ' + err);
		}); 	
		
		if(prevActiveRecordings < 800 && instance.activeRecordings >= 800 && self.canSpawn) {
			
			appManager.insertApp({
				name: "Rec-ATL-" + (1001 + Math.round(Math.random() * 8998)),
				type: "capture", 
				minWorkers: 3,
				maxWorkers: 5,
				encoding:'',
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
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningPackage = function(instance) {
		
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(90, 10, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(30, 25, instance.bandwidthPercent, 0, 100);

		instance.save( function(err) {
			if (err) self.error('runningPackage: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningPlay = function(instance) {
		
		instance.cpuPercent = decelarateTo(30, 25, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(60, 40, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(90, 10, instance.bandwidthPercent, 0, 100);
		var prevActivePlaybacks = instance.activePlaybacks;
		instance.activePlaybacks = advanceTo(280, 40, instance.activePlaybacks, 0, 300, 10);

		instance.save( function(err) {
			if (err) self.error('runningPlay: err = ' + err);
		}); 	
		
		if(prevActivePlaybacks < 239 && instance.activePlaybacks >= 239 && self.canSpawn) {
			
			appManager.insertApp({
				name: "Play-NYC-" + (1001 + Math.round(Math.random() * 8998)),
				type: "play", 
				minWorkers: 3,
				maxWorkers: 5,
				encoding:'',
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
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningManage = function(instance) {
		
		instance.cpuPercent = decelarateTo(80, 20, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(90, 10, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(40, 20, instance.bandwidthPercent, 0, 100);

		instance.save( function(err) {
			if (err) self.error('runningManage: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningNavigate = function(instance) {
		
		instance.cpuPercent = decelarateTo(20, 10, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(30, 10, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(20, 10, instance.bandwidthPercent, 0, 100);

		instance.save( function(err) {
			if (err) self.error('runningNavigate: err = ' + err);
		}); 	
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningS3 = function(instance) {
		
		var prevStorageUsed = instance.storageUsed;
		instance.cpuPercent = decelarateTo(15, 5, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(30, 20, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(80, 20, instance.bandwidthPercent, 0, 100);
		instance.storageUsed = advanceTo(95, 10, instance.storageUsed, 0, 100, 4);
		instance.storageCapacity = 100;

		instance.save( function(err) {
			if (err) self.error('runningS3: err = ' + err);
		}); 	
		
		if(prevStorageUsed < 84 && instance.storageUsed >= 84 && self.canSpawn) {
			
			appManager.insertApp({
				name: "S3-VIR-" + (1001 + Math.round(Math.random() * 8998)),
				type: "store", 
				minWorkers: 3,
				maxWorkers: 5,
				encoding:'',
				activeRecordings: null,
				scheduledRecordings: null,
				archivedRecordings: null,
				activePlaybacks: null,
				storageUsed: null,
				storageCapacity: 100,
				cpuPercent: null,
				memoryPercent: null,
				bandwidthPercent: null,
				runstatus: 0
			});
		}
		
		return self.whatNextForApp(instance);	
	}
	
	this.runningRackspace = function(instance) {

		var prevStorageUsed = instance.storageUsed;
		instance.cpuPercent = decelarateTo(15, 5, instance.cpuPercent, 0, 100);
		instance.memoryPercent = decelarateTo(30, 20, instance.memoryPercent, 0, 100);
		instance.bandwidthPercent = decelarateTo(80, 20, instance.bandwidthPercent, 0, 100);
		instance.storageUsed = advanceTo(95, 10, instance.storageUsed, 0, 100, 4);
		instance.storageCapacity = 100;

		instance.save( function(err) {
			if (err) self.error('runningRackspace: err = ' + err);
		}); 	
		
		if(prevStorageUsed < 84 && instance.storageUsed >= 84 && self.canSpawn) {
			
			appManager.insertApp({
				name: "Rec-ATL-" + (1001 + Math.round(Math.random() * 8998)),
				type: "store", 
				minWorkers: 3,
				maxWorkers: 5,
				encoding:'',
				activeRecordings: null,
				scheduledRecordings: null,
				archivedRecordings: null,
				activePlaybacks: null,
				storageUsed: null,
				storageCapacity: 100,
				cpuPercent: null,
				memoryPercent: null,
				bandwidthPercent: null,
				runstatus: 0
			});
		}
		
		return self.whatNextForApp(instance);	
	}
	
	this.whatNextForService = function(ai) {
		
		var when;
		var what;
		
		switch(ai.runstatus) {
	
			case 0: // PRELAUNCH - IN 7 OR SO SECONDS LEVEL UP THE LAUNCH
				when = in5SecondsOrSoFrom(self.now);
				what = self.nowLaunchService;
				comment = 'nowLaunchService';
				break;
			
			case 1: // LAUNCH - IN 20 OR SO SECONDS LEVEL UP TO CONFIGURE
				when = in10SecondsOrSoFrom(self.now)	
				what = self.nowConfigureService;
				comment = 'nowConfigureService';
				break;
		
			case 3: // CONFIGURE - IN 20 OR SO SECONDS LEVEL UP TO INITIALIZE
			
				when = in10SecondsOrSoFrom(self.now)

				if(ai.type != 'manage') {
					what = self.nowInitializeService;
					comment = 'nowInitializeService';
				} else {
					what = self.nowCrashService;
					comment = 'nowCrashService';
				}
				
				break;
		
			case 5: // INITIALIZE - IN 20 OR SO SECONDS LEVEL UP TO ACTIVE
				when = in10SecondsOrSoFrom(self.now)
				what = self.nowActiveService;
				comment = 'nowActiveService';
				break;
	
			case 7: // ACTIVE
			default:
			
				switch(ai.type) {
					case 'cdvr': return self.whatNextCDvr(ai);
					case 'vod': return self.whatNextVod(ai);
					case 'tstv': return self.whatNextTstv(ai);
					case 'live':  return self.whatNextLive(ai);
				}
				
				self.warn('whatNextForService: UNKNOWN TYPE, ai.type = ' + ai.type);
				when = Math.Infinity;
				what = null;
				comment = 'ERROR';
				break;
				
			case 2: // CRASHED
			case 4:
			case 6:
				when = in15SecondsFrom(self.now);
				what = self.cleanupService;
				comment = 'cleanupService';
				break;
		}
		
		
		//self.debug('whatNextForService: ai.name = ' + ai.name + ' when = ' + when + ' what = ' + comment);
		return {time: when, touch: what, comment: comment};
	};

	this.whatNextCDvr = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningCdvr;
		var comment = 'running transcode'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextVod = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningVod;
		var comment = 'running package'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextTstv = function(ai) {
		
		var when = in5SecondsOrSoFrom(self.now)
		var what = self.runningTstv;
		var comment = 'running capture'
		return {time: when, touch: what, comment: comment};
	};
	
	this.whatNextLive = function(ai) {
		
		var when = in10SecondsOrSoFrom(self.now)
		var what = self.runningLive;
		var comment = 'running play'
		return {time: when, touch: what, comment: comment};
	};
	
	this.nowLaunchService = function(instance) {
		
		instance.runstatus = 1;
		
		instance.save( function(err) {
			if (err) self.error('nowLaunchService: err = ' + err);
		});
		
		return self.whatNextForService(instance);	
	}
	
	this.nowConfigureService = function(instance) {
		
		instance.runstatus = 3;
		
		instance.save( function(err) {
			if (err) self.error('nowConfigureService: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.nowInitializeService = function(instance) {
		
		instance.runstatus = 5;
		
		instance.save( function(err) {
			if (err) self.error('nowInitializeService: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.nowActiveService = function(instance) {
		
		instance.runstatus = 7;
		
		instance.save( function(err) {
			if (err) g('nowActiveService: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}

	this.nowCrashService = function(instance) {
		
		switch(instance.runstatus) {
			case 0:
			case 1:		instance.runstatus = 2; break;
			case 3:		instance.runstatus = 4; break;
			default:	instance.runstatus = 6; break;
		}

		instance.save( function(err) {
			if (err) self.error('nowCrashService: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.cleanupService = function(instance) {
		appManager.deleteService(instance);
		return null;
	}
	
	this.runningCdvr = function(instance) {
		
		instance.save( function(err) {
			if (err) self.error('runningCdvr: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.runningVod = function(instance) {
		

		instance.save( function(err) {
			if (err) self.error('runningVod: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.runningTstv = function(instance) {
		
		instance.save( function(err) {
			if (err) self.error('runningTstv: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
	
	this.runningLive = function(instance) {
		
		instance.save( function(err) {
			if (err) self.error('runningLive: err = ' + err);
		}); 	
		
		return self.whatNextForService(instance);	
	}
}
