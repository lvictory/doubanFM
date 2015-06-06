define([
	"backbone"
],function(
	Backbone
) {
	return Backbone.View.extend({
		template: _.template($("#player-template").html())
		,events: {
			"click .next": "playNextSong"
			,"mouseover .volumn": "showVolumn"
			,"mouseout .volumn": "hideVolumn"
		}
		,initialize: function(options) {
			this.model = new Backbone.Model({
				artist: "LinkinPark"
				,album: "HybridTheory"
				,title: "In the End"
			});
			this.port = options.port;
		}
		,render: function() {
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
		,showVolumn: function() {
			this.$el.find(".volumn-range").addClass("range-show");
		}
		,hideVolumn: function() {
			this.$el.find(".volumn-range").removeClass("range-show");
		}	
	});
});