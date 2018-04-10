$( document ).ready(function() {
    $('select').chosen({
        disable_search: true,
        width:"100%"
    });
});
function findOrderSum(){
    let totals = 0;
    $('.ordered-products ul>li.products:not(.deleted)').each(function(){
        totals = totals+Number($(this).find('.prod-total-price').contents().first()[0].textContent);
    });
    $('#order_sum').val(totals.toFixed(2));
}
function findTotals(el){
    let $product_row = $(el).closest('li');
    let price = Number($product_row.find('.prod-price').text());
    let $totals = $product_row.find('.prod-total-price');
    $totals.contents().first()[0].textContent=(price*Number(el.value)).toFixed(2);
    findOrderSum();
}
function deleteOrderedProduct(el){
    let $product_row = $(el).closest('li');
    let product_id = $product_row.find('.prod-name>input').val();
    $product_row.slideUp(200,function () {
        $(this).addClass('deleted');
        if($product_row.hasClass('new')) $product_row.remove();
        $('.analog-search-result>li[data-product_id="'+product_id+'"]').attr('onclick','addEquivalent(this)').removeClass('disabled');
        findOrderSum();
    });
}

function checkExsistEquivalents() {
    $('.ordered-products ul>li.products:not(.deleted)').each(function(){
        let prod_id = $(this).find('.prod-name>input').val();
        $('.analog-search-result>li[data-product_id="'+prod_id+'"]').removeAttr('onclick').addClass('disabled');
    });
}
function addEquivalent(el){
    let prod_id = $(el).attr('data-product_id');
    let img = $(el).find('img').attr('src');
    let price =$(el).find('.seil-price>span').text();
    let name = $(el).find('.row:nth-child(1)').text();
    let artikul = $(el).find('.row:nth-child(2) .artikul').text().replace('Артикул:','');
    let item = '<li class="flex products new"><div class="prod-picture flex"><img src="' + img + '"></div><div class="prod-name">' + name + ' '+ artikul +'<input type="hidden" value="' + prod_id + '"></div><div class="prod-qty"><input value="1" onchange="findTotals(this)"></div><div class="prod-price">'+price+'</div><div class="prod-total-price">'+price+'<span class="icon-delete" onclick="deleteOrderedProduct(this)"></span></div></li>';
    $(item).insertBefore('.ordered-products>ul>.totals');
    checkExsistEquivalents();
    findOrderSum();
}

function getDeletedProducts(){
    let result=[];
    $('.ordered-products ul>li.products.deleted').each(function(){
        result.push($(this).find('.prod-name>input').val());
    });
    return result;
}

function getNewProducts(){
    let result=[];
    let order_id = $('#order_id').val();
    let product_id,price,qty;
    let params = "a:0:{}";
    $('.ordered-products ul>li.products.new').each(function(){
        product_id = $(this).find('.prod-name>input').val();
        price = Number($(this).find('.prod-price').text());
        qty = Number($(this).find('.prod-qty>input').val());
        result.push([order_id,product_id,qty,price,params]);
    });
    return result;
}
function getOrderData(){
    return {
        order_id:$('#order_id').val(),
        order_data:{
            order_status:$('#order_status').val(),
            order_sum:$('#order_sum').val()
        },
        newProducts:getNewProducts(),
        deletedProducts:getDeletedProducts()
    }
}
function deleteOrder(){
    if (!confirm('Заказ будет безвозвратно удален. Вы уверены, что хотите продолжить!!!')){
        return;
    }
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/order",
        data: JSON.stringify({data: $('#order_id').val(), method:'deleteOrder'}),
        dataType: "json",
        contentType: "application/json",
        complete: function(){
            window.location.href="/orders";
        },
    });
}

function saveOrder(){
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/order",
        data: JSON.stringify({data: getOrderData(), method:'saveOrder'}),
        dataType: "json",
        contentType: "application/json",
        success: function(data){
            $('#loading-popup').hide();
            alert("Данные сохранены")
        }
    });
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
        prod_id:'new'
    };
    $('#loading-popup').show();
    $.ajax({
        type: "POST",
        url: "/order",
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



