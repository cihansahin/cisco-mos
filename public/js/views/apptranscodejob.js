window.AppTranscodeJobView = Backbone.View.extend({
    initialize: function () {
        this.render();
    },

    render: function () {
		var transcodeArray = [];
		
		for(var i = 0; i < this.model.models.length; i++) {
			transcodeArray.push(this.model.models[i].name);
		}
		
		var transcodeObject = {"transcodeList" : transcodeArray};
		
        $(this.el).html(this.template(transcodeObject));
        return this;
    },

    events: {
        "click .save": "beforeTranscodeJob"
    },

    beforeTranscodeJob: function () {
        var transcodeDD =  document.getElementById("transcodeJob");
        if (transcodeDD.options[transcodeDD.selectedIndex].value === "") {
            utils.displayValidationErrors("Select a transcode instance");
            return false;
        }
        this.transcodeJob();
        return false;
    },

    transcodeJob: function () {
		var transcodeDD =  document.getElementById("transcodeJob");
		window.location = "/transcodeJob/" + transcodeDD.options[transcodeDD.selectedIndex].value;
    }

});



