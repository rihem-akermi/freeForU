1. Quand on modifie schema.prisma et Regenerates the Prisma Client ❌Does NOT modify the database :
   npx prisma generate

2. Pisma lit la base est crée des models dépend des tables deja existantes :
   npx prisma db pull

3. if we change the database (by migration) , IT MODIFY THE DATABASE by generating an actual sql lines and executes them
   npx prisma migrate dev

4. Check whether the migration has been applied or not 
   npx prisma migrate status

5. view dataBase 
   npx prisma studio

6. deploy migrations in production :
   npx prisma migrate deploy