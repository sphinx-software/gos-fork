function customAuth(req, res, next) {
    let params = req.params;
    if (params.token === '123') {
        return next();
    } else {
        return res.send(401);
    }
}

module.exports = customAuth;
