import { DataTypes, Sequelize } from 'sequelize';
import pg from 'pg';

const dbName = process.env.DB_NAME ?? 'undood_test';
const dbUser = process.env.DB_USER ?? 'postgres';
const dbPass = process.env.DB_PASS ?? 'postgres';
const dbHost = process.env.DB_HOST ?? 'localhost';
const dbPort = Number(process.env.DB_PORT ?? 5432);

export const sequelize = new Sequelize(dbName, dbUser, dbPass, {
  host: dbHost,
  port: dbPort,
  dialect: 'postgres',
  dialectModule: pg,
  logging: false,
  dialectOptions: {
    ssl: false,
  },
});

export const Donador = sequelize.define(
  'Donador',
  {
    donador_dni: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      field: 'donador_dni',
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    cp: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    fecha_creacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_creacion',
    },
    fecha_ultima: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: 'fecha_ultima',
    },
  },
  {
    tableName: 'donadores',
    timestamps: false,
  }
);

export const Donacion = sequelize.define(
  'Donacion',
  {
    id_donacion: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: 'id_donacion',
    },
    dni_donante: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'dni_donante',
      references: {
        model: Donador,
        key: 'donador_dni',
      },
    },
    monto: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'donaciones',
    timestamps: false,
  }
);

Donador.hasMany(Donacion, {
  foreignKey: 'dni_donante',
  sourceKey: 'donador_dni',
});
Donacion.belongsTo(Donador, {
  foreignKey: 'dni_donante',
  targetKey: 'donador_dni',
});

export async function conectDB(): Promise<Sequelize> {
  try {
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');
    return sequelize;
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    throw error;
  }
}

export async function syncModels(): Promise<Sequelize> {
  await conectDB();
  await sequelize.sync({ alter: true });
  return sequelize;
}
