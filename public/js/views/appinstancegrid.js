window.AppInstanceGridView = Backbone.View.extend({


    vent :  _.extend({}, Backbone.Events),

    initialize: function () {

        _.bindAll(this, "doneSaving");
        this.vent.bind("onSaveComplete", this.doneSaving);
		
		//Get All Instances
		
		var self = this;
		this.render();
    },

    events: {
        'click .new' : 'showForm'
    }, 

    itemTemplate: _.template(""), 


    showForm: function() {
        var appInstance = new AppInstance({type: this.options.type});
        $('.controls', this.el).append(new AppInstanceView({model: appInstance, vent: this.vent}).render().el);
    }, 

    doneSaving: function() {
        $('.controls', this.el).html("");
        var self = this;
        this.model.fetch({success: function(){
            self.render();
        }});

    }, 
    render: function () {
		
	
        var instances = this.model.models;
        var len = instances.length;

		//Content template for grid items
        var itemContent = '<div class="container" style="width:inherit;"  >';
        itemContent += ' <div id="apps" class="box-padding masonry" style="padding:0px" >'
        itemContent += '</div>';
        itemContent += '</div>';
		
		itemTemplate: _.template( "");
		
		 $(this.el).html( this.template({itemTemplate: itemContent}));


        for (var i = 0; i < len; i++) {
            
            var instance = instances[i];

            
            $('#apps', this.el).append(new AppGridItemView({model: instance}).render().el);
        }


        return this;
    }

});

window.AppGridItemView = Backbone.View.extend({

    //tagName: "li",

    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
		
		//Background colour for grid item. Temporary.
		var instance = this.model;
		
		var black = "#333333";
		var green = "#32be9b";
		var yellow = "#FDAB17";
		var red = "#CC4C39";
		
		var clearNotification = "indicatorClear";
		var greenNotification = "indicatorGreen";
		var yellowNotification = "indicatorYellow";
		var redNotification = "indicatorRed";
		
		switch(instance.runstatus)
			{
			case 1:
				this.model.set({ color: yellow });
				this.model.set({ launch: yellowNotification });
				this.model.set({ config: clearNotification });
				this.model.set({ init: clearNotification });
  			break;
			case 2:
				this.model.set({ color: red });
				this.model.set({ launch: redNotification });
				this.model.set({ config: clearNotification });
				this.model.set({ init: clearNotification });
  			break;
			case 3:
				this.model.set({ color: yellow });
				this.model.set({ launch: greenNotification });
				this.model.set({ config: yellowNotification });
				this.model.set({ init: clearNotification });
  			break;
			case 4:
				this.model.set({ color: red });
				this.model.set({ launch: greenNotification });
				this.model.set({ config: redNotification });
				this.model.set({ init: clearNotification });
  			break;
			case 5:
				this.model.set({ color: yellow });
				this.model.set({ launch: greenNotification });
				this.model.set({ config: greenNotification });
				this.model.set({ init: yellowNotification });
  			break;
			case 6:
				this.model.set({ color: red });
				this.model.set({ launch: greenNotification });
				this.model.set({ config: greenNotification });
				this.model.set({ init: redNotification });
  			break;
			case 7:
				this.model.set({ color: green });
				this.model.set({ launch: greenNotification });
				this.model.set({ config: greenNotification });
				this.model.set({ init: greenNotification });
  			break;
			default:
				this.model.set({ color: black });
				this.model.set({ launch: clearNotification });
				this.model.set({ config: clearNotification });
				this.model.set({ init: clearNotification });
  			break;
			}
		
		//Render each grid item. See AppGridItemView.
        $(this.el).html(this.template(this.model.toJSON()));

        return this;
    }

});

