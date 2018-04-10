

function addBrand(ev, el) {
	ev.preventDefault();
    $('#loading-popup').show();
    tinyMCE.triggerSave();
	data= {
        row: {
            brand_name: $(el).find('#brand_name').val(),
            picture_name: $(el).find('.model_pic img').attr('img-name'),
            order: Number($('#max-order').val())+1,
            discription: $(el).find('#discription').val(),
            meta_discription: $(el).find('#meta_discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val(),
        },
        picture: {
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'car_brands'
        }
    };
    $.ajax({
        type: "POST",
        url: "/site",
        data: JSON.stringify({data: data, method:'addBrand'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log('done')
        },complete: function () {
            document.location.reload();
        }
    });
}

function addNewYears(ev){
    ev.preventDefault();
    if($('.packing-block #'+$('#newYearData').val().replace(/[.]/g,'1')).length>0){
        alert("Такой период уже задан!!!");
        return;
    }
    $('#addYear').modal('hide');

    let years = $('#newYearData').val();

    $('.packing-block .nav-tabs li').removeClass('active');
    $('<li><a data-toggle="tab" href="#'+years.replace(/[.]/g,'1')+'">'+years+'</a>').insertBefore('.addYear').addClass('active');
    $('.packing-block .tab-content .tab-pane').removeClass('in active');
    $("#clone-exapmle").clone().attr('id',years.replace(/[.]/g,'1')).addClass('in active new').appendTo('.packing-block .tab-content');
    $('.packing-block #'+years.replace(/[.]/g,'1')+' input[name="yearsBuild"]').val(years).attr("ex-year",years.replace(/[.]/g,'1'));
    $('.packing-block #'+years.replace(/[.]/g,'1')+' .picture-block>label').attr('for','export-year-pic_'+years.replace(/[.]/g,'1'));
    $('.packing-block #'+years.replace(/[.]/g,'1')+' .picture-block>input').attr('id','export-year-pic_'+years.replace(/[.]/g,'1'));
}



function getPictures(){
    let images=[];
    $('#model_edit img.new').each(function(){
        addData = {
            name:$(this).attr('img-name'),
            image:$(this).attr('src'),
        };
        if($(this).attr('ex-name')!==undefined){
            addData['ex_name'] = $(this).attr('ex-name');
        }
        if($(this).closest('div').hasClass('picture-block')){
            addData['path']="car_packing";
        }else{
            addData['path']="car_models";
        }
        images.push(addData);
    });
    return images;

}

function saveData(){
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/model_edit",
        data: JSON.stringify({data: getModelData(), method:'addModelData'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
        },
        complete: function(){
            document.location.reload();
        }
    });
}

function getModelData(){
    let new_years=[];
    let removed_years = [];
    let updated_years = [];

    $('.packing-block .tab-content>.tab-pane:gt(0)').each(function () {
        if($(this).hasClass('new')){
           let img_name = null;
           if($(this).find('.picture-block.upload-file>img').attr('img-name')!==undefined){
               img_name = $(this).find('.picture-block.upload-file>img').attr('img-name');
           }
           let engines=[];
           $(this).find('.engines-block>.flex.new>#engine-value').each(function(){
               if($(this).val()!==""){
                   engines.push($(this).val());
               }
           });
           let new_year = {
               year: $(this).find('input[name="yearsBuild"]').val(),
               picture_name:img_name,
               engines:  engines
           };
           new_years.push(new_year);
        }else if($(this).hasClass('removed')){
            let img_name = null;
            if($(this).find('.picture-block.upload-file>img').attr('img-name')!==undefined){
                img_name = $(this).find('.picture-block.upload-file>img').attr('img-name');
            }
            let removed_year={
                id:$(this).find('#packing_id').val(),
                picture:img_name
            };
            removed_years.push(removed_year);
        }else{
            let img_name = null;
            if($(this).find('.picture-block.upload-file>img').attr('img-name')!==undefined){
                img_name = $(this).find('.picture-block.upload-file>img').attr('img-name');
            }
            let new_engines=[];
            $(this).find('.engines-block>.flex.new>#engine-value').each(function(){
                if($(this).val()!==""){
                    new_engines.push($(this).val());
                }
            });
            let removed_engines=[];
            $(this).find('.engines-block>.flex.removed').each(function(){
                removed_engines.push($(this).find('#engine-id').val());
            });
            let engines=[];
            $(this).find('.engines-block>.flex:not(.new):not(.removed)').each(function(){
                    let engine=[
                        $(this).find('#engine-id').val(),
                        $(this).find('#engine-value').val()
                    ];
                    engines.push(engine);
            });
            let updated_year = {
                packing_id:$(this).find('#packing_id').val(),
                year: $(this).find('input[name="yearsBuild"]').val(),
                picture_name:img_name,
                engines:  engines,
                removed_engines: removed_engines,
                new_engines: new_engines
            };
            updated_years.push(updated_year);
        }
    });
    let model_img_name = null;
    if($('.info-block .upload-file>img').attr('img-name')!==undefined){
        model_img_name = $('.info-block .upload-file>img').attr('img-name');
    }
    return {
        car_brand: $('#car_brand').val(),
        images: getPictures(),
        model_id: $('#model_id').val(),
        model_name: $('#model_name').val(),
        picture_name: model_img_name,
        meta_discription: $('#model_meta_desc').val(),
        keywords: $('#model_keywords').val(),
        updated_years: updated_years,
        removed_years:removed_years,
        new_years:new_years
    };
}

function deleteYears(el){
    $('.packing-block .nav-tabs li.active').remove();
    if($(el).closest('.engine-head').find('#packing_id').val()!==undefined){
        $('.packing-block .tab-content .tab-pane.active').addClass('removed').removeClass('in active');
    }else{
        $('.packing-block .tab-content .tab-pane.active').remove();
    }
    if($('.packing-block .nav-tabs li:not(.removed)').length>1) {
        $('.packing-block .nav-tabs li:first-child').addClass('active');
        $('.packing-block .tab-content .tab-pane:not(.removed):eq(1)').addClass('in active');
    }
}

function yearsChanged(el){
    let data = $(el).val();
    if($('.packing-block .nav-tabs a[href="#'+data.replace(/[.]/g,'1')+'"]').length>0 && $('.packing-block .nav-tabs a[href="#'+data.replace(/[.]/g,'1')+'"]').text()==data){

        alert("Такой период уже задан!!!");
        return;
    }
    let ex_years=$(el).attr("ex-year");
    $('.packing-block #'+ex_years+' .picture-block>label').attr('for','export-year-pic_'+data.replace(/[.]/g,'1'));
    $('.packing-block #'+ex_years+' .picture-block>input').attr('id','export-year-pic_'+data.replace(/[.]/g,'1'));
    $(el).closest('.tab-pane').attr('id',data.replace(/[.]/g,'1'));
    $('.packing-block a[href="#'+ex_years+'"]').attr('href','#'+data.replace(/[.]/g,'1')).text(data);
    $(el).attr("ex-year",data.replace(/[.]/g,'1'));

}
function addNewEngine(el){
    $('<div class="flex new"><input class="form-control" id="engine-value"><span class="icon-delete" onclick="deleteEngine(this)"></span></div>').insertBefore(el);
}
function deleteEngine(el){
    if($(el).closest('div').find('#engine-id').length>0){
        $(el).closest('div').addClass('removed');
        $(el).closest('div').hide(200);
    }else{
        $(el).closest('div').remove();
    }

}
function updateBrand(ev, el) {
    ev.preventDefault();
    $(el).find("div[id^='brandEdit_']").modal('hide');
    $('#loading-popup').show();
    tinyMCE.triggerSave();
    let data= {
        id: $(el).find("div[id^='brandEdit_']").attr('id').split('_')[1],
        row: {
            brand_name: $(el).find('#brand_name').val(),
            discription: $(el).find('#discription').val(),
            meta_discription: $(el).find('#meta_discription').val(),
            meta_keywords: $(el).find('#meta_keywords').val(),
        }
    };
    if($(el).find('.model_pic img').hasClass('new')){
        data.row['picture_name']=$(el).find('.model_pic img').attr('img-name');
        $(el).find('.model_pic img').removeClass('new');
        data['picture']={
            name: $(el).find('.model_pic img').attr('img-name'),
            image: $(el).find('.model_pic img').attr('src'),
            path: 'car_brands'
        };
        if($(el).find('.model_pic img').attr('ex-name')!==""){
            data.picture['ex_name'] = $(el).find('.model_pic img').attr('ex-name');
        }
    }
    $.ajax({
        type: "POST",
        url: "/site",
        data: JSON.stringify({data: data, method:'updateBrand'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $("#brand_"+data.id+" >li:nth-child(2)>a").text(data.row.brand_name);
            if(data.hasOwnProperty('picture')){
                $("#brand_"+data.id+" >li:nth-child(3)>img").attr('src',data.picture.image);
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
        url: "/site",
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
        $(el).closest('.upload-file').find('img').attr('src',reader.result);
        $(el).closest('.upload-file').find('img').attr('img-name',file.name);
        if(update){
            $(el).closest('.upload-file').find('img').addClass('new');
		}
    };

    if (file) {
        reader.readAsDataURL(file);
    }
    $(el).val('');
}

