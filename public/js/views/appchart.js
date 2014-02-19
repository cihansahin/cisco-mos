window.AppChartView = Backbone.View.extend({

    initialize: function() {
		this.render();
    },

    render: function() {
	
		// THIS IS A HACK. BACKBONE, YOU SUCK. SAVING MY DATA TO A GLOBAL TO PASS AN ARGUMENT BECAUSE YOU CHOKE ON IT.
		window.chartData = this.model.toJSON();
		$(this.el).html(this.template());
        return this;
    }

});

