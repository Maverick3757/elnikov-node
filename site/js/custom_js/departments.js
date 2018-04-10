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
		var isDelete = confirm("Вы уверены, что хотите удалить отдел?");
		if (isDelete){
			$('#loading-popup').show();
		 $.ajax({
				type: "POST",
				url: "/departments",
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
			alert('Название не должно быть пустым!!!');
			return;
		}	
			$('#loading-popup').show();
		var id = $(el).find('div[id^="depEdit_"]').attr('id').split('_')[1];
		data={name:$(el).find('#name').val(),id:id};
		console.log(data);
		  $.ajax({
				type: "POST",
				url: "/departments",
				data: JSON.stringify({data: data, method:'updatedDep'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 
					depText="";
					$(el).closest('tr').find('td#name').text($(el).find('#name').val());
					$(el).find('div[id^="depEdit_"]').modal('hide');
					$('#loading-popup').hide();
				}
				
			});  
	}
	
	function addDep(ev, el){
		ev.preventDefault();
		if($(el).find('#name').val()==""){
			alert('Название не должно быть пустым!!!');
			return;
		}	
		$('#loading-popup').show();
		 $.ajax({
				type: "POST",
				url: "/departments",
				data: JSON.stringify({data: $(el).find('#name').val(), method:'addDep'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 				
					alert("Отдел добавлен");
				},
				complete: function(){
					document.location.reload(); 
				}
			}); 
		
	}



	