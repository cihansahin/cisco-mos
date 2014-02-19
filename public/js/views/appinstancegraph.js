window.AppInstanceGraphView = Backbone.View.extend({
initialize: function () {
        this.render();
	    //this.listenTo(this.model, "change", this.render);
	    this.model.on("change", this.render, this);
    },

    render: function () {
        $(this.el).html(this.template(this.model.toJSON()));
        return this;
    },

});

