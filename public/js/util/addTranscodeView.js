$(document).ready(function () {
	
	
	document.getElementById('http').style.display = 'none';
	
	$( "#storageURL" ).change(function() {
		
		var e = document.getElementById("storageURL");
		var storagestring = e.options[e.selectedIndex].value;
		
		if(storagestring == "ftp://" || storagestring == "webdav-ssl://" )
		{
			document.getElementById('ftp').style.display = 'block';
			document.getElementById('http').style.display = 'none';
		}else if(storagestring == "http://" || storagestring == "https://")
		{
			document.getElementById('ftp').style.display = 'none';
			document.getElementById('http').style.display = 'block';
		}else{
			document.getElementById('ftp').style.display = 'none';
			document.getElementById('http').style.display = 'none';
		}
		
  		
	});
 
 });