window.AppInstanceDisplayView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

    events: {
        "change": "change",
        "click .save": "beforeSave",
        "click .delete": "deleteAppInstance",
    },
    
    change: function (event) {
        // Remove any existing alert message
        utils.hideAlert();

        // Apply the change to the model
        var target = event.target;
        var change = {};
        change[target.name] = target.value;
        this.model.set(change);

        // Run validation rule (if any) on changed item
        var check = this.model.validateItem(target.id);
        if (check.isValid === false) {
            utils.addValidationError(target.id, check.message);
        } else {
            utils.removeValidationError(target.id);
        }
    },

    beforeSave: function () {
        var self = this;
        var check = this.model.validateAll();
        if (check.isValid === false) {
            utils.displayValidationErrors(check.messages);
            return false;
        }
        this.saveAppInstance();
        return false;
    },

    saveAppInstance: function () {
        var self = this;
        console.log('before save');
        this.model.save(null, {
            success: function (model) {
                self.render();
                
                utils.showAlert('Success!', 'App saved successfully', 'alert-success');
                //app.navigate('/app', true);
                
                console.log(self.options)
                if ( self.options.vent ) {
                    console.log("Triggering ....onSaveComplete");
                    self.options.vent.trigger('onSaveComplete');
                }

                console.log("APP MODEL........" + JSON.stringify(model));
                var url = '/listInstances';
                console.log("MOVING TO URL: " + url);
                app.navigate( url, true );

                //app.navigate('/app/' + model.type + "/listInstances" , true);
            },
            error: function (info, response) {
                utils.showAlert('Error', 'Failed to add entry' + JSON.stringify(info) + 
                    "Response" + JSON.stringify(response), 'alert-error');
            }
        });
    },

    deleteAppInstance: function () {
        this.model.destroy({
            success: function () {
                alert('App deleted successfully');
                window.history.back();
            }
        });
        return false;
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
