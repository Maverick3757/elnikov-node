$( document ).ready(function() {
    $('#providers').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	 $('#charge_providers').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
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
			url: "/providers_charge",
			data: JSON.stringify({data: {id:charge_id,sum:value}, method:'changeChargeSum'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){
                findTotalSumm();
				$('#loading-popup').hide();

			}
		});
	}
	function changeChargeRate(charge_id, value){
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/providers_charge",
			data: JSON.stringify({data: {id:charge_id,rate:value}, method:'changeChargeRate'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){
                findTotalSumm();
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
	
	function getProvidersCurrency(){
		$('#loading-popup').show();
        $('li.balance').text('').hide();
		data = $('#charge_providers').val();
		$.ajax({
			type: "POST",
			url: "/providers_charge",
			data: JSON.stringify({data: data, method:'getProvidersCurrency'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				if(data[0].length==0){
					alert('От этого поставщика еще не было поставок');
				}else{
					$('#charge_currency').val(data[0][0].currency_id);
                    $('li.balance').text("Баланс "+data[1][0].balance.toFixed(2)+",грн").show(200);
				}
				$('#loading-popup').hide();
			}
		});
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
		if($('#charge_providers').val()===''){
			alert('Выберите поставщика');
			return false;
		} 
		$('#loading-popup').show();
		data = {
			providers_id:$('#charge_providers').val(),
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
			url: "/providers_charge",
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
			providers:$('#providers').val(),
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};
			if($('#date-from').val()!="" && $('#date-to').val()!=""){
				data["date"]={'from':$('#date-from').val(),'to':$('#date-to').val()+' 23:59:59'};
			}
		$.ajax({
			type: "POST",
			url: "/providers_charge",
			data: JSON.stringify({data: data, method:'setChargesFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#charges-table li').not(':first').remove();
				$('#charges-table').append(data.html);
				$('#totals').val(data.sum.toFixed(2));
                $('input[data-type="number"]').change(function(){
                    $(this).val(convertToNumber($(this).val()));
                });
				$('#loading-popup').hide();
			}
		});
	}
	
	



	