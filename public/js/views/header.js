window.HeaderView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    },
	
	 hideInstanceOptions: function () {
		document.getElementById("subHeader").style.visibility = "visible";
		document.getElementById("headerAddButton").style.visibility = "hidden";
		document.getElementById("headerActionsButton").style.visibility = "hidden";
    },
	
	showInstanceOptions: function () {
		document.getElementById("subHeader").style.visibility = "visible";
        document.getElementById("headerAddButton").style.visibility = "visible";
		document.getElementById("headerActionsButton").style.visibility = "visible";

    },
	
	hideSubHeader: function () {
		document.getElementById("subHeader").style.visibility = "hidden";
		document.getElementById("headerAddButton").style.visibility = "hidden";
		document.getElementById("headerActionsButton").style.visibility = "hidden";
		document.getElementById("header").style.height = "20px";

    }

});

window.HeaderBasicView = Backbone.View.extend({

    initialize: function () {
        this.render();
    },

    render: function () {
        $(this.el).html(this.template());
        return this;
    },

    selectMenuItem: function (menuItem) {
        $('.nav li').removeClass('active');
        if (menuItem) {
            $('.' + menuItem).addClass('active');
        }
    },
	
	 hideInstanceOptions: function () {
    },
	
	showInstanceOptions: function () {

    },
	
	hideSubHeader: function () {

    }

});