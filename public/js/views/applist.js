window.AppListView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        var apps = this.model.models;
        var instances = this.options.model2;

        var len = apps.length;
        var startPos = (this.options.page - 1) * 8;
        var endPos = Math.min(startPos + 8, len);

		//Content template for grid items
        var itemContent = '<div class="row-fluid">'
        itemContent += ' <div id="apps">'
        
        itemContent += '</div>';
        itemContent += '</div>';


		itemTemplate: _.template( "");
		
		$(this.el).html( this.template({itemTemplate: itemContent}));

        //$(this.el).html(ui);

        for (var i = startPos; i < endPos; i++) {
            
            var appModel = apps[i];
            var appType = appModel.attributes.type;
            var appName = appModel.attributes.name;
            
            $('#apps', this.el).append(new AppListItemView({model: appModel}).render().el);
        }

        //$(this.el).append(new Paginator({model: this.model, page: this.options.page}).render().el);

        return this;
    }
});

window.AppListItemView = Backbone.View.extend({

    //tagName: "li",

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