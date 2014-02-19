



window.HomeView = Backbone.View.extend({

    initialize:function () {
        this.render();
    },

    drawGraph: function() {

    	console.log("CALLING DRAW GRAPH ")
		var d1 = [];
		for (var i = 0; i <= 10; i += 1) { d1.push([i, parseInt(Math.random() * 30)]); }
		var d2 = [];
		for (var i = 0; i <= 10; i += 1) { d2.push([i, parseInt(Math.random() * 30)]); }
		var d3 = [];
		for (var i = 0; i <= 10; i += 1) { d3.push([i, parseInt(Math.random() * 30)]); }
		var d4 = [];
		for (var i = 0; i <= 10; i += 1) { d4.push([i, parseInt(Math.random() * 30)]); }

		var e1 =[];
		for (var i = 0; i <= 7; i += 1) { e1.push([i, parseInt(Math.random() * 30)]); }

		var colors = [ "#ef754a", "#2abf9e",  "#FFA93C", "#AC193D"];
		var stack = 1,
			bars = true,
			lines = false,
			steps = false;


		if( $("#flot-front", this.el).length > 0 ){
			console.log("FLOT FRONT ????")

			console.log( $('#flot-front', this.el));
			$.plot (
				$("#flot-front", this.el), [ d1, d2 ], {
					xaxis: {
						font: {
						    color: "#ccc",
						    size: 12,
						}
					},
					yaxis: {
						font: {
						    color: "#ccc",
						    size: 12,
						}
					},
				    series: {
						lines: { 
							show: true,
							lineWidth: 5,
							fill: .8,
						},
						points: { 
							show: true,
							radius: 0,
						},
					},
					grid: {
						show:false,
						clickable: true,
					    hoverable: true,
					    autoHighlight: true,
					    mouseActiveRadius: 10,
					    aboveData: true,
					    backgroundColor: "#333",
					    borderWidth: 0,
					    minBorderMargin: 25,
					},
					colors: colors,
				    shadowSize: 0,
				}
			);
		
		}
    }, 

    render:function () {
        $(this.el).html(this.template());
        this.drawGraph();
        return this;
    }

});



