/* 列表页面逻辑 */
var List=(function(){

	var TAB_SPEED = -1,TAB_GETNUM = -2,TAB_PASS = -3,TAB_OPEN=-4;
	var branch_id = 10;
	var pagesize = 1000;
	var page = 1;
	var curTablesize = TAB_SPEED;
	var allTablesize = {'-3':"过号列表"};

	var isOpen = 1;
	var isOpenMap = {0:'关闭',1:'开启'};
	var status = 3;	// 默认是开启的

	var prototype = {
		init : function(){
			this.getSubmenu();
			this.tabEffect();
			this.getSpeedQuene();
			this.ListenStatus();
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
			var timer = setInterval(function(){
				//if( -1 != parseInt(curTablesize))
					that.getSpeedQuene();
			},1000);
			
			var timer2 = setInterval(function(){
				for(var pro in allTablesize ){
					var tablesize =  parseInt(pro);
					//if( tablesize != parseInt(curTablesize)){
						if(tablesize==TAB_PASS){
							that.getPassQuene();
						}else{
							that.getTableQuene(tablesize);
						}
					//}
						
				}
			},3000);
		},
		getOpenStatus : function(){
			var that = this;
			$.getJSON(apiUrl+'?action=need_queue',function(data){
				if(data && data.status==3){
					isOpen = 1;
					$('#tokenTips').show();
				}else{
					isOpen = 0;
				}
				that.switchTokenTips(data.status);
			});
		},
		// tab点击效果 
		tabEffect : function(){
			var submenuObj = $('#submenu');
			var that = this;
			submenuObj.delegate('.item','click',function(){
				/*if($(this).hasClass('on')){
					return false;
				}*/
				$('#wattingNums').hide();
				$('#wattingTime').hide();
				submenuObj.find('.item').removeClass('on');
				$(this).addClass('on');

				var tablesize = $(this).attr('tablesize');
				curTablesize = parseInt(tablesize);
				that.hideNumsTips(tablesize);
				if(tablesize==TAB_SPEED){
					// 获取快速叫号 
					that.showTips(1);
					that.getSpeedQuene();
				}else if(tablesize==TAB_GETNUM){
					if(!isOpen){
						//that.showOpenTips();
						submenuObj.find('.item[tablesize='+TAB_OPEN+']').click();
						return false;
					}
					// 显示普通取号 
					that.hideTips();
					that.switchListTitle(1);
					$('#listContent').hide();
					$('#getNumber').show();
				}else if(tablesize==TAB_PASS){
					that.showTips(1);
					that.getPassQuene();
				}else if(tablesize==TAB_OPEN){
					that.showOpenTips();
					//that.showTips('等位系统已经'+isOpenMap[isOpen]);
				}else{
					// 获取普通桌位等位情况 
					that.showTips(1);
					that.getTableQuene(tablesize);
				}
				return false;
			});

			$('#getNumber').delegate('[name="getNumber"]','click',function(){
				var tablesize = $(this).data('tablesize');
				that.getNumber(tablesize);
				return false;
			});
		},
		// 获取菜单配置文件 
		getSubmenu : function(){
			$.getJSON(apiUrl+'?action=get_config&branch_id='+branch_id,function(data){
				if(data){
					menuNums = data.length;
					if(menuNums){
						var listHtml = '<li tablesize="'+TAB_SPEED+'" class="item on"><i class="flag"></i><span class="title">快速叫号</span><em style="display:none;" class="num_tips">--</em></li>';
						var listHtml2 = '';
						var even = '';
						for(var i=0;i<menuNums;i++){
							listHtml += '<li tablesize="'+data[i]['tablesize']+'" class="item"><i class="flag"></i><span class="title">'+data[i]['desc']+'</span><em class="num_tips" style="display:none;"></em></li>';
							if(i%2==0){
								even = 'even';
							}else{
								even = '';
							}
							listHtml2 += '<li tablesize="'+data[i]['tablesize']+'" class="item '+even+'"><span class="order"><b>'+data[i]['desc']+'</b>(<em class="num_tips">'+data[i]['min']+'-'+data[i]['max']+'人</em>)</span><span class="opt"><a data-tablesize="'+data[i]['tablesize']+'" title="取号" name="getNumber" class="use" href="javascript:;">取号</a></span></li>';
							allTablesize[data[i]['tablesize']] = data[i]['desc'];
						}
						listHtml += '<li tablesize="'+TAB_PASS+'" class="item"><i class="flag"></i><span class="title">过号列表</span><em class="num_tips" style="display:none;"></em></li>';
						listHtml += '<li tablesize="'+TAB_GETNUM+'" class="item"><i class="flag"></i><span class="title">普通取号</span></li>';
						listHtml += '<li tablesize="'+TAB_OPEN+'" class="item"><i class="flag"></i><span class="title">关闭/开启等位</span></li>';
						$('#submenu ul').html(listHtml);
						$('#getNumber ul').html(listHtml2);
					}
				}
			}); 
		},
		// 获取快速排号信息 
		getSpeedQuene : function(){
			this._getQuene(apiUrl+'?action=get_speed&branch_id='+branch_id,TAB_SPEED);
		},
		// 获取各桌等位信息 
		getTableQuene : function(tablesize){
			this._getQuene(apiUrl+'?action=get_qn&branch_id='+branch_id+'&tablesize='+tablesize+'&pagesize='+pagesize+'&page='+page,tablesize);	
		},
		// 获取过号列表 
		getPassQuene : function(){
			var url = apiUrl+'?action=get_pass&branch_id='+branch_id+'&pagesize='+pagesize+'&page='+page;
			this._getQuene(url,TAB_PASS);
		},
		// 获取队列
		_getQuene : function(url,tablesize){
			var that = this;
			var tablesize = parseInt(tablesize);
			$.ajax({
				url: url+'&t='+(new Date().getTime()),
				dataType:'json',
				timeout : 60000,
				success : function(data){
				// 信息回包时已经切换到其他tab了 
					if(!data){
						that.showTips('暂时没有等位信息');
						return false;
					}
					if(typeof(data.token)!='undefined'){
						$('#token').html(data.token);
					}
					if(typeof(data.status)!='undefined'){
						if(data.status==3){
							isOpen = 1;
						}else{
							isOpen = 0;
						}
						that.switchTokenTips(data.status);
					}
					if(typeof(data.token_time)!='undefined' && tablesize==TAB_SPEED ){
						countDown(0,data.token_time,1,function(time){
							if(time[2]){
								$('#nextUpdateTime').html(time[2]+'分'+time[3]);
							}else{
								$('#nextUpdateTime').html(time[3]);
							}
							
						});
					}
					if(curTablesize != tablesize ){
						if(data.num){
							that.showNumsTips(tablesize,data.num);
						}else{
							that.hideNumsTips();
						}
						return false;
					}
					that.switchListTitle();
					if(data.info){
						var info = data.info;
					}else if(tablesize==TAB_PASS){
						var info = data;

					}
					var infoNum = info.length;
					if(infoNum){
						var listHtml = '';
						var use_disabled = pass_disabled = '';
						var index = 0;
						for(var i=0;i<infoNum;i++){
							if(info[i]['qn']){
								if(index%2==0){
									listHtml +='<li data-qn="'+info[i]['qn']+'" data-tablesize="'+info[i]['tablesize']+'" class="item even">';
								}else{
									listHtml +='<li data-qn="'+info[i]['qn']+'" data-tablesize="'+info[i]['tablesize']+'"class="item">';
								}
								if(index!=0 && tablesize!=TAB_SPEED){
									use_disabled = 'use_disabled';
									pass_disabled = 'pass_disabled';
								}

								if( typeof(info[i]['phone']) =='undefined' || !info[i]['phone'] ){
									info[i]['phone'] = '--';
								}	
								if( typeof(info[i]['num']) =='undefined' || !info[i]['num'] ){
									info[i]['num'] = '--';
								}	

								if(tablesize==TAB_PASS){
									listHtml +='<span class="order">'+info[i]['tabledesc']+'</span>';
									listHtml +='<span class="number">'+info[i]['qn']+'</span>';
									listHtml +='<span class="phone">'+info[i]['phone']+'</span>';
									listHtml +='<span class="customer_nums">'+info[i]['num']+'</span>';
									listHtml +='<span class="time">'+Common.formatDateTime(info[i]['ctime'])+'</span>';
									listHtml +='<span class="opt">';
									listHtml +='<a title="就餐" class="use '+use_disabled+'" href="javascript:;">就餐</a>';
								}else{
									listHtml +='<span class="order">'+info[i]['desc']+'</span>';
									listHtml +='<span class="number">'+info[i]['qn']+'</span>';
									listHtml +='<span class="phone">'+info[i]['phone']+'</span>';
									listHtml +='<span class="customer_nums">'+info[i]['num']+'</span>';
									listHtml +='<span class="time">'+Common.formatDateTime(info[i]['time'])+'</span>';

									/*
									// 快速叫号显示距离上次时间 
									if(tablesize==TAB_SPEED){
										if(typeof(info[i]['last_time'])!='undefined' && info[i]['last_time'] ){
											listHtml +='<span style="display:;" name="last_time" class="time">'+formatContDown(info[i]['last_time'])+'</span>';
										}else{
											listHtml +='<span style="display:;" name="last_time" class="time">--</span>';
										}
										$('#listTitle span[name="last_time"]').show();
									}else{
										$('#listTitle span[name="last_time"]').hide();
									}
									
									$('#listTitle span[name="last_time"]').hide();
									*/

									listHtml +='<span class="opt">';
									listHtml +='<a title="就餐" class="use '+use_disabled+'" href="javascript:;">就餐</a><a title="过号" class="pass '+pass_disabled+'" href="javascript:;">过号</a>';
								}

								listHtml +='</span>';
								listHtml +='</li>';
								index ++;
							}
						}


						that.hideTips();
						if(data.num && curTablesize == tablesize){
							$('#wattingNums').html('当前等位人数:'+data.num).show();
							if( typeof(data.last_time)!='undefined' && curTablesize!=TAB_SPEED  && curTablesize==tablesize && curTablesize>0 ){
								countDown2(0,data.last_time,1,function(time){
									if(curTablesize<0 || curTablesize != tablesize){
										$('#wattingTime').hide();
										return false;
									}
									if(time[1]){
										$('#wattingTime em').html(time[1]+'时'+time[2]+'分'+time[3]+'秒');
									}else if(time[2]){
										$('#wattingTime em').html(time[2]+'分'+time[3]+'秒');
									}else{
										$('#wattingTime em').html(time[3]+'秒');
									}
									$('#wattingTime').show();
									
								});
								
							}
						}
						$('#listContent').html(listHtml).show();
					}else{
						if(countDownTimer2){
							clearTimeout(countDownTimer2);
						}
						$('#wattingTime').hide();
						that.showTips('暂时没有等位信息');
					}
										
				},
				error : function(data){
					if(curTablesize != tablesize ){
						return false;
					}
					that.switchListTitle();
					that.showTips('获取信息失败，请稍后重试');
				}
			})
		},
		// 取号 
		getNumber : function(tablesize){
			var that = this;
			
			$.ajax({
				url:  apiUrl+'?action=insert_queue&branch_id='+branch_id+'&tablesize='+tablesize,
				dataType:'json',
				timeout : 60000,
				success : function(data){
					var msg ='取号失败，请稍后重试';
					var type = 0;
					if(data && data['qn']){
						msg = '当前取得的排号是:'+ data['qn']+',请抄写在纸上给顾客';
						type = 1;

					}
					that.showGetNumTips(msg,type);
				},
				error : function(data){
					that.showTips('获取信息失败，请稍后重试');
				}
			});	
		},
		// 就餐/过号 
		ListenStatus : function(){
			var that = this;
			$('#listContent').delegate('.opt a','click',function(){
				var tablesize = $(this).closest('li').data('tablesize');
				var qn = $(this).closest('li').data('qn');
				var optTips = {1:'就餐',2:'过号'};
				if($(this).hasClass('use')){
					var method = 1 ;
				}else{
					var method = 2 ;
				}
				if(curTablesize == TAB_SPEED){
					if(tablesize && qn){
						that._setStatus(apiUrl+'?action=cancel_queue&branch_id='+branch_id+'&qn='+qn+'&method='+method,tablesize);
					}
				}else{
					if( confirm('确定要'+optTips[method]+'吗？') ){
						if(tablesize && qn){
							that._setStatus(apiUrl+'?action=cancel_queue&branch_id='+branch_id+'&qn='+qn+'&method='+method,tablesize);
						}
					}	
				}

				
				return false;
			});

		},
		_setStatus : function(url,tablesize){
			var that = this;
			var tablesize = tablesize;
			$.ajax({
				url: url+'&t='+(new Date().getTime()),
				dataType:'json',
				timeout : 60000,
				success : function(data){
					if(parseInt(curTablesize)==TAB_PASS){
						that.getPassQuene();
					}else if(parseInt(curTablesize)==TAB_SPEED){
						that.getSpeedQuene();
					}else{
						that.getTableQuene(curTablesize);
					}
					
				},
				error : function(data){
					alert('获取信息失败，请稍后重试');
				}
			});	
		},
		shutDown : function(){
			var that = this;
			var switchValue = 1-isOpen;

			$.ajax({
				url: apiUrl+'?action=open_queue&branch_id='+branch_id+'&switch='+switchValue,
				dataType:'json',
				timeout : 60000,
				success : function(data){
					isOpen = 1-isOpen;
					that.showOpenTips();
				},
				error : function(data){
					that.showTips('获取信息失败，请稍后重试');
				}
			});	
		},
		showNumsTips : function(tablesize,num){
			$('#submenu .item[tablesize='+tablesize+']').find('em').html(num).show();
			//$('#getNumber .item[tablesize='+tablesize+']').find('em').html(num);
		},
		hideNumsTips : function(tablesize){
			$('#submenu .item[tablesize='+tablesize+']').find('em').hide();
		},
		 // 切换信息标题 
		switchListTitle : function(type){
			// 显示取号时标题 
			if(type==1){
				$('#listTitle').hide();
				$('#numberTitle').show();
			}else{
				$('#listTitle').show();
				$('#numberTitle').hide();
			}
		},
		showTips : function(msg){
			$('#getNumber').hide();
			$('#listContent').hide();
			$('#listTitle').hide();
			$('#numberTitle').hide();
			//$('#failOpt').hide();
			if(msg==1){
				$('#optTips span').hide();
				$('#optTips img').show();
				$('#failOpt').hide();
			}else{
				$('#optTips img').hide();
				$('#optTips span').html(msg).show();
			}
			$('#optTips').show();
		},
		hideTips : function(){
			$('#optTips').hide();
		},
		// 开关状态提示 
		showOpenTips : function(){
			var that = this;
			$('#failOpt').unbind('click').click(function(){
				that.shutDown();
				return false;
			}).html(isOpenMap[1-isOpen]);
			if(status==1){
				$('#failOpt').hide();
			}else{
				$('#failOpt').show();
			}

			that.showTips('等位系统已经'+isOpenMap[isOpen]);
		},
		// 显示取号后的提示 
		showGetNumTips : function(msg,type){
			var that = this;
			var title = '操作失败，重试';
			if(type==1){
				title = '操作成功!';
			}
			$('#failOpt').unbind('click').click(function(){
				if(type==1){
					$('#submenu .item[tablesize='+TAB_SPEED+']').click();
				}else{
					$('#submenu .item[tablesize='+TAB_GETNUM+']').click();
				}
				return false;
			}).html('操作成功!').show();
			that.showTips(msg);
		},
		switchTokenTips : function(s){
			if(s==1 && status!=1){
				$('#tokenTips').hide();
				$('#statusTips').html('<span style="font-size:1.5em;line-height:4;">非营业时间等位系统无法开启</span>').show();
			}else if(s==2 && status!=2){
				$('#tokenTips').hide();
				$('#statusTips').html('<span style="font-size:1.5em;line-height:4;">等位系统已经关闭</span>').show();
			}else if(s==3 && status!=3){
				$('#tokenTips').show();
				$('#statusTips').hide();
			}
			status = s;
		}
	};
	return prototype;
})();

