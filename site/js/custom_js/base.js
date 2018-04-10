$( document ).ready(function() {
	findNotReceivedItemTotal();
	$('#menu .dropdown-menu a, #menu a[href="/managers"]').click(function(){
		$('#loading-popup').show();
	});
	$('#quickSerch').on('hidden.bs.modal', function () {
	  $('#quickSerch #search-result').html('');
	  $('#search-string-fast').val('');
	});
	let timer;
	$(".has-inner").hover(function () {
		let el = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            $(el).children('ul').slideDown(200);
        }, 300);
    },function () {
        let el = this;
        clearTimeout(timer);
        timer = setTimeout(function () {
            $(el).children('ul').slideUp(200);
        }, 300);
    });
    $('.dropdown-submenu').hover(function () {
        $(this).find('.dropdown-menu').slideDown(200);
    },function() {
		$(this).find('.dropdown-menu').slideUp(200);
    });
    $('button.new-orders').click(function(){
    	if(Number($(this).children().text())>0){
    		window.location.href="/orders";
		}else{
    		alert('Нет новых заказов!!!');
		}
	});
});
$(document).on('focusin', function(e) {
    if ($(e.target).closest(".mce-window").length) {
        e.stopImmediatePropagation();
    }
});
$(document).keydown(function (e) {
	if(e.which==70 && e.ctrlKey){
		e.preventDefault();
		$('#quickSerch').modal();
        setTimeout(function() { $('input[id="search-string-fast"]').focus() }, 300);
	}
});

	Math.ceil5 = function(value) {
		return Math.ceil(value/5)*5
	};
	function convertToNumber(value, dec=2){
		return Number(value.replace(',',".")).toFixed(dec);
	}
	function getQuickSerchProducts(){
		if($('#search-string-fast').val().length<=1){
			$('#quickSerch #search-result').html('');
			return false;
		}
		
		$('#loading-popup').show();
		$.ajax({
			type: "POST",
			url: "/base",
			data: JSON.stringify({data: '%'+$('#search-string-fast').val()+'%', method:'getQuickSerchProducts'}),
			dataType: "json",
			contentType: "application/json",
			success: function(data){ 
				$('#quickSerch #search-result').html(data);
				if(document.location.pathname=="/seils/add"){
					$('#quickSerch .scrolled-content>ul').hover(
					  function() {
						$( this ).find('.quick-add-from-search').fadeIn(500);
					  }, function() {
						$( this ).find('.quick-add-from-search').fadeOut(100);
					  }
					);
				}
				$('#loading-popup').hide();
			}
		});
	}
	function setTodayRate(currency_id){
		$('#loading-popup').show();
		$.ajax({
				type: "POST",
				url: "/base",
				data: JSON.stringify({data: {currency_id:currency_id,rate:convertToNumber($('#todayRate_'+currency_id).val())}, method:'setTodayRate'}),
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
	function arrayColumn(array, columnName){
		resArray = [];
		$.each( array, function( i, val ) {
			resArray.push(val[columnName]);
		});
		return resArray;
	}
	
	
	function arrayColumnUniq(array, columnName){
		resArray = [];
		$.each( array, function( i, val ) {
			if($.inArray(val[columnName],resArray)==-1){
				resArray.push(val[columnName]);
			}		
		});
		return resArray;
	}

	function findNotReceivedItemTotal(){
		var sum =0;
		$('input[name="res_qty"]').each(function(){
			sum = sum+Number($(this).val());
		});
		$('button[data-target="#not_received_prod"]>span').text(sum);
	}
	
	function moveFromTmpProducts(el, dep_id, receive_id){
		$('#loading-popup').show();
			var products = [];
			var dep_name = "department_"+dep_id;
			$(el).closest('table').find('#res_qty'+receive_id).each(function(){
				qty = Number($(this).closest('tr').find('input[name="stock"]').val())+Number($(this).val());
				products.push([$(this).attr('attr-data'),qty])
			});
			data={
				products: products,
				dep_id: dep_id,
				res_id: receive_id
			};
			console.log(data);
			$.ajax({
				type: "POST",
				url: "/base",
				data: JSON.stringify({data: data, method:'moveFromTmpProducts'}),
				dataType: "json",
				contentType: "application/json",
				success: function(data){ 
					$('#loading-popup').hide();
					alert("Данные успешно сохранены");
				},
				complete: function(){
					$(el).closest('table').find('#res_qty'+receive_id).each(function(){
						$(this).closest('tr').remove();
					});
					if($(el).closest('table').find('tr').length==1){
						$('#'+dep_id).html('<h3>Нет непринятых товаров</h3>');
					}else{	
						$(el).closest('tr').remove();
					}
					findNotReceivedItemTotal();	
				}
			});
		}
	function resetChoosen(el){
			el.val('');
			el.trigger('chosen:updated');
		}


	