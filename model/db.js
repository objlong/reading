//建立存储区
var AppDirectory = require('appdirectory');
var dirs = new AppDirectory('reading');
//lowdb数据库
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync(dirs.userData() + '/book.json');
const db = low(adapter);

module.exports = {
    initData(data) {
        db.defaults(data)
            .write();
    },
    setBook(data) {
        db.get('bookList')
            .push(data)
            .write();        
    },
    getBookList() {
        return (db.get('bookList')
            .value() || []);
    },
    getBook(id) {
        return (db.get('bookList')
            .find({id: id})
            .value() || {});
    },
    delBook(id) {
        db.get('bookList')
            .remove({id: id})
            .write(); 
    }
}