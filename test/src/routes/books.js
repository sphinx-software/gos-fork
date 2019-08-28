module.exports = [{
    route: '/api/v1/book',
    method: 'post',
    controller: require('../controllers/books/create'),
    auth: true,
    customAuth: require('../controllers/books/customAuth')
}, {
    route: '/api/v1/book',
    method: 'get',
    controller: require('../controllers/books/get'),
    auth: true
}, {
    route: '/api/v1/book/:book_id',
    method: 'get',
    controller: require('../controllers/books/get'),
    pathParams: {
        book_id: require('../controllers/books/parseBookId')
    },
    auth: true
}, {
    route: '/api/v1/car/upload',
    method: 'post',
    controller: require('../controllers/books/upload')
}]
