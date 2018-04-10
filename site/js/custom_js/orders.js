$( document ).ready(function() {
    $('select').chosen({
        disable_search: true,
        width:"100%"
    });
});

function setFilter(){
    let selectedDates = $(".datepicker-here").data('datepicker').selectedDates;
    selectedDates[1]=new Date(selectedDates[1].setHours(23,59));
    let searched_text = '%'+$('#search-string').val()+'%';
    let statuses = $('#statuses').val();
    let data = {
        searched_text:searched_text,
        statuses:statuses,
        selectedDates:selectedDates,
        pag_offset:$('#pag_offset').val(),
        pag_qty:$('#pag_qty').val()
    };
    $.ajax({
        type: "POST",
        url: "/orders",
        data: JSON.stringify({data: data, method:'getOrdersFilter'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $('.scrolled-content').html(data);
        }
    });
}

