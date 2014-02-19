$(document).ready(function () {
	
	var elements = document.getElementsByName('radio');
	if(elements.length > 0) {
		elements[0].checked = true;
		document.getElementById("editInstance").href = "/#services/instance/" + elements[0].value;
	  	document.getElementById("showChartView").href = "/#services/graph/" + elements[0].value;
		document.getElementById("deleteAppInstance").href = "/#services/instance/delete/" + elements[0].value;
	}

});

$("input[type='radio']").click(function() {

 if($(this).is(":checked")) {
	  var group = "input:checkbox[name='" + $(this).attr("name") + "']";
      $(group).prop("checked", false);
      $(this).prop("checked", true);
	  document.getElementById("editInstance").href = "/#services/instance/" +this.value;
	  document.getElementById("showChartView").href = "/#services/graph/" +this.value;
	  document.getElementById("deleteAppInstance").href = "/#services/instance/delete/" +this.value;
 }
 else {
	$(this).prop("checked", true);
 }
 
 });