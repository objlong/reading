var selectBtn = $('[data-js=selectBook]'),
    bookList = $('[data-js=bookList]'),
    content = $('[data-js=content]'),
    chapterList = $('[data-js=chapterList]'),
    main = document.querySelector('.main');
// loading
var spinner = new Spinner().spin(main);

const ipc = require('electron').ipcRenderer;
const dbModel = require('../../model/db.js');

//渲染列表
ipc.send('get-book-list');
ipc.on('get-book-list', function(e, data) {
    if (data.status === 'success') {

        bookList.html(data.bookListStr);
        spinner.stop();
    }
});

//选书
let par, id;

bookList.on('click', 'a', function() {
    if (id === $(this).data('id')) {
        return false;
    }

    id = $(this).data('id');

    ipc.send('get-book', id);
    spinner.spin(main);
//删书
}).on('click', 'i', function(e) {
    e.stopPropagation();

    par = $(this).parent('a'),
    id = par.data('id');

    ipc.send('del-book', id);
    
    spinner.spin(main);
});

//选书回调
ipc.on('get-book', function(e, data) {
    if (data.status === 'success') {
        content.html(data.bookData.content);
        chapterList.html(data.bookData.chapter);   

        spinner.stop();
    }

});

//删书回调
ipc.on('del-book', function(e, data) {
    if (data.status === 'success' && data.id === id) {
        par.remove();
        content.html('');
        chapterList.html('');        
        spinner.stop();
    }

});

//点击选择书籍
selectBtn.on('click', function(e) {
    if ($(this).hasClass('no')) {
        return false;
    }

    ipc.send('open-file');
});

// 选择状态转换
ipc.on('selecting-directory', function(e, data) {
    if (data.status == 'uploading') {
        selectBtn.text('加载中').addClass('no');

        spinner.spin(main);

    } else {
        selectBtn.text('选择书籍').removeClass('no');

        spinner.stop();
    }
});

// ipc通讯当前书籍
ipc.on('selected-directory', function(e, data) {
    $('[data-js=bookList]').append(data.fileName);

    id = data.id;
    content.html(data.content);
    chapterList.html(data.chapter);
});