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

---------------------------------------------
7. it resumes the most recent conversation for that workspace with antigravity
   agy -c


11. launch Antigravity in powerShell
   & "$env:LOCALAPPDATA\agy\bin\agy.exe"  
---------------------------------------------


8. create a new branch and switch to it : 
   git switch -c ui-redesign-phase3
   -c : create 

9. check in what branch and how many branchs exists 
   git branch

10. commit in a the branch you are in 
   git add .
   git commit -m "Redesign UI foundation"

12. push in a newly created local branch 
   git push -u origin nameOfTheBranch

13. This shows your last 10 commits.
   git log --oneline --decorate -10

14. This shows your local branches and their tracking information.
   git branch - vv



-----------------------------------------
*** Merging two branches *** or through the GitHub (easier)
1. Clone the repository or update your local repository with the latest changes.
   git pull origin main

2. Switch to the base branch of the pull request.
   git checkout main

3. Merge the head branch into the base branch.
   git merge ui-redesign-phase3

4. Push the changes.
   git push -u origin main
-----------------------------------------

* delete a non merged branch : 
   git branch -D new-vitrine

* delete a merged branch 
   git branch -d new-vitrine
   git push origin --delete new-vitrine

main = stable version
       │
       ├── feature branch → experiment
       │                    │
       │                    ├── like it → PR → merge → delete branch : git branch -D new-vitrine
       │                    │
       │                    └── hate it → delete branch :  git branch -d new-vitrine
       │
       └── remains untouched

GitHub → Pull Request → review → merge → delete branch