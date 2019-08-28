class OTPGenerator {
    generate(len, type) {
        len = len || 20;
        type = type || 'numbers_uppercases_lowercases';

        var strings = {
            numbers: '0123456789',
            uppercases: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercases: 'abcdefghiklmnopqrstuvwxyz'
        }
        let choise = '',
            ret = '',
            types = type.split('_');

        for (let i = 0; i < types.length; i++) {
            if (strings[types[i]]) {
                choise += strings[types[i]];
            }
        }

        if (!choise) {
            choise = strings.numbers + strings.lowercases + strings.uppercases;
        }

        for (let i = 0; i < len; i++) {
            ret += choise[Math.floor(Math.random() * choise.length)];
        }

        return ret;
    }
}

module.exports = OTPGenerator;
