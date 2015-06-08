define([
	"backbone"
],function(
	Backbone
) {
	var playList = [];

	var currentSong = {};

	var channel = {};

	var Radio = function() {

	};

	Radio.init = function(id, options) {
		var radio = new Radio();

		_.extend(radio, Backbone.Events);
		radio.updatePort(options.port);
		
		radio.audio = document.getElementById(id.replace("#",""));
		radio.audio.volume = currentSong.volumn/100 || 1;

		if(!options.hasPreviousRadio) {
			radio.getPlayList();
		}

		radio.on("getListReady", radio.playSingleSong);
		radio.on("songChanged", function(song) {
			radio.port && radio.port.postMessage({
				type: "currentSongData"
				,song: song
			});
		});
		radio.audio.addEventListener("ended", function() {
			radio.updateCurrentSong({
				isPaused: true
			});
			radio.playSingleSong();
		});
		radio.audio.addEventListener("timeupdate", function() {
			radio.updateCurrentSong({
				duration: radio.audio.duration
				,currentTime: radio.audio.currentTime
			});

			radio.port && radio.port.postMessage({
				type: "time"
				,time: {
					duration: radio.audio.duration
					,currentTime: radio.audio.currentTime
				}
			});
		});
		radio.audio.addEventListener("loadstart", function() {
			radio.port && radio.port.postMessage({
				type: "time"
				,time: {
					duration: 1
					,currentTime: 0
				}
			});
		});
		return radio;
	};

	_.extend(Radio.prototype, {
		uuid: function() {
		    var s = [];
		    var hexDigits = "0123456789abcdef";
		    for (var i = 0; i < 10; i++) {
		        s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		    }
		 
		    var uuid = s.join("");
		    return uuid;
		}

		,getPlayList: function() {
			var self = this;

			$.ajax({
				url: "http://douban.fm/j/mine/playlist"
				,type: "GET"
				,dataType: "json"
				,data: {
					type: _.isEmpty(currentSong) ? "n" : "s"
					//歌曲ID
					,sid: currentSong.sid || ""
					//当前播放时间
					,pt:this.audio.currentTime
					//频道ID
					,channel: channel.channelId || 0
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
		}

		,playSingleSong: function() {
			if (playList.length === 0) {
				this.getPlayList();
				return null;
			}
			currentSong = playList.shift();

			this.audio.src = currentSong.url;
			
			this.play();
		}

		,play: function() {
			this.audio.play();
			this.updateCurrentSong({
				isPaused: false
			});
			this.trigger("songChanged", currentSong);
		}

		,skip: function() {
			this.audio.pause();
			this.playSingleSong();
		}

		,pause: function() {
			this.audio.pause();
			this.updateCurrentSong({
				isPaused: true
			});
		}

		,updateCurrentSong: function(options) {
			_.extend(currentSong, options);
		}

		,getCurrentSong: function() {
			if(!_.isEmpty(currentSong)) {
				this.port.postMessage({
					type: "currentSongData"
					,song: currentSong
				});
			}
		}

		,setVolumn: function(value) {
			this.audio.volume = value/100;
			this.updateCurrentSong({
				volumn: value
			});
		}

		,updatePort: function(port) {
			var self = this;
			this.port = port;
			this.port.onDisconnect.addListener(function() {
				self.port = null;
			});
		}
	});
	

	return Radio;
})