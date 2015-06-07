require(['backend/radio'], function(Radio) {
	var checkLogIn = function() {
		chrome.cookies.get({
			url: "http://douban.com"
			,name: "dbcl2"
		}, function(cookie) {
			if(cookie) {
				chrome.cookies.set({
					url: "http://douban.fm"
					,name: "dbcl2"
					,value: cookie.value
				});
			} else {
				port && port.postMessage({
					type: "logIn"
				});
			}
		});
		chrome.cookies.get({
			url: "http://douban.com"
			,name: "ck"
		},function(cookie) {
			chrome.cookies.set({
				url: "http://douban.fm"
				,name: "ck"
				,"value": cookie.value
			});
		});
	};

	var radio;

	var hasPreviousRadio = false;

	chrome.extension.onConnect.addListener(function(port) {
		if(port.name !== "doubanFM") {
			return null;
		}

		window.port = port;

		port.onDisconnect.addListener(function() {
			window.port = null;
		});

		checkLogIn();

		radio = Radio.init("#main-audio", {
			port: port
			,hasPreviousRadio: hasPreviousRadio
		});

		hasPreviousRadio = true;

		port.postMessage({
			type: "init"
		});
	});

	chrome.extension.onMessage.addListener(function(msg) {
		switch (msg.name) {
			case "skip":
				radio.skip();
				break;

			case "pause":
				radio.pause();
				break;

			case "continue":
				radio.play();
				break;

			case "requestCurrentSong":
				radio.getCurrentSong();
				break;

			default:
				break;
		}
	});


})