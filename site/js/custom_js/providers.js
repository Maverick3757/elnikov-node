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
		
	function deleteDep(id){
		var isDelete = confirm("Вы уверены, что хотите удалить поставщика?");
		if (isDelete){
			$('#loading-popup').show();
		 $.ajax({
				type: "POST",
				url: "/providers",
				data: JSON.stringify({data: id, method:'deleteDep'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$('#depEdit_'+id).modal('hide');
					$('#depEdit_'+id).on('hidden.bs.modal',function(e){
						$('#depEdit_'+id).closest('tr').remove()
					});
					$('#loading-popup').hide();
				}
			});  
		}
	}
	
	function updateDep(ev, el){
		ev.preventDefault();
		if($(el).find('#name').val()==""){
			alert('Имя поставщика не должно быть пустым!!!');
			return;
		}
			$('#loading-popup').show();
		var id = $(el).find('div[id^="depEdit_"]').attr('id').split('_')[1];contact
		var data={
			providers_name:$(el).find('#name').val(),
			id:id,
			providers_contact:$(el).find('#contact').val(),
			providers_info:$(el).find('#info').val()
		};
		  $.ajax({
				type: "POST",
				url: "/providers",
				data: JSON.stringify({data: data, method:'updatedDep'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					$(el).closest('tr').find('td#name').text(data.providers_name);
					$(el).closest('tr').find('td#contact').text(data.providers_contact);
					$(el).closest('tr').find('td#info').text(data.providers_info);
					$(el).find('div[id^="depEdit_"]').modal('hide');
					$('#loading-popup').hide();
				}
			});  
	}
	
	function addDep(ev, el){
		ev.preventDefault();
		if($(el).find('#name').val()==""){
			alert('Имя поставщика не должно быть пустым!!!');
			return;
		}	
		$('#loading-popup').show();
		var data={
			providers_name:$(el).find('#name').val(),
			providers_contact:$(el).find('#contact').val(),
			providers_info:$(el).find('#info').val()
		};


		 $.ajax({
				type: "POST",
				url: "/providers",
				data: JSON.stringify({data: data, method:'addDep'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 				
					alert("Поставщик добавлен");
				},
				complete: function(){
					document.location.reload(); 
				}
			}); 
		
	}



	