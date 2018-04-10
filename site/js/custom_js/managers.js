$( document ).ready(function() {
    $('select').chosen({
		no_results_text: "Ничего не найдено по запросу",
		search_contains: true,
		width:"50%"
	});
	$('input[data-type="number"]').change(function(){
		$(this).val(convertToNumber($(this).val()));
	});
});
	
	function saveEditedUser(el){
		$('#loading-popup').show();
		var modal = $(el).closest('.modal-content');
		var data = {};
		data["product_id"]=$(el).closest('div[id^="productEdit_"]').attr('id').split('_')[1];
		data["product_data"]={};
		modal.find('.list-group-item>input, select').each(function(){
			data.product_data[$(this).attr('name')]=$(this).val();
		});
		$.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: data, method:'updateProduct'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$('#loading-popup').hide();
					$(el).closest('tr').find('#product_name').text(data.product_data.product_name);
					$(el).closest('tr').find('#provider_name').text(modal.find('.list-group-item select[name="providers"]').find('option:selected').text());
					$(el).closest('tr').find('#provider_artikul').text(data.product_data.providers_artikul);
					$(el).closest('tr').find('#product_vin').text(data.product_data.vin);
					$('#loading-popup').hide();
					alert("Данные успешно сохранены");
				}
			});
	}
	
	function changePassword(modal){
		$('#loading-popup').show();
		var data={};
		data['id']=$('#'+modal).attr('id').split('_')[1];
		data['old_pass']=$('#'+modal+' #old_pass').val();
		data['new_pass']=$('#'+modal+' #new_pass').val();
		$.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: data, method:'сhangePassword'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$('#loading-popup').hide();
					if(res=='error'){
						alert("Неверный пароль");
						if(!$('#'+modal+' #old_pass').hasClass('has-error'));
						$('#'+modal+' #old_pass').next().addClass('has-error');
						$('#'+modal+' #old_pass').addClass('has-error');
					}else{
						alert("Новый пароль сохранен");
						$('.pass-edit input').val('');
						$('.pass-edit').hide(200);
						$('#'+modal+' input.has-error, #'+modal+' span.has-error').removeClass('has-error');
						$('#'+modal+' input.success, #'+modal+' span.success').removeClass('success');
						$('#'+modal+' #pass_change').hide();
					}
				}
			});
	}
	
	function isSame(modal,change=false){
		if($('#'+modal+' #new_pass').val()!="" && $('#'+modal+' #new_pass_again').val()!=""){
			if($('#'+modal+' #new_pass').val()!=$('#'+modal+' #new_pass_again').val()){
				$('#'+modal+' #new_pass_again').next().addClass('has-error');
				$('#'+modal+' #new_pass_again').addClass('has-error');
				$('#'+modal+' #new_pass').addClass('has-error');
				$('#'+modal+' #new_pass_again').next().removeClass('success');
				$('#'+modal+' #new_pass_again').removeClass('success');
				$('#'+modal+' #new_pass').removeClass('success');
				if(change){
					$('#'+modal+' #pass_change').hide(200);
				}
			}else{
				$('#'+modal+' #new_pass').addClass('success');
				$('#'+modal+' #new_pass_again').next().addClass('success');
				$('#'+modal+' #new_pass_again').addClass('success');
				$('#'+modal+' #new_pass_again').next().removeClass('has-error');
				$('#'+modal+' #new_pass_again').removeClass('has-error');
				$('#'+modal+' #new_pass').removeClass('has-error');
				if(change && $('#'+modal+' #old_pass').val()!=""){
					$('#'+modal+' #pass_change').show(200);
				}
			}
		}
		if(change && $('#'+modal+' #old_pass').val()==""){
			$('#'+modal+' #pass_change').hide(200);
		}
	}
	
	function checkLogin(el, isSelf=false){
		
		if($(el).val()=="") return
		login = $(el).val();
		var id = "";
		if (isSelf){
			id = $(el).closest('form').find('div[id^="userEdit_"]').attr('id').split('_')[1];
		}
		$('#loading-popup').show();
		 $.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: {login:login,isSelf:isSelf, id:id}, method:'checkLogin'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 			
					if(res=="error"){
						$(el).next().show(200);
					}else{
						$(el).next().hide(200);
					}
					$('#loading-popup').hide();
				}
			}); 
	}
	
	function deleteUser(id){
		var isDelete = confirm("Вы уверены, что хотите удалить пользователя?");
		if (isDelete){
			$('#loading-popup').show();
		 $.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: id, method:'deleteUser'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$('#userEdit_'+id).modal('hide');
					$('#userEdit_'+id).on('hidden.bs.modal',function(e){
						$('#userEdit_'+id).closest('tr').remove()
					});
					$('#loading-popup').hide();
				}
			});  
		}
	}
	
	function updateUser(ev, el){
		
		ev.preventDefault();
		if($(el).find('#role').val()==""){
			alert('Выберите должность!!!');
			return;
		}
		if($(el).find('.bg-danger').is(":visible")){
			alert('Измените логин!!!');
			return
		}
		$('#loading-popup').show();
		var userValues = {};
		var id = $(el).find('div[id^="userEdit_"]').attr('id').split('_')[1];
		$(el).find('.list-group-item>input, select').each(function(){
			if($(this).val()!=""){
				userValues[$(this).attr('id')]=$(this).val();
			}
		}); 
		data={userValues:userValues,id:id};
		  $.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: data, method:'updatedUser'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					depText="";
					$(el).closest('tr').find('td#fio').text($(el).find('#name').val()+' '+$(el).find('#family_name').val());
					$(el).closest('tr').find('td#login').text($(el).find('#login').val());
					$(el).closest('tr').find('td#email').text($(el).find('#email').val());
					$(el).closest('tr').find('td#telephone').text($(el).find('#telephone').val());
					$(el).closest('tr').find('td#role_name').text($(el).find('#role option:selected').text());
					$(el).find('#departments option:selected').each(function(){
						depText=depText+', '+$(this).text();
					});
					depText = depText.slice(2);
					$(el).closest('tr').find('td#departments').text(depText);
					$(el).find('div[id^="userEdit_"]').modal('hide');
					$('.pass-edit').hide();
					$('#loading-popup').hide();
				}
			});  
	}
	
	function addUser(ev, el){
		ev.preventDefault();
		if(!$(el).find('.passes span').hasClass('success')){
			alert('Пароли не совпадают!!!');
			return;
		}
		if($(el).find('#role').val()==""){
			alert('Выберите должность!!!');
			return;
		}
		if($(el).find('.bg-danger').is(":visible")){
			alert('Измените логин!!!');
			return
		}
		var data = {};
		$(el).find('.list-group-item>input, select, .passes input').each(function(){
			if($(this).val()!=""){
				data[$(this).attr('id')]=$(this).val();
			}
		}); 
				$('#loading-popup').show();
		data['password'] = data.new_pass;
		delete data['new_pass_again'];
		delete data['new_pass'];
		 $.ajax({
				type: "POST",
				url: "/managers",
				data: JSON.stringify({data: data, method:'addUser'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$('#loading-popup').hide();
					alert("Пользователь добавлен");
				},
				complete: function(){
					document.location.reload(); 
				}
			}); 
		
	}



	