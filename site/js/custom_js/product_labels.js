function addManufacturer(ev, el) {
	ev.preventDefault();
    $('#loading-popup').show();
    tinyMCE.triggerSave();
	data= {
        row: {
            name: $(el).find('#name').val(),
            picture_name: $(el).find('.model_pic img').attr('img-name'),
        },
        picture: {
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'labels'
        }
    };
    $.ajax({
        type: "POST",
        url: "/product_labels",
        data: JSON.stringify({data: data, method:'addLabel'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log('done')
        },complete: function () {
            document.location.reload();
        }
    });
}
function deleteLabel(ev, el) {
    ev.preventDefault();
    el = $(el).closest('form');
    $(el).find("div[id^='manufacturerEdit_']").modal('hide');
    let data = {
        id:$(el).find("div[id^='manufacturerEdit_']").attr('id').split('_')[1],
        picture:{
            name:$(el).find('.model_pic img').attr('ex-name'),
            path: 'labels'
        }
    };
    $.ajax({
        type: "POST",
        url: "/product_labels",
        data: JSON.stringify({data: data, method:'deleteLabel'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $("#labels_"+data.id).remove();
            $('#loading-popup').hide();
        }
    });
    }


function updateManufacturer(ev, el) {
    ev.preventDefault();
    $(el).find("div[id^='manufacturerEdit_']").modal('hide');
    $('#loading-popup').show();
    tinyMCE.triggerSave();
    let data= {
        id: $(el).find("div[id^='manufacturerEdit_']").attr('id').split('_')[1],
        row: {
            name: $(el).find('#name').val(),
            discription: $(el).find('#discription').val(),
        }
    };
    if($(el).find('.model_pic img').hasClass('new')){
        data.row['picture_name']=$(el).find('.model_pic img').attr('img-name');
        $(el).find('.model_pic img').removeClass('new');
        data['picture']={
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'manufacturers'
        };
        if($(el).find('.model_pic img').attr('ex-name')!==""){
            data.picture['ex_name'] = $(el).find('.model_pic img').attr('ex-name');
        }
    }
    $.ajax({
        type: "POST",
        url: "/product_labels",
        data: JSON.stringify({data: data, method:'updateLabel'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $("#labels_"+data.id+" >li:nth-child(2)>a").text(data.row.name);
            $("#labels_"+data.id+" >li:nth-child(3)").text(data.row.discription);
            if(data.hasOwnProperty('picture')){
                $("#labels_"+data.id+" >li:nth-child(4)>img").attr('src',data.picture.image);
            }
            $('#loading-popup').hide();
        }
    });
}

function loadImg(el,ev,update){
	ev.preventDefault();

    let reader  = new FileReader();
    let file    = el.files[0];

    reader.onloadend = function () {
        $(el).closest('.model_pic').find('img').attr('src',reader.result);
        $(el).closest('.model_pic').find('img').attr('img-name',file.name);
        if(update){
            $(el).closest('.model_pic').find('img').addClass('new');
		}
    };

    if (file) {
        reader.readAsDataURL(file);
    }
    $(el).val('');
}

