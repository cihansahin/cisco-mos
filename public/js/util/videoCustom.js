var myPlayer = _V_("example_video_1");
var myPlayer;
var startVideoAt;
var stopVideoAt;
var recordingStarted;
var recordingStopped;
var numVideos;

//Canvas item variables
var video;
var canvas;
var context;
var ratio;
var w = 200;
var h = 120;

var  recordingDuration = 15.0;
	
videojs.options.flash.swf = "video-js/video-js.swf";

_V_("example_video_1").ready(function(){
	
	videojs.options.flash.swf = "video-js/video-js.swf";
	
	recordingStarted = recordingStopped = null;

    var myPlayer = this;
	myPlayer.volume(0);
	myPlayer.play();
	setButtonPaused(true);
	startVideoAt = 0;
	stopVideoAt = myPlayer.duration();
	
	//Add entire video to playlist
	$("#videoPlayerCarousel ul").append('<li id="><a href="" onclick="playSection('+ 0 + ',' + myPlayer.duration() +');return false;"><img src="../img/defaultCarouselImage.png" /></a></li>');
		
	numVideos = $('#videoPlayerCarousel li').length;
		
	 //Time update function. Fired every 15-250 milliseconds according to videojs documentation
	this.on("timeupdate", function(){
		
		if(recordingStarted){
			
			if((myPlayer.currentTime() - recordingStarted) > recordingDuration){
				onRecButton();
			}
			
		}
		
		//CHECK DURATION
		//Restart section if reaches duration
		if( stopVideoAt > 0 && this.currentTime()  > stopVideoAt){
			myPlayer.pause();
			myPlayer.currentTime(startVideoAt);
			setButtonPaused(false);
		}
           	
      });
		
	//Video Ended
	this.on("ended", function(){ 
    	setButtonPaused(false);
     });
});

function onPlayButton()
{	
	if(myPlayer.paused()){
		myPlayer.play();
		myPlayer.volume(0);
		setButtonPaused(true);
	}else{
		myPlayer.pause();
		setButtonPaused(false);
	}
}
	
function onRecButton()
{
	var currentRecTime = myPlayer.currentTime();
	if(currentRecTime > 0){
			
		if(recordingStarted){
			
			if( !(currentRecTime > recordingStarted)){
				setRecStatusMessage("Video isn't playing");
				return;
			}
			recordingStopped = currentRecTime;
			createCarouselItem();
			setRecStatusMessage("Finished Recording");
			$('#recButtonImg').css("content",'url("../../img/recButton.png")');
		}else{
			setRecStatusMessage("Started Recording");
			recordingStarted = currentRecTime;
			$('#recButtonImg').css("content",'url("../../img/recButtonPressed.png")');
		}	
	}else{
		setRecStatusMessage("Video isn't playing");
	}
}
	
function createCarouselItem(){
	
	var currentCanvasID = "canvasID" + numVideos;
	var currentCarouselID = "carouselItem" + numVideos;
	
	$("#videoPlayerCarousel ul").append('<li  id="'+currentCarouselID+'"><a href="" onclick="playSection('+ recordingStarted + ',' + recordingStopped +');return false;"><canvas id="' + currentCanvasID +'"></canvas></a></li>');
	$('#'+currentCarouselID).hide().fadeIn('slow');
	
	//Get current video snapshot and draw into the canvas nested in the list item
	video = document.querySelector('video');
	canvas = document.getElementById(currentCanvasID);
	context = canvas.getContext('2d');
	canvas.width = w;
	canvas.height = h;
	context.fillRect(0, 0, w, h);
	context.drawImage(video, 0, 0, w, h);	
	
	//Fade the new carousel item in
	
	//Increment the video number
	numVideos++;
	
	//Reset the recoding data
	recordingStarted = recordingStopped = null;
}
	
function playSection(fromTime, toTime)
{
	//Play a certain section based on what is contained in the list item
	
	//Revert any recordings that have started.
	$('#recButtonImg').css("content",'url("../../img/recButton.png")');
	recordingStarted = recordingStopped = null;
	
	stopVideoAt = toTime;
	startVideoAt = fromTime;
	myPlayer.currentTime(fromTime);
	setButtonPaused(true);
	myPlayer.play();
}
	
function setVideoSource(){
	
	//To set a new video source
	myPlayer.src([
		{ type: "video/mp4", src: "http://video-js.zencoder.com/oceans-clip.mp4" },
		{ type: "video/webm", src: "http://video-js.zencoder.com/oceans-clip.webm" },
		{ type: "video/ogg", src: "http://video-js.zencoder.com/oceans-clip.ogv" }
	]);
}

function setRecStatusMessage(message){
	$("#recStatus").stop(true, true);
	$('#recStatus').text(message);
	$('#recStatus').hide().fadeIn('fast');
	$('#recStatus').fadeOut(2000);
}

function setButtonPaused(paused){
	if(paused){
		$('#playPause').css("content",'url("../../img/pauseButton.png")');
	}else{
		$('#playPause').css("content",'url("../../img/playButton.png")');
	}
}
