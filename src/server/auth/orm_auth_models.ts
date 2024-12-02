import { DataTypes, Model, InferAttributes, InferCreationAttributes } from 'sequelize';
import { sequelize } from './orm_auth_store';
import { Usuario, Mesa, Comanda } from './auth_types';

// Modelo de Usuario
export class UsuarioModel extends Model<InferAttributes<UsuarioModel>, InferCreationAttributes<UsuarioModel>> implements Usuario {
  declare id: number;
  declare nombre: string;
  declare correo: string;
  declare contraseña: string;
  declare rol: 'mesero' | 'cocinero' | 'administrador';
}

UsuarioModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nombre: { type: DataTypes.STRING, allowNull: false },
    correo: { type: DataTypes.STRING, allowNull: false, unique: true },
    contraseña: { type: DataTypes.STRING, allowNull: false },
    rol: { type: DataTypes.ENUM('mesero', 'cocinero', 'administrador'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Usuario',
    tableName: 'usuarios',
    timestamps: true, // Habilita createdAt y updatedAt
  }
);

// Modelo de Mesa
export class MesaModel extends Model<InferAttributes<MesaModel>, InferCreationAttributes<MesaModel>> implements Mesa {
  declare id: number;
  declare numero: number;
  declare estado: 'disponible' | 'ocupada';
}

MesaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    estado: { type: DataTypes.ENUM('disponible', 'ocupada'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Mesa',
    tableName: 'mesas',
    timestamps: true,
  }
);

// Modelo de Comanda
export class ComandaModel extends Model<InferAttributes<ComandaModel>, InferCreationAttributes<ComandaModel>> implements Comanda {
  declare id: number;
  declare idMesa: number;
  declare platillos: string[];
  declare bebidas: string[];
  declare notas?: string;
  declare estado: 'pendiente' | 'en preparación' | 'listo';
}

ComandaModel.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    idMesa: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: MesaModel,
        key: 'id',
      },
    },
    platillos: { type: DataTypes.JSON, allowNull: false }, // Guardar como JSON para arrays
    bebidas: { type: DataTypes.JSON, allowNull: false },
    notas: { type: DataTypes.STRING, allowNull: true },
    estado: { type: DataTypes.ENUM('pendiente', 'en preparación', 'listo'), allowNull: false },
  },
  {
    sequelize,
    modelName: 'Comanda',
    tableName: 'comandas',
    timestamps: true,
  }
);

// Relaciones
MesaModel.hasMany(ComandaModel, { foreignKey: 'idMesa', as: 'comandas' });
ComandaModel.belongsTo(MesaModel, { foreignKey: 'idMesa', as: 'mesa' });

// Sincronización
export const initModels = async () => {
  try {
    await sequelize.sync({ force: false }); // Cambia a force: true solo para desarrollo
    console.log('Modelos sincronizados con la base de datos.');
  } catch (error) {
    console.error('Error al sincronizar modelos:', error);
  }
};
