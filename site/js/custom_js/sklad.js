$( document ).ready(function() {
    $('#pag_qty').chosen({
        disable_search_threshold: 15,
        inherit_select_classes: true,
        width:"100px"
    }).val($('#pag_qty_input').val()).trigger("chosen:updated");
    let sort_col = $('#sort_col').val();
    let sort_dir = $('#sort_direction').val();

    if(sort_dir!='DESC'){
        $('.icon-sort-up.'+sort_col).removeClass('icon-sort-up').addClass('icon-sort-down active')
	}else{
        $('.icon-sort-up.'+sort_col).addClass('active');
	}

    $('select').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
    $('.pag_page').click(function(){
    	$('#pag_offset').val($(this).val());
		$("form[name='pagination']").submit();
	});
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
	replaceInputProvidersToSelect();
/*$(window).scroll(function(){
	  if  ($(window).scrollTop() == $(document).height() - $(window).height()){
		  if($('#pag_max').val()===$('#pag_offset').val()) return false;
			if((Number($('#pag_offset').val())+Number($('#pag_qty').val()))>=Number($('#pag_max').val())){
				return false;
			}else{
				$('#pag_offset').val(Number($('#pag_offset').val())+Number($('#pag_qty').val()));
			}
			
			setFilter(true);
	}
  });*/

	
});
function setProviders(el) {
    $('input[name="providers"]').val($(el).val().join(','));
    $("form[name='pagination']").submit();
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
        $("form[name='pagination']").submit();
	}
	
	function replaceInputProvidersToSelect(){
        $('div[id^="productEdit_"]').find('.chosen-container').remove();
		 $('div[id^="productEdit_"]').find('#providersEdit').each(function(){
			providersEl = $("#providers" ).clone();
			providersEl.removeAttr('onchange');
			providersEl.removeAttr('multiple');
			providersEl.attr('id','providersEdit');
			providersEl.attr('name','providers');
			providersEl.addClass('pull-right');
			el = $(this).parent();
			providersEl.val(providersEl.find('option:contains('+$(this).closest('tr').find('#provider_name').text()+')').val());
			providersEl.appendTo(el);
			$(this).remove();
		});
		$('div[id^="productEdit_"]').find('#providersEdit').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"50%"
	}); 
	}
	
	
	
	function setFilter(pagination=false){
		$('#loading-popup').show();
		if(!pagination){
			$('#pag_offset').val(0);
			$('#pag_qty').val(10);
		}
		let serchObject={};
		if($('#providers option:selected').text()!=""){		
			serchObject["providers"]=$('#providers').val();
		}
		if($('#search-string').val()!=""){
			serchObject["search_string"]='%'+$('#search-string').val()+'%';
		}
		let data={
			search:serchObject,
			order:{name:$('#sort_col').val(),direction:$('#sort_direction').val()},
			limits:{qty:Number($('#pag_qty').val()), offset:Number($('#pag_offset').val())}
			};

		//console.log($.param(data));

		$.ajax({
			type: "POST",
			url: "/sklad",
			data: JSON.stringify({data: data, method:'setSkladFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			if(!pagination)	$('#sklad-table tr').not(':first').remove();
				$('#sklad-table').append(data);
				replaceInputProvidersToSelect();	
				$('#loading-popup').hide();
			}
		});
	}
	
	
	function saveEditedProduct(el){
		$('#loading-popup').show();
		let modal = $(el).closest('.modal-content');
		let data = {};
		data["product_id"]=$(el).closest('div[id^="productEdit_"]').attr('id').split('_')[1];
		data["product_data"]={};
		modal.find('.list-group-item>input, select').each(function(){
			data.product_data[$(this).attr('name')]=$(this).val();
		});
		$.ajax({
				type: "POST",
				url: "/sklad",
				data: JSON.stringify({data: data, method:'updateProduct'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 				
					$(el).closest('tr').find('#product_name').text(data.product_data.product_name);
					$(el).closest('tr').find('#provider_name').text(modal.find('.list-group-item select[name="providers"]').find('option:selected').text());
					$(el).closest('tr').find('#provider_artikul').text(data.product_data.providers_artikul);
					$(el).closest('tr').find('#product_vin').text(data.product_data.vin);
					$(el).closest('tr').find('#product_info').text(data.product_data.info);
					$('#loading-popup').hide();
					alert("Данные успешно сохранены");
					
				}
			});
	}



	