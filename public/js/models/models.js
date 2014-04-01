window.App = Backbone.Model.extend({

    urlRoot: "/app",
    idAttribute: "_id",

    initialize: function() {
    },

    validateItem: function(key) {
        return {isValid: true};
    },

    validateAll: function() {
        return {isValid: true};
    },

    defaults: {
        _id: null,
        name: "",
        type: "",
        description: "",
        picture: null
    }
});

window.AppCollection = Backbone.Collection.extend({
    model: App,
    url: "/app"
});

window.AppInstance = Backbone.Model.extend({

    urlRoot: "/app/", 
    idAttribute : "_id",

    _id: null,							// READ ONLY  
    name: "",
    type: null,							// READ ONLY
	icon: null,							// READ ONLY 
	minWorkers: 1,
	maxWorkers: 20,
	activeRecordings: null,				// READ ONLY 
	scheduledRecordings: null,			// READ ONLY 
	archivedRecordings: null,			// READ ONLY 
	activePlaybacks: null,				// READ ONLY 
	storageUsed: null,					// READ ONLY 
	storageCapacity: null,
	cpuPercent: null,					// READ ONLY 
	memoryPercent: null,				// READ ONLY 
	bandwidthPercent: null,				// READ ONLY 
	runstatus: 0,						// READ ONLY 

    methodToURL: {},

    initialize: function(data) {
        this._id  =  data._id; 
        this.name  = data.name;
        this.type = data.type;
		this.icon = data.icon;
        this.minWorkers = data.minWorkers;
        this.maxWorkers = data.maxWorkers;
		this.activeRecordings = data.activeRecordings;
		this.scheduledRecordings = data.scheduledRecordings;
		this.archivedRecordings = data.archivedRecordings;
		this.activePlaybacks = data.activePlaybacks;
		this.storageUsed = data.storageUsed;
		this.storageCapacity = data.storageCapacity;
		this.cpuPercent = data.cpuPercent;
		this.memoryPercent = data.memoryPercent;
		this.bandwidthPercent = data.bandwidthPercent;
 		this.runstatus = data.runstatus;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
	
        if (this._id == null) {
            return this.urlRoot + this.type + "/instance";
        }

        return this.urlRoot + this.type + "/instance/" + this._id;
    }, 

    defaults: {
        _id: null, 
        name: "App",
        type: "",
		icon: "", 
		icon: "",
		minWorkers: 1,
		maxWorkers: 20,
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
  }
});

window.AppInstanceCollection = Backbone.Collection.extend({

	model: AppInstance,
	type: null, 

	initialize: function(data) {
		this.type = data.type;
	}, 

	url: function() {
		
		if(this.type) {
			return "/app/" + this.type + "/instance";
		}
		
		return "/app/instance"
	}
});

window.AppAllInstanceCollection = Backbone.Collection.extend({
	
    model: AppInstance,

    url: function() {
         return "/app/instance";
    }
});

window.ServiceCollection = Backbone.Collection.extend({
    model: App,
    url: "/service"
});

