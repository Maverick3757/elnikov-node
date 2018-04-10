$( document ).ready(function() {
    $('select').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
	
  $(window).scroll(function(){
	  if  ($(window).scrollTop() == $(document).height() - $(window).height()){
		  if($('#pag_max').val()===$('#pag_offset').val()) return false;
			if((Number($('#pag_offset').val())+Number($('#pag_qty').val()))>=Number($('#pag_max').val())){
				return false;
			}else{
				$('#pag_offset').val(Number($('#pag_offset').val())+Number($('#pag_qty').val()));
			}
			
			setFilter(true);
	}
  });
	document.getElementById('distribution-table').addEventListener("mousewheel", function(e){
		$('#distribution-table').scrollLeft( $('#distribution-table').scrollLeft()+e.deltaY );
	});

	$('#departments').change(function(){
		$('th[id^="department_"] ,td[id^="department_"]').show();
		$(this).val().forEach(function(item){
			$('th#department_'+item+' ,td#department_'+item).hide();
		});
	});
});

$(document).keydown(function(e) {
	if($(e.target).hasClass('dep-qty')){
		
		max = $('#distribution-table th').length-2;
		curIndex = Number($(e.target).attr('tabindex'));
		switch(e.which) {
			case 37: // left
				el = $('input[tabindex="'+(curIndex-1)+'"]');
				if(el.length!=0){
					el.focus();
				}
			break;

			case 38: // up
				el = $('input[tabindex="'+(curIndex-max)+'"]');
				if(el.length!=0){
					el.focus();
				}
			break;

			case 39: // right
				el = $('input[tabindex="'+(curIndex+1)+'"]');
				if(el.length!=0){
					el.focus();
				}else{
					if($('#pag_max').val()!='true'){
						$('#pag_offset').val(Number($('#pag_offset').val())+Number($('#pag_qty').val()));
						setFilter(true);
					}
				}
			break;

			case 40: // down
			
				el = $('input[tabindex="'+(curIndex+max)+'"]');
				console.log(el);
				if(el.length!=0){
					el.focus();
				}else{
					if($('#pag_max').val()!='true'){
						$('#pag_offset').val(Number($('#pag_offset').val())+Number($('#pag_qty').val()));
						setFilter(true);
					}
				}
			break;
		}
	}
});

		
	function depQtyChanged(el){
		if(!$(el).closest('tr').hasClass('changed')){
			$(el).closest('tr').addClass('changed');
		}
		$(el).data('newVal', $(el).val());
		undef_prev_el = $(el).closest('tr').find('#department_1 input');
		undef_prev_el.val(Number(undef_prev_el.val())+Number($(el).data().oldVal)-Number($(el).data().newVal));
		if(undef_prev_el.val()<0){
			undef_prev_el.addClass('danger');
		}else{
			undef_prev_el.removeClass('danger');
		}
	}

	function checkResidues(el){
		var qtyEl = $(el).closest('ul').find('#undef-qty');
		var inputs = $(el).closest('ul').find('input[id^="department_"]');
		var dialogNumber =  $(el).closest('.modal').attr('id').split('_')[1];
		var totalQty = Number($('#qty_'+dialogNumber).val());
		var sum=0;
		inputs.each(function() {
				sum = sum + Number($(this).val());
			});
		var resQty = totalQty - sum;
		if (resQty<0){
			if(Number(qtyEl.text())>0){
				$(el).val(Number(qtyEl.text()));
				qtyEl.text(0);
			}else{
				$(el).val('');
			}
		}else{
			qtyEl.text(resQty);
		}
		$('#groupButton_'+dialogNumber+' span').text(qtyEl.text());		
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
	
	
	function setFilter(pagination=false){
		$('#loading-popup').show();
		if(!pagination){
			$('#pag_offset').val(0);
			$('#pag_qty').val(10);
		}
		data={};	
			data["search_string"]='%'+$('#search-string').val()+'%';
			data["limits_qty"]=Number($('#pag_qty').val());
			data["limits_offset"]=Number($('#pag_offset').val());
			data["direction"]=$('#sort_direction').val();
			data["tabindex"]=$('#distribution-table tr:last td:last input').attr('tabindex');

		$.ajax({
			type: "POST",
			url: "/distribution",
			data: JSON.stringify({data: data, method:'setDistributionFilter'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			if(!pagination) $('#distribution-table tr').not(':first').remove();
				$('#distribution-table').append(data);
			$('#departments').val().forEach(function(item){
			$('th#department_'+item+' ,td#department_'+item).hide();
		});
				$('#loading-popup').hide();
			}
		});
	}
	
	
	function saveEditedProduct(){
		$('#loading-popup').show();
		if($('input.danger').length>0){
			$('.alert-danger').fadeIn();
			$('.alert-danger').delay(5000).fadeOut("slow");;
		}else{	
			var products=[];
			var departments=[];
			var keyUpdate=[];
			var data={};
			$('tr.changed').each(function(){
				product = [];
				product.push($(this).attr('id').split('_')[2]);
				$(this).find('td[id^="department_"]').each(function(){
					product.push($(this).find('input').val());	
					if ($.inArray($(this).attr('id'),departments)==-1){
						departments.push($(this).attr('id'));
						keyUpdate.push($(this).attr('id')+'=VALUES('+$(this).attr('id')+')')
					}
					
				});
				products.push(product);
			});
			data["products"]=products;
			data["departments"]=departments;
			data["keyUpdate"]=keyUpdate;
			$.ajax({
				type: "POST",
				url: "/distribution",
				data: JSON.stringify({data: data, method:'updateProducts'}),
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
	}



	