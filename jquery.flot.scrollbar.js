/*
*Flot plugin for scrollbar.
*Copyright (c) 2013 QiangKong
*Date: Fri Jan 04 2013 08:32:29
*Usage:
* var options = {
*         scrollbar: {
*                show: true
*         }  
* }
*/
(function ($) {
	/*
	flot设置
	*/
	var options = {
		scrollbar: {
			show: false, //是否显示滚动条
			scrollSize: 10, //滚动前进的大小，默认是前进10个刻度
			whenShow: 100//满足指定的刻度显示
		}
	};
	/*
	全局变量
	*/
	var box = {
		rawData: [],
		movStep: 0
	};
	var jBar = jBarLet = jBarMid = jBarRit = null, jBarWidth = track = 0;
	var axes = x_axis = null, xscale = count = 0, plotWidth = xaxisCount = 0, axesStep = 1;
	var currentBarPos = barSize = unit = barStep = scrollSize = scrollSpeed = 0, jBarBtnWidth = 15;
	var barClass = '.jfscroll-bar', scrollbarExist = false, scrollOption = null;
	/*
	初始化方法
	*/
	function init(plot, options) {

		function initOptions(plot, options) {
			scrollOption = options.scrollbar;
			if (scrollOption.show) {
				for (var i = 0; i < options.xaxes.length; i++) {
					options.xaxes[i].max = scrollOption.scrollSize;
				}
			}
		}
		function scrollbar(plot) {
			var plotData = plot.getData();

			if (!scrollOption.show) {
				return;
			}
			if (scrollOption.whenShow > findDataMaxLength(plotData)) {
				return;
			}
			if ($(barClass).length > 0) {
				if (plotData != box.rawData) {
					unbindEvent();
				} else {
					return;
				}
				scrollbarExist = true;
			}

			scrollSize = scrollOption.scrollSize;
			box.rawData = plotData;
			plotWidth = plot.width();
			axes = plot.getAxes();
			x_axis = axes.xaxis;
			xaxisCount = Math.round(x_axis.datamax, 10);
			xscale = x_axis.scale;
			track = (plotWidth - 2 * jBarBtnWidth);
			barSize = track / xaxisCount;
			count = Math.abs(x_axis.max - x_axis.min);
			unit = plotWidth / count;
			barStep = scrollSize * (track - barSize) / xaxisCount;
			box.movStep = (track - barSize) / xaxisCount;

			function makeScrollbar() {
				var placeholder = plot.getPlaceholder();
				var plotHeight = placeholder.height();
				var plotOffset = plot.offset();
				var sTop = plotOffset.top + plotHeight;
				var sLeft = plotOffset.left;
				var html = '<div class="jfscroll-bar" style="top:' + sTop + 'px;left:' + sLeft + 'px;width:' + plotWidth + 'px;">' +
                '<div class="jfscroll-bar-btn jfscroll-bar-btn-top" style="left:0;"></div>' +
                '<div class="jfscroll-bar-mid" style="width:' + barSize + 'px;left:' + jBarBtnWidth + 'px;"></div>' +
				'<div class="jfscroll-bar-btn jfscroll-bar-btn-bot" style="right:0;" ></div>' + '</div>';
				$('body').append(html);
				jBar = $('.jfscroll-bar');
				jBarLet = $('.jfscroll-bar-btn-top');
				jBarMid = $('.jfscroll-bar-mid');
				jBarRit = $('.jfscroll-bar-btn-bot');

				$(window).resize(function (e) {
					setTimeout(function () {
						var po = plot.offset();
						jBar.css({ left: po.left, top: po.top + plotHeight });
					}, 200);
				});
			}

			function restScrollbar() {
				currentBarPos = 0;
				jBarMid.css({
					left: jBarBtnWidth,
					width: barSize
				});
			}

			function findDataMaxLength(fd) {
				var m = [];
				for (var i = 0; i < fd.length; i++) {
					m.push(fd[i].data.length);
				}
				//由小到大
				m.sort(function (a, b) {
					if (a > b) {
						return 1;
					} else if (a > b) {
						return -1
					} else if (a == b) {
						return 0;
					}
				});
				return m[m.length - 1];
			}

			if (!scrollbarExist) {
				makeScrollbar();
			} else {
				restScrollbar();
			}
			jBarWidth = jBar.width();
			axesStep = scrollSize * unit;

			bindEvent();
		}
		function setScrollbar(fn) {
			if (!fn) { return; }
			var roll = fn();
			var opts = x_axis.options, min, max;

			if (currentBarPos < jBarBtnWidth) {
				currentBarPos = jBarBtnWidth;
			}
			if (currentBarPos > jBarWidth - jBarBtnWidth - barSize) {
				currentBarPos = jBarWidth - jBarBtnWidth - barSize - 1;
			}
			jBarMid.css({ left: currentBarPos });
			min = x_axis.c2p(x_axis.p2c(x_axis.min) + roll);
			max = x_axis.c2p(x_axis.p2c(x_axis.max) + roll);
			if (min <= 0) {
				min = 0;
				max = scrollSize;
			}
			if (max >= xaxisCount) {
				min = xaxisCount - count;
				max = xaxisCount;
			}
			opts.min = min;
			opts.max = max;
			plot.setupGrid();
			plot.draw();
		}
		var barBtnClick = function (dir) {
			setScrollbar(function () {
				if (dir == 'left') {
					currentBarPos -= barStep;
					return axesStep * -1;
				} else {
					currentBarPos += barStep;
					return axesStep;
				}
			});
			scrollSpeed += 2;
			var t = 500 - scrollSpeed * 50;
			if (t <= 0) {
				t = 0;
			}
			scrollTimer = setTimeout(function () {
				barBtnClick(dir);
			}, t);
		}
		function bindEvent() {
			jBarLet.bind('mousedown', function (e) {
				barBtnClick('left');
				$(document).mouseup(function () {
					$(document).unbind();
					clearTimeout(scrollTimer);
					scrollSpeed = 0;
				});
			});
			jBarRit.bind('mousedown', function (e) {
				barBtnClick('right');
				$(document).mouseup(function () {
					$(document).unbind();
					clearTimeout(scrollTimer);
					scrollSpeed = 0;
				});
			});
			jBarMid.bind('mousedown', function (e) {
				var pageX = e.pageX;
				var pos = parseInt(jBarMid.css('left'), 10);
				$(document).mousemove(function (e2) {
					var mousePos = e2.pageX;
					currentBarPos = pos + mousePos - pageX;
					setScrollbar(function () {
						return getPlotUnit(currentBarPos) - getPlotUnit(jBarMid.css('left'));
					});
				});
				$(document).mouseup(function () {
					$(document).unbind();
				});
				return false;
			});
			jBar.mousewheel(function () {
				var current = this;
				setScrollbar(function () {
					if (current.delta > 0) {
						currentBarPos -= barStep;
						return axesStep * -1;
					} else {
						currentBarPos += barStep;
						return axesStep;
					}
				});
			});
		}
		function getPlotUnit(pos) {
			return ((parseInt(pos, 10) - jBarBtnWidth) / box.movStep) * unit;
		}
		function unbindEvent() {
			jBar.unbind('mousewheel');
			jBarLet.unbind('mousedown');
			jBarRit.unbind('mousedown');
			jBarMid.unbind('mousedown');
		}

		plot.hooks.processOptions.push(initOptions);
		plot.hooks.draw.push(scrollbar);
	}

	/*
	扩展jQuery滚轮事件
	*/
	$.fn.extend({
		mousewheel: function (fun) {
			return this.each(function () {
				var _self = this;
				_self.delta = 0;
				if ($.browser.msie || $.browser.safari) {
					_self.onmousewheel = function () {
						_self.delta = event.wheelDelta;
						event.returnValue = false;
						if (fun) {
							fun.call(_self);
						}
					}
				} else {
					_self.addEventListener('DOMMouseScroll', function (e) {
						_self.delta = e.detail > 0 ? -1 : 1;
						e.preventDefault();
						if (fun) {
							fun.call(_self);
						}
					}, false);
				}
			});
		}
	});

	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'scrollbar',
		version: '1.4'
	});

})(jQuery);