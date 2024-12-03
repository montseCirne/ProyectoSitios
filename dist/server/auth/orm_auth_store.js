"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthStore = exports.Comanda = exports.Mesa = exports.Usuario = exports.sequelize = void 0;
const orm_auth_models_1 = require("./orm_auth_models");
const orm_auth_models_2 = require("./orm_auth_models");
const orm_auth_models_3 = require("./orm_auth_models");
const bcrypt_1 = __importDefault(require("bcrypt"));
const sequelize_1 = require("sequelize");
// Configuración de la base de datos
exports.sequelize = new sequelize_1.Sequelize({
    dialect: 'sqlite',
    storage: 'restaurante.bd',
    logging: console.log,
});
// Modelo de Usuario
exports.Usuario = orm_auth_models_3.UsuarioModel;
// Modelo de Mesa
exports.Mesa = orm_auth_models_1.MesaModel;
// Modelo de Comanda
exports.Comanda = orm_auth_models_2.ComandaModel;
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
    // Listar mesas ocupadas
    async listOccupiedTables() {
        return await exports.Mesa.findAll({
            where: {
                estado: 'ocupada',
            }
        });
    }
    // Crear o actualizar una comanda
    async storeOrUpdateComanda(idMesa, meseroId, platillos, bebidas, notas, estado) {
        const mesa = await exports.Mesa.findByPk(idMesa);
        if (!mesa || mesa.estado === 'ocupada') {
            throw new Error('Mesa no disponible o ya ocupada');
        }
        // Registrar comanda y actualizar estado de mesa
        await exports.Comanda.upsert({
            idMesa,
            meseroId,
            platillos,
            bebidas,
            notas,
            estado,
        });
        // Actualizar estado de la mesa a ocupada
        await mesa.update({ estado: 'ocupada' });
    }
    // Eliminar una comanda
    async deleteComanda(id) {
        try {
            const comanda = await exports.Comanda.findByPk(id);
            if (!comanda) {
                throw new Error('Comanda no encontrada');
            }
            // Comprobación de la existencia de la mesa antes de acceder a sus propiedades
            const mesa = await exports.Mesa.findByPk(comanda.idMesa);
            if (mesa) {
                await mesa.update({ estado: 'disponible' });
            }
            else {
                throw new Error('Mesa no encontrada');
            }
            // Eliminar la comanda
            await exports.Comanda.destroy({ where: { id } });
        }
        catch (error) {
            console.error('Error al eliminar la comanda:', error);
        }
    }
    // Listar todas las comandas
    async listComandas() {
        return await exports.Comanda.findAll();
    }
    // Inicializar la base de datos con datos por defecto
    async initModelAndDatabase() {
        try {
            await exports.sequelize.sync({ alter: true }); // Sincroniza las tablas, pero no borra datos
            console.log('Modelos sincronizados con la base de datos.');
            // Inicializar datos por defecto
            await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
            await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
            await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');
            // Inicialización de mesas por defecto
            const defaultTables = [];
            for (let i = 1; i <= 10; i++) {
                defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
            }
            await Promise.all(defaultTables);
            // Inicialización de comandas por defecto
            const defaultComandas = [];
            defaultComandas.push(this.storeOrUpdateComanda(1, 1, ['Ensalada César'], ['Agua'], 'Sin notas', 'pendiente'), this.storeOrUpdateComanda(2, 1, ['Pizza Margherita'], ['Cerveza'], 'Sin notas', 'pendiente'), this.storeOrUpdateComanda(3, 1, ['Pasta Bolognesa'], ['Vino Tinto'], 'Sin notas', 'pendiente'));
            await Promise.all(defaultComandas);
            console.log('Base de datos inicializada con usuarios, mesas y comandas por defecto.');
        }
        catch (error) {
            console.error('Error al sincronizar o inicializar la base de datos:', error);
        }
    }
}
exports.AuthStore = AuthStore;
// Ejemplo de inicialización de la base de datos
(async () => {
    const store = new AuthStore();
    await store.initModelAndDatabase();
})();
