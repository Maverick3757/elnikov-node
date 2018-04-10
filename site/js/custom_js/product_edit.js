$( document ).ready(function() {
    $('select[id^="brands"] option:selected').each(function(){
        $('select[id^="brands"] option:not(:selected)[value="'+$(this).val()+'"]').prop("disabled",true)
    });
    $('#car_packages select[data-attr="chosen"]:not([id$="_0"])').chosen({
        no_results_text: "Ничего не найдено по запросу",
        search_contains: true,
        inherit_select_classes: true,
        include_group_label_in_selected:true,
        width:"100%"
    });
    $('#product_category').on('change', function(evt, params) {
        if(params.hasOwnProperty('deselected')){
            let $option = $(this).find('option[value="'+params.deselected+'"]');
            if($option.attr('data-row_id')!==undefined){
                $option.addClass('deleted');
            }
        }else {
            $(this).find('option[value="' + params.selected + '"]').removeClass('deleted');
        }
    });
    $('#manual_price_currency').chosen({
        disable_search_threshold: 15,
        inherit_select_classes: true,
        width:"100px"
    });

    $('#product_info select[data-attr="chosen"]').chosen({
        disable_search_threshold: 15,
        inherit_select_classes: true,
        width:"68%"
    });
    enableEventsForSelect();
});
function enableEventsForSelect(row=""){
    $('select[id^="engines_'+row+'"]').on('change', function(evt, params) {
        engineChanged(this, params);
    });
    $('select[id^="brands_'+row+'"]').on('change', function(evt, params) {
        brandChanged(this, params);
    });
    $('select[id^="packages_'+row+'"]').on('change', function(evt, params) {
        packageChanged(this, params);
    });
    $('select[id^="models_'+row+'"]').on('change', function(evt, params) {
        modelsChanged(this, params);
    });
}
function addNewRowForCar(){
    let nextId = Number($('#car_packages>.content>ul:last-child select').attr('id').split('_')[1])+1;
    $("#cars-clone").clone().removeAttr('id').removeClass('hidden').find("select").each(function() {
        $(this).attr({
            'id': function(_, id) { if (typeof id !== undefined) return id.split("_")[0]+"_"+nextId }
        });
        $(this).chosen({
            no_results_text: "Ничего не найдено по запросу",
            search_contains: true,
            include_group_label_in_selected:true,
            width:"100%"
        });
    }).end().find('.icon-delete').attr('onclick',"deleteCar("+(nextId)+")").end().appendTo('#car_packages>.content');
    enableEventsForSelect(nextId);
}
function deleteCar(row) {
    deleteAllModels(row,false);
    let $ul=$('#models_'+row).closest('ul');
    $ul.remove();
    $('select[id^="brands"] option:disabled').prop("disabled",false);
    $('select[id^="brands"] option:selected').each(function(){
        $('select[id^="brands"] option:not(:selected)[value="'+$(this).val()+'"]').prop("disabled",true)
    });
    $('select[id^="brands"]').trigger("chosen:updated");
}
function modelsChanged(el, params) {
    let row = $(el).attr('id').split('_')[1];
    if(params.hasOwnProperty('deselected')){
        deleteModel(row,params.deselected);
    }else{
        if(params.selected!=="all" && params.selected!=="deleteAll"){
            addModel(row,params.selected);
        }else if(params.selected==="deleteAll"){
            $(el).find('option:selected:not([value="all"])').each(function(){
                deleteModel(row, $(this).val());
                $(this).prop("selected",false);
            });
            $(el).find('option[value="deleteAll"]').prop("selected",false);
            $(el).trigger("chosen:updated");
        }else{
            $(el).find('option:not(:selected):not([value="deleteAll"])').each(function(){
                addModel(row, $(this).val());
                $(this).prop("selected",true);
            });
            $(el).find('option[value="all"]').prop("selected",false);
            $(el).trigger("chosen:updated");
        }
    }
}
function packageChanged(el, params){
    let row = $(el).attr('id').split('_')[1];
    if(params.hasOwnProperty('deselected')){
        deletePackage(row,params.deselected);
    }else {
        if (params.selected!=="all" && params.selected!=="deleteAll") {
            addPackage(row, params.selected);
        }else if(params.selected==="deleteAll"){
            $(el).find('option:selected:not([value="all"])').each(function(){
                deletePackage(row, $(this).val());
                $(this).prop("selected",false);
            });
            $(el).find('option[value="deleteAll"]').prop("selected",false);
            $(el).trigger("chosen:updated");
        }else{
            $(el).find('option:not(:selected):not([value="deleteAll"])').each(function(){
                addPackage(row, $(this).val());
                $(this).prop("selected",true);
            });
            $(el).find('option[value="all"]').prop("selected",false);
            $(el).trigger("chosen:updated");
        }
    }
}
function brandChanged(el, params){
    let row = $(el).attr('id').split('_')[1];
    if($(el).attr('id')==$('#car_packages>.content>ul:last-child select').attr('id')){
        addNewRowForCar();
    }
    let $models=$('#models_'+row);
    if($('select[id^="brands"]>option:selected[value="'+$(el).val()+'"]').length>1){
        $(el).trigger("chosen:updated");
        return;
    }
    $('#loading-popup').show();
    deleteAllModels(row,false);
    $.ajax({
        type: "POST",
        url: "/product_edit",
        data: JSON.stringify({data: params.selected, method:'getModelsByBrandId'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            console.log(data);
            for(let val of data){
                $models.append("<option value='"+val.id+"'>"+val.model_name+"</option>")
            }
            $('select[id^="brands"] option:disabled').prop("disabled",false);
            $('select[id^="brands"] option:selected').each(function(){
                $('select[id^="brands"] option:not(:selected)[value="'+$(this).val()+'"]').prop("disabled",true)
            });
            $('select[id^="brands"]').trigger("chosen:updated");
            $models.trigger("chosen:updated");
            $('#loading-popup').hide();
        }
    });
}
function engineChanged(el, params) {
    if (params.hasOwnProperty('deselected')) {
        deleteEngine(el, params.deselected);
    } else {
        if (params.selected !== "all" && params.selected !== "deleteAll") {
            addEngine(el, params.selected);
        } else if (params.selected === "deleteAll") {
            $(el).find('option:selected:not([value="all"])').each(function () {
                deleteEngine(el, $(this).val());
                $(this).prop("selected", false);
            });
            $(el).find('option[value="deleteAll"]').prop("selected", false);
            $(el).trigger("chosen:updated");
        } else {
            $(el).find('option:not(:selected):not([value="deleteAll"])').each(function () {
                addEngine(el, $(this).val());
                $(this).prop("selected", true);
            });
            $(el).find('option[value="all"]').prop("selected", false);
            $(el).trigger("chosen:updated");
        }
    }
}
function addPackage(row, value){
    let $engines=$('#engines_'+row);
    let $packages=$('#packages_'+row);
    let $removed_engines = $('#removed_engines');
    let removedArray = $removed_engines.val().split(',');
    let label = $packages.find('option[value="'+value+'"]').closest('optgroup').attr('label')+' '+$packages.find('option[value="'+value+'"]').text();
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/product_edit",
        data: JSON.stringify({data: value, method:'getEnginesByPackageId'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $engines.append("<optgroup label='"+label+"' data-group-id='"+value+"'></optgroup>");
            let $group = $engines.find("optgroup[label='"+label+"']");
            for(let val of data){
                if(removedArray.indexOf(val.id.toString())>-1){
                    $group.append("<option value='"+val.id+"' ex-data='"+val.id+"' selected>"+val.engine+"</option>");
                    removedArray.splice(removedArray.indexOf(val.id.toString()), 1);
                    $removed_engines.val(removedArray.join(','));
                }else{
                    $group.append("<option value='"+val.id+"'>"+val.engine+"</option>")
                }

            }
            $engines.trigger("chosen:updated");
            $('#loading-popup').hide();
        }
    });
}
function deleteAllModels(row, update=true){
    let $models=$('#models_'+row);
    $models.find('option:not([value="all"]):not([value="deleteAll"])').each(function(){
        deleteModel(row, $(this).val());
        $(this).remove();
    });
    if (update) $models.trigger("chosen:updated");
}
function addModel(row, value){
    let $models=$('#models_'+row);
    let $packages=$('#packages_'+row);
    let label = $models.find('option[value="'+value+'"]').text();
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/product_edit",
        data: JSON.stringify({data: value, method:'getPackagesByModelId'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $packages.append("<optgroup label='"+label+"' data-group-id='"+value+"'></optgroup>");
            let $group = $packages.find("optgroup[label='"+label+"']");
            for(let val of data){
                $group.append("<option value='"+val.id+"'>"+val.build_years+"</option>")
            }
            $packages.trigger("chosen:updated");
            $('#loading-popup').hide();
        }
    });
}
function deletePackage(row, value, update=true){
    let $engines=$('#engines_'+row);
    $engines.find('optgroup[data-group-id="'+value+'"]>option').each(function(){
        deleteEngine($engines,$(this).val());
    });
    $engines.find('optgroup[data-group-id="'+value+'"]').remove();
    if (update) $engines.trigger("chosen:updated");
}
function deleteModel(row, value){
    let $packages=$('#packages_'+row);
    let $engines=$('#engines_'+row);
    $packages.find('optgroup[data-group-id="'+value+'"]>option').each(function(){
        deletePackage(row,$(this).val(),false);
    });
    $packages.find('optgroup[data-group-id="'+value+'"]').remove();
    $packages.trigger("chosen:updated");
    $engines.trigger("chosen:updated");
}
function deleteEngine(select, value){
    let $new_engines = $('#new_engines');
    let newEngineArray = $new_engines.val().split(',');
    let index = newEngineArray.indexOf(value);
    if (index>-1){
        newEngineArray.splice(index, 1);
        $new_engines.val(newEngineArray.join(','));
    }
    if($(select).find('option[value="'+value+'"]').attr('ex-data')!==undefined){
        let $removed_engines = $('#removed_engines');
        let removedArray = $removed_engines.val().split(',');
        if(removedArray.indexOf(value)===-1){
            removedArray.push(value);
        }
        if ($removed_engines.val()!==""){
            $removed_engines.val(removedArray.join(','));
        }else{
            $removed_engines.val(value);
        }
    }
}
function addEngine(select, value){
    let $removed_engines = $('#removed_engines');
    let array = $removed_engines.val().split(',');
    let index = array.indexOf(value);
    if (index>-1){
        array.splice(index, 1);
        $removed_engines.val(array.join(','));
    }
    if($(select).find('option[value="'+value+'"]').attr('ex-data')===undefined){
        let $new_engines = $('#new_engines');
        let newEngineArray = $new_engines.val().split(',');
        if(newEngineArray.indexOf(value)===-1){
            newEngineArray.push(value);
        }
        if ($new_engines.val()!==""){
            $new_engines.val(newEngineArray.join(','));
        }else{
            $new_engines.val(value);
        }
    }
}

