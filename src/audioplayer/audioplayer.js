"use strict";

var jQuery = require("../lib/jquery");
var $ = jQuery;
var anima = require("../animate");
var AudioPlatforms = {
    flashInstalled: function () {
        var flashInstalled = false;
        try {
            if (new ActiveXObject("ShockwaveFlash.ShockwaveFlash"))flashInstalled = true
        } catch (e) {
            if (navigator.mimeTypes["application/x-shockwave-flash"])flashInstalled = true
        }
        return flashInstalled
    }, html5VideoSupported: function () {
        return !!document.createElement("video").canPlayType
    }, isChrome: function () {
        return navigator.userAgent.match(/Chrome/i) != null
    }, isFirefox: function () {
        return navigator.userAgent.match(/Firefox/i) != null
    }, isOpera: function () {
        return navigator.userAgent.match(/Opera/i) !=
            null
    }, isSafari: function () {
        return navigator.userAgent.match(/Safari/i) != null
    }, isAndroid: function () {
        return navigator.userAgent.match(/Android/i) != null
    }, isIPad: function () {
        return navigator.userAgent.match(/iPad/i) != null
    }, isIPhone: function () {
        return navigator.userAgent.match(/iPod/i) != null || navigator.userAgent.match(/iPhone/i) != null
    }, isIOS: function () {
        return this.isIPad() || this.isIPhone()
    }, isMobile: function () {
        return this.isIPad() || this.isIPhone() || this.isAndroid()
    }, isIE9: function () {
        return navigator.userAgent.match(/MSIE 9/i) !=
            null && !this.isOpera()
    }, isIE8: function () {
        return navigator.userAgent.match(/MSIE 8/i) != null && !this.isOpera()
    }, isIE7: function () {
        return navigator.userAgent.match(/MSIE 7/i) != null && !this.isOpera()
    }, isIE6: function () {
        return navigator.userAgent.match(/MSIE 6/i) != null && !this.isOpera()
    }, isIE678: function () {
        return this.isIE6() || this.isIE7() || this.isIE8()
    }, isIE6789: function () {
        return this.isIE6() || this.isIE7() || this.isIE8() || this.isIE9()
    }, css33dTransformSupported: function () {
        return !this.isIE6() && !this.isIE7() && !this.isIE8() && !this.isIE9() && !this.isOpera()
    }, applyBrowserStyles: function (object, applyToValue) {
        var ret = {};
        for (var key in object) {
            ret[key] = object[key];
            ret["-webkit-" + key] = applyToValue ? "-webkit-" + object[key] : object[key];
            ret["-moz-" + key] = applyToValue ? "-moz-" + object[key] : object[key];
            ret["-ms-" + key] = applyToValue ? "-ms-" + object[key] : object[key];
            ret["-o-" + key] = applyToValue ? "-o-" + object[key] : object[key]
        }
        return ret
    }
};
(function ($) {
    $.fn.audioplayer = function (options) {
        var PlayerSkin = function (jiboPlayer, container, options, id) {
            this.jiboPlayer = jiboPlayer;
            this.container = container;
            this.options = options;
            this.id = id;
            this.volumeSaved = 1;
            var instance = this;
            var isTouch = "ontouchstart"in window;
            var eStart = isTouch ? "touchstart" : "mousedown";
            var eMove = isTouch ? "touchmove" : "mousemove";
            var eCancel = isTouch ? "touchcancel" : "mouseup";
            var formatSeconds = function (secs) {
                var hours = Math.floor(secs / 3600), minutes = Math.floor(secs % 3600 /
                    60), seconds = Math.ceil(secs % 3600 % 60);
                return (hours == 0 ? "" : hours > 0 && hours.toString().length < 2 ? "0" + hours + ":" : hours + ":") + (minutes.toString().length < 2 ? "0" + minutes : minutes) + ":" + (seconds.toString().length < 2 ? "0" + seconds : seconds)
            };
            if (this.options.showbackgroundimage)this.container.css({"background-image": 'url("' + this.options.skinsfolder + this.options.backgroundimage + '")'});
            if (this.options.showimage) {
                this.$image = $("<div class='audioplayer-image'></div>");
                this.$image.appendTo(this.container);
                this.$image.css({
                    width: this.options.imagefullwidth ?
                        "100%;" : this.options.imagewidth + "px",
                    height: this.options.imageheight + "px",
                    display: "block"
                });
                this.container.bind("audioplayer.updateinfo", function (event, data) {
                    if (data.image.length > 0)instance.$image.html("<div class='audioplayer-image-space' style='display:inline-block;vertical-align:middle;height:100%;'></div><img src='" + data.image + "' style='width:100%;max-width:100%;vertical-align:middle;' />"); else instance.$image.empty()
                });
                this.container.append("<div class='audioplayer-image-clear'></div>")
            }
            if (this.options.showtitle ||
                this.options.showinfo) {
                this.$text = $("<div class='audioplayer-text'></div>");
                this.$text.appendTo(this.container);
                if (this.options.showtitle) {
                    this.$title = $("<div class='audioplayer-title'></div>");
                    this.$title.appendTo(this.$text);
                    this.container.bind("audioplayer.updateinfo", function (event, data) {
                        var t = instance.options.titleformat.replace(/%TITLE%/g, data.title);
                        t = t.replace(/%ALBUM%/g, data.album);
                        t = t.replace(/%ARTIST%/g, data.artist);
                        t = t.replace(/%INFO%/g, data.info);
                        t = t.replace(/%DURATION%/g,
                            duration);
                        t = t.replace(/%ID%/g, data.id);
                        if (data.source.length > 0) {
                            t = t.replace(/%AUDIO%/g, data.source[0].src);
                            t = t.replace(/%AUDIOURL%/g, encodeURI(data.source[0].src))
                        }
                        instance.$title.html(t)
                    });
                    this.$text.append("<div class='audioplayer-title-clear'></div>")
                }
                if (this.options.showinfo) {
                    this.$info = $("<div class='audioplayer-info'></div>");
                    this.$info.appendTo(this.$text);
                    this.container.bind("audioplayer.updateinfo", function (event, data) {
                        var duration = data.duration ? formatSeconds(data.duration) :
                            "";
                        var t = instance.options.infoformat.replace(/%TITLE%/g, data.title);
                        t = t.replace(/%ALBUM%/g, data.album);
                        t = t.replace(/%ARTIST%/g, data.artist);
                        t = t.replace(/%INFO%/g, data.info);
                        t = t.replace(/%DURATION%/g, duration);
                        t = t.replace(/%ID%/g, data.id);
                        if (data.source.length > 0) {
                            t = t.replace(/%AUDIO%/g, data.source[0].src);
                            t = t.replace(/%AUDIOURL%/g, encodeURI(data.source[0].src))
                        }
                        instance.$info.html(t)
                    });
                    this.$text.append("<div class='audioplayer-info-clear'></div>")
                }
                this.container.append("<div class='audioplayer-text-clear'></div>")
            }
            var $bar =
                $("<div class='audioplayer-bar'></div>");
            $bar.appendTo(this.container);
            if (this.options.showbarbackgroundimage)$bar.css({"background-image": 'url("' + this.options.skinsfolder + this.options.barbackgroundimage + '")'});
            var $playpause = $("<div class='audioplayer-playpause'></div>");
            $playpause.appendTo($bar).css({display: "block"});
            var $play = $("<div class='audioplayer-play'></div>");
            $play.appendTo($playpause).css({
                display: "block",
                width: this.options.playpauseimagewidth,
                height: this.options.playpauseimageheight,
                "background-image": 'url("' + this.options.skinsfolder + this.options.playpauseimage + '")',
                "background-repeat": "no-repeat",
                "background-position": "left top",
                cursor: "pointer"
            }).hover(function () {
                $(this).css({"background-position": "left bottom"})
            }, function () {
                $(this).css({"background-position": "left top"})
            });
            var $pause = $("<div class='audioplayer-pause'></div>");
            $pause.appendTo($playpause).css({
                display: "none",
                width: this.options.playpauseimagewidth,
                height: this.options.playpauseimageheight,
                "background-image": 'url("' +
                this.options.skinsfolder + this.options.playpauseimage + '")',
                "background-repeat": "no-repeat",
                "background-position": "right top",
                cursor: "pointer"
            }).hover(function () {
                $(this).css({"background-position": "right bottom"})
            }, function () {
                $(this).css({"background-position": "right top"})
            });
            $play.click(function () {
                instance.jiboPlayer.playAudio()
            });
            $pause.click(function () {
                if (instance.options.stoponpausebutton)instance.jiboPlayer.stopAudio(); else instance.jiboPlayer.pauseAudio()
            });
            this.container.bind("audioplayer.played",
                function (event, currentItem) {
                    $play.css({display: "none"});
                    $pause.css({display: "block"})
                });
            this.container.bind("audioplayer.paused", function (event, currentItem) {
                $play.css({display: "block"});
                $pause.css({display: "none"})
            });
            this.container.bind("audioplayer.stopped", function (event, currentItem) {
                $play.css({display: "block"});
                $pause.css({display: "none"})
            });
            if (this.options.showstop) {
                var $stop = $("<div class='audioplayer-stop'></div>");
                $stop.appendTo($bar).css({
                    display: "block",
                    width: this.options.stopimagewidth,
                    height: this.options.stopimageheight,
                    "background-image": 'url("' + this.options.skinsfolder + this.options.stopimage + '")',
                    "background-repeat": "no-repeat",
                    "background-position": "center top",
                    cursor: "pointer"
                }).hover(function () {
                    $(this).css({"background-position": "center bottom"})
                }, function () {
                    $(this).css({"background-position": "center top"})
                });
                $stop.click(function () {
                    instance.jiboPlayer.stopAudio()
                })
            }
            if (this.options.showprevnext) {
                var $prev = $("<div class='audioplayer-prev'></div>");
                $prev.appendTo($bar).css({
                    display: "block",
                    width: this.options.prevnextimagewidth,
                    height: this.options.prevnextimageheight,
                    "background-image": 'url("' + this.options.skinsfolder + this.options.prevnextimage + '")',
                    "background-repeat": "no-repeat",
                    "background-position": "left top",
                    cursor: "pointer"
                }).hover(function () {
                    $(this).css({"background-position": "left bottom"})
                }, function () {
                    $(this).css({"background-position": "left top"})
                });
                var $next = $("<div class='audioplayer-next'></div>");
                $next.appendTo($bar).css({
                    display: "block",
                    width: this.options.prevnextimagewidth,
                    height: this.options.prevnextimageheight,
                    "background-image": 'url("' + this.options.skinsfolder + this.options.prevnextimage + '")',
                    "background-repeat": "no-repeat",
                    "background-position": "right top",
                    cursor: "pointer"
                }).hover(function () {
                    $(this).css({"background-position": "right bottom"})
                }, function () {
                    $(this).css({"background-position": "right top"})
                });
                $prev.click(function () {
                    instance.jiboPlayer.audioRun(-2, instance.jiboPlayer.audioPlayer.isPlaying)
                });
                $next.click(function () {
                    instance.jiboPlayer.audioRun(-1,
                        instance.jiboPlayer.audioPlayer.isPlaying)
                })
            }
            if (this.options.showloop) {
                var $loop = $("<div class='audioplayer-loop'></div>");
                var backgroundPosX = ["left", "center", "right"];
                $loop.appendTo($bar).css({
                    display: "block",
                    width: this.options.loopimagewidth,
                    height: this.options.loopimageheight,
                    "background-image": 'url("' + this.options.skinsfolder + this.options.loopimage + '")',
                    "background-repeat": "no-repeat",
                    "background-position": backgroundPosX[this.options.loop] + " top",
                    cursor: "pointer"
                }).hover(function () {
                    var backgroundPosX =
                        $(this).css("background-position") ? $(this).css("background-position").split(" ")[0] : $(this).css("background-position-x");
                    $(this).css({"background-position": backgroundPosX + " bottom"})
                }, function () {
                    var backgroundPosX = $(this).css("background-position") ? $(this).css("background-position").split(" ")[0] : $(this).css("background-position-x");
                    $(this).css({"background-position": backgroundPosX + " top"})
                });
                $loop.click(function () {
                    if (instance.options.loop >= 2)instance.options.loop = 0; else instance.options.loop++;
                    var backgroundPosX =
                        ["left", "center", "right"];
                    var backgroundPosY = $(this).css("background-position") ? $(this).css("background-position").split(" ")[1] : $(this).css("background-position-y");
                    $(this).css({"background-position": backgroundPosX[instance.options.loop] + " " + backgroundPosY})
                })
            }
            if (this.options.showtitleinbar) {
                this.$bartitle = $("<div class='audioplayer-bar-title'></div>");
                this.$bartitle.appendTo($bar);
                this.$bartitle.css({
                    display: "block",
                    overflow: "hidden",
                    "white-space": "nowrap",
                    width: this.options.titleinbarwidthmode ==
                    "auto" ? "auto" : this.options.titleinbarwidth,
                    height: "auto"
                });
                this.container.bind("audioplayer.updateinfo", function (event, data) {
                    var t = instance.options.titleinbarformat.replace(/%TITLE%/g, data.title);
                    t = t.replace(/%ALBUM%/g, data.album);
                    t = t.replace(/%ARTIST%/g, data.artist);
                    t = t.replace(/%INFO%/g, data.info);
                    t = t.replace(/%DURATION%/g, duration);
                    t = t.replace(/%ID%/g, data.id);
                    if (data.source.length > 0) {
                        t = t.replace(/%AUDIO%/g, data.source[0].src);
                        t = t.replace(/%AUDIOURL%/g, encodeURI(data.source[0].src))
                    }
                    instance.$bartitletext =
                        $("<span class='audioplayer-bar-title-text'>" + t + "</span>");
                    instance.$bartitle.empty();
                    instance.$bartitle.append(instance.$bartitletext);
                    instance.$bartitle.css({"text-indent": 0});
                    instance.$bartitle.data("text-indent", 0);
                    clearInterval(instance.updateTitleInBar);
                    if (instance.options.titleinbarscroll) {
                        instance.bartitlewidth = instance.$bartitletext.width();
                        instance.updateTitleInBar = setInterval(function () {
                            var indent = instance.$bartitle.data("text-indent");
                            indent--;
                            if (indent < -instance.bartitlewidth)indent =
                                instance.options.titleinbarwidth;
                            instance.$bartitle.css({"text-indent": indent + "px"});
                            instance.$bartitle.data("text-indent", indent)
                        }, 1E3 / 25)
                    }
                })
            }
            if (this.options.showvolume && !AudioPlatforms.isIOS() && !AudioPlatforms.isAndroid()) {
                this.$volume = $("<div class='audioplayer-volume'></div>");
                this.$volume.appendTo($bar);
                this.$volumeButton = $("<div class='audioplayer-volume-button'></div>");
                this.$volumeButton.appendTo(this.$volume);
                this.$volume.css({display: "block"});
                this.$volumeButton.css({
                    display: "block",
                    position: "relative",
                    width: this.options.volumeimagewidth,
                    height: this.options.volumeimageheight,
                    "background-image": 'url("' + this.options.skinsfolder + this.options.volumeimage + '")',
                    "background-repeat": "no-repeat",
                    "background-position": "left top",
                    cursor: "pointer"
                });
                this.$volumeButton.hover(function () {
                    var backgroundPosX = $(this).css("background-position") ? $(this).css("background-position").split(" ")[0] : $(this).css("background-position-x");
                    $(this).css({"background-position": backgroundPosX + " bottom"})
                }, function () {
                    var backgroundPosX =
                        $(this).css("background-position") ? $(this).css("background-position").split(" ")[0] : $(this).css("background-position-x");
                    $(this).css({"background-position": backgroundPosX + " top"})
                });
                this.$volumeButton.click(function () {
                    var volume = instance.jiboPlayer.audioPlayer.getVolume();
                    if (volume > 0) {
                        instance.volumeSaved = volume;
                        volume = 0
                    } else volume = instance.volumeSaved;
                    var backgroundPosY = $(this).css("background-position") ? $(this).css("background-position").split(" ")[1] : $(this).css("background-position-y");
                    instance.$volumeButton.css({
                        "background-position": (volume >
                        0 ? "left" : "right") + " " + backgroundPosY
                    });
                    instance.jiboPlayer.audioPlayer.setVolume(volume);
                    if (instance.options.showvolumebar)instance.$volumeBarAdjustActive.css({height: Math.round(volume * 100) + "%"})
                });
                if (this.options.showvolumebar) {
                    this.$volumeBar = $("<div class='audioplayer-volume-bar'></div>");
                    this.$volumeBar.appendTo(this.$volume);
                    this.$volumeBarAdjust = $("<div class='audioplayer-volume-bar-adjust'></div>");
                    this.$volumeBarAdjust.appendTo(this.$volumeBar);
                    this.$volumeBarAdjustActive =
                        $("<div class='audioplayer-volume-bar-adjust-active'></div>");
                    this.$volumeBarAdjustActive.appendTo(this.$volumeBarAdjust);
                    this.$volumeBar.css({
                        display: "none",
                        position: "absolute",
                        left: 0,
                        bottom: "100%",
                        "-webkit-box-sizing": "content-box",
                        "-moz-box-sizing": "content-box",
                        "box-sizing": "content-box",
                        width: this.options.volumeimagewidth - 2 * this.options.volumebarpadding,
                        height: this.options.volumebarheight - 2 * this.options.volumebarpadding,
                        padding: this.options.volumebarpadding
                    });
                    this.$volumeBarAdjust.css({
                        display: "block",
                        position: "relative", width: "100%", height: "100%", cursor: "pointer"
                    });
                    this.$volumeBarAdjustActive.css({
                        display: "block",
                        position: "absolute",
                        left: 0,
                        bottom: 0,
                        width: "100%",
                        height: "100%"
                    });
                    this.$volumeBarAdjust.bind(eStart, function (e) {
                        var e0 = isTouch ? e.originalEvent.touches[0] : e;
                        var vol = 1 - (e0.pageY - instance.$volumeBarAdjust.offset().top) / instance.$volumeBarAdjust.height();
                        vol = vol > 1 ? 1 : vol < 0 ? 0 : vol;
                        instance.$volumeBarAdjustActive.css({height: Math.round(vol * 100) + "%"});
                        instance.$volumeButton.css({
                            "background-position": "left " +
                            (vol > 0 ? "top" : "bottom")
                        });
                        instance.jiboPlayer.audioPlayer.setVolume(vol);
                        instance.$volumeBarAdjust.bind(eMove, function (e) {
                            var e0 = isTouch ? e.originalEvent.touches[0] : e;
                            var vol = 1 - (e0.pageY - instance.$volumeBarAdjust.offset().top) / instance.$volumeBarAdjust.height();
                            vol = vol > 1 ? 1 : vol < 0 ? 0 : vol;
                            instance.$volumeBarAdjustActive.css({height: Math.round(vol * 100) + "%"});
                            instance.$volumeButton.css({"background-position": "left " + (vol > 0 ? "top" : "bottom")});
                            instance.jiboPlayer.audioPlayer.setVolume(vol)
                        })
                    }).bind(eCancel,
                        function () {
                            instance.$volumeBarAdjust.unbind(eMove)
                        });
                    this.hideVolumeBarTimeout = null;
                    this.$volume.hover(function () {
                        clearTimeout(instance.hideVolumeBarTimeout);
                        if (AudioPlatforms.isIE678())instance.$volumeBar.show(); else instance.$volumeBar.fadeIn()
                    }, function () {
                        clearTimeout(instance.hideVolumeBarTimeout);
                        instance.hideVolumeBarTimeout = setTimeout(function () {
                            if (AudioPlatforms.isIE678())instance.$volumeBar.hide(); else instance.$volumeBar.fadeOut()
                        }, 1E3)
                    })
                }
                this.container.bind("audioplayer.setvolume",
                    function (event, volume) {
                        volume = volume > 1 ? 1 : volume < 0 ? 0 : volume;
                        var backgroundPosY = instance.$volumeButton.css("background-position") ? instance.$volumeButton.css("background-position").split(" ")[1] : instance.$volumeButton.css("background-position-y");
                        instance.$volumeButton.css({"background-position": (volume > 0 ? "left" : "right") + " " + backgroundPosY});
                        if (instance.options.showvolumebar)instance.$volumeBarAdjustActive.css({height: Math.round(volume * 100) + "%"})
                    })
            }
            if (this.options.showtime) {
                var $time = $("<div class='audioplayer-time'></div>");
                $time.appendTo($bar);
                this.container.bind("audioplayer.playprogress", function (event, data) {
                    var current = isNaN(data.current) ? 0 : data.current;
                    var duration = isNaN(data.duration) || !isFinite(data.duration) ? 0 : data.duration;
                    var left = formatSeconds(Math.ceil(duration - current / 1E3));
                    current = formatSeconds(Math.ceil(current / 1E3));
                    duration = formatSeconds(Math.ceil(duration / 1E3));
                    var t;
                    if (data.live)t = instance.options.timeformatlive.replace("%CURRENT%", current); else t = instance.options.timeformat.replace("%CURRENT%",
                        current).replace("%DURATION%", duration).replace("%LEFT%", left);
                    $time.html(t)
                });
                this.container.bind("audioplayer.played", function (event, currentItem) {
                    if (instance.options.showloading)$time.html(instance.options.loadingformat)
                })
            }
            if (this.options.showprogress) {
                var $progress = $("<div class='audioplayer-progress'></div>");
                var $progressLoaded = $("<div class='audioplayer-progress-loaded'></div>");
                var $progressPlayed = $("<div class='audioplayer-progress-played'></div>");
                $progressLoaded.appendTo($progress);
                $progressPlayed.appendTo($progress);
                $progress.appendTo($bar);
                $progress.css({
                    display: "block",
                    cursor: "pointer",
                    overflow: "hidden",
                    height: this.options.progressheight
                });
                if ($progress.css("right") == "auto")$progress.css("right", $progress.css("left"));
                $progressLoaded.css({display: "block", position: "absolute", left: 0, top: 0, height: "100%"});
                $progressPlayed.css({display: "block", position: "absolute", left: 0, top: 0, height: "100%"});
                $progress.bind(eStart, function (e) {
                    var e0 = isTouch ? e.originalEvent.touches[0] : e;
                    var pos =
                        (e0.pageX - $progress.offset().left) / $progress.width();
                    instance.jiboPlayer.setTime(pos);
                    $progress.bind(eMove, function (e) {
                        var e0 = isTouch ? e.originalEvent.touches[0] : e;
                        var pos = (e0.pageX - $progress.offset().left) / $progress.width();
                        instance.jiboPlayer.setTime(pos)
                    })
                }).bind(eCancel, function () {
                    $progress.unbind(eMove)
                });
                this.container.bind("audioplayer.loadprogress", function (event, progress) {
                    $progressLoaded.css({width: progress + "%"})
                });
                this.container.bind("audioplayer.playprogress", function (event,
                                                                                 data) {
                    if (data.live)return;
                    var progress = 0;
                    if (!isNaN(data.duration) && isFinite(data.duration) && data.duration > 0)progress = Math.ceil(data.current * 100 / data.duration);
                    $progressPlayed.css({width: progress + "%"})
                })
            }
            $bar.append("<div class='audioplayer-bar-buttons-clear'></div>");
            this.container.append("<div class='audioplayer-bar-clear'></div>");
            if (this.options.showtracklist) {
                this.$tracklistwrapper = $("<div class='audioplayer-tracklist'></div>");
                this.$tracklistwrapper.appendTo(this.container);
                this.$tracklistwrapper.css({display: "block", height: "auto"});
                this.$tracklistcontainer = $("<div class='audioplayer-tracklist-container'></div>");
                this.$tracklistcontainer.appendTo(this.$tracklistwrapper);
                if (this.options.showtracklistbackgroundimage)this.$tracklistcontainer.css({"background-image": 'url("' + this.options.skinsfolder + this.options.tracklistbackgroundimage + '")'});
                this.$tracklist = $("<div class='audioplayer-tracks-wrapper'></div>");
                this.$tracklist.appendTo(this.$tracklistcontainer);
                this.$tracks = $("<ul class='audioplayer-tracks'></ul>");
                this.$tracks.appendTo(this.$tracklist);
                this.$tracks.css({display: "block"});
                this.container.bind("audioplayer.switched", function (event, data) {
                    if (data.previous >= 0) {
                        instance.trackitems[data.previous].removeClass("audioplayer-track-item-active");
                        instance.trackitems[data.previous].removeClass("audioplayer-track-item-hoverover")
                    }
                    if (data.current >= 0) {
                        instance.trackitems[data.current].addClass("audioplayer-track-item-active");
                        instance.trackitems[data.current].removeClass("audioplayer-track-item-hoverover");
                        if (instance.options.tracklistitem < instance.jiboPlayer.elemLength) {
                            var page = Math.floor(data.current / instance.options.tracklistitem);
                            if (instance.tracklistPage != page) {
                                instance.tracklistPage = page;
                                if (instance.tracklistPage == 0) {
                                    instance.$tracklistarrowprev.hide();
                                    instance.$tracklistarrownext.show()
                                } else if (instance.tracklistPage == instance.tracklistPageNum - 1) {
                                    instance.$tracklistarrowprev.show();
                                    instance.$tracklistarrownext.hide()
                                } else {
                                    instance.$tracklistarrowprev.show();
                                    instance.$tracklistarrownext.show()
                                }
                                var t = -instance.tracklistPage * instance.tracklistItemHeight * instance.options.tracklistitem;
                                instance.$tracks.animate({top: t})
                            }
                        }
                    }
                });
                this.tracklistItemHeight = 0;
                this.trackitems = new Array;
                for (var i = 0; i < this.jiboPlayer.elemLength; i++) {
                    var $track = $("<li class='audioplayer-track-item'></li>");
                    var data = this.jiboPlayer.elemArray[i];
                    var duration = data.duration ? formatSeconds(data.duration) : "";
                    var t = this.options.tracklistitemformat.replace(/%TITLE%/g, data.title);
                    t = t.replace(/%ALBUM%/g, data.album);
                    t = t.replace(/%ARTIST%/g, data.artist);
                    t = t.replace(/%INFO%/g, data.info);
                    t = t.replace(/%DURATION%/g, duration);
                    t = t.replace(/%ID%/g, data.id);
                    t = t.replace("%ORDER%", data.id);
                    if (data.source.length > 0) {
                        t = t.replace(/%AUDIO%/g, data.source[0].src);
                        t = t.replace(/%AUDIOURL%/g, encodeURI(data.source[0].src))
                    }
                    $track.data("order", i);
                    $track.html(t);
                    $track.appendTo(this.$tracks);
                    this.tracklistItemHeight = $track.height();
                    this.trackitems.push($track);
                    $track.click(function () {
                        instance.jiboPlayer.audioRun($(this).data("order"),
                            true)
                    });
                    $track.hover(function () {
                        $(this).addClass("audioplayer-track-item-active");
                        if ($(this).data("order") != instance.jiboPlayer.currentItem)$(this).addClass("audioplayer-track-item-hoverover")
                    }, function () {
                        if ($(this).data("order") != instance.jiboPlayer.currentItem)$(this).removeClass("audioplayer-track-item-active");
                        $(this).removeClass("audioplayer-track-item-hoverover")
                    })
                }
                this.$tracklist.css({overflow: "hidden"});
                if (this.options.tracklistitem < this.jiboPlayer.elemLength) {
                    this.$tracklist.css({
                        height: this.tracklistItemHeight *
                        this.options.tracklistitem + "px"
                    });
                    this.tracklistPage = 0;
                    this.tracklistPageNum = Math.ceil(this.jiboPlayer.elemLength / this.options.tracklistitem);
                    this.$tracklistarrowprev = $("<div class='audioplayer-tracklist-arrow-prev'></div>");
                    this.$tracklistarrowprev.appendTo(this.$tracklistwrapper);
                    this.$tracklistarrowprev.css({
                        display: "none",
                        width: this.options.tracklistarrowimagewidth,
                        height: this.options.tracklistarrowimageheight,
                        "background-image": 'url("' + this.options.skinsfolder + this.options.tracklistarrowimage +
                        '")',
                        "background-repeat": "no-repeat",
                        "background-position": "left top",
                        cursor: "pointer"
                    }).hover(function () {
                        $(this).css({"background-position": "left bottom"})
                    }, function () {
                        $(this).css({"background-position": "left top"})
                    });
                    this.$tracklistarrownext = $("<div class='audioplayer-tracklist-arrow-next'></div>");
                    this.$tracklistarrownext.appendTo(this.$tracklistwrapper);
                    this.$tracklistarrownext.css({
                        display: "block",
                        width: this.options.tracklistarrowimagewidth,
                        height: this.options.tracklistarrowimageheight,
                        "background-image": 'url("' + this.options.skinsfolder + this.options.tracklistarrowimage + '")',
                        "background-repeat": "no-repeat",
                        "background-position": "right top",
                        cursor: "pointer"
                    }).hover(function () {
                        $(this).css({"background-position": "right bottom"})
                    }, function () {
                        $(this).css({"background-position": "right top"})
                    });
                    this.$tracklistarrowprev.click(function () {
                        instance.tracklistPage--;
                        if (instance.tracklistPage <= 0) {
                            instance.tracklistPage = 0;
                            instance.$tracklistarrowprev.hide()
                        }
                        instance.$tracklistarrownext.show();
                        var t = -instance.tracklistPage * instance.tracklistItemHeight * instance.options.tracklistitem;
                        instance.$tracks.animate({top: t})
                    });
                    this.$tracklistarrownext.click(function () {
                        instance.tracklistPage++;
                        if (instance.tracklistPage >= instance.tracklistPageNum - 1) {
                            instance.tracklistPage = instance.tracklistPageNum - 1;
                            instance.$tracklistarrownext.hide()
                        }
                        instance.$tracklistarrowprev.show();
                        var t = -instance.tracklistPage * instance.tracklistItemHeight * instance.options.tracklistitem;
                        instance.$tracks.animate({top: t})
                    })
                }
                this.container.append("<div class='audioplayer-tracklist-clear'></div>")
            }
            if (this.options.addwm &&
                window.location.href.indexOf(this.options.fvm) < 0) {
                var $wm = $("<div style='position:absolute;top:100%;right:0;margin:4px;text-align:right;font:normal 10px Arial, sans-serif;'><a href='" + this.options.lvm + "' target='_blank' style='color:#666;text-decoration:none;'>" + this.options.pvm + "</a></div>");
                $wm.appendTo(this.container)
            }
        };
        var FlashHTML5Player = function (jiboPlayer, flashPlayerEngine) {
            this.jiboPlayer = jiboPlayer;
            this.container = this.jiboPlayer.container;
            this.id = this.jiboPlayer.id;
            this.flashPlayerEngine =
                flashPlayerEngine;
            this.html5Object = null;
            this.flashObject = null;
            this.isHtml5 = false;
            this.isPlaying = false;
            this.html5LoadUpdate = null;
            this.audioItem = null;
            var a = document.createElement("audio");
            this.supportMp3 = !!(a.canPlayType && a.canPlayType("audio/mpeg;").replace(/no/, ""));
            this.supportOgg = !!(a.canPlayType && a.canPlayType('audio/ogg; codecs="vorbis"').replace(/no/, ""));
            this.loadFlashTimeout = 0
        };
        FlashHTML5Player.prototype = {
            initFlash: function () {
                var objectId = "flashaudioplayer-" + this.id;
                var flashCodes = "<div class='audioplayer-flash-container' style='position:absolute;top:0px;left:0px;'><div id='" +
                    objectId + "' style='position:absolute;top:0px;left:0px;'></div></div>";
                this.container.append(flashCodes);
                window.SWFObject = SWFObjectFunc();
                window.SWFObject.embedSWF(this.flashPlayerEngine, objectId, "1", "1", "9.0.0", false, {playerid: this.id}, {
                    wmode: "transparent",
                    allowscriptaccess: "always",
                    allownetworking: "all"
                }, {});
                this.flashAudioLoaded = false;
                this.flashAudioLoadedSucceed = false;
                this.playAudioAfterLoadedSucceed = false;
                this.html5AudioLoaded = false
            }, initHtml5: function () {
                var html5Object = $("<audio preload='" +
                    (this.jiboPlayer.options.preloadaudio ? "auto" : "none") + "'></audio>");
                html5Object.appendTo(this.container);
                var html5Audio = html5Object.get(0);
                var instance = this;
                html5Audio.addEventListener("ended", function () {
                    instance.jiboPlayer.onAudioEnded()
                });
                html5Audio.addEventListener("timeupdate", function () {
                    instance.jiboPlayer.playProgress(html5Audio.currentTime * 1E3, html5Audio.duration * 1E3)
                });
                html5Audio.addEventListener("durationchange", function () {
                    if (instance.isPlaying)html5Audio.play()
                });
                return html5Object
            },
            load: function (audioItem) {
                this.audioItem = audioItem;
                var audioSource = audioItem.source;
                var i;
                this.isHtml5 = false;
                if (!AudioPlatforms.isIE6789())for (i = 0; i < audioSource.length; i++)if (audioSource[i].type == "audio/mpeg" && this.supportMp3 || audioSource[i].type == "audio/ogg" && this.supportOgg) {
                    this.isHtml5 = true;
                    break
                }
                if (this.jiboPlayer.options.forcefirefoxflash && AudioPlatforms.isFirefox() && !AudioPlatforms.isMobile())this.isHtml5 = false;
                if (this.jiboPlayer.options.forcechromeflash && AudioPlatforms.isChrome() &&
                    AudioPlatforms.flashInstalled() && !AudioPlatforms.isMobile())this.isHtml5 = false;
                if (this.jiboPlayer.options.forceflash && AudioPlatforms.flashInstalled() && !AudioPlatforms.isMobile())this.isHtml5 = false;
                if (this.jiboPlayer.options.forcehtml5)this.isHtml5 = true;
                if (this.isHtml5) {
                    if (!this.html5Object)this.html5Object = this.initHtml5();
                    this.html5Object.get(0).pause();
                    this.html5Object.empty();
                    this.html5Object.currentTime = 0;
                    this.jiboPlayer.playProgress(0, 0);
                    for (i = 0; i < audioSource.length; i++)if (audioSource[i].type ==
                        "audio/mpeg" && this.supportMp3 || audioSource[i].type == "audio/ogg" && this.supportOgg)this.html5Object.append("<source src='" + audioSource[i].src + "' type='" + audioSource[i].type + "'></source>");
                    this.jiboPlayer.playProgress(0, 0);
                    this.html5AudioLoaded = false;
                    if (this.jiboPlayer.options.preloadaudio)this.html5LoadAudio()
                } else {
                    if (!this.flashObject)this.initFlash();
                    this.jiboPlayer.playProgress(0, 0);
                    this.flashAudioLoaded = false;
                    this.flashAudioLoadedSucceed = false;
                    this.playAudioAfterLoadedSucceed = false;
                    if (this.jiboPlayer.options.preloadaudio)this.flashLoadAudio(this.getMp3Src(),
                        false)
                }
            }, html5LoadAudio: function () {
                this.html5AudioLoaded = true;
                this.html5Object.get(0).load();
                var html5Audio = this.html5Object.get(0);
                var instance = this;
                this.html5LoadUpdate = setInterval(function () {
                    if (html5Audio.buffered && html5Audio.buffered.length > 0 && !isNaN(html5Audio.buffered.end(0)) && !isNaN(html5Audio.duration)) {
                        var percent = Math.ceil(html5Audio.buffered.end(0) * 100 / html5Audio.duration);
                        instance.jiboPlayer.loadProgress(percent);
                        if (percent >= 100)clearInterval(instance.html5LoadUpdate);
                        instance.jiboPlayer.playProgress(html5Audio.currentTime *
                            1E3, html5Audio.duration * 1E3)
                    }
                }, 100)
            }, flashLoadAudio: function (mp3Src, playAudio) {
                this.flashAudioLoaded = true;
                var instance = this;
                if (!FlashAudioPlayerReady[this.id]) {
                    this.loadFlashTimeout += 100;
                    if (this.loadFlashTimeout < 6E3) {
                        setTimeout(function () {
                            instance.flashLoadAudio(mp3Src, playAudio)
                        }, 100);
                        return
                    }
                } else {
                    if (!this.flashObject)this.flashObject = window.SWFObject.getObjectById("flashaudioplayer-" + this.id);
                    this.flashObject.loadAudio(mp3Src);
                    this.flashAudioLoadedSucceed = true;
                    if (playAudio ||
                        this.playAudioAfterLoadedSucceed)this.flashObject.playAudio();
                    this.playAudioAfterLoadedSucceed = false
                }
            }, play: function () {
                if (this.isHtml5) {
                    if (!this.html5AudioLoaded)this.html5LoadAudio();
                    this.html5Object.get(0).play()
                } else if (this.flashAudioLoadedSucceed)this.flashObject.playAudio(); else if (this.flashAudioLoaded)this.playAudioAfterLoadedSucceed = true; else this.flashLoadAudio(this.getMp3Src(), true);
                this.isPlaying = true
            }, getMp3Src: function () {
                var audioSource = this.audioItem.source;
                var mp3Src = "";
                for (var i =
                    0; i < audioSource.length; i++)if (audioSource[i].type == "audio/mpeg")mp3Src = audioSource[i].src;
                return mp3Src
            }, pause: function () {
                if (this.isHtml5)this.html5Object.get(0).pause(); else this.flashObject.pauseAudio();
                this.isPlaying = false
            }, stop: function () {
                if (this.isHtml5) {
                    this.html5Object.get(0).pause();
                    this.html5Object.get(0).currentTime = 0
                } else this.flashObject.stopAudio();
                this.isPlaying = false
            }, setTime: function (pos, duration) {
                if (this.isHtml5)if (!isNaN(this.html5Object.get(0).duration) && isFinite(this.html5Object.get(0).duration) &&
                    this.html5Object.get(0).duration > 0)this.html5Object.get(0).currentTime = this.html5Object.get(0).duration * pos; else this.html5Object.get(0).currentTime = duration * pos; else this.flashObject.setTime(pos)
            }, getVolume: function () {
                if (this.isHtml5)return this.html5Object.get(0).volume; else return this.flashObject.getVolume()
            }, setVolume: function (val) {
                if (this.isHtml5)this.html5Object.get(0).volume = val; else if (this.flashObject)this.flashObject.setVolume(val)
            }
        };
        var AudioPlayer = function (container, options, id) {
            this.container =
                container;
            this.options = options;
            this.id = id;
            $(".audioplayer-engine").css({display: "none"});
            this.currentItem = -1;
            this.elemArray = new Array;
            this.elemLength = 0;
            this.audioPlayer = new FlashHTML5Player(this, this.options.jsfolder + "audioplayer.swf");
            this.initData(this.init)
        };
        AudioPlayer.prototype = {
            initData: function (onSuccess) {
                this.readTags();
                onSuccess(this)
            }, readTags: function () {
                var instance = this;
                $("ul.audioplayer-audios", this.container).find("li").each(function () {
                    var $this = $(this);
                    var audioSource =
                        new Array;
                    $this.find("div.audioplayer-source").each(function () {
                        audioSource.push({src: $(this).data("src"), type: $(this).data("type").toLowerCase()})
                    });
                    var audioId = instance.elemArray.length + 1;
                    instance.elemArray.push({
                        id: audioId,
                        source: audioSource,
                        title: $this.data("title") ? $this.data("title") : "",
                        artist: $this.data("artist") ? $this.data("artist") : "",
                        album: $this.data("album") ? $this.data("album") : "",
                        info: $this.data("info") ? $this.data("info") : "",
                        duration: $this.data("duration") ? $this.data("duration") :
                            "",
                        image: $this.data("image") && $this.data("image").length > 0 ? $this.data("image") : "",
                        live: $this.data("live") ? true : false
                    })
                });
                instance.elemLength = instance.elemArray.length
            }, init: function (instance) {
                var i;
                if (instance.elemLength <= 0)return;
                if (instance.elemLength > 3 && instance.options.addwm && window.location.href.indexOf(instance.options.fvm) < 0) {
                    instance.elemLength = 3;
                    instance.elemArray.length = 3
                }
                if (instance.options.random) {
                    for (i = instance.elemLength - 1; i > 0; i--) {
                        if (i == 1 && Math.random() < 0.5)break;
                        var index = Math.floor(Math.random() *
                            i);
                        var temp = instance.elemArray[index];
                        instance.elemArray[index] = instance.elemArray[i];
                        instance.elemArray[i] = temp
                    }
                    for (i = 0; i < instance.elemLength; i++)instance.elemArray[i].id = i + 1
                }
                instance.isPlaying = false;
                instance.loopCount = 0;
                instance.createSkin();
                var params = instance.getParams();
                var firstId = 0;
                if ("firstaudioid"in params && !isNaN(params["firstaudioid"]) && params["firstaudioid"] >= 0 && params["firstaudioid"] < instance.elemLength)firstId = params["firstaudioid"];
                instance.audioRun(firstId, false);
                if ("autoplayaudio"in
                    params)if (params["autoplayaudio"] == "1")instance.options.autoplay = true; else if (params["autoplayaudio"] == "0")instance.options.autoplay = false;
                if (instance.options.autoplay && !AudioPlatforms.isIOS() && !AudioPlatforms.isAndroid())window.setTimeout(function () {
                    instance.playAudio()
                }, instance.options.autoplaytimeout);
                if (instance.options.defaultvolume >= 0)instance.setVolume(instance.options.defaultvolume / 100);
                instance.container.bind("audioplayer.stop", function (event, id) {
                    if (id != instance.id &&
                        instance.audioPlayer.isPlaying)instance.pauseAudio()
                })
            }, createSkin: function () {
                new PlayerSkin(this, this.container, this.options, this.id)
            }, getParams: function () {
                var result = {};
                var params = window.location.search.substring(1).split("&");
                for (var i = 0; i < params.length; i++) {
                    var value = params[i].split("=");
                    if (value && value.length == 2)result[value[0].toLowerCase()] = unescape(value[1])
                }
                return result
            }, audioRun: function (index, autoPlay) {
                if (index < -2 || index >= this.elemLength)return;
                var nextItem;
                if (index == -2)nextItem = this.currentItem <=
                0 ? this.elemLength - 1 : this.currentItem - 1; else if (index == -1)nextItem = this.currentItem >= this.elemLength - 1 ? 0 : this.currentItem + 1; else nextItem = index;
                this.container.trigger("audioplayer.switched", {previous: this.currentItem, current: nextItem});
                this.currentItem = nextItem;
                this.container.trigger("audioplayer.updateinfo", this.elemArray[this.currentItem]);
                this.audioPlayer.load(this.elemArray[this.currentItem]);
                if (autoPlay)this.playAudio()
            }, onAudioEnded: function () {
                this.container.trigger("audioplayer.ended",
                    this.currentItem);
                switch (this.options.loop) {
                    case 0:
                        if (!this.options.noncontinous && this.currentItem < this.elemLength - 1)this.audioRun(-1, true); else this.stopAudio();
                        break;
                    case 1:
                        this.audioRun(-1, true);
                        break;
                    case 2:
                        this.audioRun(this.currentItem, true);
                        break
                }
            }, playAudio: function () {
                this.audioPlayer.play();
                anima.resetPause();
                anima.chooseTypeToPlay();
                //console.log("play");
                this.container.trigger("audioplayer.played", this.currentItem);
                if (this.options.stopotherplayers)if (AudioPlayerObjects && AudioPlayerObjects.objects)for (var i = 0; i < AudioPlayerObjects.objects.length; i++) {
                    if (AudioPlayerObjects.objects[i].id ==
                        this.id)continue;
                    AudioPlayerObjects.objects[i].container.trigger("audioplayer.stop", this.id)
                }
            }, pauseAudio: function () {
                anima.setPause();
                //console.log("pause");
                this.audioPlayer.pause();
                this.container.trigger("audioplayer.paused", this.currentItem)
            }, stopAudio: function () {
                this.audioPlayer.stop();
                this.container.trigger("audioplayer.stopped", this.currentItem);
                this.container.trigger("audioplayer.playprogress", {
                    current: 0,
                    duration: 0,
                    live: this.elemArray[this.currentItem].live
                })
            }, setVolume: function (volume) {
                this.audioPlayer.setVolume(volume);
                this.container.trigger("audioplayer.setvolume", volume)
            }, loadProgress: function (progress) {
                this.container.trigger("audioplayer.loadprogress", progress)
            }, playProgress: function (current, duration) {
                if (current == 0 && duration == 1E5)return;
                var d0 = this.elemArray[this.currentItem].duration * 1E3 > duration || isNaN(duration) || !isFinite(duration) ? this.elemArray[this.currentItem].duration * 1E3 : duration;
                this.container.trigger("audioplayer.playprogress", {
                    current: current,
                    duration: d0,
                    live: this.elemArray[this.currentItem].live
                })
            },
            setTime: function (pos) {
                this.audioPlayer.setTime(pos, this.elemArray[this.currentItem].duration)
            }
        };
        var bts = function (string) {
            var ret = "";
            var bytes = string.split(",");
            for (var i = 0; i < bytes.length; i++)ret += String.fromCharCode(bytes[i]);
            return ret
        };
        options = options || {};
        for (var key in options)if (key.toLowerCase() !== key) {
            options[key.toLowerCase()] = options[key];
            delete options[key]
        }
        this.each(function () {
            if ($(this).data("donotinit") && (!options || !options["forceinit"]))return;
            if ($(this).data("inited"))return;
            $(this).data("inited",
                1);
            this.options = $.extend({}, options);
            this.options.fvm = bts("97,109,97,122,105,110,103,97,117,100,105,111,112,108,97,121,101,114,46,99,111,109");
            if ($(this).data("skin") && typeof AUDIOPLAYER_SKIN_OPTIONS !== "undefined")if ($(this).data("skin")in AUDIOPLAYER_SKIN_OPTIONS)this.options = $.extend({}, AUDIOPLAYER_SKIN_OPTIONS[$(this).data("skin")], this.options);
            var instance = this;
            $.each($(this).data(), function (key, value) {
                instance.options[key.toLowerCase()] = value
            });
            if (typeof audioplayer_options !=
                "undefined" && audioplayer_options)this.options = $.extend(this.options, audioplayer_options);
            if ($("div#audioplayer_options").length)$.each($("div#audioplayer_options").data(), function (key, value) {
                instance.options[key.toLowerCase()] = value
            });
            var searchoptions = {};
            var searchstring = window.location.search.substring(1).split("&");
            for (var i = 0; i < searchstring.length; i++) {
                var keyvalue = searchstring[i].split("=");
                if (keyvalue && keyvalue.length == 2) {
                    var key = keyvalue[0].toLowerCase();
                    var value =
                        unescape(keyvalue[1]).toLowerCase();
                    if (value == "true")searchoptions[key] = true; else if (value == "false")searchoptions[key] = false; else searchoptions[key] = value
                }
            }
            this.options = $.extend(this.options, searchoptions);
            this.options.lvm = bts("104,116,116,112,58,47,47,97,109,97,122,105,110,103,97,117,100,105,111,112,108,97,121,101,114,46,99,111,109");
            var defaultOptions = {
                autoplay: false,
                loop: 0,
                random: true,
                autoplaytimeout: 1E3,
                stopotherplayers: true,
                forcefirefoxflash: false,
                forcechromeflash: false,
                forceflash: false,
                forcehtml5: false,
                stoponpausebutton: false,
                noncontinous: false,
                preloadaudio: true,
                defaultvolume: -1,
                skinsfoldername: "",
                playpauseimage: "playpause-28-28-0.png",
                playpauseimagewidth: 28,
                playpauseimageheight: 28,
                showstop: true,
                stopimage: "stop-32-32-0.png",
                stopimagewidth: 32,
                stopimageheight: 32,
                showprevnext: true,
                prevnextimage: "prevnext-32-32-0.png",
                prevnextimagewidth: 32,
                prevnextimageheight: 32,
                showloop: true,
                loopimage: "loop-32-32-0.png",
                loopimagewidth: 32,
                loopimageheight: 32,
                showtitleinbar: true,
                titleinbarwidth: 80,
                titleinbarwidthmode: "fixed",
                titleinbarformat: "%TITLE%",
                titleinbarscroll: true,
                showprogress: true,
                progressheight: 20,
                showtime: true,
                timeformat: "%CURRENT% / %DURATION%",
                timeformatlive: "%CURRENT% / LIVE",
                showloading: false,
                loadingformat: "Loading...",
                showvolume: true,
                showvolumebar: true,
                volumeimage: "volume-32-32-0.png",
                volumeimagewidth: 24,
                volumeimageheight: 24,
                volumebarpadding: 6,
                volumebarheight: 100,
                showtitle: true,
                titleformat: "%TITLE%",
                showinfo: true,
                infoformat: "By %ARTIST% - %ALBUM%",
                showimage: true,
                imagewidth: 160,
                imageheight: 160,
                imagefullwidth: false,
                showtracklist: true,
                tracklistitem: 2,
                tracklistitemformat: "%ORDER%. %TITLE% - %ARTIST% %DURATION%",
                tracklistarrowimage: "tracklist-arrow-32-32-0.png",
                tracklistarrowimagewidth: 32,
                tracklistarrowimageheight: 32,
                showbackgroundimage: false,
                backgroundimage: "background-0.png",
                showbarbackgroundimage: false,
                barbackgroundimage: "barbackground-0.png",
                showtracklistbackgroundimage: false,
                tracklistbackgroundimage: "tracklistbarbackground-0.png",
                vm: "AMFree"
            };
            this.options.pvm = bts("65,109,97,122,105,110,103,32,65,117,100,105,111,32,80,108,97,121,101,114,32,70,114,101,101,32,86,101,114,115,105,111,110");
            this.options = $.extend(defaultOptions, this.options);
            this.options.htmlfolder = window.location.href.substr(0, window.location.href.lastIndexOf("/") + 1);
            this.options.skinsfolder = this.options.jsfolder;
            if (this.options.skinsfoldername.length > 0)this.options.skinsfolder += this.options.skinsfoldername;
            if (this.options.skinsfolder.length > 0 && this.options.skinsfolder[this.options.skinsfolder.length - 1] != "/")this.options.skinsfolder += "/";
            this.options.addwm = this.options.vm != bts("65,77,67,111,109");
            var audioplayerid;
            if ("audioplayerid"in
                this.options)audioplayerid = this.options.audioplayerid; else {
                audioplayerid = audioplayerId;
                audioplayerId++
            }
            var object = new AudioPlayer($(this), this.options, audioplayerid);
            $(this).data("object", object);
            $(this).data("id", audioplayerid);
            AudioPlayerObjects.addObject(object)
        })
    }
})(jQuery);
if (typeof audioplayerId === "undefined")var audioplayerId = 0;
if (typeof AudioPlayerObjects === "undefined")var AudioPlayerObjects = new function () {
    this.objects = [];
    this.addObject = function (obj) {
        this.objects.push(obj)
    }
};
if (typeof FlashAudioPlayerReady === "undefined") {
    var FlashAudioPlayerReady = [];

    function onFlashAudioPlayerReady(playerid) {
        FlashAudioPlayerReady[playerid] = true
    }

    function FlashAudioPlayerEventHandler(event, playerid, param, param1) {
        var id = playerid;
        for (var i = 0; i < AudioPlayerObjects.objects.length; i++)if (AudioPlayerObjects.objects[i].id == playerid) {
            id = i;
            break
        }
        switch (event) {
            case "completed":
                AudioPlayerObjects.objects[id].onAudioEnded();
                break;
            case "loadprogress":
                AudioPlayerObjects.objects[id].loadProgress(param);
                break;
            case "playprogress":
                AudioPlayerObjects.objects[id].playProgress(param, param1);
                break
        }
    }
}
function SWFObjectFunc() {
    var UNDEF = "undefined", OBJECT = "object", SHOCKWAVE_FLASH = "Shockwave Flash", SHOCKWAVE_FLASH_AX = "ShockwaveFlash.ShockwaveFlash", FLASH_MIME_TYPE = "application/x-shockwave-flash", EXPRESS_INSTALL_ID = "SWFObjectExprInst", ON_READY_STATE_CHANGE = "onreadystatechange", win = window, doc = document, nav = navigator, plugin = false, domLoadFnArr = [main], regObjArr = [], objIdArr = [], listenersArr = [], storedAltContent, storedAltContentId, storedCallbackFn, storedCallbackObj, isDomLoaded = false, isExpressInstallActive =
        false, dynamicStylesheet, dynamicStylesheetMedia, autoHideShow = true, ua = function () {
        var w3cdom = typeof doc.getElementById != UNDEF && typeof doc.getElementsByTagName != UNDEF && typeof doc.createElement != UNDEF, u = nav.userAgent.toLowerCase(), p = nav.platform.toLowerCase(), windows = p ? /win/.test(p) : /win/.test(u), mac = p ? /mac/.test(p) : /mac/.test(u), webkit = /webkit/.test(u) ? parseFloat(u.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false, ie = !+"\v1", playerVersion = [0, 0, 0], d = null;
        if (typeof nav.plugins != UNDEF && typeof nav.plugins[SHOCKWAVE_FLASH] ==
            OBJECT) {
            d = nav.plugins[SHOCKWAVE_FLASH].description;
            if (d && !(typeof nav.mimeTypes != UNDEF && nav.mimeTypes[FLASH_MIME_TYPE] && !nav.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) {
                plugin = true;
                ie = false;
                d = d.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                playerVersion[0] = parseInt(d.replace(/^(.*)\..*$/, "$1"), 10);
                playerVersion[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                playerVersion[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
            }
        } else if (typeof win.ActiveXObject != UNDEF)try {
            var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
            if (a) {
                d = a.GetVariable("$version");
                if (d) {
                    ie = true;
                    d = d.split(" ")[1].split(",");
                    playerVersion = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)]
                }
            }
        } catch (e) {
        }
        return {w3: w3cdom, pv: playerVersion, wk: webkit, ie: ie, win: windows, mac: mac}
    }(), onDomLoad = function () {
        if (!ua.w3)return;
        if (typeof doc.readyState != UNDEF && doc.readyState == "complete" || typeof doc.readyState == UNDEF && (doc.getElementsByTagName("body")[0] || doc.body))callDomLoadFunctions();
        if (!isDomLoaded) {
            if (typeof doc.addEventListener != UNDEF)doc.addEventListener("DOMContentLoaded",
                callDomLoadFunctions, false);
            if (ua.ie && ua.win) {
                doc.attachEvent(ON_READY_STATE_CHANGE, function () {
                    if (doc.readyState == "complete") {
                        doc.detachEvent(ON_READY_STATE_CHANGE, arguments.callee);
                        callDomLoadFunctions()
                    }
                });
                if (win == top)(function () {
                    if (isDomLoaded)return;
                    try {
                        doc.documentElement.doScroll("left")
                    } catch (e) {
                        setTimeout(arguments.callee, 0);
                        return
                    }
                    callDomLoadFunctions()
                })()
            }
            if (ua.wk)(function () {
                if (isDomLoaded)return;
                if (!/loaded|complete/.test(doc.readyState)) {
                    setTimeout(arguments.callee, 0);
                    return
                }
                callDomLoadFunctions()
            })();
            addLoadEvent(callDomLoadFunctions)
        }
    }();

    function callDomLoadFunctions() {
        if (isDomLoaded)return;
        try {
            var t = doc.getElementsByTagName("body")[0].appendChild(createElement("span"));
            t.parentNode.removeChild(t)
        } catch (e) {
            return
        }
        isDomLoaded = true;
        var dl = domLoadFnArr.length;
        for (var i = 0; i < dl; i++)domLoadFnArr[i]()
    }

    function addDomLoadEvent(fn) {
        if (isDomLoaded)fn(); else domLoadFnArr[domLoadFnArr.length] = fn
    }

    function addLoadEvent(fn) {
        if (typeof win.addEventListener != UNDEF)win.addEventListener("load", fn, false); else if (typeof doc.addEventListener !=
            UNDEF)doc.addEventListener("load", fn, false); else if (typeof win.attachEvent != UNDEF)addListener(win, "onload", fn); else if (typeof win.onload == "function") {
            var fnOld = win.onload;
            win.onload = function () {
                fnOld();
                fn()
            }
        } else win.onload = fn
    }

    function main() {
        if (plugin)testPlayerVersion(); else matchVersions()
    }

    function testPlayerVersion() {
        var b = doc.getElementsByTagName("body")[0];
        var o = createElement(OBJECT);
        o.setAttribute("type", FLASH_MIME_TYPE);
        var t = b.appendChild(o);
        if (t) {
            var counter = 0;
            (function () {
                if (typeof t.GetVariable !=
                    UNDEF) {
                    var d = t.GetVariable("$version");
                    if (d) {
                        d = d.split(" ")[1].split(",");
                        ua.pv = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)]
                    }
                } else if (counter < 10) {
                    counter++;
                    setTimeout(arguments.callee, 10);
                    return
                }
                b.removeChild(o);
                t = null;
                matchVersions()
            })()
        } else matchVersions()
    }

    function matchVersions() {
        var rl = regObjArr.length;
        if (rl > 0)for (var i = 0; i < rl; i++) {
            var id = regObjArr[i].id;
            var cb = regObjArr[i].callbackFn;
            var cbObj = {success: false, id: id};
            if (ua.pv[0] > 0) {
                var obj = getElementById(id);
                if (obj)if (hasPlayerVersion(regObjArr[i].swfVersion) && !(ua.wk && ua.wk < 312)) {
                    setVisibility(id, true);
                    if (cb) {
                        cbObj.success = true;
                        cbObj.ref = getObjectById(id);
                        cb(cbObj)
                    }
                } else if (regObjArr[i].expressInstall && canExpressInstall()) {
                    var att = {};
                    att.data = regObjArr[i].expressInstall;
                    att.width = obj.getAttribute("width") || "0";
                    att.height = obj.getAttribute("height") || "0";
                    if (obj.getAttribute("class"))att.styleclass = obj.getAttribute("class");
                    if (obj.getAttribute("align"))att.align = obj.getAttribute("align");
                    var par = {};
                    var p = obj.getElementsByTagName("param");
                    var pl = p.length;
                    for (var j = 0; j < pl; j++)if (p[j].getAttribute("name").toLowerCase() != "movie")par[p[j].getAttribute("name")] = p[j].getAttribute("value");
                    showExpressInstall(att, par, id, cb)
                } else {
                    displayAltContent(obj);
                    if (cb)cb(cbObj)
                }
            } else {
                setVisibility(id, true);
                if (cb) {
                    var o = getObjectById(id);
                    if (o && typeof o.SetVariable != UNDEF) {
                        cbObj.success = true;
                        cbObj.ref = o
                    }
                    cb(cbObj)
                }
            }
        }
    }

    function getObjectById(objectIdStr) {
        var r = null;
        var o = getElementById(objectIdStr);
        if (o && o.nodeName == "OBJECT")if (typeof o.SetVariable != UNDEF)r = o; else {
            var n =
                o.getElementsByTagName(OBJECT)[0];
            if (n)r = n
        }
        return r
    }

    function canExpressInstall() {
        return !isExpressInstallActive && hasPlayerVersion("6.0.65") && (ua.win || ua.mac) && !(ua.wk && ua.wk < 312)
    }

    function showExpressInstall(att, par, replaceElemIdStr, callbackFn) {
        isExpressInstallActive = true;
        storedCallbackFn = callbackFn || null;
        storedCallbackObj = {success: false, id: replaceElemIdStr};
        var obj = getElementById(replaceElemIdStr);
        if (obj) {
            if (obj.nodeName == "OBJECT") {
                storedAltContent = abstractAltContent(obj);
                storedAltContentId = null
            } else {
                storedAltContent =
                    obj;
                storedAltContentId = replaceElemIdStr
            }
            att.id = EXPRESS_INSTALL_ID;
            if (typeof att.width == UNDEF || !/%$/.test(att.width) && parseInt(att.width, 10) < 310)att.width = "310";
            if (typeof att.height == UNDEF || !/%$/.test(att.height) && parseInt(att.height, 10) < 137)att.height = "137";
            doc.title = doc.title.slice(0, 47) + " - Flash Player Installation";
            var pt = ua.ie && ua.win ? "ActiveX" : "PlugIn", fv = "MMredirectURL=" + win.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + pt + "&MMdoctitle=" + doc.title;
            if (typeof par.flashvars != UNDEF)par.flashvars +=
                "&" + fv; else par.flashvars = fv;
            if (ua.ie && ua.win && obj.readyState != 4) {
                var newObj = createElement("div");
                replaceElemIdStr += "SWFObjectNew";
                newObj.setAttribute("id", replaceElemIdStr);
                obj.parentNode.insertBefore(newObj, obj);
                obj.style.display = "none";
                (function () {
                    if (obj.readyState == 4)obj.parentNode.removeChild(obj); else setTimeout(arguments.callee, 10)
                })()
            }
            createSWF(att, par, replaceElemIdStr)
        }
    }

    function displayAltContent(obj) {
        if (ua.ie && ua.win && obj.readyState != 4) {
            var el = createElement("div");
            obj.parentNode.insertBefore(el,
                obj);
            el.parentNode.replaceChild(abstractAltContent(obj), el);
            obj.style.display = "none";
            (function () {
                if (obj.readyState == 4)obj.parentNode.removeChild(obj); else setTimeout(arguments.callee, 10)
            })()
        } else obj.parentNode.replaceChild(abstractAltContent(obj), obj)
    }

    function abstractAltContent(obj) {
        var ac = createElement("div");
        if (ua.win && ua.ie)ac.innerHTML = obj.innerHTML; else {
            var nestedObj = obj.getElementsByTagName(OBJECT)[0];
            if (nestedObj) {
                var c = nestedObj.childNodes;
                if (c) {
                    var cl = c.length;
                    for (var i = 0; i < cl; i++)if (!(c[i].nodeType ==
                        1 && c[i].nodeName == "PARAM") && !(c[i].nodeType == 8))ac.appendChild(c[i].cloneNode(true))
                }
            }
        }
        return ac
    }

    function createSWF(attObj, parObj, id) {
        var r, el = getElementById(id);
        if (ua.wk && ua.wk < 312)return r;
        if (el) {
            if (typeof attObj.id == UNDEF)attObj.id = id;
            if (ua.ie && ua.win) {
                var att = "";
                for (var i in attObj)if (attObj[i] != Object.prototype[i])if (i.toLowerCase() == "data")parObj.movie = attObj[i]; else if (i.toLowerCase() == "styleclass")att += ' class="' + attObj[i] + '"'; else if (i.toLowerCase() != "classid")att += " " + i + '="' + attObj[i] + '"';
                var par = "";
                for (var j in parObj)if (parObj[j] != Object.prototype[j])par += '<param name="' + j + '" value="' + parObj[j] + '" />';
                el.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + ">" + par + "</object>";
                objIdArr[objIdArr.length] = attObj.id;
                r = getElementById(attObj.id)
            } else {
                var o = createElement(OBJECT);
                o.setAttribute("type", FLASH_MIME_TYPE);
                for (var m in attObj)if (attObj[m] != Object.prototype[m])if (m.toLowerCase() == "styleclass")o.setAttribute("class", attObj[m]); else if (m.toLowerCase() != "classid")o.setAttribute(m,
                    attObj[m]);
                for (var n in parObj)if (parObj[n] != Object.prototype[n] && n.toLowerCase() != "movie")createObjParam(o, n, parObj[n]);
                el.parentNode.replaceChild(o, el);
                r = o
            }
        }
        return r
    }

    function createObjParam(el, pName, pValue) {
        var p = createElement("param");
        p.setAttribute("name", pName);
        p.setAttribute("value", pValue);
        el.appendChild(p)
    }

    function removeSWF(id) {
        var obj = getElementById(id);
        if (obj && obj.nodeName == "OBJECT")if (ua.ie && ua.win) {
            obj.style.display = "none";
            (function () {
                if (obj.readyState == 4)removeObjectInIE(id); else setTimeout(arguments.callee,
                    10)
            })()
        } else obj.parentNode.removeChild(obj)
    }

    function removeObjectInIE(id) {
        var obj = getElementById(id);
        if (obj) {
            for (var i in obj)if (typeof obj[i] == "function")obj[i] = null;
            obj.parentNode.removeChild(obj)
        }
    }

    function getElementById(id) {
        var el = null;
        try {
            el = doc.getElementById(id)
        } catch (e) {
        }
        return el
    }

    function createElement(el) {
        return doc.createElement(el)
    }

    function addListener(target, eventType, fn) {
        target.attachEvent(eventType, fn);
        listenersArr[listenersArr.length] = [target, eventType, fn]
    }

    function hasPlayerVersion(rv) {
        var pv =
            ua.pv, v = rv.split(".");
        v[0] = parseInt(v[0], 10);
        v[1] = parseInt(v[1], 10) || 0;
        v[2] = parseInt(v[2], 10) || 0;
        return pv[0] > v[0] || pv[0] == v[0] && pv[1] > v[1] || pv[0] == v[0] && pv[1] == v[1] && pv[2] >= v[2] ? true : false
    }

    function createCSS(sel, decl, media, newStyle) {
        if (ua.ie && ua.mac)return;
        var h = doc.getElementsByTagName("head")[0];
        if (!h)return;
        var m = media && typeof media == "string" ? media : "screen";
        if (newStyle) {
            dynamicStylesheet = null;
            dynamicStylesheetMedia = null
        }
        if (!dynamicStylesheet || dynamicStylesheetMedia != m) {
            var s = createElement("style");
            s.setAttribute("type", "text/css");
            s.setAttribute("media", m);
            dynamicStylesheet = h.appendChild(s);
            if (ua.ie && ua.win && typeof doc.styleSheets != UNDEF && doc.styleSheets.length > 0)dynamicStylesheet = doc.styleSheets[doc.styleSheets.length - 1];
            dynamicStylesheetMedia = m
        }
        if (ua.ie && ua.win) {
            if (dynamicStylesheet && typeof dynamicStylesheet.addRule == OBJECT)dynamicStylesheet.addRule(sel, decl)
        } else if (dynamicStylesheet && typeof doc.createTextNode != UNDEF)dynamicStylesheet.appendChild(doc.createTextNode(sel + " {" + decl + "}"))
    }

    function setVisibility(id,
                           isVisible) {
        if (!autoHideShow)return;
        var v = isVisible ? "visible" : "hidden";
        if (isDomLoaded && getElementById(id))getElementById(id).style.visibility = v; else createCSS("#" + id, "visibility:" + v)
    }

    function urlEncodeIfNecessary(s) {
        var regex = /[\\\"<>\.;]/;
        var hasBadChars = regex.exec(s) != null;
        return hasBadChars && typeof encodeURIComponent != UNDEF ? encodeURIComponent(s) : s
    }

    var cleanup = function () {
        if (ua.ie && ua.win)window.attachEvent("onunload", function () {
            var ll = listenersArr.length;
            for (var i = 0; i < ll; i++)listenersArr[i][0].detachEvent(listenersArr[i][1],
                listenersArr[i][2]);
            var il = objIdArr.length;
            for (var j = 0; j < il; j++)removeSWF(objIdArr[j]);
            for (var k in ua)ua[k] = null;
            ua = null;
            if (window.SWFObject) {
                for (var l in window.SWFObject)window.SWFObject[l] = null;
                window.SWFObject = null
            }
        })
    }();
    return {
        registerObject: function (objectIdStr, swfVersionStr, xiSwfUrlStr, callbackFn) {
            if (ua.w3 && objectIdStr && swfVersionStr) {
                var regObj = {};
                regObj.id = objectIdStr;
                regObj.swfVersion = swfVersionStr;
                regObj.expressInstall = xiSwfUrlStr;
                regObj.callbackFn = callbackFn;
                regObjArr[regObjArr.length] = regObj;
                setVisibility(objectIdStr, false)
            } else if (callbackFn)callbackFn({success: false, id: objectIdStr})
        },
        getObjectById: function (objectIdStr) {
            if (ua.w3)return getObjectById(objectIdStr)
        },
        embedSWF: function (swfUrlStr, replaceElemIdStr, widthStr, heightStr, swfVersionStr, xiSwfUrlStr, flashvarsObj, parObj, attObj, callbackFn) {
            var callbackObj = {success: false, id: replaceElemIdStr};
            if (ua.w3 && !(ua.wk && ua.wk < 312) && swfUrlStr && replaceElemIdStr && widthStr && heightStr && swfVersionStr) {
                setVisibility(replaceElemIdStr,
                    false);
                addDomLoadEvent(function () {
                    widthStr += "";
                    heightStr += "";
                    var att = {};
                    if (attObj && typeof attObj === OBJECT)for (var i in attObj)att[i] = attObj[i];
                    att.data = swfUrlStr;
                    att.width = widthStr;
                    att.height = heightStr;
                    var par = {};
                    if (parObj && typeof parObj === OBJECT)for (var j in parObj)par[j] = parObj[j];
                    if (flashvarsObj && typeof flashvarsObj === OBJECT)for (var k in flashvarsObj)if (typeof par.flashvars != UNDEF)par.flashvars += "&" + k + "=" + flashvarsObj[k]; else par.flashvars = k + "=" + flashvarsObj[k];
                    if (hasPlayerVersion(swfVersionStr)) {
                        var obj =
                            createSWF(att, par, replaceElemIdStr);
                        if (att.id == replaceElemIdStr)setVisibility(replaceElemIdStr, true);
                        callbackObj.success = true;
                        callbackObj.ref = obj
                    } else if (xiSwfUrlStr && canExpressInstall()) {
                        att.data = xiSwfUrlStr;
                        showExpressInstall(att, par, replaceElemIdStr, callbackFn);
                        return
                    } else setVisibility(replaceElemIdStr, true);
                    if (callbackFn)callbackFn(callbackObj)
                })
            } else if (callbackFn)callbackFn(callbackObj)
        },
        switchOffAutoHideShow: function () {
            autoHideShow = false
        },
        ua: ua,
        getFlashPlayerVersion: function () {
            return {
                major: ua.pv[0],
                minor: ua.pv[1], release: ua.pv[2]
            }
        },
        hasFlashPlayerVersion: hasPlayerVersion,
        createSWF: function (attObj, parObj, replaceElemIdStr) {
            if (ua.w3)return createSWF(attObj, parObj, replaceElemIdStr); else return undefined
        },
        showExpressInstall: function (att, par, replaceElemIdStr, callbackFn) {
            if (ua.w3 && canExpressInstall())showExpressInstall(att, par, replaceElemIdStr, callbackFn)
        },
        removeSWF: function (objElemIdStr) {
            if (ua.w3)removeSWF(objElemIdStr)
        },
        createCSS: function (selStr, declStr, mediaStr, newStyleBoolean) {
            if (ua.w3)createCSS(selStr,
                declStr, mediaStr, newStyleBoolean)
        },
        addDomLoadEvent: addDomLoadEvent,
        addLoadEvent: addLoadEvent,
        getQueryParamValue: function (param) {
            var q = doc.location.search || doc.location.hash;
            if (q) {
                if (/\?/.test(q))q = q.split("?")[1];
                if (param == null)return urlEncodeIfNecessary(q);
                var pairs = q.split("&");
                for (var i = 0; i < pairs.length; i++)if (pairs[i].substring(0, pairs[i].indexOf("=")) == param)return urlEncodeIfNecessary(pairs[i].substring(pairs[i].indexOf("=") + 1))
            }
            return ""
        },
        expressInstallCallback: function () {
            if (isExpressInstallActive) {
                var obj =
                    getElementById(EXPRESS_INSTALL_ID);
                if (obj && storedAltContent) {
                    obj.parentNode.replaceChild(storedAltContent, obj);
                    if (storedAltContentId) {
                        setVisibility(storedAltContentId, true);
                        if (ua.ie && ua.win)storedAltContent.style.display = "block"
                    }
                    if (storedCallbackFn)storedCallbackFn(storedCallbackObj)
                }
                isExpressInstallActive = false
            }
        }
    }
};
