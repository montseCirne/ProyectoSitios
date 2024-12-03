import { MesaModel } from './orm_auth_models'; // Asegúrate de importar el modelo correcto
import { ComandaModel } from './orm_auth_models'; // Asegúrate de importar el modelo correcto
import { UsuarioModel } from './orm_auth_models'; // Asegúrate de importar el modelo correcto
import bcrypt from 'bcrypt';
import { Sequelize, DataTypes } from 'sequelize';

// Configuración de la base de datos
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'restaurante.bd',
  logging: console.log,
});

// Modelo de Usuario
export const Usuario = UsuarioModel;

// Modelo de Mesa
export const Mesa = MesaModel;

// Modelo de Comanda
export const Comanda = ComandaModel;

export class AuthStore {
  // Crear o actualizar usuario
  async storeOrUpdateUser(
    nombre: string,
    correo: string,
    contraseña: string,
    rol: 'mesero' | 'cocinero' | 'administrador'
  ): Promise<void> {
    const hashedPassword = await bcrypt.hash(contraseña, 10);
    await Usuario.upsert({
      nombre,
      correo,
      contraseña: hashedPassword,
      rol,
    });
  }

  // Eliminar un usuario
  async deleteUser(correo: string): Promise<void> {
    await Usuario.destroy({ where: { correo } });
  }

  // Listar todos los usuarios
  async listUsers(): Promise<any[]> {
    return await Usuario.findAll();
  }

  // Crear o actualizar una mesa
  async storeOrUpdateTable(numero: number, estado: 'disponible' | 'ocupada'): Promise<void> {
    await Mesa.upsert({ numero, estado });
  }

  // Eliminar una mesa
  async deleteTable(numero: number): Promise<void> {
    await Mesa.destroy({ where: { numero } });
  }

  // Listar todas las mesas
  async listTables(): Promise<any[]> {
    return await Mesa.findAll();
  }

  // Listar mesas ocupadas
  async listOccupiedTables(): Promise<any[]> {
    return await Mesa.findAll({
      where: {
        estado: 'ocupada',
      }
    });
  }

  // Crear o actualizar una comanda
  async storeOrUpdateComanda(
    idMesa: number,
    meseroId: number,
    platillos: string[],
    bebidas: string[],
    notas: string,
    estado: 'pendiente' | 'en preparación' | 'listo'
  ): Promise<void> {
    const mesa = await Mesa.findByPk(idMesa);
    if (!mesa || mesa.estado === 'ocupada') {
      throw new Error('Mesa no disponible o ya ocupada');
    }

    // Registrar comanda y actualizar estado de mesa
    await Comanda.upsert({
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
  async deleteComanda(id: number): Promise<void> {
    try {
      const comanda = await Comanda.findByPk(id);
      if (!comanda) {
        throw new Error('Comanda no encontrada');
      }

      // Comprobación de la existencia de la mesa antes de acceder a sus propiedades
      const mesa = await Mesa.findByPk(comanda.idMesa);
      if (mesa) {
        await mesa.update({ estado: 'disponible' });
      } else {
        throw new Error('Mesa no encontrada');
      }

      // Eliminar la comanda
      await Comanda.destroy({ where: { id } });
    } catch (error) {
      console.error('Error al eliminar la comanda:', error);
    }
  }

  // Listar todas las comandas
  async listComandas(): Promise<any[]> {
    return await Comanda.findAll();
  }

  // Inicializar la base de datos con datos por defecto
  async initModelAndDatabase(): Promise<void> {
    try {
      await sequelize.sync({ alter: true });  // Sincroniza las tablas, pero no borra datos
      console.log('Modelos sincronizados con la base de datos.');

      // Inicializar datos por defecto
      await this.storeOrUpdateUser('Erik', 'eriklopez@gmail.com', '1234', 'mesero');
      await this.storeOrUpdateUser('Eber', 'eber@gmail.com', 'mysecret', 'cocinero');
      await this.storeOrUpdateUser('Tiberio', 'tibi@gmail.com', 'mysecret', 'administrador');

      // Inicialización de mesas por defecto
      const defaultTables: Promise<void>[] = [];
      for (let i = 1; i <= 10; i++) {
        defaultTables.push(this.storeOrUpdateTable(i, 'disponible'));
      }
      await Promise.all(defaultTables);

      // Inicialización de comandas por defecto
      const defaultComandas: Promise<void>[] = [];
      defaultComandas.push(
        this.storeOrUpdateComanda(1, 1, ['Ensalada César'], ['Agua'], 'Sin notas', 'pendiente'),
        this.storeOrUpdateComanda(2, 1, ['Pizza Margherita'], ['Cerveza'], 'Sin notas', 'pendiente'),
        this.storeOrUpdateComanda(3, 1, ['Pasta Bolognesa'], ['Vino Tinto'], 'Sin notas', 'pendiente')
      );
      await Promise.all(defaultComandas);

      console.log('Base de datos inicializada con usuarios, mesas y comandas por defecto.');
    } catch (error) {
      console.error('Error al sincronizar o inicializar la base de datos:', error);
    }
  }
}

// Ejemplo de inicialización de la base de datos
(async () => {
  const store = new AuthStore();
  await store.initModelAndDatabase();
})();
