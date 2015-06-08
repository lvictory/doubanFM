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
			,"change .volumn-range": "changeVolumn"
			,"click .collect": "like"
			,"click .blacklist": "blacklist"
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
				,volumn: 100
				,currentLength: 0
			});

			this.listenTo(this.model, "change", this.render);

			chrome.extension.sendMessage({
				name: "requestCurrentSong"
			});
			
			this.port.onMessage.addListener(function(msg) {
				switch(msg.type) {
					case "currentSongData":
						self.model.set(msg.song);
						break;

					case "time":
						self.updatePlayTime(msg.time);
						break;

					default:
						break;
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
		,changeVolumn: function() {
			var volumn = this.$el.find(".volumn-range").val();
			chrome.extension.sendMessage({
				name: "volumn"
				,value: volumn
			});
		}
		,like: function() {
			this.model.set("like", +!this.model.get("like"));
			chrome.extension.sendMessage({
				name: "toggleLike"
			});
		}
		,blacklist: function() {
			chrome.extension.sendMessage({
				name: "blacklist"
			});
		}
		,updatePlayTime: function(time) {
			var currentLength = time.currentTime/time.duration*100;
			this.model.set({
				"currentLength": currentLength
			}, {
				silent: true
			});
			this.$el.find(".progress-bar").val(currentLength);
		}
	});
});