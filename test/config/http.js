module.exports = {
    host: process.env.HTTP_HOST || 'localhost',
    port: process.env.HTTP_PORT || '8082',
    ssl: false,
    uploadDir: 'uploads',
    cors: {
        origins: ['*'],
        allowHeaders: ['*']
    },
    certs: {
        key: 'key.pem',
        certificate: 'certificate.pem'
    }
}
