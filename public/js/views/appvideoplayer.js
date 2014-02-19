window.AppVideoPlayerView = Backbone.View.extend({
        initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template(""));
        return this;
    },

        events: {
        "click #recButton": "saveAppInstance",
    },
	
	 saveAppInstance: function () {
		 
		 
		 if($('#carouselul').children(document).length % 5 == 0){
			 var nameVar = 'Capture-MOS-' + (1001 + Math.round(Math.random() * 8998));
			 var captureInstance = new AppInstance({type: "capture", name : nameVar });
			
			
			captureInstance.save(null, {
            success: function (model) {
                //Created capture item
            },
            error: function (info, response) {
                //Failed to create capture item.
            }
        });
			
			 
		 }
		 
	 }
    

});
