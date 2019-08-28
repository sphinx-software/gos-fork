
module.exports = [{
    route: '/api/v1/auth',
    method: 'post',
    controller: require('../controllers/auth/mobile')
}, {
    route: '/api/v1/auth/verify',
    method: 'post',
    controller: require('../controllers/auth/verify')
}]
