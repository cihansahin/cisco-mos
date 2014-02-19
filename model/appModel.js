var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// MOS APPS

var appTypeSchema = new Schema( {
    name:  { type: String, unique: true},
	description: String,
	type: String,
	picture: String
});

module.exports.appModel = mongoose.model('apps', appTypeSchema);

var appInstanceSchema =  new Schema( {
	name : { type: String, unique: true}, 
	type : String,
	subType: Number,
	icon: String,
	minWorkers: Number,
	workers: Number,
	maxWorkers: Number,
	encoding: String,
	activeRecordings: Number,
	scheduledRecordings: Number,
	archivedRecordings: Number,
	activePlaybacks: Number,
	storageUsed: Number,
	storageCapacity: Number,
	cpuPercent: Number,
	memoryPercent: Number,
	bandwidthPercent: Number,
	runstatus: Number
});

module.exports.registerAppMiddleWare = function(hooks) {

	for (var property in hooks) {
		if (hooks.hasOwnProperty(property)) {
			appInstanceSchema.post(property, hooks[property]);
		}
	}
}

module.exports.createAppModel = function(type) {
	return mongoose.model(type, appInstanceSchema);
}

// MOS SERVICES

var serviceTypeSchema = new Schema( {
    name:  { type: String, unique: true},
	description: String,
	type: String,
	picture: String
});

module.exports.serviceModel = mongoose.model('services', serviceTypeSchema);

var serviceInstanceSchema =  new Schema( {
	name : { type: String, unique: true}, 
	type : String, 
	icon: String,
	size: Number,
	channelLineup: String,
	encryption: Boolean,
	inputVideoFormat: String,
	storagePolicy: String,
	archivePolicy: String,
	abrProfile: String,
	drmProfile: String,
	outputFormats: [String],
	captureInstances: [String],
	storeInstances: [String],
	playInstances: [String],
	transcodeInstances: [String],
	runstatus: Number
});

module.exports.registerServiceMiddleWare = function(hooks) {

	for (var property in hooks) {
		if (hooks.hasOwnProperty(property)) {
			serviceInstanceSchema.post(property, hooks[property]);
		}
	}
}

module.exports.createServiceModel = function(type) {
	return mongoose.model(type, serviceInstanceSchema);
}

// ABR TEMPLATE
 
var abrTemplateSchema = new Schema( {
    name:  { type: String, unique: true},
	mpegTS: String,
	hls: Boolean,
	hds: Boolean,
	hss: Boolean,
	profiles: [String]
});

module.exports.abrTemplateModel = mongoose.model('abrTemplate', abrTemplateSchema);

// DRM

var drmTemplateSchema = new Schema( {
    name:  { type: String, unique: true},
	path: String
});

module.exports.drmTemplateModel = mongoose.model('drmTemplate', drmTemplateSchema);

// CONTENT VOLUME

var contentVolumeSchema = new Schema( {
    name:  { type: String, unique: true},
	protocol: String,
	path: String,
	username: String,
	password: String
});

module.exports.contentVolumeModel = mongoose.model('contentVolume', contentVolumeSchema);

// ARCHIVE POLICY

var archivePolicySchema = new Schema( {
    name:  { type: String, unique: true},
	archiveInDays: Number,
	volume: String,
	drm: String
});

module.exports.archivePolicyModel = mongoose.model('archivePolicy', archivePolicySchema);

// STORAGE POLICY

var storagePolicySchema = new Schema( {
    name:  { type: String, unique: true},
	retention: Number,
	drm: String,
	volume: String,
	archivePolicy: String
});

module.exports.storagePolicyModel = mongoose.model('storagePolicy', storagePolicySchema);

// CHANNEL 

var channelSchema = new Schema( {
    name:  { type: String, unique: true},
	channelId: Number,
	logo: String,
	abr: String,
	storagePolicy: String,
	playoutMpegTs: Boolean,
	playoutABR: Boolean,
	encryption: Boolean,
	retentionDays: Number
});

module.exports.channelModel = mongoose.model('channel', channelSchema);

// CHANNEL LINEUP

var channelLineupSchema = new Schema( {
    name:  { type: String, unique: true},
	channels: [String]
});

module.exports.channelLineupModel = mongoose.model('channelLineup', channelLineupSchema);
