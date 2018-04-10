$( document ).ready(function() {
    $('#providers').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
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

	function changeCurrencyOftotalCont(el){
        $('#totals').val((Number($('#totals-UAH').val())/Number($(el).val())).toFixed(2));
    }
	
	function showSiledProducts(el,ev){	
		if($(ev.target).closest('ul').attr('id')=='receives-table'){
			if($(el).find('.sailed-product').hasClass('collapsed')){
				$(el).find('.sailed-product').slideDown(500);
			}else{
				$(el).find('.sailed-product').slideUp(500);
			}
			$(el).find('.sailed-product').toggleClass('collapsed');
		}
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
			search_string: '%'+$('#search-string').val()+'%',
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};
			if($('#date-from').val()!="" && $('#date-to').val()!=""){
				data["date"]={'from':$('#date-from').val(),'to':$('#date-to').val()+' 23:59:59'};
			}
		$.ajax({
			type: "POST",
			url: "/receives",
			data: JSON.stringify({data: data, method:'setSailsFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#receives-table li').not(':first').remove();
				$('#receives-table').append(data.html);
                $('#totals-UAH').val(data.sum.toFixed(2));
                $('#totals').val((data.sum/Number($('.total-cont select').val())).toFixed(2));
				$('#loading-popup').hide();
			}
		});
	}
	
	



	