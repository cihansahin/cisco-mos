$(document).ready(function () {
	
	function testExample () {

		// We use an inline data source in the example, usually data would
		// be fetched from a server

		var data = [],
			totalPoints = 300;

		function getRandomData() {

			if (data.length > 0)
				data = data.slice(1);

			// Do a random walk

			while (data.length < totalPoints) {

				var prev = data.length > 0 ? data[data.length - 1] : 50,
					y = prev + Math.random() * 10 - 5;

				if (y < 0) {
					y = 0;
				} else if (y > 100) {
					y = 100;
				}

				data.push(y);
			}

			// Zip the generated y values with the x values

			var res = [];
			for (var i = 0; i < data.length; ++i) {
				res.push([i, data[i]])
			}

			return res;
		}

		// Set up the control widget

		var updateInterval = 2000;
		$("#updateInterval").val(updateInterval).change(function () {
			var v = $(this).val();
			if (v && !isNaN(+v)) {
				updateInterval = +v;
				if (updateInterval < 1) {
					updateInterval = 1;
				} else if (updateInterval > 2000) {
					updateInterval = 2000;
				}
				$(this).val("" + updateInterval);
			}
		});

		var plot = $.plot("#placeholder", [ getRandomData() ], {
			series: {
				shadowSize: 0	// Drawing is faster without shadows
			},
			yaxis: {
				min: 0,
				max: 100
			},
			xaxis: {
				show: false
			}
		});

		function update() {

			plot.setData([getRandomData()]);
			
			

			// Since the axes don't change, we don't need to call plot.setupGrid()

			plot.draw();
			setTimeout(update, updateInterval);
		}

		update();
		
		var testVal = 100;
		$("#testVal").val(testVal).change(function () {
			var v = $(this).val();
			if (v && !isNaN(+v)) {
				testVal = +v;
				if (testVal < 1) {
					testVal = 1;
				} else if (testVal > 2000) {
					testVal = 2000;
				}
				$(this).val("" + testVal);
				
				console.log(testVal);
			}
		});

		// Add the Flot version string to the footer

		$("#footer").prepend("Flot " + $.plot.version + " &ndash; ");
	};
	
	function lineGraphVarSetup () {
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

		var colors = [ "#ef754a", "#2abf9e", "#00AAFF",  "#FFA93C" ];
		var stack = 1,
			bars = true,
			lines = false,
			steps = false;

		function graphPlot () {
			if( $("#flot-line-filled").length > 0 ){
				$.plot (
					$("#flot-line-filled"), [ d1, d2, d4 ], {
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
							show:true,
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
		}
	
	
	
		graphPlot();
	}
	
	lineGraphVarSetup();
});