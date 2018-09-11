// JavaScript Document
(function($){
	"use strict";
	$(function(){
		
		var selectedCode = window.localStorage.getItem("selected_code");
		
		if(selectedCode === null){
			selectedCode = "all";
			window.localStorage.setItem("selected_code", "all");
		}else{
			$("li.lang-option."+selectedCode).addClass("active");
		}
		
		if(selectedCode === "all"){
				$(".selector").css("display", "block");
		}else{
			$(".selector").css("display", "none");
			$(".selector."+selectedCode).css("display", "block");
		}
		
		$("li.lang-option").click(function(){
			if($(this).hasClass("active")){
				return;
			}
			
			var codeDisplay = $(this).data("for");
			window.localStorage.setItem("selected_code", codeDisplay);
			
			$("li.lang-option."+selectedCode).removeClass("active");
			$(this).addClass("active");
			
			if(codeDisplay === "all"){
				$(".selector").css("display", "block");
			}else{
				$(".selector").css("display", "none");
				$(".selector."+codeDisplay).css("display", "block");
			}
			window.localStorage.setItem("selected_code", codeDisplay);
			selectedCode = codeDisplay;
		});
		
	});
})(jQuery);