window.ResourceList = Backbone.Model.extend({

    urlRoot: "/resource/",

    channelLineup: null,					// READ ONLY  
    channel: null,							// READ ONLY
	storagePolicy: null,					// READ ONLY 
	archivePolicy: null,					// READ ONLY
	contentVolume: null,					// READ ONLY
	drmTemplate: null,						// READ ONLY
	abrTemplate: null,						// READ ONLY 

    methodToURL: {},

    initialize: function(data) {
        this.channelLineup  =  data.channelLineup; 
        this.channel  = data.channel;
		this.storagePolicy = data.storagePolicy;
		this.archivePolicy = data.archivePolicy;
		this.contentVolume = data.contentVolume;
		this.drmTemplate = data.drmTemplate;
		this.abrTemplate = data.abrTemplate;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    defaults: {
        channel: null, 
        storagePolicy: "Channel",
		archivePolicy: "",
		contentVolume: null,
		drmTemplate: null,
		abrTemplate: null,
		channelLineup: null
  }
});


window.ResourceDataCollection = Backbone.Collection.extend({
    model: ResourceList,
    url: "/resource"
});

window.ServiceInstance = Backbone.Model.extend({

    urlRoot: "/service/", 
    idAttribute : "_id",

    _id: null,							// READ ONLY  
    name: "",
    type: null,							// READ ONLY
	icon: null,							// READ ONLY
	size: 1,
	channelLineup: "",
	encryption: false,
	inputVideoFormat: "",
	storagePolicy: "",
	archivePolicy: "",
	abrProfile: "",
	drmProfile: "",
	outputFormats: [],					// READ ONLY
	captureInstances: [],				// READ ONLY
	storeInstances: [],					// READ ONLY
	playInstances: [],					// READ ONLY
	transcodeInstances: [],				// READ ONLY
	runstatus: 0,						// READ ONLY

    methodToURL: {},

    initialize: function(data) {
        this._id  =  data._id; 
        this.name  = data.name;
        this.type = data.type;
		this.icon = data.icon;
		this.size = data.size;
		this.channelLineup = data.channelLineup;
		this.encryption = data.encryption;
		this.inputVideoFormat = data.inputVideoFormat;
		this.storagePolicy = data.storagePolicy;
		this.archivePolicy = data.archivePolicy;
		this.abrProfile = data.abrProfile;
		this.drmProfile = data.drmProfile;
		this.outputFormats = data.outputFormats;
		this.captureInstances = data.captureInstances;
		this.storeInstances = data.storeInstances;
		this.playInstances = data.playInstances;
		this.transcodeInstances = data.transcodeInstances;
		this.runstatus = data.runstatus;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
        if (this._id == null) {
            return this.urlRoot + this.type + "/instance";
        }

        return this.urlRoot + this.type + "/instance/" + this._id;
    }, 

    defaults: {
        _id: null, 
        name: "Service",
        type: "",
		icon: "",
		size: 1,
		channelLineup: "",
		encryption: false,
		inputVideoFormat: "",
		storagePolicy: "",
		archivePolicy: "",
		abrProfile: "",
		drmProfile: "",
		outputFormats: [],					// READ ONLY
		captureInstances: [],				// READ ONLY
		storeInstances: [],					// READ ONLY
		playInstances: [],					// READ ONLY
		transcodeInstances: [],				// READ ONLY
		runstatus: 0						// READ ONLY
  }
});

window.ServiceAllInstanceCollection = Backbone.Collection.extend({
	
    model: AppInstance,

    url: function() {
         return "/service/instance";
    }
});

window.ResourceCollection = Backbone.Collection.extend({
    model: App,
    url: "/resourceType"
});

window.ChannelInstance = Backbone.Model.extend({

    urlRoot: "/channel/", 
    idAttribute : "_id",

	_id: null,							// READ ONLY
    channelId: null,					// READ ONLY  
    name: "",
	logo: null,							// READ ONLY 
	storagePolicy: null,				// READ ONLY
	abr: null,							// READ ONLY 
	retentionDays: 30,					// READ ONLY

    methodToURL: {},

    initialize: function(data) {
    	this._id  =  data._id; 
        this.channelId  =  data.channelId; 
        this.name  = data.name;
		this.logo = data.logo;
		this.storagePolicy = data.storagePolicy;
		this.abr = data.abr;
		this.retentionDays = data.retentionDays;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
	
        if (this._id == null) {
            return this.urlRoot;
        }

        return this.urlRoot + this._id;
    }, 

    defaults: {
    	_id: null,
        channelId: null, 
        name: "Channel",
		logo: "",
		storagePolicy: null,
		abr: null,
		retentionDays: 30
  }
});

window.ChannelInstanceCollection = Backbone.Collection.extend({
    model: ChannelInstance,
    url: "/channel"
});

window.EncodingProfileInstance = Backbone.Model.extend({

    urlRoot: "/encodingProfile/", 
    idAttribute : "_id",

	_id: null,							// READ ONLY
    name: null,							// READ ONLY 
    profile: null,						// READ ONLY 
    level: "",
	bitRate: null,						// READ ONLY 
	keyFrameInterval: null,				// READ ONLY
	bufferSize: null,					// READ ONLY 
	outputResolution: null,				// READ ONLY
	outputFrameRate: null,				// READ ONLY

    methodToURL: {},

    initialize: function(data) {
    	this._id  =  data._id; 
        this.name  =  data.name;
        this.profile  =  data.profile; 
        this.level  = data.level;
		this.bitRate = data.bitRate;
		this.keyFrameInterval = data.keyFrameInterval;
		this.bufferSize = data.bufferSize;
		this.outputResolution = data.outputResolution;
		this.outputFrameRate = data.outputFrameRate;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
	
        if (this._id == null) {
            return this.urlRoot;
        }

        return this.urlRoot + this._id;
    }, 

    defaults: {
    	_id: null,
        name: "Encoding Profile",
  }
});

window.EncodingProfileInstanceCollection = Backbone.Collection.extend({
    model: EncodingProfileInstance,
    url: "/encodingProfile"
});




window.ChannelLineupInstance = Backbone.Model.extend({

    urlRoot: "/channelLineup/", 
    idAttribute : "_id",

    _id: null,					// READ ONLY  
    name: "",
	logo: null,							// READ ONLY 
	storagePolicy: null,				// READ ONLY
	abr: null,							// READ ONLY 

    methodToURL: {},

    initialize: function(data) {
        this._id  =  data._id; 
        this.name  = data.name;
		this.channels = this.channels;
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
	
        if (this._id == null) {
            return this.urlRoot + "channelLineup" + "/instance";
        }

        return this.urlRoot + "channelLineup" + "/instance/" + this._id;
    }, 

    defaults: {
        _id: null, 
        name: "Channel Lineup",
		channels: null
  }
});

window.ChannelLineupInstanceCollection = Backbone.Collection.extend({
    model: ChannelLineupInstance,
    url: "/channelLineup"
});



window.SummaryData = Backbone.Model.extend({

	total: {},
	average: {},
	instances: {},
	runstatus: {},

    methodToURL: {},

    initialize: function(data) {
	
		if(data.total) this.total = data.total;
		if(data.average) this.average = data.average;
		if(data.instances) this.instances = data.instances;
		if(data.runstatus) this.runstatus = data.runstatus;
	
		var sd = this;
		
		appManagerEvents.on('summarydata', function(data2) {
			sd.set(data2);
		});
   },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
        return "/summaryData";
    }, 

    defaults: {
		total: {},
		average: {},
		instances: {},
		runstatus: {}
	}
});

