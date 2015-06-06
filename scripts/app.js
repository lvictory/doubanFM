define(['views/Player'], function(Player) {
	var app = {};
	app.start = function() {
		var port = chrome.extension.connect({
			name: "doubanFM"
		});

		port.onMessage.addListener(function(msg) {
			switch (msg.type) {
				case "logIn":
					showLogIn();
					break;

				case "init":
					player = new Player({
						port: port
					});
					player.render();
					break;

				default:
					break;
			}
		});

		function showLogIn () {
			$("#notify").show();
		}
	};
	
	return app;
});