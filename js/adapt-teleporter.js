/*
* Teleporter
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Tom Greenfield
*/

define(function(require) {

	var Adapt = require("coreJS/adapt");
	var $body = $("body");
	var $document = $(document);
	var keys = [];
	var $el;
	var $input;
	var validElement;

	function render() {
		$body.append(Handlebars.templates.teleporter);
		$el = $("#teleporter");
		$input = $("input", $el);
		Adapt.on("menuView:postRender pageView:postRender", function() { checkZIndex(); });
		$document.on("keyup", checkKeys);
	}

	function checkKeys(event) {
		keys.push(event.which);
		if (keys.toString().indexOf("84,69,76,69") >= 0) {
			keys = [];
			$document.off("keyup", checkKeys);
			checkZIndex();
			show();
		}
	}

	function show() {
		$el.velocity("fadeIn", {
			duration: 200,
			complete: function() {
				$input.focus().on("keyup", inputOnKeyUp).on("keydown", inputOnKeyDown);
				$document.on("keyup", hide);
			}
		});
	}

	function inputOnKeyUp(event) {
		if (event.which !== 13) validate(this.value);
	}

	function inputOnKeyDown(event) {
		if (event.which === 13) {
			event.preventDefault();
			validElement ? teleport(this.value, validElement) : shake();
		}
	}

	function validate(value) {
		validElement = Adapt.mapById(value);

		if (validElement) $el.addClass("valid-element");
		else $el.removeClass("valid-element");
	}

	function teleport(id, type) {
		if (type === "course") {
			location.assign("#");
		} else if (type === "contentObjects") {
			location.assign("#/id/" + id);
		} else {
			Adapt.once("page:scrollTo", highlight).navigateToElement("." + id, {
				offset: { top: -$(".navigation").outerHeight() }
			}, false);
		}
	}

	function shake() {
		if ($el.hasClass("teleporter-shake")) $el.removeClass("teleporter-shake");

		$el.addClass("teleporter-shake").one("webkitAnimationEnd animationend", function() {
			$(this).removeClass("teleporter-shake");
		});
	}

	function highlight(element) {
		var $element = $(element);

		if ($element.hasClass("element-fade")) $element.removeClass("element-fade");

		$element.addClass("element-highlight").delay(0).queue(function() {
			$(this).addClass("element-fade").dequeue();
		}).delay(0).queue(function() {
			$(this).removeClass("element-highlight").dequeue();
		}).one("webkitTransitionEnd transitionend", function() {
			$(this).removeClass("element-fade");
		});
	}

	function hide(event) {
		if (event.which === 27) {
			$input.off("keyup keydown").val("");
			$document.off("keyup", hide).on("keyup", checkKeys);
			$el.removeClass("valid-element").velocity("fadeOut", 200);
		}
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

	Adapt.on("app:dataReady", function() { if (!Adapt.device.touch) render(); });

});