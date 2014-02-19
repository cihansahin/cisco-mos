window.ChannelLineupListView = Backbone.View.extend({


    vent :  _.extend({}, Backbone.Events),

    initialize: function () {

        _.bindAll(this, "doneSaving");
        this.vent.bind("onSaveComplete", this.doneSaving);
		
		this.render();
    },

    events: {
        'click .new' : 'showForm'
    }, 

    itemTemplate: _.template("<tr><td class='idtd'><input class='radioButtonCustom' type='radio' name='radio' value=<%= id %>><p><%= id %></p></td>" + 
        "<td><%= name %></td>" +
		"<td><%= channels %></td>"), 


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
		this.model.on("change", this.render, this);
		
        var instances = this.model.models;
        var len = instances.length;
		
        $(this.el).html( this.template({items: instances, itemTemplate: this.itemTemplate }));

        return this;
    }

});

