/* --------------------------------------------------------------------------------------------------- 
 * BuildTool - WebView
 * 
 * @author	Robin Bonnes <http://robinbonnes.nl/>
 * @version	1.0
 *
 * Copyright (C) 2013 Robin Bonnes. All rights reserved.
 * 
 * Description:
 * 
 * Webview that will load a webpage. When you don't have an internet connection it will show a dialog message.
 *
 * -------------------------------------------------------------------------------------------------- */

/*
To fix:
 - Back button not going back a page, but going back to the main loading page
 - Stop loading redirect requests in new window links


Links opening in external browser, however only once
After that happens, they will not open again and loadstart/loadstop fails


*/

/*
 * Default Settings
 */

// Settings
var debug 		= false;
var busy 		= false;
var iabRef		= null;
var config 		= "config.xml";

// Options
var url, gradient_start, gradient_stop, font_color, button_background, button_font, title;
	
// Get from config
if(debug){
	config = "config.xml";
}

/* --------------------------------------------------------------------------------------------------- */

/*
 * Initialize
 */

// Device Ready
document.addEventListener("deviceready", function deviceReady(){
	$.get(config, function(data){
		if(data){
			// Get settings from app builder
			/*url 				= $(data).find('option[name=webview_url]').attr('value');
			gradient_start 		= $(data).find('option[name=gradient_start]').attr('value');
			gradient_stop 		= $(data).find('option[name=gradient_stop]').attr('value');
			font_color 			= $(data).find('option[name=font_color]').attr('value');
			button_background 	= $(data).find('option[name=button_background]').attr('value');
			button_font 		= $(data).find('option[name=button_font]').attr('value');
			title 				= $(data).find('option[name=title]').attr('value');*/
			
			url 				= 'http://www.devonto.com';
			gradient_start 		= 'rgba(229,101,55,1)';
			gradient_stop 		= 'rgba(229,101,55,1)';
			font_color 			= '#FFFFFF';
			button_background 	= '#0055a5';
			button_font 		= '#FFFFFF';
			title 				= 'Web App';
			
			
			
			//Apply the above settings to the loading page
			setupCustomisations();
			
			
			// Offline Detection
			document.addEventListener("offline", onOffline, false);
			
			//Change the loading button on the spash screen to show "Relaunch" after 7 seconds - to give the initial page time to load
			setTimeout(showRelaunch, 7000);
			launchSite();
		}
		else
			alert("Wrong config file. Are you sure this package contains bt_config.xml?");
	});
});

function launchSite(){
	if(debug) alert('Launching Site');
	//Check if the device is offline, if so, alert the user
	if (navigator.connection.type == Connection.NONE){
		if(debug) alert('Offline detected');
		onOffline();
	}
	else{
		//if(debug) alert('Online, loading URL: "'+url+'"');
		// Get Webpage in InAppBrowser (using the _blank target) and hide it until loaded
		iabRef = window.open(url+'?inApp=true&v='+Math.floor((Math.random()*100)+1), '_blank', 'location=no,hidden=yes,hardwareback=true');
		
		//Attach listener for external link intercepting
		iabRef.addEventListener('loadstart', iabLoad);
		//Attach listener for loading complete
		iabRef.addEventListener('loadstop', iabLoaded);
	}
			
	//Attach listener to tidy up and exit
	//DISABLED as Android was using any back button request as Exit, stopping the back history navigation
	//iabRef.addEventListener('exit', iabClose);
}

function iabLoad(event){
	if(debug) alert('Setting app.js local storage watcher on initial load');
	// Keep looping every 100ms and watching for URL to load localstorage. 
	setInterval(function() {
		iabRef.executeScript({
				code: "localStorage.getItem('external-click');"
			}, 
			function (val) {
				var url = val[0];
				//if(debug) alert('Local storage looper activated, URL:' + url);
				
				if(url) {
					// Clear the value for the future 
					iabRef.executeScript({code: "localStorage.setItem('external-click', '');"});
					
					// Open the link in default browser.
					if(debug) alert('External link opening in default browser');
					window.open(url, '_system', null);
				}
			});
	},100);
}

function iabLoaded(event){
	if(debug) alert('loadstop called');
	
	//If window was hidden whilst loading, show it now that it has loaded
	iabRef.show();
}

//Tidy up on exit
function iabClose(event) {	
	if(debug) alert('Exit called');
	iabRef.removeEventListener('loadstart', iabLoad);
	//iabRef.removeEventListener('exit', iabClose);
	navigator.app.exitApp();
}

//Show a relaunch button if the user somehow gets back to the main screen
function showRelaunch(){
	$('#loading').css('display','none');
	$('#relaunch').css('display','block');
	
	$('#relaunch').click(function(){
		if(debug) alert('Relaunching');
		launchSite()
	});
}

/* --------------------------------------------------------------------------------------------------- */


// When phone does not have an internet connection
function onOffline(){
	// Prevents going off twice
	if(!busy){
		busy = true;
				
		// Show message
		navigator.notification.confirm(
			'Sorry, you need an active internet connection to use this app. Please enable a network connection and try again.',
			function(buttonIndex){
				if(buttonIndex == 1){
					// Check status again
					busy = false;
					getWebpage();
				}
				else{
					navigator.app.exitApp();
				}
			},
			'You\re Offline!',
			['Try Again','Close App']
		);
		navigator.notification.vibrate(100);
	}
}

function setupCustomisations(){
	$('#title').html(						title);
	
	$('body, body a, body h1').css('color',	font_color);
	$('body').css('background-color',		gradient_start);
	
	$('.button').css('color',				button_font);
	$('.button').css('background-color',	button_background);
	
	
	$('body').css({'background': '-moz-linear-gradient(top,  '+gradient_start+' 0%, '+gradient_stop+' 50%, '+gradient_start+' 100%)'});
	$('body').css({'background': '-webkit-gradient(linear, left top, left bottom, color-stop(0%,'+gradient_start+'), color-stop(50%,'+gradient_stop+'), color-stop(100%,'+gradient_start+'))'});
	$('body').css({'background': '-webkit-linear-gradient(top,  '+gradient_start+' 0%,'+gradient_stop+' 50%,'+gradient_start+' 100%)'});
	$('body').css({'background': '-o-linear-gradient(top,  '+gradient_start+' 0%,'+gradient_stop+' 50%,'+gradient_start+' 100%)'});
	$('body').css({'background': '-ms-linear-gradient(top,  '+gradient_start+' 0%,'+gradient_stop+' 50%,'+gradient_start+' 100%)'});
	$('body').css({'background': 'linear-gradient(to bottom,  '+gradient_start+' 0%,'+gradient_stop+' 50%,'+gradient_start+' 100%)'});
	
}