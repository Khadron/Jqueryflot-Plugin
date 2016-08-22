/*
*Flot plugin for valueLabel.
*Copyright (c) 2014 QiangKong
*Date: Tue Mar 25 2014 13:28:09
*Usage:
* var options = {
*        series: {
*             bars: {
*                 valueLabel: ['宋体', '12px', 'blue']
*             }
*        }
* }
*/
(function ($) {
	var options = {
		series: {
			bars: {
				valueLabel: []//label的样式，如字体大小、粗细。约定数组的最后一项为字体的颜色
			}
		}
	};
	function init(plot) {
		function valueLabel(p, ctx) {
			var d = p.getData();
			ctx.beginPath();
			for (var i = 0; i < d.length; i++) {
				var val = d[i].bars.valueLabel, center = d[i].bars.barWidth;

				if (!(val instanceof Array) && val.length == 0) {
					continue;
				}
				var data = d[i].data;
				for (var j = 0; j < data.length; j++) {
					var target = data[j];
					if (target != null) {
						var valLabel = target[1] == null ? '' : target[1];
						var curr = p.pointOffset({ x: target[0] + (center / 2), y: valLabel });
						ctx.fillStyle = val[val.length - 1];
						ctx.textAlign = 'Center';
						ctx.font = val.join(' ');
						ctx.fillText(valLabel, curr.left, curr.top - 4);
					}
				}
			}
			ctx.closePath();
		}
		plot.hooks.draw.push(valueLabel);
	}
	$.plot.plugins.push({
		init: init,
		options: options,
		name: 'valueLabel',
		version: '1.4'
	});

})(jQuery);