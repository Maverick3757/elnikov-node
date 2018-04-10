function addManufacturer(ev, el) {
	ev.preventDefault();
    $('#loading-popup').show();
    tinyMCE.triggerSave();
	data= {
        row: {
            name: $(el).find('#name').val(),
            picture: $(el).find('.model_pic img').attr('img-name'),
            content: $(el).find('#discription').val(),
            meta_discription: $(el).find('#meta_discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val()
        },
        picture: {
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'news'
        }
    };
    $.ajax({
        type: "POST",
        url: "/news",
        data: JSON.stringify({data: data, method:'addNews'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log('done')
        },complete: function () {
            document.location.reload();
        }
    });
}

function deleteNews(id){
    let el = $("#manufacturerEdit_"+id);
    let data = {
        row: id
    };
    data['picture']=$(el).find('.model_pic img').attr('ex_name');
    $.ajax({
        type: "POST",
        url: "/news",
        data: JSON.stringify({data: data, method:'deleteNews'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            el.on('hidden.bs.modal', function () {
                $('#loading-popup').hide();
                $("#manufacturer_"+id).remove();
            }).modal('hide');
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
            content: $(el).find('#discription').val(),
            meta_discription: $(el).find('#meta_discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val()
        }
    };
    if($(el).find('.model_pic img').hasClass('new')){
        data.row['picture']=$(el).find('.model_pic img').attr('img-name');
        $(el).find('.model_pic img').removeClass('new');
        data['picture']={
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'news'
        };
        if($(el).find('.model_pic img').attr('ex-name')!==""){
            data.picture['ex_name'] = $(el).find('.model_pic img').attr('ex-name');
        }
    }
    $.ajax({
        type: "POST",
        url: "/news",
        data: JSON.stringify({data: data, method:'updateNews'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $("#manufacturer_"+data.id+" >li:nth-child(2)>a").text(data.row.name);
            $("#manufacturer_"+data.id+" >li:nth-child(3)").text(data.row.content);
            if(data.hasOwnProperty('picture')){
                $("#manufacturer_"+data.id+" >li:nth-child(4)>img").attr('src',data.picture.image);
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

