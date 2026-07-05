import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Pool } from 'pg';

@Injectable()
//to not call it every time
//in other modules 
//const db = new DatabaseService();
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
    //pool: ensemble des connexions avec la db gardés ouvertes
    //une connexion simple permet d'envoyer un seule requete à instant t 
    private pool: Pool;

  constructor(){
    console.log("☀️   DB service initialized")
  }

    //initialisation module 
  onModuleInit() {
    //app.listen() call it 
    console.log('!!!starting creating the pool ');
    this.pool = new Pool({
      host: 'localhost',
      port: 5432,
      user: 'postgres',
      password: 'password',
      database: 'freeforu',
    });

    console.log('🔌 Pool PostgreSQL créé');
  }

  async query(text: string, params?: any[]) {
    //when i will write an SQL request it will go here 
    console.log('📤 SQL envoyé :', text, params ?? '');
    const result = await this.pool.query(text, params);

    console.log('📥 Résultat reçu :', result.rowCount, 'ligne(s)');
    return result;
  }

  //detruire module 
  onModuleDestroy() {
    this.pool.end();
    console.log('🔌 Pool PostgreSQL fermé');
  }

}