function getImgToLoad(){
    let images=[];
    let addData;
    $('#products_picture .picture-block:not(.deleted) img.new, #products_picture .picture-block:not(.deleted) img.updated').each(function(){
        addData = {
            name:$(this).attr('img-name'),
            image:$(this).attr('src'),
        };
        if($(this).attr('ex-data')!==undefined){
            addData['ex-data'] = $(this).attr('ex-data');
        }
        addData['path']="products";
        images.push(addData);
    });
    return images;
}

function saveData(){
    if(!validateInfo(getProductData().main_info)) return;
    let product_id;
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/product_edit",
        data: JSON.stringify({data: getProductData(), method:'saveProductData'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            product_id = data
        },
        complete: function(data){
            document.location.href="/product_edit?id="+product_id;
        }
    });
}
function validateInfo(info){
    if(info.product_name=="" || info.product_name==null){
        alert("Введите название для продутка");
        return false;
    }else if(info.providers=="" || info.providers==null){
        alert("Выберите основного поставщика");
        return false;
    }else if(info.providers_artikul=="" || info.providers_artikul==null){
        alert("Введите артикул для продутка");
        return false;
    }else if((info.manual_price!="" && info.manual_price_currency=='')||(info.manual_price_currency!="" && info.manual_price=='')){
        alert('Если выбрана валюиа или указана цена в поле "Цена(от поставщика)" то оба поля должны быть заполнены!!!');
        return false;
    }
    //else if($('#product_category').val()=="" || $('#product_category').val()==null){
    //    alert("Выберите категорию для продутка");
    //   return false;
    //}
    else{
        return true;
    }

}
function getProductData(){
    let imagesToDelete=[];
    $('.picture-block.deleted img[ex-data]').each(function(){
        imagesToDelete.push($(this).attr('ex-data'))
    });
    let info = {
        product_name:$('#product_name').val(),
        vin:$('#product_oe').val(),
        providers:$('#product_providers').val(),
        providers_artikul:$('#providers_artikul').val(),
        manufacturer:$('#manufacturers').val(),
        info:$('#dop_info').val(),
        discription:$('#discription').val(),
        meta_description:$('#meta_description').val(),
        meta_keywords:$('#meta_keywords').val(),
        manual_price:$('#manual_price').val(),
        manual_price_currency:$('#manual_price_currency').val(),
        discont:$('#discont').val(),
        label_id:$('#labels').val()==''?null:$('#labels').val(),
    };
    let cars_data = {
        new_engines:$('#new_engines').val(),
        removed_engines:$('#removed_engines').val()
    };

    return {
        product_id:$('#product_id').val(),
        imgToLoad:getImgToLoad(),
        imagesToDelete:imagesToDelete,
        main_info:info,
        cars_data: cars_data,
        equivalents_data:getEquivalents(),
        categories_data:getCategories(),
        charack_data:getCharackData(),
        picture_data:getPictureData()
    };
}
function getEquivalents(){
    let newAnalogs = [];
    let deletedAnalogs = [];
    let product_id = $('#product_id').val();
    $('.equivalent_product>li').each(function(){
        if($(this).hasClass('new')){
            let item = [
                $(this).attr('data-product_id'),/*equivalent_prod_id*/
            ];
            if (product_id!=='new') item.push(product_id);/*product_id*/
            newAnalogs.push(item);
        }else if($(this).hasClass('deleted')){
            deletedAnalogs.push($(this).attr('data-row_id'))
        }
    });
    return {
        newAnalogs:newAnalogs,
        deletedAnalogs:deletedAnalogs
    }
}

