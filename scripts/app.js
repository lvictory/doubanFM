define(['views/Player'], function(Player) {
	var port = chrome.extension.connect({
		name: "doubanFM"
	});

	port.onMessage.addListener(function(msg) {
		switch (msg.type) {
			case "logIn":
				showLogIn();
				break;

			case "init":
				player = new Player();
				break;

			default:
				break;
		}
	});

	function showLogIn () {
		debugger
		$("#notify").show();
	}
});