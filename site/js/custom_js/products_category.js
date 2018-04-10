function addСategory(ev, el) {
	ev.preventDefault();
    $('#loading-popup').show();
    tinyMCE.triggerSave();
	data= {
        row: {
            category_name: $(el).find('#category_name').val(),
            picture_name: $(el).find('.model_pic img').attr('img-name'),
            order: Number($('#max-order').val())+1,
            discription: $(el).find('#discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val(),
        },
        picture: {
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'products_category'
        }
    };
    $.ajax({
        type: "POST",
        url: "/products_category",
        data: JSON.stringify({data: data, method:'addСategory'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log('done')
        },complete: function () {
            document.location.reload();
        }
    });
}

function updateCategory(ev, el) {
    ev.preventDefault();
    $(el).find("div[id^='categoryEdit_']").modal('hide');
    $('#loading-popup').show();
    tinyMCE.triggerSave();
    let data= {
        id: $(el).find("div[id^='categoryEdit_']").attr('id').split('_')[1],
        row: {
            category_name: $(el).find('#category_name').val(),
            discription: $(el).find('#discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val(),
        }
    };
    if($(el).find('.model_pic img').hasClass('new')){
        data.row['picture_name']=$(el).find('.model_pic img').attr('img-name');
        $(el).find('.model_pic img').removeClass('new');
        data['picture']={
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'products_category'
        };
        if($(el).find('.model_pic img').attr('ex-name')!==""){
            data.picture['ex_name'] = $(el).find('.model_pic img').attr('ex-name');
        }
    }
    $.ajax({
        type: "POST",
        url: "/products_category",
        data: JSON.stringify({data: data, method:'updateСategory'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $("#category_"+data.id+" >li:nth-child(2)>a").text(data.row.category_name);
            if(data.hasOwnProperty('picture')){
                $("#category_"+data.id+" >li:nth-child(3)>img").attr('src',data.picture.image);
            }
            $('#loading-popup').hide();
        }
    });
}

function changeOrder(el) {
    $('#loading-popup').show();
    id1=$(el).closest('ul').attr('id').split('_')[1];
    id2=$('#showing_order input[ex-order="'+$(el).val()+'"]').closest('ul').attr('id').split('_')[1];
    ex_order=$(el).attr('ex-order');
    new_order=$(el).val();
    let data = [[id1,new_order],[id2,ex_order]];

    $.ajax({
        type: "POST",
        url: "/products_category",
        data: JSON.stringify({data: data, method:'changeOrder'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $('#showing_order input[ex-order="'+$(el).val()+'"]').val(ex_order);
            $('#showing_order input[ex-order="'+$(el).val()+'"]').attr('ex-order',ex_order);
            $(el).attr('ex-order',new_order);
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