function getCategories(){
    let newCategories = [];
    let deletedCategories = [];
    let product_id = $('#product_id').val();
    let $product_category = $('#product_category');
    $product_category.find('>option.deleted').each(function(){
        deletedCategories.push($(this).attr('data-row_id'))
    });
    for(let val of $product_category.val()){
        if($product_category.find('>option[value="'+val+'"]').attr('data-row_id')===undefined){
            let item = [
                val,/*category_id*/
            ];
            if (product_id!=='new') item.push(product_id);/*product_id*/
            newCategories.push(item)
        }
    }
    return {
        newCategories:newCategories,
        deletedCategories:deletedCategories
    }
}

function getCharackData(){
    let newCharack = [];
    let deletedCharack = [];
    let updatedCharack = [];
    let product_id = $('#product_id').val();
    $('#products_charakteristiks .row:not(.clone)').not(':last-child').each(function(){
        if($(this).hasClass('deleted')){
            if($(this).attr('row-id')!==undefined)  deletedCharack.push($(this).attr('row-id'))
        }else{
            if($(this).attr('row-id')!==undefined){
                updatedCharack.push([
                    $(this).attr('row-id'),/*id*/
                    $(this).find('input:nth-child(2)').val(),/*field_name*/
                    $(this).find('input:nth-child(3)').val()/*field_value*/
                ])
            }else{
                let item = [
                    $(this).find('input:nth-child(2)').val(),/*field_name*/
                    $(this).find('input:nth-child(3)').val()/*field_value*/
                ];
                if (product_id!=='new') item.push(product_id);/*product_id*/
                newCharack.push(item);
            }
        }
    });
    return {
        newCharack:newCharack,
        deletedCharack:deletedCharack,
        updatedCharack:updatedCharack
    }
}

