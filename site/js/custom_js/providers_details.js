$( document ).ready(function() {
    $('#providers').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	 $('#charge_currency').chosen({
		no_results_text: "Ничего не найдено по запросу",
	 	disable_search: true,
		width:"50%"
	});
	$('#date_period').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"50%",
		allow_single_deselect:true
	});
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
});

	function changeChargeSum(charge_id, value){
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/providers_details",
			data: JSON.stringify({data: {id:charge_id,sum:value,providers_id:$('#provider_id').val()}, method:'changeChargeSum'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){
                if($('#charge_currency').val()!==1){
                    $('#provider_balance').val((data/$('#todayRate_'+$('#charge_currency').val()).val()).toFixed(2));
                    $('#provider_balance_uah').val(data.toFixed(2));
                }else{
                    $('#provider_balance').val(data.toFixed(2));
                }
                $('#loading-popup').hide();

			}
		});
	}
	function changeChargeRate(charge_id, value){
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/providers_details",
			data: JSON.stringify({data: {id:charge_id,rate:value,providers_id:$('#provider_id').val()}, method:'changeChargeRate'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){
				if($('#charge_currency').val()!==1){
                    $('#provider_balance').val((data/$('#todayRate_'+$('#charge_currency').val()).val()).toFixed(2));
                    $('#provider_balance_uah').val(data.toFixed(2));
				}else{
                    $('#provider_balance').val(data.toFixed(2));
				}
				$('#loading-popup').hide();
			}
		});
	}

	function converToDateFormat(string){
		result = [];
		string.split('-').forEach(function(item){
			if(Number(item)<10){
				result.push('0'+Number(item));
			}else{
				result.push(Number(item));
			}
		});
		return result.join('-');
	}
	
	function setPeriod(el){	
		if($(el).val()!==''){
		$('#date-from').val(converToDateFormat($(el).find('option:selected').attr('date-from')));
		$('#date-to').val(converToDateFormat($(el).find('option:selected').attr('date-to')));
		}else{
			$('#date-from').val('');
			$('#date-to').val('');
		}
		setFilter();
	}

	function findTotalSumm(){
		let sum = 0;
        $('#charges-table>li:gt(0)').each(function(){
        	sum = sum + Number($(this).find('.charge-sum>input').val())*Number($(this).find('.charge-rate>input').val());
		});
        $('#totals').val(sum.toFixed(2));
	}
	function saveCharge(ev){
		ev.preventDefault();
		$('#loading-popup').show();
		data = {
			providers_id:$('#provider_id').val(),
			currency_id:$('#charge_currency').val(),
			sum:$('#charge_sum').val(),
			description:$('#charge_description').val(),
			rate:$('#todayRate_'+$('#charge_currency').val()).val()
			};
		if($('#charge_currency').val()==1){
			data.rate=1;
		}
		$.ajax({
			type: "POST",
			url: "/providers_details",
			data: JSON.stringify({data: data, method:'saveCharge'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			},
			complete: function(){
					document.location.reload();
			}
			
		});
	}
	
	function changeSort(el, sortField){
		$('#sort_col').val(sortField);
		$('span[class^="icon-sort-"]').removeClass('active');
		if($(el).hasClass("icon-sort-up")){
			$(el).removeClass("icon-sort-up");
			$(el).addClass("icon-sort-down active");
			$('#sort_direction').val('ASC');
		}else{
			$(el).removeClass("icon-sort-down");
			$(el).addClass("icon-sort-up active");
			$('#sort_direction').val('DESC');
		}
	setFilter();	
	}

	
	
	function setFilter(){
		$('#loading-popup').show();
		data={
			providers:$('#provider_id').val(),
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};
			if($('#date-from').val()!="" && $('#date-to').val()!=""){
				data["date"]={'from':$('#date-from').val(),'to':$('#date-to').val()+' 23:59:59'};
			}
		$.ajax({
			type: "POST",
			url: "/providers_details",
			data: JSON.stringify({data: data, method:'setChargesFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#charges-table li').not(':first').remove();
				$('#charges-table').append(data.html);
                $('input[data-type="number"]').change(function(){
                    $(this).val(convertToNumber($(this).val()));
                });
				$('#loading-popup').hide();
			}
		});
	}
	
	



	