/**
*	方法名：倒计时
*	用法: var a=new countDown(1111,22222,2,funcName1,funcName2);
*	@param int startTime	倒计时开始的时间戳（单位是秒）
*	@param int endTime		倒计时结束的时间戳（单位是秒）
*	@param int step		倒计时间隔,默认是1（单位秒）
*	@param function processingCallback		倒计时进行中回调方法，传参数： 天、时、分、秒
*	@param endCallback endCallback		倒计时结束回调方法，无参数
*/
var countDownTimer = null;
function countDown(startTime,endTime,step,processingCallback,endCallback) {
	var step = step ? step : 1 ;
	var leftTime = parseInt(endTime-startTime);
	var processingCallback = processingCallback ;
	var endCallback = endCallback;
	if(countDownTimer){
		clearTimeout(countDownTimer);
	}
	var timeValues = [];

	var run = function(){
		if(isNaN(leftTime) || Math.floor(leftTime)<=0){
			clearTimeout(countDownTimer);
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
			leftTime -=step;
			countDownTimer = setTimeout(function(){
				run();				
			},step*1000);
		}
	};
	run();
}

// 偷懒
var countDownTimer2 = null;
function countDown2(startTime,endTime,step,processingCallback,endCallback) {
	var step = step ? step : 1 ;
	var leftTime = parseInt(endTime-startTime);
	var processingCallback = processingCallback ;
	var endCallback = endCallback;
	if(countDownTimer2){
		clearTimeout(countDownTimer2);
	}
	var timeValues = [];

	var run = function(){
		if(isNaN(leftTime) || Math.floor(leftTime)<=0){
			clearTimeout(countDownTimer2);
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
			countDownTimer2 = setTimeout(function(){
				run();				
			},step*1000);
		}
	};
	run();
}


function formatContDown(leftTime){
	var timeValues = [];
	timeValues[0] = Math.floor(leftTime/(60*60*24));
	timeValues[1] = Math.floor(leftTime/(60*60))%24;
	timeValues[2] = Math.floor(leftTime/60)%60;
	timeValues[3] = Math.floor(leftTime%60);

	var tips = '';
	if(timeValues[0]){
		tips += timeValues[0]+'天';
	}
	if(timeValues[1]){
		tips += timeValues[1]+'时';
	}
	if(timeValues[2]){
		tips += timeValues[2]+'分';
	}
	if(timeValues[3]){
		tips += timeValues[3]+'秒';
	}
	return tips;
}

