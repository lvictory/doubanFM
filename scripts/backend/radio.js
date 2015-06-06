define([
	"backbone"
],function(
	Backbone
) {
	var isPlaying = false;

	var playList = [];

	var Radio = function() {

	};

	Radio.init = function(id) {
		var radio = new Radio();
		_.extend(radio, Backbone.Events);
		radio.audio = document.getElementById(id.replace("#",""));

		!isPlaying && radio.getPlayList();

		radio.on("getListReady", radio.playSingleSong);
		radio.on("songChanged", function(currentSong) {
			radio.trigger("changeSingleSong", currentSong)
		});
		radio.audio.addEventListener("ended", function() {
			isPlaying = false;
			radio.playSingleSong();
		});
		return radio;
	};

	Radio.prototype.uuid = function() {
	    var s = [];
	    var hexDigits = "0123456789abcdef";
	    for (var i = 0; i < 10; i++) {
	        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
	    }
	 
	    var uuid = s.join("");
	    return uuid;
	};

	Radio.prototype.getPlayList = function() {
		var self = this;

		$.ajax({
			url: "http://douban.fm/j/mine/playlist"
			,type: "GET"
			,dataType: "json"
			,data: {
				type:"n"
				//歌曲ID
				,sid:''
				//当前播放时间
				,pt:this.audio.currentTime
				//频道ID
				,channel:0
				,pb:128
				,from:"mainsite"
				//随机数
				,r:this.uuid()
			}
			,success: function(resp) {
				playList = resp.song;
				self.trigger("getListReady");
			}
			,error: function(resp) {
			}
		});
	};

	Radio.prototype.playSingleSong = function() {
		if (playList.length === 0) {
			return this.getPlayList();
		}
		var currentSong = playList.shift();
 
		this.audio.src = currentSong.url;
		this.audio.play();
		isPlaying = true;
		this.trigger("songChanged", currentSong);
	};

	Radio.prototype.skip = function() {
		this.audio.pause();
		this.playSingleSong();
	};

	return Radio;
})