function getPictureData() {
    let newImages = [];
    let deletedImages = [];
    let updatedImages = [];
    let product_id = $('#product_id').val();
    $('#products_picture .picture-block:not(.clone)').each(function () {
        let $img = $(this).find('img');
        if($(this).hasClass('deleted')){
            if(!$img.hasClass('new')){
                deletedImages.push($img.attr('picture-row-id'));
            }
        }else{
            let img_order = $(this).find('input[id^="order_"]').val();
            if($img.hasClass('updated')){
                updatedImages.push([
                    $img.attr('picture-row-id'),/*id*/
                    $img.attr('img-name'),/*picture_name*/
                    img_order/*ordering*/
                ]);
            }else if(!$img.hasClass('new')){
                updatedImages.push([
                    $img.attr('picture-row-id'),/*id*/
                    $img.attr('src').split('/').pop(),/*picture_name*/
                    img_order/*ordering*/
                ]);
            }else{
                let item = [
                    $img.attr('img-name'),/*picture_name*/
                    img_order/*ordering*/
                ];
                if (product_id!=='new') item.push(product_id);/*product_id*/
                newImages.push(item);
            }
        }
    });
    return {
        newImages: newImages,
        deletedImages: deletedImages,
        updatedImages: updatedImages
    }
}

function findMaxOrdering(){
    let result = 1;
    $('.picture-block:not(.deleted) input[id^="order_"]').each(function(){
        if(result<=Number(this.value)) result=Number(this.value)+1
    });
    return result;
}

