/// <reference path="jquery.js" />

(function(window, document, $)
{
	var
		$window = $(window),
		$html = $(document.documentElement);

	$(function()
	{
		var
			$menu,
			$menuOpener,
			$menuCloser,
			inLargeView = !isInSmallView(),
			isHeaderExpanded = false;
		
		function window_resize()
		{
			var
				vpWidth = $window.width(),
				vpHeight = $window.height(),
				scrollTop = $window.scrollTop();

			if (window.innerWidth < document.documentElement.offsetWidth)
				$html.addClass('zoomed');
			else
				$html.removeClass('zoomed');

			if (inLargeView)
			{
				if (isInSmallView())
				{
					inLargeView = false;

					setGaOnclick(false);

					$menu.addClass('avoid-transition');
					isHeaderExpanded = true;
					$menuOpener.trigger('click');

					window.setTimeout(function()
					{
						$menu
							.removeClass('avoid-transition')
					}, 1);
				}
			}
			else
			{
				if (!isInSmallView())
				{
					inLargeView = true;
					setGaOnclick(true);
				}
			}
		}

		function document_mousedown(e)
		{
			e.stopPropagation();
			
			if (0 === $(e.target).parents('body > header > nav').length)
			{
				$menuOpener.trigger('click');
			}
		}

		function isInSmallView()
		{
			return 3 === window.getComputedStyle(document.documentElement, '::before').content.length;
		}

		function setGaOnclick(forPc)
		{
			var
				n = (forPc) ? 'pc_button' : 'sp_button';

			$('[data-onclick]')
				.each(function(index, element)
				{
					element.setAttribute(
						'onclick',
						element.getAttribute('data-onclick').replace(/(?:pc|sp)_button/, n));
				});
		}

		setGaOnclick(inLargeView);

		$menu = $('body > header > nav');
		$menuOpener = $('<a href="javascript:" />');
		$menuCloser = $('<a href="javascript:" />');

		$window
			.on('resize', window_resize);

		window_resize();

		$menu
			.attr('aria-expanded', false);

		$menuOpener
			.appendTo($menu)
			.on('click', function(e)
			{
				var
					$self = $(e.currentTarget);

				$menu
					.attr('aria-expanded', !isHeaderExpanded);

				if (isHeaderExpanded)
					$menuCloser.detach();
				else
					$menuCloser.appendTo('body > header > nav');

				isHeaderExpanded = !isHeaderExpanded;

				e.preventDefault();
			})
			.parent()
			.children('div')
			.on('click', function(e)
			{
				if (document.querySelector('body > header.sticked'))
				{
					var
						logo = document.querySelector('body > header > nav li:first-child a');

					if (e.clientX <= logo.getBoundingClientRect().right)
					{
						location.href = logo.href;
					}
				}
			});

		$menuCloser
			.on('click', function(e)
			{
				$menuOpener.trigger('click');
				e.preventDefault();
			});

		$('body > header > nav > div a')
			.on('click', function(e)
			{
				if (isHeaderExpanded)
					$menuOpener.trigger('click');
			});

		$('body > footer > nav > a')
			.on('click', function(e)
			{
				e.preventDefault();

				$('html, body')
					.animate({ scrollTop: 0 }, { duration: 600 });
			});

		$('a[href]')
			.on('click', function(e)
			{
				var
					$to = $(e.currentTarget.hash);

				if ($to.length)
				{
					e.preventDefault();

					var
						navHeight = $('body > header > nav').outerHeight() ||
							Number(window.getComputedStyle($('body > header > nav > div')[0], ':after').paddingTop.replace(/\D+$/, '')) || 0;

					$('html, body')
						.animate({ scrollTop: $to.offset().top - navHeight }, { duration: 600 });
				}
			})
	});

	if (performance.navigation.type !== 1)
	{
		$window
			.on('load', function()
			{
				try
				{
					var
						$to = $(location.hash);

					if ($to.length)
					{
						$window.scrollTop(0);

						window.setTimeout(function()
						{
							var
								navHeight = $('body > header > nav').outerHeight() ||
									Number(window.getComputedStyle($('body > header > nav > div')[0], ':after').paddingTop.replace(/\D+$/, '')) || 0;

							$('html, body')
								.animate({ scrollTop: $to.offset().top - navHeight }, { duration: 720 });
						}, 100);
					}
				}
				catch (e) { }
			});
	}
})(window, document, window.jQuery);