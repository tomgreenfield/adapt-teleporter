define([ "coreJS/adapt" ], function(Adapt) {

	var $body;
	var $el;
	var $document;
	var keys = [];
	var $input;
	var validElement;

	function render() {
		$body = $("body");
		$el = $(Handlebars.templates.teleporter()).appendTo($body);
		$document = $(document).on("keyup", checkKeys);
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
				keyup: inputOnKeyUp,
				keydown: inputOnKeyDown
			});
			$document.on("keyup", hide);
			Adapt.on("menuView:ready pageView:ready", checkZIndex);
		});
	}

	function inputOnKeyUp(event) {
		if (event.which !== 13) validate(this.value);
	}

	function inputOnKeyDown(event) {
		if (event.which !== 13) return;

		event.preventDefault();

		validElement ? teleport(this.value, validElement) : shake();
	}

	function validate(id) {
		validElement = Adapt.mapById(id);

		if (validElement) checkVisibility(id);
		else $el.removeClass("valid-element locked-element");
	}

	function teleport(id, type) {
		if (type === "course") location.assign("#");
		else Adapt.once("page:scrollTo", onScrollTo).navigateToElement("." + id);
	}

	function onScrollTo(selector) {
		checkVisibility(selector.slice(1));
		highlight(selector);
	}

	function checkVisibility(id) {
		var isVisible = Adapt.findById(id).get("_isVisible");

		$el
			.removeClass(isVisible ? "locked-element" : "valid-element")
			.addClass(isVisible ? "valid-element" : "locked-element");
	}

	function highlight(selector) {
		$(selector)
			.velocity("finish")
			.velocity({ backgroundColor: "#f93" }, 0)
			.velocity("reverse", 1000, function() {
				checkVisibility(selector.slice(1));
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
			$input.off("keyup keydown").val("");
			$document.off("keyup", hide).on("keyup", checkKeys);
			Adapt.off("menuView:ready pageView:ready", checkZIndex);
		});
	}

	function checkZIndex() {
		var topZIndex = 0;
		var zIndex = parseInt($el.css("z-index"), 10) || 0;

		$body.find("*").not($el.selector).each(function() {
			var i = parseInt($(this).css("z-index"), 10);

			if (i > topZIndex) topZIndex = i;
		});

		if (topZIndex !== 0 && topZIndex >= zIndex) $el.css("z-index", topZIndex + 1);
	}

	Adapt.once("app:dataReady", function() { if (!Adapt.device.touch) render(); });

});