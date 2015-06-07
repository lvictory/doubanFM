define([
	"backbone"
],function(
	Backbone
) {
	return Backbone.View.extend({
		template: _.template($("#player-template").html())
		,events: {
			"click .next": "playNextSong"
			,"click .pause": "pause"
			,"click .pause-mask": "play"
		}
		,initialize: function(options) {
			var self = this;
			this.port = options.port;

			this.model = new Backbone.Model({
				artist: ""
				,albumtitle: ""
				,title: ""
				,picture: ""
				,album: ""
			});

			this.listenTo(this.model, "change", this.render);

			chrome.extension.sendMessage({
				name: "requestCurrentSong"
			});
			
			this.port.onMessage.addListener(function(msg) {
				if(msg.type === "currentSongData") {
					self.model.set(msg.song);
				}
			});			
		}
		,render: function() {
			if(this.model.get("title") === "") {
				return null;
			}

			var html = this.template(this.model.toJSON());
			this.$el.html(html);
			this.$el.appendTo($("body"));
		}
		,onSongChanged: function(data) {
			this.songList = data.song;
		}
		,playNextSong: function() {
			chrome.extension.sendMessage({
				name: "skip"
			});
		}
		,pause: function() {
			chrome.extension.sendMessage({
				name: "pause"
			});
			this.$el.find(".pause-mask").show();
		}
		,play: function() {
			chrome.extension.sendMessage({
				name: "continue"
			});
			this.$el.find(".pause-mask").hide();
		}
	});
});