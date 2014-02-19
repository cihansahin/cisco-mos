window.AppInstanceListView = Backbone.View.extend({


    vent :  _.extend({}, Backbone.Events),

    initialize: function () {

        _.bindAll(this, "doneSaving");
        this.vent.bind("onSaveComplete", this.doneSaving);
		
		this.render();
    },

    events: {
        'click .new' : 'showForm'
    }, 

    itemTemplate: _.template("<tr><td class='idtd'><img src='../pics/<%= icon %>'/><input class='radioButtonCustom' type='radio' name='radio' value=<%= type %>/<%= id %>><p><%= id %></p></td>" + 
        "<td><%= name %></td>" + 
        "<td><%= type %></td>" +
		"<%= statusIndicators %>"), 


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
        
//        app.navigate('/app/' + this.options.type + "/listInstances" , true);
    }, 
    render: function () {
		this.model.on("change", this.render, this);
		
        var instances = this.model.models;
        var len = instances.length;
		
		for(var i = 0; i < instances.length; i++) {
			
			var currentInstance = instances[ i ];
			
			<!-- String formatting to ensure proper id name -->
			var idToString = currentInstance._id.toString();
			var idToLowerCase = idToString.toLowerCase();
			var launchID = "launch" + idToLowerCase;
			var configID = "config" + idToLowerCase;
			var initID = "init"  + idToLowerCase;
		
			<!-- Set original notification table row for each instance --->
			switch(currentInstance.runstatus)
			{
			case 1:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorYellow'/></li><li><img id='" +configID + "' class='indicatorClear'/></li><li><img id='" +initID + "' class='indicatorClear'/></li></ul></td></tr>";
  			break;
			case 2:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorRed'/></li><li><img id='" +configID + "' class='indicatorClear'/></li><li><img id='" +initID + "' class='indicatorClear'/></li></ul></td></tr>";
  			break;
			case 3:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorGreen'/></li><li><img id='" +configID + "' class='indicatorYellow'/></li><li><img id='" +initID + "' class='indicatorClear'/></li></ul></td></tr>";
  			break;
			case 4:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorGreen'/></li><li><img id='" +configID + "' class='indicatorRed'/></li><li><img id='" +initID + "' class='indicatorClear'/></li></ul></td></tr>";
  			break;
			case 5:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorGreen'/></li><li><img id='" +configID + "' class='indicatorGreen'/></li><li><img id='" +initID + "' class='indicatorYellow'/></li></ul></td></tr>";
  			break;
			case 6:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorGreen'/></li><li><img id='" +configID + "' class='indicatorGreen'/></li><li><img id='" +initID + "' class='indicatorRed'/></li></ul></td></tr>";
  			break;
			case 7:
  				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorGreen'/></li><li><img id='" +configID + "' class='indicatorGreen'/></li><li><img id='" +initID + "' class='indicatorGreen'/></li></ul></td></tr>";
  			break;
			default:
				currentInstance.statusIndicators = "<td class='statustd'><ul><li><img id='" +launchID + "' class='indicatorClear'/></li><li><img id='" +configID + "' class='indicatorClear'/></li><li><img id='" +initID + "' class='indicatorClear'/></li></ul></td></tr>";;
  			break;
			}
		}
		
		instances.sort(this.sortByName);
		
        $(this.el).html( this.template({type: this.options.type, items: instances, itemTemplate: this.itemTemplate }));

        return this;
    },
	
	sortByName : function(a,b) {
  		if (a.name < b.name)
     		return -1;
  		if (a.name > b.name)
    		return 1;
  		return 0;
	}

});

