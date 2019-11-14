/// <reference path="jquery.js" />
/// <reference path="lory.js" />
/// <reference path="gsap.js" />

(function(window, document, $)
{
	var
		$window = $(window);

	$window.on('load', function()
	{
		var
			$header = $('body > header'),
			$navc = $('body > header > nav > div'),
			$actOnScroll = $('[data-act-on-scroll]'),
			$jsSliderOriginal = $('.js_slider').clone(false),
			navcScale = $window.width() / 1200,
			actions,
			startLoryFunctions = [],
			sliderTids = [],
			inLargeView = !isInSmallView(),
			initializedOnLargeView = false;

		function window_resize()
		{
			var
				vpWidth = $window.width(),
				vpHeight = $window.height(),
				scrollTop = $window.scrollTop();

			if (inLargeView)
			{
				if (isInSmallView())
				{
					inLargeView = false;

					setupJsSlidersForSmallView();
					startLory();

					if (initializedOnLargeView && $actOnScroll.length > 0)
					{
						$actOnScroll
							.each(function(index, element)
							{
								var aid = element.getAttribute('data-act-on-scroll');

								if (actions.hasOwnProperty(aid))
								{
									actions[aid].clear(element);
									delete actions[aid];
								}
							});

						$actOnScroll = [];
					}
				}
			}
			else
			{
				if (!isInSmallView())
				{
					inLargeView = true;

					setupJsSlidersForLargeView();
					startLory();
				}
			}
		}

		function window_resize2()
		{
			if (!isInSmallView())
			{
				if ($window.width() <= 1280)
				{
					navcScale = $window.width() / 1280;

					var c = 'scale(' + navcScale + ')' + (($('body > header.sticked').length === 0) ? ' translateY(' + ((1 - navcScale) * 100 + 100) + '%)' : '');

					$navc.css({ transform: c, '-webkit-transform': c, 'overflow': 'visible' });
				}
				else
				{
					$navc.css({ transform: '', '-webkit-transform': '', 'overflow': '' });
					navcScale = 1;
				}
			}
			else
			{
				$navc.css({ transform: '', '-webkit-transform': '', 'overflow': '' });
			}
		}

		function window_scroll()
		{
			var
				vpHeight = $window.height(),
				scrollTop = $window.scrollTop(),
				scrollBottom = vpHeight + scrollTop,
				c;

			if (scrollTop >= $header.offset().top + $header.outerHeight())
			{
				$header.addClass('sticked');
				c = 'scale(' + navcScale + ')';
			}
			else
			{
				$header.removeClass('sticked');
				c = 'scale(' + navcScale + ')' + ' translateY(' + ((1 - navcScale) * 100 + 100) + '%)';
			}

			if (inLargeView)
			{
				if (navcScale < 1)
					$navc.css({ transform: c, '-webkit-transform': c, 'overflow': 'visible' });
				else
					$navc.css({ transform: '', '-webkit-transform': '', 'overflow': '' });
			}

			if (inLargeView && $actOnScroll.length > 0)
			{
				for (var i = 0; i < $actOnScroll.length; i++)
				{
					var
						targetBottom = $actOnScroll.eq(i).offset().top + $actOnScroll.eq(i).outerHeight();

					if (scrollTop < targetBottom && scrollBottom > targetBottom)
					{
						var
							aid = $actOnScroll[i].getAttribute('data-act-on-scroll');

						if (actions.hasOwnProperty(aid))
						{
							actions[aid].act($actOnScroll[i]);

							delete actions[aid];

							$actOnScroll[i].removeAttribute('data-act-on-scroll');
							$actOnScroll = $('[data-act-on-scroll]');
						}
					}
				}
			}
		}

		function isInSmallView()
		{
			return 3 === window.getComputedStyle(document.documentElement, '::before').content.length;
		}

		function startLory()
		{
			var i = 0;

			for (; i < sliderTids.length; i++)
			{
				window.clearTimeout(sliderTids[i].tid);
			}

			for (i = 0; i < startLoryFunctions.length; i++)
			{
				startLoryFunctions[i]();
			}
		}

		function resetJsSliders()
		{
			while (sliderTids.length > 0)
			{
				window.clearTimeout(sliderTids[0].tid);
				sliderTids.shift();
			}

			while (startLoryFunctions.length > 0)
			{
				startLoryFunctions.pop();
			}

			$('.js_slider')
				.each(function(index, element)
				{
					element.parentNode.replaceChild(
						$jsSliderOriginal[index].cloneNode(true), element);
				});
		}

		function setupJsSliders()
		{
			$('.js_slider')
				.find('.js_slide')
				.each(function(index, element)
				{
					$('.js_indicator')
						.append('<li><a href="javascript:" /></li>');
				})
				.end()
				.each(function(index, element)
				{
					var
						$self = $(element),
						$indicators = $self.find('.js_indicator li'),
						sliderTimeout = { tid: undefined };

					function window_interval()
					{
						($self.data().lory || { next: $.noop }).next();
					}

					function startFunction()
					{
						sliderTimeout.tid = window.setTimeout(window_interval, 5000);
					}

					sliderTids.push(sliderTimeout);
					startLoryFunctions.push(startFunction);

					$indicators
						.eq(0)
						.addClass('active')
						.end()
						.find('a')
						.on('click', function(e)
						{
							var
								$a = $(e.currentTarget);

							e.preventDefault();

							$self.data().lory.slideTo(
								$a.parent().parent().children().index($a.parent()));
						});

					element.addEventListener('before.lory.slide', function(e, a)
					{
						window.clearTimeout(sliderTimeout.tid);
					});

					element.addEventListener('after.lory.slide', function(e, a)
					{
						$indicators
							.removeClass('active')
							.eq(e.detail.currentSlide - 1)
							.addClass('active');

						startFunction();
					});
				})
				.find('a.js_prev, a.js_next')
				.prop('href', 'javascript:');
		}

		function setupJsSlidersForLargeView()
		{
			resetJsSliders();

			setupJsSliders();

			$('.js_slider')
				.lory({
					infinite: 1,
					slideSpeed: 500,
					ease: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
				});
		}

		function setupJsSlidersForSmallView()
		{
			resetJsSliders();

			$('.js_slider')
				.find('[role="listitem"]')
				.each(function(index, element)
				{
					element.parentNode.parentNode.insertBefore(element, element.parentNode);
				})
				.end()
				.find('.js_slide')
				.detach()
				.end()
				.find('[role="listitem"]')
				.addClass('js_slide');

			setupJsSliders();

			$('.js_slider')
				.lory({
					infinite: 1,
					slideSpeed: 500,
					ease: 'cubic-bezier(0.46, 0.03, 0.52, 0.96)',
				});
		}

		actions = {
			a: {
				init: function(element)
				{
					var
						images = element.getElementsByTagName('img');

					TweenLite
						.set(images, { opacity: 0 });

					TweenLite
						.set(images[0], { clearProps: 'opacity' });
				},
				act: function(element)
				{
					var
						images = element.getElementsByTagName('img'),
						timeline = new TimelineLite;

					timeline
						.to(images[1], .56, { opacity: 1, ease: Power2.easeIn })
						.to(images[2], .56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[3], .56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[4], .56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[5], .56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[6], .56, { opacity: 1, ease: Power2.easeIn }, '-=.2');
				},
				clear: function(element)
				{
					var
						images = element.getElementsByTagName('img');

					TweenLite
						.set(images, { clearProps: 'opacity' });
				},
			},
			b: {
				init: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img');

					TweenLite
						.set(images, { opacity: 0 });
				},
				act: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img'),
						timeline = new TimelineLite;

					timeline
						.to(images[0], 0.56, { opacity: 1, ease: Power2.easeIn })
						.to(images[1], 0.56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[2], 0.56, { opacity: 1, ease: Power2.easeIn }, '-=.2');
				},
				clear: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img');

					TweenLite
						.set(images, { clearProps: 'opacity' });
				},
			},
			c: {
				init: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img');

					TweenLite
						.set(images, { opacity: 0 });
				},
				act: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img'),
						timeline = new TimelineLite;

					timeline
						.to(images[0], 0.56, { opacity: 1, ease: Power2.easeIn })
						.to(images[1], 0.56, { opacity: 1, ease: Power2.easeIn }, '-=.2')
						.to(images[2], 0.56, { opacity: 1, ease: Power2.easeIn }, '-=.2');
				},
				clear: function(element)
				{
					var
						images = $(element).parents('.features-list').find('img');

					TweenLite
						.set(images, { clearProps: 'opacity' });
				},
			},
			e: {
				init: function(element)
				{
					var
						images = element.getElementsByTagName('img');

					TweenLite
						.set(images, { opacity: 0 });
				},
				act: function(element)
				{
					var
						images = element.getElementsByTagName('img'),
						timeline = new TimelineLite;

					timeline
						.to(images[0], .64, { opacity: 1, ease: Power1.easeIn })
						.to(images[1], .64, { opacity: 1, ease: Power1.easeIn }, '+=.2');
				},
				clear: function(element)
				{
					var
						images = element.getElementsByTagName('img');

					TweenLite
						.set(images, { clearProps: 'opacity' });
				},
			}
		};

		$window
			.on('resize', window_resize)
			.on('resize', window_resize2)
			.one('scroll', function()
			{
				$window
					.on('scroll', window_scroll);
			});

		window_resize2();

		$('<p><a href="javascript:">もっと見る</a></p>')
			.insertAfter('#s6 ul')
			.on('click', function(e)
			{
				var
					$self = $(e.currentTarget),
					$cont = $self.parent();

				$self.detach();

				$cont
					.attr('aria-expanded', 'true');
			})
			.parent()
			.attr('aria-expanded', 'false');

		if (inLargeView)
		{
			setupJsSlidersForLargeView();
			startLory();

			$actOnScroll = $('[data-act-on-scroll]');

			$actOnScroll
				.each(function(index, element)
				{
					if (actions.hasOwnProperty(element.getAttribute('data-act-on-scroll')))
						actions[element.getAttribute('data-act-on-scroll')].init(element);
				});

			initializedOnLargeView = true;
		}
		else
		{
			setupJsSlidersForSmallView();
			startLory();
		}
	});
})(window, document, window.jQuery);