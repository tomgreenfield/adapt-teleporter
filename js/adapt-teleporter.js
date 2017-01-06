define([ "coreJS/adapt" ], function(Adapt) {

	var $body;
	var $el;
	var ids = [];
	var $document;
	var keys = [];
	var $input;
	var validId;

	function render() {
		$body = $("body");
		$el = $(Handlebars.templates.teleporter()).appendTo($body);
		collateIds();
		$document = $(document).on("keyup", checkKeys);
	}

	function collateIds() {
		ids.push(Adapt.course.get("_id"));

		for (var key in Adapt) {
			if (Adapt.hasOwnProperty(key)) {
				ids.push.apply(ids, _.keys(Adapt[key]._byAdaptID));
			}
		}
	}

	function checkKeys(event) {
		keys.push(event.which);

		if (keys.toString().indexOf("84,69,76,69") === -1) return;

		keys = [];
		$document.off("keyup", checkKeys);
		checkZIndex();
		show();
	}

	function show() {
		$el.velocity("fadeIn", 200, function() {
			$input = $el.find("input").focus().on({
				"input propertychange": onInput,
				keydown: onKeyDown
			});
			$document.on("keyup", hide);
			Adapt.on("menuView:ready pageView:ready", checkZIndex);
		});
	}

	function onInput() {
		validate(this.value);
	}

	function onKeyDown(event) {
		if (event.which !== 13) return;

		event.preventDefault();

		validId ? teleport() : shake();
	}

	function validate(id) {
		validId = _.contains(ids, id) ? id : false;
		toggleClasses();
	}

	function teleport() {
		if (Adapt.mapById(validId) === "course") location.assign("#");
		else Adapt.once("page:scrollTo", onScrollTo).navigateToElement("." + validId);
	}

	function onScrollTo(selector) {
		toggleClasses();
		highlight(selector);
	}

	function toggleClasses() {
		var isVisible = validId && Adapt.findById(validId).get("_isVisible");

		$el
			.toggleClass("valid-element", isVisible)
			.toggleClass("locked-element", validId && !isVisible);
	}

	function highlight(selector) {
		$(selector)
			.velocity("finish")
			.velocity({ backgroundColor: "#f93" }, 0)
			.velocity("reverse", 1000, function() {
				toggleClasses();
				$input.focus();
			});
	}

	function shake() {
		$el
			.velocity("stop", true)
			.velocity({ translateX: -5 }, 20)
			.velocity({ translateX: 5 }, { duration: 20, loop: 4 })
			.velocity({ translateX: 0 }, 20);
	}

	function hide(event) {
		if (event.which !== 27) return;

		$el.velocity("fadeOut", 200, function() {
			$el.removeClass("valid-element locked-element");
			$input.off("input propertychange keydown").val("");
			$document.off("keyup", hide).on("keyup", checkKeys);
			Adapt.off("menuView:ready pageView:ready", checkZIndex);
		});
	}

	function checkZIndex() {
		var topZIndex = 0;
		var zIndex = parseInt($el.css("z-index"), 10) || 0;

		$body.find("*").not($el).each(function() {
			var i = parseInt($(this).css("z-index"), 10);

			if (i > topZIndex) topZIndex = i;
		});

		if (topZIndex !== 0 && topZIndex >= zIndex) $el.css("z-index", topZIndex + 1);
	}

	Adapt.once("app:dataReady", function() { if (!Adapt.device.touch) render(); });

});