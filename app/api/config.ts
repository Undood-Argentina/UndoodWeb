import {Sequelize} from 'sequelize';


export async function conectDB(): Promise<Sequelize> {

    const dbName = process.env.DB_NAME!;
    const dbUser = process.env.DB_USER!;
    const dbPass = process.env.DB_PASS!;
    const dbHost = process.env.DB_HOST!;
    const dbPort = Number(process.env.DB_PORT!);

    const mysql2mod = await import('mysql2');
    const mysql2 = (mysql2mod && (mysql2mod.default ?? mysql2mod));

    const sequelize = new Sequelize(dbName, dbUser, dbPass, {
        dialect: 'mysql',
        dialectModule: mysql2,
        host: dbHost,
        port: dbPort,
    })

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        return error as unknown as Sequelize;
    }
}
