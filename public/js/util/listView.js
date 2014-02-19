$(document).ready(function () {
	
	var elements = document.getElementsByName('radio');
	if(elements.length > 0) {
		elements[0].checked = true;
		document.getElementById("editInstance").href = "/#app/instance/" + elements[0].value;
	  	document.getElementById("showChartView").href = "/#app/graph/" + elements[0].value;
		document.getElementById("deleteAppInstance").href = "/#app/instance/delete/" + elements[0].value;
	}

});

$("input[type='radio']").click(function() {

 if($(this).is(":checked")) {
	  var group = "input:checkbox[name='" + $(this).attr("name") + "']";
      $(group).prop("checked", false);
      $(this).prop("checked", true);
	  document.getElementById("editInstance").href = "/#app/instance/" +this.value;
	  document.getElementById("showChartView").href = "/#app/graph/" +this.value;
	  document.getElementById("deleteAppInstance").href = "/#app/instance/delete/" +this.value;
 }
 else {
	$(this).prop("checked", true);
 }
 
 });