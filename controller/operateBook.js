//ipc通信
const ipc = require('electron').ipcMain;
//系统弹框
const dialog = require('electron').dialog;
//fs模块读写文件
const fs = require('fs');
//iconv模块转码
const iconv = require("iconv-lite");
//jschardet模块判断编码
const jschardet = require('jschardet');
//db model
const dbModel = require('../model/db');

function readFile(files, callback) {
    let info = {},
        fileArr = files.split('/'),
        id = new Date().getTime(),
        fileName = '<a href="javascript:;" class="book" data-id="' + id + '">' + fileArr[fileArr.length - 1] + '<i></i></a>';

    fs.readFile(files, function(err, buffer) {
        if (err) {
            info.content = err;
            info.chapter = '';
        } else {
            let code = jschardet.detect(buffer);

            let str = iconv.decode(buffer, code.encoding);
            let arr = str.split('\n'), chapter = [];

            arr.map((item, index) => {
                if (/第(.{1,9})章/g.test(item)) {
                    chapter.push('<a href="#item_' + index + '">'+ item +'</a>');
                    arr[index] = '<div id="item_' + index + '" name="item_' + index + '">' + item + '</div>';
                }
            });
            info.content = arr.join('<br/>');
            info.chapter = chapter.join('');
            info.fileName = fileName;
            info.id = id;

            dbModel.setBook(info);
        }
        callback && callback(info);
    });        
}

//打开选项
function openFile() {
    ipc.on('open-file', function(e) {
        dialog.showOpenDialog({
            properties: ['openFile', 'openDirectory']
        }, function(files) {
            if (files && files.length) {
                let ev = e;

                ev.sender.send('selecting-directory', {status: 'uploading'});

                readFile(files[0], (info) => {
                    ev.sender.send('selected-directory', info);
                    ev.sender.send('selecting-directory', {status: 'complete'});
                });
            }
        });
    });     
}

//获取书籍列表
function getBookList() {
    ipc.on('get-book-list', function(e) {
        let bookList = dbModel.getBookList(),
            bookListStr = '';

        bookList.map((item) => {
            bookListStr += item.fileName;
        });

        e.sender.send('get-book-list', {status: 'success', bookListStr: bookListStr});
    });
}

//获取书籍
function getBook() {
    ipc.on('get-book', function(e, id) {
        let data = dbModel.getBook(id);

        e.sender.send('get-book', {status: 'success', bookData: data});
    });
}

//删除书籍
function delBook() {
    ipc.on('del-book', function(e, id) {
        dbModel.delBook(id);

        e.sender.send('del-book', {status: 'success', id: id});
    });
}

exports.install = function() {
    dbModel.initData({bookList: []});
    openFile();
    getBookList();
    getBook();
    delBook();
}