// JavaScript Document
(function (window, $) {
	/*ifream高さ変更*/
	window.addEventListener("message", receiveSize, false);

	function receiveSize(e) {
		if (e.origin === "https://info.pscsrv.co.jp")
			document.getElementById("pardotform").style.height = e.data + "px";
	}
})(window, jQuery);
