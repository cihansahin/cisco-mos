window.ResourceListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var resources = this.model.models;
        var itemContent = '<div class="row-fluid">'
        itemContent += ' <div id="serviceDiv">'
        itemContent += '</div>';
        itemContent += '</div>';
		
		itemTemplate: _.template( "");
		$(this.el).html( this.template({itemTemplate: itemContent}));

        for (var i = 0; i < resources.length; i++) {
            
            var resourceModel = resources[i];
            
            $('#serviceDiv', this.el).append(new ResourceListItemView({model: resourceModel}).render().el);
        }
        return this;
    }
});

window.ResourceListItemView = Backbone.View.extend({
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