function changeImgOrder(el) {
    $('.picture-block:not(.deleted) input[id^="order_"][ex-data="'+el.value+'"]').val($(el).attr('ex-data')).attr('ex-data',$(el).attr('ex-data'));
    $(el).attr('ex-data',el.value);
}
function addNewCharakRow(el){
    $('#products_charakteristiks .row.clone').clone().find("input").val('').end().appendTo('#products_charakteristiks .content');
    $(el).closest('.row').removeClass('clone').find('input').removeAttr('oninput');
}
function searchProduct(el){
    if(el.value.length==''){
        $('.analog-search-result').slideUp(200).html('');
        return
    }else if(el.value.length<=2) {
        return
    }
    let data={
        search:el.value,
        prod_id:$('#product_id').val()
    };
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/product_edit",
        data: JSON.stringify({data: data, method:'searchProdForEquivalent'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $('.analog-search-result').html(data).slideDown(200);
            checkExsistEquivalents();
            $('#loading-popup').hide();
        }
    });
}
function addEquivalent(el){
    let prod_id = $(el).attr('data-product_id');
    if($('.equivalent_product>li[data-product_id="'+prod_id+'"]').length>0){
        $('.equivalent_product>li[data-product_id="'+prod_id+'"]').removeClass('hidden deleted')
    }else {
        let img = $(el).find('img').attr('src');
        let name = $(el).find('.row:nth-child(1)').html();
        let artikul = $(el).find('.row:nth-child(2) .artikul').html();
        let item = '<li class="flex new" data-product_id="' + prod_id + '"><span class="icon-delete" onclick="removeEquivalent(this)"></span><div class="img-block"><img src="' + img + '"/></div><div class="discription flex"><div>' + name + '</div><div>' + artikul + '</div>';
        $(item).appendTo('.equivalent_product');
    }
    checkExsistEquivalents();
}
function removeEquivalent(el){
    let $li = $(el).closest('li');
    let prod_id = $li.attr('data-product_id');
    $('.analog-search-result>li[data-product_id="'+prod_id+'"]').attr('onclick','addEquivalent(this)').removeClass('disabled');
    if($li.hasClass('new')){
        $li.remove();
    }else{
        $li.addClass('hidden deleted');
    }
}
function checkExsistEquivalents() {
    $('.equivalent_product>li:not(.deleted)').each(function(){
        let prod_id = $(this).attr('data-product_id');
        $('.analog-search-result>li[data-product_id="'+prod_id+'"]').removeAttr('onclick').addClass('disabled');
    });
}
function loadImg(el,ev){
	ev.preventDefault();
    let reader  = new FileReader();
    let file    = el.files[0];
    let $img = $(el).prev().find('img');
    reader.onloadend = function () {
        if($('.picture-block:not(.deleted) img[img-name="'+file.name+'"],.picture-block:not(.deleted) img[ex-data="'+file.name+'"]:not([new-data]),.picture-block:not(.deleted) img[new-data="'+file.name+'"]').length>0) {
            alert("Изображение с таким именем уже загружено");
            return;
        }
        if($(el).closest('.picture-block').hasClass('clone')){
            let nextId = Number($('.picture-block:not(.deleted)').first().find('input[type="file"]').attr('id').split('_')[1])+1;
            $(el).closest('.picture-block').clone().removeClass('clone').find("label,input,img").each(function() {
                if($(this).attr('id')==="order_0"){
                    $(this).val(findMaxOrdering());
                    $(this).attr('ex-data',findMaxOrdering());
                }
                if($(this).attr('id')!==undefined){
                    $(this).attr({
                        'id': function(_, id) { if (typeof id !== undefined) return id.split("_")[0]+"_"+nextId }
                    }).removeClass('hidden');
                }
                if($(this).attr('for')!==undefined){
                    $(this).attr({
                        'for': function(_, id) { if (typeof id !== undefined) return id.split("_")[0]+"_"+nextId }
                    });
                }
                if($(this).attr('src')!==undefined){
                    $(this).attr({
                        'src': reader.result,
                        'img-name':file.name,
                        'class': 'new'
                    });
                }
            }).end().find('label>div').text('Заменить фото').end().find('button').removeClass('hidden').end().prependTo('#products_picture .content').hide().fadeIn(1000);
        }else if ($img.attr('ex-data')!==undefined){
            $img.attr({
                'src':reader.result,
                'img-name':file.name
            }).addClass('updated')
        }else{
            $img.attr({
                'src':reader.result,
                'img-name':file.name,
            });
        }
    };
    if (file) {
        reader.readAsDataURL(file);
    }
    $(el).val('');
}

