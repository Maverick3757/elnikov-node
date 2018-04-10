    function tinyInit() {
        tinymce.init({
            forced_root_block : "",
            selector: 'textarea.tiny',
            width: "100%",
            skin: "custom",
            language: 'ru',
            plugins: [
                'lists link charmap hr',
                'searchreplace wordcount visualblocks visualchars code fullscreen charmap',
                'insertdatetime table contextmenu directionality',
                'emoticons paste textcolor colorpicker textpattern imagetools codesample toc'
            ],
            toolbar1: 'undo redo | insert | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent',
            toolbar2: 'forecolor backcolor emoticons | charmap code',
            resize: 'none',
        });//
    }




