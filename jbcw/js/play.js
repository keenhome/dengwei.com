/* 列表页面逻辑 */
var Play=(function(){

	var branch_id = 10;
	var pagesize = 1000;
	var page = 1;
	var allTablesize = {};

	var isOpen = 1;
	var isOpenMap = {0:'关闭',1:'开启'};


	var prototype = {
		init : function(){
			this.getSubmenu();
			this.autoGetData();
			this.getOpenStatus();
			$('#name').html(Common.getCookie('name'));
			$('#quit').click(function(){
				document.location.href = "../";
				return false;
			});
		},
		autoGetData : function(){
			var that = this;
		
			var timer2 = setInterval(function(){
				for(var pro in allTablesize ){
					var tablesize =  parseInt(pro);
					that.getTableQuene(tablesize);
						
				}
			},3000);
		},
		getOpenStatus : function(){
			$.getJSON(apiUrl+'?action=need_queue',function(data){
				if(data && data.status==3){
					isOpen = 1;
				}else{
					isOpen = 0;
				}
			});
		},
		// 获取菜单配置文件 
		getSubmenu : function(){
			$.getJSON(apiUrl+'?action=get_config&branch_id='+branch_id,function(data){
				if(data){
					menuNums = data.length;
					if(menuNums){
						var listHtml = '';
						for(var i=0;i<menuNums;i++){
							//listHtml += '<li tablesize="'+data[i]['tablesize']+'"  class="item"><span name="desc">'+data[i]['desc']+'</span><span name="nums">--</span><span class="time" name="time">--</span><span class="next" name="next">--</span></li>';
							listHtml += '<li tablesize="'+data[i]['tablesize']+'"  class="item"><span name="desc">'+data[i]['desc']+'</span><span name="nums">--</span><span class="next" name="next">--</span></li>';
							allTablesize[data[i]['tablesize']] = data[i]['desc'];
						}
						$('#submenu ul').html(listHtml);
					}
				}
			}); 
		},
		// 获取各桌排队信息 
		getTableQuene : function(tablesize){
			this._getQuene(apiUrl+'?action=get_qn&branch_id='+branch_id+'&tablesize='+tablesize+'&pagesize='+pagesize+'&page='+page,tablesize);	
		},
		// 获取队列
		_getQuene : function(url,tablesize){
			var that = this;
			var tablesize = parseInt(tablesize);
			$.ajax({
				url: url+'&'+(new Date().getTime()),
				dataType:'json',
				timeout : 60000,
				success : function(data){
				// 信息回包时已经切换到其他tab了 
					if(!data){
						return false;
					}
					if(typeof(data.token)!='undefined'){
						$('#token').html(data.token);
					}

					/*if(data.num){
						if( typeof(data.last_time)!='undefined' ){
							countDown(tablesize,0,data.last_time,1,function(time){
								if(time[1]){
									var msg = time[1]+'时'+time[2]+'分'+time[3]+'秒';
								}else if(time[2]){
									var msg = time[2]+'分'+time[3]+'秒';
								}else{
									var msg = time[3]+'秒';
								}
								$('#submenu .item[tablesize='+tablesize+']').find('span[name="time"]').html(msg).show();
								
							});
						}else{
							$('#submenu .item[tablesize='+tablesize+']').find('span[name="time"]').html('--').show();
						}
					}else{
						countDown(tablesize,0,data.last_time,1,function(time){
							$('#submenu .item[tablesize='+tablesize+']').find('span[name="time"]').html('--').show();
						});
					}*/

					// 当前排队数 
					if(data.num){
						$('#submenu .item[tablesize='+tablesize+']').find('span[name="nums"]').html(data.num);
					}else{
						$('#submenu .item[tablesize='+tablesize+']').find('span[name="nums"]').html('--');
					}
					// 下一号 
					var info = data.info;
					if(info.length){
						$('#submenu .item[tablesize='+tablesize+']').find('span[name="next"]').html(info[0]['qn']);
					}else{
						$('#submenu .item[tablesize='+tablesize+']').find('span[name="next"]').html('--');
					}
										
				},
				error : function(data){

				}
			})
		}
	};
	return prototype;
})();

var countDownTimer = {};
function countDown(id,startTime,endTime,step,processingCallback,endCallback) {
	var step = step ? step : 1 ;
	var leftTime = parseInt(endTime-startTime);
	var processingCallback = processingCallback ;
	var endCallback = endCallback;
	if( typeof(countDownTimer[id]!='undefined') && countDownTimer[id] ){
		clearTimeout(countDownTimer[id]);
	}
	var timeValues = [];

	var run = function(){
		if(isNaN(leftTime) || Math.floor(leftTime)<=0){
			clearTimeout(countDownTimer[id]);
			if(typeof(endCallback)=='function'){
				endCallback();
			}
			return false;
		}else{
			timeValues[0] = Math.floor(leftTime/(60*60*24));
			timeValues[1] = Math.floor(leftTime/(60*60))%24;
			timeValues[2] = Math.floor(leftTime/60)%60;
			timeValues[3] = Math.floor(leftTime%60);
			if(typeof(processingCallback)=='function'){
				processingCallback(timeValues);
			}
			leftTime +=step;
			countDownTimer[id] = setTimeout(function(){
				run();				
			},step*1000);
		}
	};
	run();
}
