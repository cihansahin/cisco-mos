window.ChannelInstanceListView = Backbone.View.extend({


    vent :  _.extend({}, Backbone.Events),

    initialize: function () {

        _.bindAll(this, "doneSaving");
        this.vent.bind("onSaveComplete", this.doneSaving);
		
		this.render();
    },

    events: {
        'click .new' : 'showForm'
    }, 
	
	

    itemTemplate: _.template("<tr><td class='idtd'><img src='../pics/channelLogos/<%= logo %>'/><input class='radioButtonCustom' type='radio' name='radio' value=<%= _id %>><p><%= channelId %></p></td>" + 
        "<td><%= name %></td>" + 
        "<td><%= abr %></td>" +
		"<td><%= storagePolicy %></td>" +
		"<td><%= retentionDays %></td>" +
		"<%= playoutMpegTsStatus %>" +
		"<%= playoutABRStatus %>" +
		"<%= encryptionStatus %>"), 


    showForm: function() {
        var channelInstance = new ChannelInstance(null);
        $('.controls', this.el).append(new ChannelAddInstanceView({model: channelInstance, vent: this.vent}).render().el);
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
			
			if(currentInstance.attributes.playoutMpegTs){
				currentInstance.playoutMpegTsStatus = "<td class='statustd'><img id='mpeg' class='indicatorGreen'/></td>";
			}else{
				currentInstance.playoutMpegTsStatus = "<td class='statustd'><img id='mpeg' class='indicatorClear'/></td>";
			}
			
			if(currentInstance.attributes.playoutABR){
				currentInstance.playoutABRStatus = "<td class='statustd'><img id='mpeg' class='indicatorGreen'/></td>";
			}else{
				currentInstance.playoutABRStatus = "<td class='statustd'><img id='mpeg' class='indicatorClear'/></td>";
			}
			
			if(currentInstance.attributes.encryption){
				currentInstance.encryptionStatus = "<td class='statustd'><img id='mpeg' class='indicatorGreen'/></td></tr>";
			}else{
				currentInstance.encryptionStatus = "<td class='statustd'><img id='mpeg' class='indicatorClear'/></td></tr>";
			}
	
		}
		
		
        $(this.el).html( this.template({items: instances, itemTemplate: this.itemTemplate }));

        return this;
    }

});

