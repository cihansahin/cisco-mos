window.ServiceListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var services = this.model.models;
		//Template for service grid items
        var itemContent = '<div class="row-fluid">'
        itemContent += ' <div id="serviceDiv">'
        itemContent += '</div>';
        itemContent += '</div>';
		
		itemTemplate: _.template( "");
		$(this.el).html( this.template({itemTemplate: itemContent}));

        for (var i = 0; i < services.length; i++) {
            
            var serviceModel = services[i];
            
            $('#serviceDiv', this.el).append(new ServiceListItemView({model: serviceModel}).render().el);
        }
        return this;
    }
});

window.ServiceListItemView = Backbone.View.extend({
    initialize: function () {
        this.model.bind("change", this.render, this);
        this.model.bind("destroy", this.close, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        var elem = "#" + this.model.attributes.name; 
        return this;
    }

});