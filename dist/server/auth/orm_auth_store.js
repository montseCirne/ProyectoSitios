"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStore = exports.Comanda = exports.Mesa = exports.Usuario = exports.sequelize = void 0;
const sequelize_1 = require("sequelize");
const bcrypt_1 = __importDefault(require("bcrypt"));
// Configuración de la base de datos
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'restaurante.bd',
});
// Modelo de Usuario
exports.Usuario = exports.sequelize.define('Usuario', {
    nombre: sequelize_1.DataTypes.STRING,
    correo: sequelize_1.DataTypes.STRING,
    contraseña: sequelize_1.DataTypes.STRING,
    rol: sequelize_1.DataTypes.ENUM('mesero', 'cocinero', 'administrador'),
});
// Modelo de Mesa
exports.Mesa = exports.sequelize.define('Mesa', {
    numero: sequelize_1.DataTypes.INTEGER,
    estado: sequelize_1.DataTypes.ENUM('disponible', 'ocupada'),
});
// Modelo de Comanda
exports.Comanda = exports.sequelize.define('Comanda', {
    idMesa: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: exports.Mesa,
            key: 'id',
        },
    },
    platillos: sequelize_1.DataTypes.JSON,
    bebidas: sequelize_1.DataTypes.JSON,
    notas: sequelize_1.DataTypes.STRING,
    estado: sequelize_1.DataTypes.ENUM('pendiente', 'en preparación', 'listo'),
    meseroId: {
        type: sequelize_1.DataTypes.INTEGER,
        references: {
            model: exports.Usuario,
            key: 'id',
        },
    },
});
class AuthStore {
    // Crear o actualizar usuario
    async storeOrUpdateUser(nombre, correo, contraseña, rol) {
        const hashedPassword = await bcrypt_1.default.hash(contraseña, 10);
        await exports.Usuario.upsert({
            nombre,
            correo,
            contraseña: hashedPassword,
            rol,
        });
    }
    // Eliminar un usuario
    async deleteUser(correo) {
        await exports.Usuario.destroy({ where: { correo } });
    }
    // Listar todos los usuarios
    async listUsers() {
        return await exports.Usuario.findAll();
    }
    // Crear o actualizar una mesa
    async storeOrUpdateTable(numero, estado) {
        await exports.Mesa.upsert({ numero, estado });
    }
    // Eliminar una mesa
    async deleteTable(numero) {
        await exports.Mesa.destroy({ where: { numero } });
    }
    // Listar todas las mesas
    async listTables() {
        return await exports.Mesa.findAll();
    }
    // Crear o actualizar una comanda
    async storeOrUpdateComanda(idMesa, meseroId, platillos, bebidas, notas, estado) {
        await exports.Comanda.upsert({
            idMesa,
            meseroId,
            platillos,
            bebidas,
            notas,
            estado,
        });
    }
    // Eliminar una comanda
    async deleteComanda(id) {
        await exports.Comanda.destroy({ where: { id } });
    }
    // Listar todas las comandas
    async listComandas() {
        return await exports.Comanda.findAll();
    }
    // Inicializar la base de datos con datos por defecto
    async initModelAndDatabase() {
        await exports.sequelize.truncate({ cascade: true }); // Elimina datos pero no tablas
        // Usuarios por defecto
        await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
        await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
        await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');
        // Mesas por defecto
        const defaultTables = [];
        for (let i = 1; i <= 10; i++) {
            defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
        }
        await Promise.all(defaultTables);
        console.log('Base de datos inicializada con usuarios y mesas por defecto.');
    }
}
exports.AuthStore = AuthStore;
// Ejemplo de inicialización de la base de datos
(async () => {
    const store = new AuthStore();
    await store.initModelAndDatabase();
})();
