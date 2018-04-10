$(document).ready(function(){
    $('#telephones_dialog').on('hidden.bs.modal', function () {
        let $telephones=$('#telephones');
        let $dialog = $('#telephones_dialog');
        let telephones = [];
        $dialog.find('.modal-body input').each(function(){
            if($(this).val()!=""){
                telephones.push($(this).val());
                $(this).remove();
            }
        });
        $telephones.val(telephones.join(','));
    });
    $('#email_for_advise_dialog').on('hidden.bs.modal', function () {
        let $telephones=$('#email_for_advise');
        let $dialog = $('#email_for_advise_dialog');
        let telephones = [];
        $dialog.find('.modal-body input').each(function(){
            if($(this).val()!=""){
                telephones.push($(this).val());
                $(this).remove();
            }
        });
        $telephones.val(telephones.join(','));
    })
});


function addPhone(el) {
    let $el = $(el);
    let $dialog = $('#telephones_dialog');
    if($dialog.find('.modal-body input:last-child').is($el)){
        $('<input class="form-control" type="email" oninput="addEmail(this)">').appendTo($dialog.find('.modal-body'))
    }
}
function addEmail(el) {
    let $el = $(el);
    let $dialog = $('#email_for_advise_dialog');
    if($dialog.find('.modal-body input:last-child').is($el)){
        $('<input class="form-control" type="text" oninput="addPhone(this)">').appendTo($dialog.find('.modal-body'))
    }
}
function showEmails() {
    let $telephones=$('#email_for_advise');
    let $dialog = $('#email_for_advise_dialog');
    if($telephones.val()=="") {
        setTimeout(function(){
            $dialog.find('.modal-body input').first().focus();
        }, 300);
        $dialog.modal();
        return false;
    }
    let telephones = $telephones.val().split(',').reverse();

    for(let tel of telephones){
        $('<input class="form-control" type="email" oninput="addEmail(this)" value='+tel+'>').prependTo($dialog.find('.modal-body'))
    }
    setTimeout(function(){
        $dialog.find('.modal-body input').first().focus();
    }, 300);
    $dialog.modal();

}
function showPhones() {
    let $telephones=$('#telephones');
    let $dialog = $('#telephones_dialog');
    if($telephones.val()=="") {
        setTimeout(function(){
            $dialog.find('.modal-body input').first().focus();
        }, 300);
        $dialog.modal();
        return false;
    }
    let telephones = $telephones.val().split(',').reverse();

    for(let tel of telephones){
        $('<input class="form-control" type="text" oninput="addPhone(this)" value='+tel+'>').prependTo($dialog.find('.modal-body'))
    }
    setTimeout(function(){
        $dialog.find('.modal-body input').first().focus();
    }, 300);
    $dialog.modal();

}
function updateStaticInfo() {
    $('#loading-popup').show();
    let contacts={};
    let email_for_advise={};
    let data={};
    $('.info-block').find('input:not([type="file"])[id],textarea').each(function(){
        if($(this).closest('.tab-pane').attr('id')=='contacts-info'){
            contacts[this.id]=$(this).val()==''?null:$(this).val();
        }else{
            data[this.id]=$(this).val()==''?null:$(this).val();
        }
    });
    data['contacts']=contacts;
    let $img = $('.upload-file').find('img');
    if($img.hasClass('new')) {
        data['main_logo'] = $img.attr('img-name');
        $img.removeClass('new');
        data['picture'] = {
            name: $img.attr('img-name'),
            image: $img.attr('src'),
        };
        if ($img.attr('ex-name') !== undefined) {
            data.picture['ex_name'] = $img.attr('ex-name');
        }
    }
    $.ajax({
        type: "POST",
        url: "/shop-info",
        data: JSON.stringify({data: data, method:'updateStaticInfo'}),
        dataType: "json",
        contentType: "application/json",
        success: function(){
            $('#loading-popup').hide();
        }
    });
}

function loadImg(el,ev,update){
	ev.preventDefault();

    let reader  = new FileReader();
    let file    = el.files[0];

    reader.onloadend = function () {
        $(el).next().attr('src',reader.result);
        $(el).next().attr('img-name',file.name);
        if(update){
            $(el).next().addClass('new');
		}
    };

    if (file) {
        reader.readAsDataURL(file);
    }
    $(el).val('');
}

