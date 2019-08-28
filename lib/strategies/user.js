const bcryptjs = require('bcryptjs');
const uuidv1 = require('uuid/v1');
const Sequelize = require('sequelize');

const model = {};

module.exports = model;
module.exports.init = function(db) {
    const User = db.define('User', {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        username: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Username already exists'
            }
        },
        password: {
            type: Sequelize.STRING,
            allowNull: false
        },
        refresh_token: {
            type: Sequelize.UUID,
            allowNull: false,
            unique: {
                args: true,
                msg: 'Odds are really against you'
            },
            defaultValue: uuidv1()
        }
    }, { underscored: true });

    User.beforeCreate(user => {
        user.refresh_token = uuidv1();
    });

    User.prototype.changePassword = function(newPassword) {
        const hash = bcryptjs.hashSync(newPassword, 10);
        this.password = hash;
    }

    User.prototype.comparePassword = function(somePassword) {
        return bcryptjs.compareSync(somePassword, this.password);
    };
    model.User = User;
}

