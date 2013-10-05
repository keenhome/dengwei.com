/* 公共方法 */
var Common = (function(){
	
	var prototype = {
		setCookie : function(name,value,domain,expire){
			var domain = domain ? domain : document.location.host;
			if(expire){
				var expireDate=new Date(new Date().getTime()+expire*1000);
				document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain+"; expires=" + expireDate.toGMTString() ;
			}else{
				document.cookie = name + "=" + escape(value) + "; path=/; domain="+domain;
			}
		},
		getCookie : function(name){
			return this.decode((document.cookie.match(new RegExp("(^" + name + "| " + name + ")=([^;]*)")) == null) ? "" : RegExp.$2);
		},
		decode : function(str) {
			var r = '';
				try {r = decodeURIComponent(decodeURIComponent(str));	
			}catch(e){
				try {r = decodeURIComponent(str);} catch(e) {r = str;}
			}
			return r;
		},
		encode : function(str) {
			return encodeURIComponent(str);
		},
		isLogined : function(){
			return this.getCookie('sessionid') && this.getCookie('userid');
		},
		addBookmark : function(){
			var url = location.href;
			var title = document.title ? document.title : '';
			if (window.sidebar) {
				window.sidebar.addPanel(title, url,"");
			} else if( document.all ) {
				window.external.AddFavorite( url, title);
			} else if( window.opera && window.print ) {
				return;
			} else {
				alert('请按Ctrl+D放入收藏夹');
			}
		},
		isUndef : function(a) {
			return typeof a == "undefined";
		},
		isNull : function(a) {
			return typeof a == "object" && !a;
		},
		getUrlParam : function(parameter, url) {
			url = isUndef(url) ? location.href : url;
			var result = url.match(new RegExp("[\#|\?]([^#]*)[\#|\?]?"));
			url = "&" + (isNull(result) ? "" : result[1]);
			result = url.match(new RegExp("&" + parameter + "=", "i"));
			return isNull(result) ? undefined : url.substr(result.index+1).split("&")[0].split("=")[1];
		},
		formatDateTime : function(timestamp){
			var time = 1310030215; 
			var d = new Date(timestamp*1000);
			var Y = d.getFullYear();
			var M = (d.getMonth()+1).toString();
			M = (M.length==1) ? ('0'+M) : M;
			var D = d.getDate().toString();
			D = (D.length==1) ? ('0'+D) : D;
			var H = d.getHours().toString();
			H = (H.length==1) ? ('0'+H) : H;
			var m = d.getMinutes().toString();
			m = (m.length==1) ? ('0'+m) : m;
			var s = d.getSeconds().toString();
			s = (s.length==1) ? ('0'+s) : s;
			
			return M+"-"+D+" "+H+":"+m+":"+s;

		}
	};
	return prototype;
})();

var apiUrl = '../a.php';