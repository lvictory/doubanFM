requirejs.config({
	baseUrl: "./scripts",
	paths: {
		"$": "vendor/jquery.min",
		"_": "vendor/underscore",
		"backbone": "vendor/backbone"
	},
	shim: {
		"$": {
			exports: "jquery"
		},
		"_": {
			exports: "underscore"
		},
		"backbone": {
			deps: ["$", "_"]
		}
	}
})