$( document ).ready(function() {
    $('select').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
});
	
	function addNewRowForProducts(){
		 $("#products-table tr:last").clone().find("td>input, td>select").each(function() {
			$(this).val('');
			$(this).find('option:selected').attr('selected','');
		}).end().appendTo('#products-table');
		$("#products-table tr:last").find('.chosen-container').remove();
		$("#products-table tr:last").find('select').chosen({
			no_results_text: "Ничего не найдено по запросу",
			search_contains: true,
			width:"80%"
		});
	}	
	function dataChanged(el){
		if(!$(el).hasClass('completed')){
			$(el).addClass('completed')
		}else if($(el).hasClass('completed') && $(el).val('')){
			$(el).removeClass('completed')
		}
		if($(el).closest('tr').find('.completed').length>=3){
			$(el).closest('tr').addClass('ready');
		}else{
			$(el).closest('tr').removeClass('ready');
		}
		
		if(!$(el).closest('tr').next().is('tr')){
			addNewRowForProducts();
		}
	}
	
	function deleteRow(el){
		if( $("#products-table tr").length>2){
			$(el).closest('tr').remove();
		}
	}
	
					
	function saveProducts(){
		$('#loading-popup').show();
		var data = [];
		$("#products-table").find(".ready").each(function(){
			product = [];
			product.push($(this).find('#product_name').val());
			product.push($(this).find('#providers').val());
			product.push($(this).find('#providers_artikul').val());
			product.push($(this).find('#vin').val());
			product.push($(this).find('#info').val());
			data.push(product);
		});
		 $.ajax({
				type: "POST",
				url: "/tovar/add",
				data: JSON.stringify({data: data, method:'saveProducts'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 	
					alert("Данные успешно сохранены");
				},
				complete: function(){
					document.location.reload(); 
				}
			}); 
	}



	