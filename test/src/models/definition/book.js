/* eslint new-cap: "off", global-require: "off" */

module.exports = (sequelize, DataTypes) => sequelize.define('Book', {
    id: {
        type: DataTypes.INTEGER,
        field: 'id',
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    category: {
        type: DataTypes.STRING(200),
        field: 'category',
        allowNull: true
    },
    code: {
        type: DataTypes.STRING(200),
        field: 'code',
        allowNull: false
    },
    name: {
        type: DataTypes.STRING(200),
        field: 'name',
        allowNull: false
    },
    createDate: {
        type: DataTypes.DATE,
        field: 'create_date',
        allowNull: true
    },
    updateDate: {
        type: DataTypes.DATE,
        field: 'update_date',
        allowNull: true
    }
}, {
    schema: 'public',
    tableName: 'book',
    timestamps: false
});

module.exports.initRelations = () => {
    delete module.exports.initRelations; // Destroy itself to prevent repeated calls.

};
