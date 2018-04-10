	
	function userVerify(ev){
		ev.preventDefault();
		$('#loading-popup').show();
		data={login:$('#login').val(),password:$('#password').val()}
		$.ajax({
				type: "POST",
				url: "/login",
				data: JSON.stringify({data: data, method:'userVerify'}),
				dataType: "json",
				contentType: "application/json",
				success: function(res){ 				
				},
				complete: function(){
					document.location.href='/'; 
				}
			});
	}
	
	