window.ChartData = Backbone.Model.extend({

	activeRecordings: [],
	activePlaybacks: [],
	archivedRecordings: [],

    methodToURL: {},

    initialize: function(data) {
		if(data.activeRecordings) this.activeRecordings = data.activeRecordings;
		if(data.activePlaybacks) this.activePlaybacks = data.activePlaybacks;
		if(data.archivedRecordings) this.archivedRecordings = data.archivedRecordings;
	},
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
        return "/chartData";
    }, 

    defaults: {
		activeRecordings: [],
		activePlaybacks: [],
		archivedRecordings: [],
	}
});

window.AppLauncher  = Backbone.Model.extend({

    urlRoot: "/appManager/", 
    idAttribute : "_id", 
    _id: null, 
    appName: "", 
    instanceName: "",

    methodToURL: {},

    initialize: function(data) {
        this._id            = data._id; 
        this.appName        = "test";
        this.instanceName   = "testInstance";
    },
    
    validateItem: function(key) {
        return {isValid: true};
    }, 

    validateAll: function() {
        return {isValid: true};
    }, 

    url: function() {
	
        if (this._id == null) {
            return this.urlRoot + "launchApp";
        }

        return this.urlRoot + "/instance/" + this._id;
    }, 

    defaults: {
        _id: null, 
        appName: "default",
        instanceName: "instanceName"
    }
});

window.AppInstanceDisplay = Backbone.Model.extend({

    type: "", 
    name: "",
    info: null,

    initialize: function(data) {
	
        //console.log("INITIALIZE: AppInstanceDisplay data = " + JSON.stringify(data));
        this.type  = data.type;
        this.name  = data.name;
    },
});

window.AppManagerBroadcast = function() {
	
	_.extend(this, Backbone.Events);
	var self = this;
	this.socket = io.connect(document.body.baseURI + 'appManager');
	
	// this.socket.on('connect', function() {
	// 	console.log("CONNECTION");
	// });
	
	this.socket.on('appinstance.update', function(data) {
		
        //console.log("APPINSTANCE UPDATE: data = " + JSON.stringify(data));
		var eventName = [];
		
		if(data) {
			if(data._id) eventName.push(data._id);
			if(data.name) eventName.push(data.name);
		}
		
		eventName.push('any');
		self.trigger(eventName.join(" "),data);
	});
	
	this.socket.on('appinstance.remove', function(data) {
		
        //console.log("APPINSTANCE REMOVE: data = " + JSON.stringify(data));
		var eventName = [];
		
		if(data) {
			if(data._id) eventName.push('remove.' + data._id);
			if(data.name) eventName.push('remove. ' + data.name);
		}
		
		eventName.push('remove.any');
		self.trigger(eventName.join(" "),data);
	});
	
	this.socket.on('serviceinstance.update', function(data) {
		
        //console.log("SERVICEINSTANCE UPDATE: data = " + JSON.stringify(data));
		var eventName = [];
		
		if(data) {
			if(data._id) eventName.push(data._id);
			if(data.name) eventName.push(data.name);
		}
		
		eventName.push('any');
		self.trigger(eventName.join(" "),data);
	});
	
	this.socket.on('serviceinstance.remove', function(data) {
		
        //console.log("SERVICEINSTANCE REMOVE: data = " + JSON.stringify(data));
		var eventName = [];
		
		if(data) {
			if(data._id) eventName.push('remove.' + data._id);
			if(data.name) eventName.push('remove. ' + data.name);
		}
		
		eventName.push('remove.any');
		self.trigger(eventName.join(" "),data);
	});
	
	this.socket.on('summarydata.update', function(data) {
        //console.log("SUMMARYDATA UPDATE: data = " + JSON.stringify(data));
		self.trigger('summarydata',data);
	});
};

window.appManagerEvents = new AppManagerBroadcast();

// Sample: listen for any changes.
// 
//		appManagerEvents.on('any', function(data) {
//			console.log("APPMANAGEREVENTS *: data = " + JSON.stringify(data));
//		});


window.mosFormat = function(obj, member, decimalDigits) {
	if(obj === undefined || obj === null) return '--';
	var value = obj[member];
	if(value === undefined || value === null) return '--';
	if(decimalDigits === undefined) decimalDigits = 0;
    return value.toFixed(decimalDigits).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
};


