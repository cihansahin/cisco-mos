var AppRouter = Backbone.Router.extend({
	
	currentContent: null,
	summaryData: null,
	chartData: null,

    routes: {
        '': 'home',
        'apps': 'list',
        'app/page/:page': 'list',
        'app/add': 'addApp',
        'app/:typeId/launchInstance': 'launchInstance', 
        'app/:typeId/addInstance': 'addInstance',
        'app/:typeId/listInstances': 'listInstances', 
        'app/instance/:typeId/:instanceId': 'showInstance',
		'app/graph/:typeId/:instanceId': 'showChartView',
        'app/instance/delete/:typeId/:instanceId': 'deleteAppInstance',
        'app/:type/display/:name': 'displayInstance',
		'app/transcodeJob': 'transcodeJob',
		'services': 'listServices',
		'services/:typeId/addInstance': 'addServiceInstance',
		'services/instances': 'listServiceInstances',
		'services/instanceGrid': 'gridServiceInstances',
		'services/instance/:typeId/:instanceId': 'showService',
		'services/instance/delete/:typeId/:instanceId': 'deleteServiceInstance',
		'resources': 'listResources',
		'channel': 'listChannels',
		'channel/addInstance': 'addChannelInstance',
		'channel/instance/:instanceId': 'showChannelInstance',
		'channel/instance/delete/:instanceId': 'deleteChannelInstance',
		'channelLineup': 'listChannelLineups',
		'abrTemplate': 'listResources',
		'drmTemplate': 'listResources',
		'contentVolume': 'listResources',
		'archivePolicy': 'listResources',
		'storagePolicy': 'listResources',
        'about': 'about',
		'listInstances': 'listInstances',
		'gridInstances': 'gridInstances',
		'player': 'videoPlayer',
    },

    initialize: function () {
		this.headerView = new HeaderView();
        this.headerBasicView = new HeaderBasicView();
        $('.header').html(this.headerView.el);
		this.summaryData = new SummaryData({});
		this.chartData = new ChartData({});
		this.startAppManagerBroadcast();
    },

    home: function (id) {
		currentContent = 'home';
        if (!this.homeView) {
            this.homeView = new HomeView();
        }
        $('#contentMain').html(this.homeView.el);
        this.setHeaderWithoutOptions("Media Origination System");
		this.hideSummaryView();
    },

	list: function(page) {
		currentContent = 'list';
        var p = page ? parseInt(page, 10): 1;
        var appList = new AppCollection();
        appList.fetch({success: function() {
                $('#contentMain').html(new AppListView({model: appList, page: p}).el);
        }});
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
    },

    addInstance: function(typeId) {
		currentContent = 'addInstance';
        var app = new AppInstance({type: typeId});
        $('#contentMain').html(new AppAddInstanceView({model: app}).el);
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
    }, 

    launchInstance: function(typeId) {
		currentContent = 'launchInstance';
        var app = new AppLauncher({type: typeId});
        app.save();
        $('#contentMain').html(new AppLauncherView({model: app}).el);
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
    },

    listInstances: function(typeId) {
		currentContent = 'listInstances';
        
		instanceList = new AppAllInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new AppInstanceListView({model: instanceList}).el);
        }});
		
		this.setHeaderWithOptions("Applications");
		this.showSummaryView();
    },

	gridInstances: function(typeId) {
		currentContent = 'gridInstances';
		
		instanceList = new AppAllInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new AppInstanceGridView({model: instanceList}).el);
        }});
		
        this.setHeaderWithOptions("Applications");
		this.showSummaryView();
    },

    showInstance: function(typeId, instanceId) {
		currentContent = 'showInstance';
        var instance = new AppInstance({type: typeId, _id: instanceId});
        instance.fetch({success: function() {
            $('#contentMain').html(new AppInstanceDisplayView({model: instance}).el);
        }});
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
    },

    displayInstance: function( typeId, nameId) {
		currentContent = 'displayInstance';
        //console.log('Calling Display Instance with' + typeId + ' ' + nameId);
        var instance = new AppInstanceDisplay({type: typeId, name: nameId});
        $('#contentMain').html(new AppInstanceDisplayView({model: instance}).el);
		this.setHeaderWithoutOptions("Applications");
		this.showSummaryView();
       
    },
	
	transcodeJob: function() {
		currentContent = 'transcode';
        var instances = new AppInstanceCollection({type: "transcode"});
        instances.fetch({success: function() {
			$('#contentMain').html(new AppTranscodeJobView({model: instances}).el);
        }});
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
       
    },
	
	showChartView: function() {
	
		currentContent = 'showChartView';
        var cd = this.chartData;
        cd.fetch({ success: function() {
			//console.log('showChartView: cd = ' + JSON.stringify(cd.toJSON()));
            $('#contentMain').html(new AppChartView({model: cd}).el);
        }});
        this.setHeaderWithoutOptions("Applications");
		this.showSummaryView();
	},
	
    deleteAppInstance: function(typeId, instanceId) {
		
		currentContent = 'deleteAppInstance';
        var instance = new AppInstance({type: typeId, _id: instanceId});
        instance.fetch({success: function() {
            instance.destroy( {success: function () {
                console.log('DESTROYED');
            }});
        }});
        window.history.back();
        this.headerView.selectMenuItem();
		this.hideSummaryView();
    },

    appDetails: function (id) {
		currentContent = 'appDetails';
        var app = new App({_id: id});
        app.fetch({success: function() {
            $('#contentMain').html(new AppView({model: app}).el);
        }});
        this.headerView.selectMenuItem();
		this.hideSummaryView();
    },

	addApp: function() {
		currentContent = 'addApp';
        var app = new App();
        $('#contentMain').html(new AppView({model: app}).el);
        this.headerView.selectMenuItem('add-menu');
		this.hideSummaryView();
	},
	
	listServices: function(page) {
		currentContent = 'listServices';
        var p = page ? parseInt(page, 10): 1;
        var appList = new ServiceCollection();
        appList.fetch({success: function() {
                $('#contentMain').html(new ServiceListView({model: appList, page: p}).el);
        }});
        this.setHeaderWithoutOptions("Services");
		this.hideSummaryView();
    },
	
	addServiceInstance: function(typeId) {
		currentContent = 'addServiceInstance';
        var app = new ServiceInstance({type: typeId});
		var resourceList = new ResourceDataCollection();
		resourceList.fetch({success: function() {
        	$('#contentMain').html(new ServiceAddInstanceView({model: app, resourceList : resourceList}).el);
		}});
        this.setHeaderWithoutOptions("Services");
		this.hideSummaryView();
    },
	
	listServiceInstances: function(typeId) {
		currentContent = 'listServiceInstances';
		instanceList = new ServiceAllInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new ServiceInstanceListView({model: instanceList}).el);
        }});
		
		this.setHeaderWithOptions("Services");
		this.showSummaryView();
    },
	
	gridServiceInstances: function(typeId) {
		currentContent = 'gridServiceInstances';
		instanceList = new ServiceAllInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new ServiceInstanceGridView({model: instanceList}).el);
        }});
		
		this.setHeaderWithOptions("Services");
		this.showSummaryView();
    },
	
	showService: function(typeId, instanceId) {
		currentContent = 'show';
        var instance = new ServiceInstance({type: typeId, _id: instanceId});
        instance.fetch({success: function() {	
			var resourceList = new ResourceDataCollection();
			resourceList.fetch({success: function() {
				$('#contentMain').html(new ServiceInstanceDisplayView({model: instance, resourceList : resourceList}).el);
			}});
        }});
        this.setHeaderWithoutOptions("Services");
		this.showSummaryView();
    },
	
	deleteServiceInstance: function(typeId, instanceId) {
		
		currentContent = 'delete';
        var instance = new ServiceInstance({type: typeId, _id: instanceId});
        instance.fetch({success: function() {
            instance.destroy( {success: function () {
                console.log('DESTROYED');
            }});
        }});
        window.history.back();
        this.headerView.selectMenuItem();
		this.hideSummaryView();
    },
	
	listResources: function(page) {
		currentContent = 'listResources';
        var p = page ? parseInt(page, 10): 1;
        var appList = new ResourceCollection(); 
        appList.fetch({success: function() {
                $('#contentMain').html(new ResourceListView({model: appList, page: p}).el);
        }});
        this.setHeaderWithoutOptions("Resources");
		this.hideSummaryView();
    },
	
	listChannelLineups: function(typeId) {
		currentContent = 'listChannelLineups';
		instanceList = new ChannelLineupInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new ChannelLineupListView({model: instanceList}).el);
        }});
		
		this.setHeaderWithOptions("Channel Lineup");
		this.hideSummaryView();
    },
	
	listChannels: function(typeId) {
		currentContent = 'listChannels';
		instanceList = new ChannelInstanceCollection();
		instanceList.fetch({success: function() {
             $('#contentMain').html(new ChannelInstanceListView({model: instanceList}).el);
        }});
		
		this.setHeaderWithOptions("Channel");
		this.hideSummaryView();
    },
	
	addChannelInstance: function() {
		currentContent = 'addChannelInstance';
        var channel = new ChannelInstance(null);
		var resourceList = new ResourceDataCollection();
		resourceList.fetch({success: function() {
			$('#contentMain').html(new ChannelAddInstanceView({model: channel, resourceList : resourceList}).el);
		}});
        this.setHeaderWithoutOptions("Channel");
		this.hideSummaryView();
    },
	
	showChannelInstance: function(instanceId) {
		currentContent = 'showChannel';
        var instance = new ChannelInstance({_id: instanceId});
        instance.fetch({success: function() {
			var resourceList = new ResourceDataCollection();
			resourceList.fetch({success: function() {
				$('#contentMain').html(new ChannelInstanceDisplayView({model: instance, resourceList : resourceList}).el);
			}});
        }});
        this.setHeaderWithoutOptions("Applications");
		this.hideSummaryView();
    },
	
	deleteChannelInstance: function(instanceId) {
		console.log("delete channel");
		currentContent = 'delete';
        var instance = new ChannelInstance({_id: instanceId});
        instance.fetch({success: function() {
            instance.destroy( {success: function () {
                console.log('DESTROYED');
            }});
        }});
        window.history.back();
        this.headerView.selectMenuItem();
		this.hideSummaryView();
    },

    about: function () {
		currentContent = 'about';
        if (!this.aboutView) {
            this.aboutView = new AboutView();
        }
        $('#contentMain').html(this.aboutView.el);
        this.headerView.selectMenuItem('about-menu');
		this.hideSummaryView();
    },
    
    videoPlayer: function() {
		currentContent = 'videoPlayer';
        $('#contentMain').html(new AppVideoPlayerView().el);
		this.headerView.hideInstanceOptions();
		this.setBasicHeader();
		this.hideSummaryView();
		
    },
	
    showSummaryData: function() {
	
		var sd = this.summaryData;
		sd.fetch({success: function() {
            $('#summarydata').html(new SummaryDataView({model: sd}).el);
        }});
    },

	startAppManagerBroadcast: function() {
	
		var self = this;
		
		appManagerEvents.on('any', function(data) {

			console.log('on any currentContent = ' + currentContent);
			
			if (currentContent == 'listInstances') {
				self.listInstances();
			} else if (currentContent == 'gridInstances') {
				self.gridInstances();
			} else if(currentContent == 'listServiceInstances'){
				self.listServiceInstances();
			} else if (currentContent == 'gridServiceInstances') {
				self.gridServiceInstances();
			}
        });
	},

	showSummaryView: function() {
		var sd = this.summaryData;
		sd.fetch({success: function() {
            $('#summarydata').html(new SummaryDataView({model: sd}).el);
			$('#summarydata').css('width', '375px');
			$('#contentMain').css('width', '675px');
			$('#contentMain').css('float', 'left');
        }});
	},
	
	hideSummaryView: function() {
		$('#summarydata').html('');
		$('#summarydata').css('width', '0px');
		$('#contentMain').css('width', '1050px');
		$('#contentMain').css('float', 'none');
		
	},
	
	setHeaderWithOptions: function(subTitle) {
		//$('html,body').scrollTop(0);
		$('.header').html(this.headerView.el);
		this.headerView.showInstanceOptions();
		$('.header').css("height", "60px");
		
		//Set Title in header
		var subHeaderTitle = document.getElementById('subHeaderTitle');
		subHeaderTitle.innerHTML = "<img src='../img/appIcon.png'/>" + subTitle;
		
		var headerAddButton = document.getElementById('headerAddButton');
		var listButton = document.getElementById('listButton');
		var gridButton = document.getElementById('gridButton');
		
		if(subTitle == "Services"){
			headerAddButton.innerHTML = "ADD SERVICE";
			headerAddButton.href = "/#services";
			listButton.href = "/#services/instances";
			gridButton.href = "/#services/instanceGrid";
		}else if(subTitle == "Channel"){
			headerAddButton.innerHTML = "ADD CHANNEL";
			headerAddButton.href = "/#channel/addInstance";
			listButton.href = "/#channel";
			gridButton.href = "/#channel";
		}else if(subTitle == "Channel Lineup"){
			headerAddButton.innerHTML = "ADD CHANNEL LINEUP";
			headerAddButton.href = "/#apps";
		}else{
			headerAddButton.innerHTML = "ADD APP";
			headerAddButton.href = "/#apps";
			listButton.href = "/#listInstances";
			gridButton.href = "/#gridInstances";
		}
		
	},
	
	setHeaderWithoutOptions: function(subTitle) {
		//$('html,body').scrollTop(0);
		$('.header').html(this.headerView.el);
		this.headerView.hideInstanceOptions();
		$('.header').css("height", "60px");
		
		//Set Title in header
		var subHeaderTitle = document.getElementById('subHeaderTitle');
		subHeaderTitle.innerHTML = "<img src='../img/appIcon.png'/>"  + subTitle;
	},
	
	setBasicHeader: function() {
		//$('html,body').scrollTop(0);
		$('.header').html(this.headerBasicView.el);
		$('.header').css("height", "0px");
	}
	
});

utils.loadTemplate(['HomeView', 'HeaderView', 'HeaderBasicView', 'SummaryDataView', 'AppAddInstanceView', 'AppInstanceDisplayView',
    'AppView', 'AppListItemView', 'AppGridItemView', 'AppInstanceListView', 'AppInstanceGridView', 'AppChartView', 'AppListView', 'AppLauncherView', 'AppTranscodeJobView', 'ServiceListView', 'ServiceListItemView', 'ServiceAddInstanceView', 'ServiceInstanceListView', 'ServiceInstanceGridView', 'ServiceGridItemView', 'ServiceInstanceDisplayView', 'ResourceListView', 'ResourceListItemView', 'ChannelLineupListView', 'ChannelInstanceListView', 'ChannelAddInstanceView', 'ChannelInstanceDisplayView', 'AboutView', 'AppVideoPlayerView'],
     function() {
    app = new AppRouter();
    Backbone.history.start();
});
