window.ServiceInstanceDisplayView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {
		
		//CREATE MODEL PROPERTIES FOR RESOURCE LIST DATA
	
		var resourceList = this.options.resourceList.models[0];
		
		
		console.log (this.model, resourceList );
		
		var channelLineupArray = [];
		var drmTemplateArray = [];
		var abrTemplateArray = [];
		var storagePolicyArray = [];
		var archivePolicyArray = [];
		
		for(var i = 0; i < resourceList.channelLineup.length; i++) {
			channelLineupArray.push(resourceList.channelLineup[i]);
		}
		for(var i = 0; i < resourceList.drmTemplate.length; i++) {
			drmTemplateArray.push(resourceList.drmTemplate[i]);
		}
		for(var i = 0; i < resourceList.abrTemplate.length; i++) {
			abrTemplateArray.push(resourceList.abrTemplate[i]);
		}
		for(var i = 0; i < resourceList.storagePolicy.length; i++) {
			storagePolicyArray.push(resourceList.storagePolicy[i]);
		}
		for(var i = 0; i < resourceList.archivePolicy.length; i++) {
			archivePolicyArray.push(resourceList.archivePolicy[i]);
		}
		
		this.model.set("channelLineupList", channelLineupArray);
		this.model.set("drmTemplateList", drmTemplateArray);
		this.model.set("abrTemplateList", abrTemplateArray);
		this.model.set("storagePolicyList", storagePolicyArray);
		this.model.set("archivePolicyList", archivePolicyArray);
		
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change": "change",
        "click .save": "beforeSave"
    },
    
    change: function (event) {
        
		 utils.hideAlert();
		

        // Apply the change to the model
        var target = event.target;
        var change = {};
		
		if(target.name == "HLS" || target.name == "HSS" || target.name == "HDS" || target.name == "ATIS"){
			
			if(target.checked){
				change[target.name] = true;
			}else{
				change[target.name] = false;
				}
			
		}else{
        	change[target.name] = target.value;
		}
		
		this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target._id);
        if (check.isValid === false) {
            utils.addValidationError(target._id, check.message);
        } else {
            utils.removeValidationError(target._id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveServiceInstance();
        return false;
    },

    saveServiceInstance: function () {
        var self = this;
        console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                
                utils.showAlert('Success!', 'Service saved successfully', 'alert-success');

                console.log(self.options)
                if ( self.options.vent ) {
                    console.log("Triggering ....onSaveComplete");
                    self.options.vent.trigger('onSaveComplete');
                }

                console.log("SERVICE MODEL........" + JSON.stringify(model));
                var url = '/listInstances';
                console.log("MOVING TO URL: " + url);
                app.navigate( url, true );
            },
            error: function (info, response) {
                utils.showAlert('Error', 'Failed to add entry' + JSON.stringify(info) + 
                    "Response" + JSON.stringify(response), 'alert-error');
            }
        });
    },

    dropHandler: function (event) {
        event.stopPropagation();
        event.preventDefault();
        var e = event.originalEvent;
        e.dataTransfer.dropEffect = 'copy';
        this.pictureFile = e.dataTransfer.files[0];

        // Read the image file from the local file system and display it in the img tag
        var reader = new FileReader();
        reader.onloadend = function () {
            $('#picture').attr('src', reader.result);
        };
        reader.readAsDataURL(this.pictureFile);
    }

});
