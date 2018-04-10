$( document ).ready(function() {
    $('#department').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"80%"
	});
	$('#discount-type').chosen({
		width:"60"
	});
	
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
	/* console.log(window.document.width,window.document.height);
	var newWin = window.open('tittle', 'Print-Window', 'width='+$(document).width()*0.8+',height='+$(document).height()*0.8+',top='+$(document).height()*0.1+',left='+$(document).width()*0.1);

newWin.document.title = "Readings on PageLinks";
newWin.document.write('<html><head><><title style="display:none">Печать</title></head><body><h1>test</h1></body></html>');

newWin.print(); */

});
	
	function setDepartment(){
		changeAllResidues();
		findOrderSumm();
	} 
	
	function artikulChanged(el){
		$('#loading-popup').show();
		var row = $(el).attr('id').split('_')[1];
		resetQtysAndPrice(row);
		var artikul = $(el).val();
		var data = {artikul: artikul};
		$.ajax({
			type: "POST",
			url: "/seils/add",
			data: JSON.stringify({data: data, method:'getProductsByArtikul'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			$('#loading-popup').hide();
			console.log(data);
			if(data.length==0){
				return false;
			}
				if(!checkRepeats(data[0].id,0) && data.length==1){						
					resetChoosen($('#providersArtikul_'+row));
					//resetChoosen($('#name_'+row));
					alert("Такой товар уже есть в заявке");
				}else{
					if(!$(el).closest('tr').next().is('tr')){
						addNewRowForSail();
					}
					//$('#name_'+row+ ' option').not(':first').remove()
					//$.each(data, function(i, item) {
					//	$('#name_'+row).append('<option value="'+item.id+'">'+item.product_name+'</option>');
					//});
					//if (data.length==1){
                    $('#VIN_'+row).val(data[0].vin);
					$('#name_'+row).html('<strong>'+data[0].product_name+'</strong><br>'+data[0].info).attr('data-product',data[0].id);
                    tovarChanged($('#name_'+row));
					//}
					//$('#name_'+row).trigger('chosen:updated');
				}
				
			}
		});
	}
	
	function getDataFromSailTable(){
			var products = [];
			var data = {};
			var newStock={};
			newStock["stock"]=[];
			$("#sail-table tr.sail-product").each(function(){
				qty = $(this).find('input[id^="seilQty_"]').val();				
				if(qty>0){
					product_id = $(this).find('div[id^="name_"]').attr('data-product');
					price_uah = $(this).find('input[id^="seilPrice_"]').val();
					product_name = $(this).find('div[id^="name_"]').html();
					product_vin = $(this).find('input[id^="VIN_"]').val();
					product_artikul = $(this).find('select[id^="providersArtikul_"]').find('option:selected').text();
					products.push([product_id,product_name,product_vin,product_artikul,qty,price_uah]);
					newStock["dep_id"]=$('#department').val();
					newStock["stock"].push([product_id,qty]);
				}		
			});
			data["stocks"]=newStock;
			data["products"]=products;
			data["department"]=$('#department').val();
			data["manager_full_name"]=$('#manager_full_name').val();
			data["seil_sum"]=$('#orderSum').val();
			return data;
	}
	function deleteSailRow(el){
		$(el).closest('tr').remove();
        findOrderSummDef();
        countDiscount();
        findOrderSumm();

	}
	function printPreview(){
        $.ajax({
            type: "POST",
            url: "/seils/add",
            data: JSON.stringify({data: getDataFromSailTable(), method:'showPreview'}),
            dataType: "json",
            contentType: "application/json",
            success: function(data){
                $('.printing-container').html(data);
                var params = [
                    'height='+screen.height,
                    'width='+screen.width,
					'status=0',
					'location=0',
                    'fullscreen=yes' // only works in IE, but here for completeness
                ].join(',');
                var myWindow = window.open("", "Предпросмотр", params);
                head = '<head><title>Предпросмотр</title><link rel="stylesheet" type="text/css" href="/css/printStyles.css"></head>';
                myWindow.document.write(head+'<div class="preview">'+data+'</div>');
                myWindow.moveTo(0,0);
            },
            complete: function(){
                $('.printing-container').html();
            }
        });
	}

	function save(){
		var data = getDataFromSailTable();
		if (data.products.length==0){
			alert ("Выберите товар для продажи и укажите количество");
			return false;
		}
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/seils/add",
			data: JSON.stringify({data: getDataFromSailTable(), method:'saveData'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
			$('#loading-popup').hide();
					alert("Продажа проведена");
					$('.printing-container').html(data);
					window.print();

				},
				complete: function(){
					document.location.reload(); 
				}
		});
	}
	
	function addNewRowForSail(){
		 $("#sail-table tr:last").clone().find("td>input, td>select, td>button, .row>select").each(function() {
			$(this).val('');
			$(this).find('option:selected').attr('selected','');
			$(this).attr({
				'id': function(_, id) { if (typeof id != 'undefined') {
					return  id.split("_")[0]+"_"+(Number(id.split("_")[1]) + 1);
				}}        
			});
		}).end().appendTo('#sail-table');
		row = $("#sail-table tr:last input[id^='qtyInDep_']").attr('id').split('_')[1];
		$("#sail-table tr:last").find('#groupButton_'+row).attr('data-target','#departmentOrdering_'+row);
		$("#sail-table tr:last #departmentOrdering_"+(row-1)).attr('id','departmentOrdering_'+row);
		//$("#sail-table tr:last").find('.chosen-container').remove();
        $("#sail-table tr:last div[id^='name_']").attr('id','name_'+row);
		//$("#sail-table tr:last select[id^='name_']").find('option:not(:first-child)').remove();
		//$("#sail-table tr:last").find('select').chosen({
		//	no_results_text: "Ничего не найдено по запросу",
		//	search_contains: true,
		//	width:"80%"
		//});
		$('input[data-type="number"]').change(function(){
			$(this).val(convertToNumber($(this).val()));
		});
	}	
	
	
	function findOrderSumm(){
		sum = 0;
		$('input[id^="seilQty_"]').each(function(){
			if($(this).val()>0){
				row = $(this).attr('id').split('_')[1];	
				sum = sum+Number($('#totalSeilPrice_'+row).val());
			}	
		});
		$('#orderSum').val(sum.toFixed(2));
	}

	function findOrderSummDef(){
		sum_def = 0;
		$('input[id^="seilQty_"]').each(function(){
			if($(this).val()>0){
				row = $(this).attr('id').split('_')[1];	
				seilPriceDef = Number($('#defaultPrice_'+row).val());
				qty = Number($(this).val());
				sum_def = sum_def+(qty*seilPriceDef);
			}	
		});
		$('#orderSumDef').val(sum_def.toFixed(2));
	}
	
	
	function resetQtysAndPrice(row){
		$('#qtyInDep_'+row).val(0);
		$('#departmentOrdering_'+row+' input[id^="departmentRes_"]').val(0);
	}
	
	function checkRepeats(item_id, par){
		if($('div[id^="name_"][data-product="'+item_id+'"]').length>par){
			return false;
		} else{
			return true;
		}
	}
	function checkResidues(row){
		if(Number($('#qtyInDep_'+row).val())<Number($('#seilQty_'+row).val())){
			alert("Недостаточно товаров в отделе");
			$('#seilQty_'+row).val($('#qtyInDep_'+row).val());
			return false;
		}else{
			return true;
		}
		
	}
	function qtyChanged(el){		
			var row = $(el).attr('id').split('_')[1];
			if(checkResidues(row)){
				var seilPrice = Number($('#seilPrice_'+row).val());
				var qty = Number($(el).val());
				$('#totalSeilPrice_'+row).val(seilPrice*qty);
				findOrderSummDef()
				countDiscount();
			}
		}
	
	function changeAllResidues(){
		var inputs = $('input[id^="qtyInDep_"]');
		var dep_id = $("#department").val();
		inputs.each(function() {
				row = $(this).attr('id').split('_')[1];
				new_val=$('#departmentOrdering_'+row+' input[id^="departmentRes_'+dep_id+'"]').val();
				$(this).val(new_val);
			});
	}
	
	function countDiscount(){
		discountValue=Number($('#discount-value').val());
		discountType=$('#discount-type').val();
		totalOrderQty = 0;

		if(discountType==1){
				if($('#orderSumDef').val()!=0){
					sailPercent = ((Number($('#orderSumDef').val())-discountValue)*100/Number($('#orderSumDef').val()))/100;
				}else{
					sailPercent = 1
				}		
		}else{
			sailPercent = (100-discountValue)/100;
		}
			$('tr.sail-product').each(function(){
				ex_price = Number($(this).find('input[id^="defaultPrice_"]').val());
				if(ex_price!=0){
					$(this).find('input[id^="seilPrice_"]').val((ex_price*sailPercent).toFixed(1));
					new_price = Number($(this).find('input[id^="seilPrice_"]').val());
					qty = Number($(this).find('input[id^="seilQty_"]').val());
					if(qty>0){
						$(this).find('input[id^="totalSeilPrice_"]').val(new_price*qty);
					}
				}
			});
		findOrderSumm();
	}
	
	function addProdToSail(providers_artikul){
		$("#sail-table tr:last").find('select[id^="providersArtikul_"]').val(providers_artikul);
		$("#sail-table tr:last").find('select[id^="providersArtikul_"]').trigger('chosen:updated');
		artikulChanged($("#sail-table tr:last").find('select[id^="providersArtikul_"]'));
		
	}

	function tovarChanged(el){
		var row = $(el).attr('id').split('_')[1];
		var product_id = $(el).attr('data-product');
		var data = {product_id: product_id};
		if(!checkRepeats(product_id,1)){
			//resetChoosen($(el));
			alert("Такой товар уже есть в заявке");
		}else{
			$('#loading-popup').show();
			$.ajax({
				type: "POST",
				url: "/seils/add",
				data: JSON.stringify({data: data, method:'getProductInfo'}),
				dataType: "json",
				contentType: "application/json",
				success: function(data){ 
					if(data.length!=0){
						data = data[0];
						$('#qtyInDep_'+row).val(data["department_"+$("#department").val()]);
						$('#seilPrice_'+row).val(Math.ceil5(data.seil_price));
						$('#defaultPrice_'+row).val(Math.ceil5(data.seil_price));
                        $('#myPrice_'+row).val(data.price.toFixed(2));
						$('#providersArtikul_'+row).val(data.providers_artikul);
						$('#providersArtikul_'+row).trigger('chosen:updated');
						if($('#qtyInDep_'+row).val()>0){
							$('#seilQty_'+row).val(1);
							$('#totalSeilPrice_'+row).val(data.seil_price);
						}else{
							$('#seilQty_'+row).val(0);
							$('#totalSeilPrice_'+row).val(0);
						}
						$.each(data, function(i, item) {
							depId = i.split('_')[1];
							$('#departmentOrdering_'+row+' input[id^="departmentRes_'+depId+'"]').val(item);
						});
						findOrderSummDef();
					}
					countDiscount();
						$('#loading-popup').hide();					
				}
			});
		}
	}


	