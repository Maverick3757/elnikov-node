$( document ).ready(function() {
    $('#departments').chosen({
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
	function checkBackQty(el){
		if(Number($(el).closest('.modal-content').find('#maxQty').val())<Number($(el).val())){
			$(el).val($(el).closest('.modal-content').find('#maxQty').val());
		}else if($(el).val()===""){
			$(el).val(1);
		}
	}

	function productBack(ev,data){
		ev.preventDefault();
		deleteSails = false;
		deleteProduct = true;
		maxQty=Number($(data).find('#maxQty').val());
		qty=Number($(data).find('#qty').val());
		if($(data).closest('.sailed-product')[0].children.length==2 && qty==maxQty){
			deleteSails = true;
		}else if(qty-maxQty!=0){
			deleteProduct = false;
		}
		data={
			sail_id:$(data).find('#sail_id').val(),
			department:$(data).find('#department_id').val(),
			product_id:$(data).find('#product_id').val(),
			newTotal:Number($(data).find('#sail_sum').val())-Number($(data).find('#total').val()),
			newQty:maxQty-qty,
			backQty:qty,
			deleteProduct: deleteProduct,
			deleteSails:deleteSails
		};
		$.ajax({
			type: "POST",
			url: "/seils",
			data: JSON.stringify({data: data, method:'productBack'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			},
			complete: function(){
					document.location.reload(); 
			}
		});
	}
	
	function showSiledProducts(el,ev){	
		if($(ev.target).closest('ul').attr('id')=='sails-table'){
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
			departments:$('#departments').val(),
			search_string: '%'+$('#search-string').val()+'%',
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};
			if($('#date-from').val()!="" && $('#date-to').val()!=""){
				data["date"]={'from':$('#date-from').val(),'to':$('#date-to').val()+' 23:59:59'};
			}
		
		$.ajax({
			type: "POST",
			url: "/seils",
			data: JSON.stringify({data: data, method:'setSailsFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#sails-table li').not(':first').remove();
				$('#sails-table').append(data.html);
				$('#totals').val(data.sum.toFixed(2));
				$('#loading-popup').hide();
			}
		});
	}
	
	



	