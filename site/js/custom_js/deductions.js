$( document ).ready(function() {
    $('#deductions_type').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	 $('#new_deductions_type').chosen({
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
	console.log(new Date(new Date().getFullYear(), new Date().getMonth(), 0));

});
		
	function converToDateFormat(string){
		result = [];
		string.split('-').forEach(function(item){
			if(Number(item)<10){
				result.push('0'+Number(item));
			}else{
				result.push(Number(item));
			}
		});
		console.log(result);
		return result.join('-');
	}
	function setNewNameForDeduct(el, ded_id){
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/deductions",
			data: JSON.stringify({data: {name:$(el).val(),id:ded_id}, method:'setNewNameForDeduct'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#loading-popup').hide();
			}
		});
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
		
	function saveDeduction(ev){
		ev.preventDefault();
		if($('#new_deductions_type').val()===''){
			alert('Выберите тип');
			return false;
		} 
		$('#loading-popup').show();
		data = {
			type_id:$('#new_deductions_type').val(),
			name:$('#deductions_name').val(),
			sum:$('#deductions_sum').val(),
			};
		$.ajax({
			type: "POST",
			url: "/deductions",
			data: JSON.stringify({data: data, method:'saveDeduction'}),
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
			deductions_type:$('#deductions_type').val(),
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};
			if($('#date-from').val()!="" && $('#date-to').val()!=""){
				data["date"]={'from':$('#date-from').val(),'to':$('#date-to').val()+' 23:59:59'};
			}
		$.ajax({
			type: "POST",
			url: "/deductions",
			data: JSON.stringify({data: data, method:'setDeductionsFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('.deductions-table .scrolled-content').html(data.html);
				$('#totals').val(data.sum.toFixed(2));
				$('#loading-popup').hide();
			}
		});
	}
	
	



	