/* 列表页面逻辑 */
var Index=(function(){

	var apiUrl = '../a.php';
	
	var prototype = {
		init : function(){
			this.getStores();
		},
		// 获取店铺名称 
		getStores : function(){
			var that = this;
			$.ajax({
				url:  apiUrl+'?action=get_select',
				dataType:'json',
				timeout : 60000,
				success : function(data){
					that.setStoresSelect(data);
				},
				error : function(data){
					that.showTips('获取信息失败，请稍后重试');
				}
			});	
		},
		setStoresSelect : function(data){
			var selectHtml = '';
			if(data){
				for(var pro in data){
					selectHtml += '<option value="'+pro+'">'+data[pro]+'</option>';
				}
				$('#branch_id').html(selectHtml);
			}
		}
	};
	return prototype;
})();

$(function(){
	Index.init();
});
