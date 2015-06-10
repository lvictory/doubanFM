define([
	"backbone"
],function(
	Backbone
) {
	var Radio = function() {
		this.playList = [];
		this.currentSong = {};
		this.channel = {};
		this.initialize.apply(this, arguments);
	};

	_.extend(Radio.prototype, Backbone.Events, {
		initialize: function(options) {
			this.updatePort(options.port);
		
			this.audio = document.getElementById(options.id.replace("#",""));
			this.audio.volume = this.currentSong.volumn/100 || 1;
			
			this.getPlayList();

			this.on("getListReady", this.playSingleSong);
			this.on("songChanged", function(song) {
				this.port && this.port.postMessage({
					type: "currentSongData"
					,song: song
				});
			});
			
			this.audio.addEventListener("ended", _.bind(function() {
				this.updateCurrentSong({
					isPaused: true
				});
				this.playSingleSong();
			}, this));
			this.audio.addEventListener("timeupdate", _.bind(function() {
				this.updateCurrentSong({
					duration: this.audio.duration
					,currentTime: this.audio.currentTime
				});

				this.port && this.port.postMessage({
					type: "time"
					,time: {
						duration: this.audio.duration
						,currentTime: this.audio.currentTime
					}
				});
			}, this));
			this.audio.addEventListener("loadstart", _.bind(function() {
				this.port && this.port.postMessage({
					type: "time"
					,time: {
						duration: 1
						,currentTime: 0
					}
				});
			}, this));
		}

		,uuid: function() {
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
					type: _.isEmpty(this.currentSong) ? "n" : "s"
					//歌曲ID
					,sid: this.currentSong.sid || ""
					//当前播放时间
					,pt:this.audio.currentTime
					//频道ID
					,channel: this.channel.channelId || -3
					,pb:128
					,from:"mainsite"
					//随机数
					,r:this.uuid()
				}
				,success: function(resp) {
					self.playList = resp.song;
					self.trigger("getListReady");
				}
				,error: function(resp) {
				}
			});
		}

		,playSingleSong: function() {
			if (this.playList.length === 0) {
				this.getPlayList();
				return null;
			}
			this.currentSong = this.playList.shift();

			this.audio.src = this.currentSong.url;
			
			this.play();
		}

		,play: function() {
			this.audio.play();
			this.updateCurrentSong({
				isPaused: false
			});
			this.trigger("songChanged", this.currentSong);
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
			_.extend(this.currentSong, options);
		}

		,getCurrentSong: function() {
			if(!_.isEmpty(this.currentSong)) {
				this.port.postMessage({
					type: "currentSongData"
					,song: this.currentSong
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