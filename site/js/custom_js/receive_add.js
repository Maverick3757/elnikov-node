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
/* $(window).scroll(function(){
		if($(window).scrollTop()+600>0){
			console.log($(window).scrollTop());
			scrollArea=Math.ceil(($(window).scrollTop()+600)/$(window).height())*$(window).height();
			$("#receives-table tr:gt(1)").hide();
			$("#receives-table tr[scroll-area='"+scrollArea+"']").show();
		}
}); */
	
	function removeChildrenJS(elem) {
		console.log(elem.childNodes);
	  for (let k = 0; k < elem.childNodes.length; k++) {
		elem.removeChild(elem.childNodes[k]);
	  }
	}
	function addNewRowForReceive(){
		row = Number($('#receives-table tr:last input[id^="qty_"]').attr('id').split('_')[1])+1;
		 $("#receives-table tr:nth-child(2)").clone().find("input, select, button, td").each(function() {
			$(this).val('');
			$(this).find('option:selected').attr('selected','');
				if(!$(this).hasClass('input_qty_dialog'))
			$(this).attr({
				'id': function(_, id) { if (typeof id != 'undefined') return id.split("_")[0]+"_"+row }
			});
		}).end().appendTo('#receives-table');
		$("#receives-table tr:last").removeAttr('style');
		$("#receives-table tr:last").find('#groupButton_'+row).attr('data-target','#departmentOrdering_'+row);
		$("#receives-table tr:last #departmentOrdering_0").attr('id','departmentOrdering_'+row);
		$("#receives-table tr:last").find('.chosen-container').remove();
		$("#receives-table tr:last").find('input[id^="oenum_"]').remove();
		$("#receives-table tr:last").find('input[id^="info_"]').remove();
		$("#receives-table tr:last select[id^='name_']").find('option:not(:first-child)').remove();
			$("#receives-table tr:last").find('select').chosen({
				no_results_text: "Ничего не найдено по запросу",
				search_contains: true,
				width:"80%"
			});
			$('input[data-type="number"]').change(function(){
				$(this).val(convertToNumber($(this).val()));
			});
		
	}	
	
	function loadVinArtikuls(provider_id){
		$('#loading-popup').show();
		let data = {provider_id: provider_id};
		$.ajax({
			type: "POST",
			url: "/",
			data: JSON.stringify({data: data, method:'getProvidersProducts'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$("#receives-table td select").find('option:not(:first-child)').remove();
	/* 			vinArray = arrayColumnUniq(data, "vin"); */
				artArray = arrayColumnUniq(data, "providers_artikul");
/* 				$.each(vinArray, function(i, item) {
					$('select[id^="VIN_"]').append('<option value="'+item+'">'+item+'</option>');
				}); */
				$.each(artArray, function(i, item) {
					$('select[id^="providersArtikul_"]').append('<option value="'+item+'">'+item+'</option>');
				});
				$('select[id^="providersArtikul_"]').trigger('chosen:updated');
/* 				$('select[id^="VIN_"]').trigger('chosen:updated'); */
				$('#loading-popup').hide();
			}
		});
	}
	
	function renameProperty(arr, properKeys) {
		 for (let i of arr) {
			 for (let name in i){
				 if(name!='renameProperty'){
					 i[properKeys[name]]=i[name];
					 delete i[name];
				 }
			 }
		 }
			return arr; 
	}
	function checkBeforeLoad(ev){
		if($('#providers').val()===''){
			alert('Выберите поставщика');
			ev.preventDefault();
		}else if($('#currencies').val()===''){
			alert('Выберите валюту поставки');
			ev.preventDefault();	
		}else{

		}
	}
	
	function readXML(el){

		$('#loading-popup').show();

		let input = el;
		let reader = new FileReader();
		reader.onload = function(event) {
			let data = event.target.result;
			
			let wb = XLSX.read(data, {type: 'binary'});
				let sheet_name_list = wb.SheetNames;
				let ws = wb.Sheets[sheet_name_list[0]];
				let xlData = XLSX.utils.sheet_to_json(ws,{header:2, raw:true});
				let properKeys={
					'Артикул':'artikul',
					'Название':'name',
					'Номер ОЕ':'oe',
					'Доп. Инфо.':'info',
					'Цена':'price',
					'Кол-во':'qty',
                    'Цена, розн':'sail_price'
				};
				xlData = renameProperty(xlData,properKeys);
				ajaxData={
					artikuls:JSON_column(xlData,'artikul'),
					providers:$('#providers').val()
				};
				xlResult={};
				xlResult['not_proper']=[];
				for (i of xlData) {
					if(i.hasOwnProperty("artikul")){
						if(i.artikul.length!=="") {
							if(xlResult.hasOwnProperty(i.artikul)){
								xlResult[i.artikul].qty=Number(xlResult[i.artikul].qty)+Number(i.qty);
							}else{
								xlResult[i.artikul]=i;
							}	
						}else{
							xlResult.not_proper.push(i);
						}
					}else if(i.hasOwnProperty("name") || i.hasOwnProperty("qty")){
						xlResult.not_proper.push(i);
					}
					
				}
				
				if(Object.keys(xlResult).length>0){
					loadData(ajaxData,xlResult);
				}else{
					alert("Данные не найдены");
				}
				
		};
		reader.readAsBinaryString(input.files[0]);
		$(input).val('');
		
	}
	function loadData(ajaxData, xlData){
		let xhr = new XMLHttpRequest();
		xhr.open("POST", "/", true);
		xhr.setRequestHeader("Content-type", "application/json");
		xhr.onreadystatechange = function () {
			if (xhr.readyState === 4 && xhr.status === 200) {
				html = JSON.parse(xhr.responseText);
				
				$("#receives-table").append(html)
				$('select').chosen({
					no_results_text: "Ничего не найдено по запросу",
					search_contains: true,
					width:"80%"
				});
				$('input[data-type="number"]').change(function(){
					$(this).val(convertToNumber($(this).val()));
				});
				/* if($(window).scrollTop()+600>0){
					scrollArea=Math.ceil(($(window).scrollTop()+600)/$(window).height())*$(window).height();
					$("#receives-table tr:gt(1)").hide();
					$("#receives-table tr[scroll-area='"+scrollArea+"']").show();
				} */
				findOrderSumm();
                if($('#currencies').val()==1){
                    findSumUah();
                }
				$('#loading-popup').hide();
			}
		};		

		
		data = {
			exData:ajaxData,
			xlData:xlData,
			rate: Number($('input[name="kurs"]').val()),
			currency: $('#currencies').val(),
			marga: Number($('input[name="marga"]').val()),
			winHeight:$(window).height(),
			trHeight:$("#receives-table tr:nth-child(3)").height()
			};
		$("#receives-table tr:gt(1)").remove();
		xhr.send(JSON.stringify({data: data, method:'getProductsByArtikulRangeAndProviders'})); 
	}

	
	function JSON_column(json,col){
		let result=[];
		for (let i of json) {
			if(i.hasOwnProperty(col)){
				if($.inArray(i[col], result)==-1) result.push(i[col]);
			}
		}
		return result;
	}

		function findOrderSumm(){
			sum = 0;
			$("#receives-table tr").not(':first').each(function(){
				sum = sum+Number($(this).find('input[id^="price_"]').val())*Number($(this).find('input[id^="qty_"]').val());
			});
			$('#orderSum').val(sum.toFixed(2));
		}
	
		function artikulChanged(el){
			$('#loading-popup').show();
			let row = $(el).attr('id').split('_')[1];
			let artikul = $(el).val();
			let providers_id = $('#providers').val();
			let data = {artikul: artikul, providers:providers_id};
			$.ajax({
				type: "POST",
				url: "/",
				data: JSON.stringify({data: data, method:'getProductsByArtikulProviders'}),
				dataType: "json",
				contentType: "application/json",
				success: function(data){ 
				$('#loading-popup').hide();
					if(!checkRepeats(data[0].id,0) && data.length==1){						
						resetChoosen($('#providersArtikul_'+row));
						resetChoosen($('#name_'+row));
						alert("Такой товар уже есть в заявке");
					}else{
						$('#name_'+row+ ' option').not(':first').remove();
						$.each(data, function(i, item) {
							$('#name_'+row).append('<option value="'+item.id+'">'+item.product_name+'</option>');
						});
						if (data.length==1){
							$('#name_'+row+ ' option:nth-child(2)').prop( "selected", true );
                            $('#prodInfo_'+row).html( data[0].info );
							console.log($('#prodInfo_'+row));
                            $('#prodInfo_'+row).text( data[0].info );
							tovarChanged($('#name_'+row));
						}
						$('#name_'+row).trigger('chosen:updated');
						/* $('#VIN_'+row).val('');
						$('#VIN_'+row).trigger('chosen:updated'); */
					}
					
				}
			});
		}
		
		function getDataFromOrderTable(){
			let products = [];
			let newProducts=[];
			let data = {};
			$("#receives-table tr:gt(1)").each(function(){
				if(!$(this).hasClass('new')){
					product_id = $(this).find('select[id^="name_"]').val();
					if(product_id>0){
						price = $(this).find('input[id^="price_"]').val();
						seil_price = $(this).find('input[id^="seilPrice_"]').val();
						qty = $(this).find('input[id^="qty_"]').val();
						prod_to_dep = {};
						undef_stock = Number($(this).find('div[id^="departmentOrdering_"] span[id^="departmentRes_"]').text());
						undef_qty = Number($(this).find('div[id^="departmentOrdering_"] span#undef-qty').text());
						prod_to_dep[1]=undef_stock+undef_qty;
						$(this).find('div[id^="departmentOrdering_"] input[id^="department_"]').each(function(){
							plusVal = Number($(this).val());
							depId = $(this).attr('id').split('_')[1];
							prod_to_dep[depId]=plusVal;
						});
						products.push({product_id:product_id,price:price,seil_price:seil_price,qty:qty, prod_to_dep:prod_to_dep});
					}
				}else{
						artikul = $(this).find('input[id^="providersArtikul_"]').val();
					if(artikul!==""){
						name = $(this).find('input[id^="name_"]').val();
						oe = $(this).find('input[id^="oenum_"]').val();
						info = $(this).find('input[id^="info_"]').val();
						price = $(this).find('input[id^="price_"]').val();
						seil_price = $(this).find('input[id^="seilPrice_"]').val();
						qty = $(this).find('input[id^="qty_"]').val();
						prod_to_dep = {};
						undef_stock = Number($(this).find('div[id^="departmentOrdering_"] span[id^="departmentRes_"]').text());
						undef_qty = Number($(this).find('div[id^="departmentOrdering_"] span#undef-qty').text());
						prod_to_dep[1]=undef_stock+undef_qty;
						$(this).find('div[id^="departmentOrdering_"] input[id^="department_"]').each(function(){
							plusVal = Number($(this).val());
							depId = $(this).attr('id').split('_')[1];
							prod_to_dep[depId]=plusVal;
						});
						newProducts.push({
							artikul:artikul,
							name:name,
							info:info,
							price:price,
							oe:oe,
							seil_price:seil_price,
							qty:qty, 
							prod_to_dep:prod_to_dep
							});
					}else{
						alert('Артикул не должен быть пустым');
						return false;
					}
				}
				
			});
			data["new_products"]=newProducts;
			data["products"]=products;
			data["providers_id"]=$('#providers').val();
			data["currency_id"]=$('#currencies').val();
			if(Number(data["currency_id"])==1){
				data["currency_id"]=3;
				data["sum_uah"]=$('#orderSumUah').val();
			}
			data["rate"]=$('input[name="kurs"]').val();
			data["sum"]=$('#orderSum').val();
			return data;
		}

		function findSumUah(){
            sum = 0;
            $("#receives-table tr").not(':first').each(function(){
                sum = sum+Number($(this).find('input[id^="priceUah_"]').val())*Number($(this).find('input[id^="qty_"]').val());
            });
            $('#orderSumUah').val(sum.toFixed(2));
		}

		function saveOrder(){
			$('#loading-popup').show();
			data = getDataFromOrderTable();
			if(!data) return false;
			$.ajax({
				type: "POST",
				url: "/",
				data: JSON.stringify({data: data, method:'saveData'}),
				dataType: "json",
				contentType: "application/json",
				success: function(data){ 	
					alert("Данные успешно сохранены");
				},
				 complete: function(){
					document.location.reload(); 
				} 
			}); 
		}
		
		function checkRepeats(item_id, par){
			if($('select[id^="name_"] option:selected[value="'+item_id+'"]').length>par){
				return false;
			} else{
				return true;
			}
		}
		
		
		
		function tovarChanged(el){
			$('#loading-popup').show();
			let row = $(el).attr('id').split('_')[1];
			let product_id = $(el).val();
			let data = {product_id: product_id};
			if(!checkRepeats(product_id,1)){
				resetChoosen($(el));
				alert("Такой товар уже есть в заявке");
			}else{
				$.ajax({
					type: "POST",
					url: "/",
					data: JSON.stringify({data: data, method:'getDepartmentsResiduesByProduct'}),
					dataType: "json",
					contentType: "application/json",
					success: function(data){ 
					if(data.length!=0){
						data = data[0];
						
						$('#departmentOrdering_'+row+' #departmentRes_1').text(data.department_1);
						delete data.product_id;
						delete data.department_1;
						$.each(data, function(i, item) {
							depId = i.split('_')[1];
							$('#departmentOrdering_'+row+' input[id^="departmentRes_'+depId+'"]').val(item);
						});
						}
							$('#loading-popup').hide();
					}
				});
			}
		}
		
		function checkResidues(el){
			let qtyEl = $(el).closest('ul').find('#undef-qty');
			let inputs = $(el).closest('ul').find('input[id^="department_"]');
			let dialogNumber =  $(el).closest('.modal').attr('id').split('_')[1];
			let totalQty = Number($('#qty_'+dialogNumber).val());
			let sum=0;
			inputs.each(function() {
					sum = sum + Number($(this).val());
				});
			let resQty = totalQty - sum;
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
		function currencyChanged(el){
			if($(el).val()!=1){
				$('input[name="kurs"]').val(Number(($('option:selected',el).attr('data-rate'))).toFixed(2));
				if(!$('.price-uah').hasClass('hidden'))
					$('.price-uah').addClass('hidden');
					$('.currency-label').text(', '+$('option:selected',el).text());
					if(!$('.orderSumUah').hasClass('hidden')){
                        $('.orderSumUah').addClass('hidden');
					}
			}else{
                $('.orderSumUah').removeClass('hidden');
				$('input[name="kurs"]').val(Number(($('option:nth-child(4)',el).attr('data-rate'))).toFixed(2));
				$('.price-uah.hidden').removeClass('hidden');
				$('.currency-label').text(', EUR');
			}	
		}
		
		function currencyValueChanged(el){
			if (confirm('Пересчитать уже внесенные товары?')) {
				if($('#currencies').val()==1){
					$("#receives-table tr").not(':first').each(function(){
						$(this).find('input[id^="price_"]').val((Number($(this).find('input[id^="priceUah_"]').val())/Number($(el).val())).toFixed(2));
						findSeilPrice($(this).find('input[id^="price_"]'));
					});
                    findSumUah();
				}

				findOrderSumm();
			}
		}
		
		function convertToEur(el,sum=true){
			let row = $(el).attr('id').split('_')[1];
			$('#price_'+row).val((convertToNumber($(el).val(),2)/Number($('input[name="kurs"]').val())).toFixed(2));	
			findSeilPrice($('#price_'+row));
			if(sum){
				findOrderSumm();
			}
		}
		
		function margaChanged(){
			if (confirm('Пересчитать уже внесенные товары?')) {
				$("#receives-table tr").not(':first').each(function(){
					findSeilPrice($(this).find('input[id^="price_"]'));
				});
			} 	
		}
		
		function findSeilPrice(el){
			let row = $(el).attr('id').split('_')[1];
			$('#seilPrice_'+row).val((convertToNumber($(el).val(),2)*((Number($('input[name="marga"]').val())+100)/100)).toFixed(2));
		}
		
		function qtyChanged(el, sum=true){
			let row = $(el).attr('id').split('_')[1];
			let qty = $(el).val();
			$('#groupButton_'+row+' span').text(qty);
			$('#departmentOrdering_'+row+" #undef-qty").text(qty);
			let inputs = $('#departmentOrdering_'+row).find('input[id^="department_"]');
			inputs.each(function() {
					$(this).val('');
				});
			if(sum){
				findOrderSumm();
                if($('#currencies').val()==1){
                    findSumUah();
                }
			}

			
		}
	