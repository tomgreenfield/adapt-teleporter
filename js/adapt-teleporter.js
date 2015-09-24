/*
* Teleporter
* License - https://github.com/adaptlearning/adapt_framework/blob/master/LICENSE
* Maintainers - Tom Greenfield
*/

define(function(require) {

	var Adapt = require("coreJS/adapt");
	var $el;

	function main() {
		var keys = [];

		$(document).on("keyup", checkKeys);

		function checkKeys(event) {
			keys.push(event.which);
			if (keys.toString().indexOf("84,69,76,69") >= 0) {
				keys = [];
				$(document).off("keyup", checkKeys);
				checkZIndex();
				showTeleporter();
			}
		}

		function showTeleporter() {
			$el.fadeIn(200, function() {
				$("input", $el).focus().on("keyup", validate);
				$(document).on("keyup", hideTeleporter);

				function validate(event) {
					var validElement = (function(input) {
						var element;
						
						element = Adapt.course;
						if (element.get("_id") == input) return element;
						element = Adapt.contentObjects.findWhere({ _id: input });
						if (element) return element;
						element = Adapt.articles.findWhere({ _id: input });
						if (element) return element;
						element = Adapt.blocks.findWhere({ _id: input });
						if (element) return element;
						element = Adapt.components.findWhere({ _id: input });
						if (element) return element;
					})($(this).val());

					if (validElement) {
						$el.addClass("valid-element");
					} else {
						$el.removeClass("valid-element");
					}

					if (event.which == 13) {
						if (validElement) {
							navigate(validElement.get("_id"), validElement.get("_type"));
						} else {
							$el.addClass("teleporter-shake").one("animationend webkitAnimationEnd", function() {
								$(this).removeClass("teleporter-shake");
							});
						}
					}
				}

				function navigate(id, type) {
					if (type == "course") {
						location.assign("#");
					} else if (type == "menu" || type == "page") {
						location.assign("#/id/" + id);
					} else {
						Adapt.navigateToElement("." + id, type + "s", {
							offset: { top: -$(".navigation").outerHeight() }
						});
					}
				}

			});
		}

		function hideTeleporter(event) {
			if (event.which == 27) {
				$(document).off("keyup", hideTeleporter).on("keyup", checkKeys);
				$("input", $el).off("keyup").val("");
				$el.removeClass("valid-element");
				$el.fadeOut(200);
			}
		}

	}

	function checkZIndex() {
		var topZIndex = 0;
		var zIndex = parseInt($el.css("z-index"), 10);

		$("body").find("*").not($el.selector).each(function() {
			var i = parseInt($(this).css("z-index"), 10);
			if (i > topZIndex) topZIndex = i;
		});
		if (topZIndex === 0) return;
		if (!zIndex) zIndex = 0;
		if (topZIndex >= zIndex) $el.css("z-index", topZIndex + 1);
	}

	Adapt.on("app:dataReady", function() {
		var config = Adapt.config.get('_teleporter');
		if (!_.isUndefined(config) && config._isEnabled == false) return;		
		if (!Adapt.device.touch) {
			$("body").append(Handlebars.templates["teleporter"]);
			$el = $("#teleporter");
			main();
			Adapt.on("menuView:postRender pageView:postRender", function() { checkZIndex(); });
		}
	});

});
