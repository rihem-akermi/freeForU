
/*Connaitre les contraintes CHECK on tables*/

SELECT
    rel.relname AS table_name,
    con.conname AS constraint_name,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class rel ON rel.oid = con.conrelid
JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
WHERE con.contype = 'c'
AND nsp.nspname = 'public'
ORDER BY table_name, constraint_name;

/*To see foreign keys and the action they dao after delete or update (no action / cascade) ... */
/*Action may be : 
- RESTRICT prevents deleting or updating a parent row if it is still referenced by a foreign key.
- CASCADE automatically performs the same action on the child rows.(delete the parent , delete all offers (childs) related to him)
*/
SELECT
    conname AS constraint_name,
    conrelid::regclass AS table_name,
    confrelid::regclass AS references_table,
    CASE confdeltype
        WHEN 'a' THEN 'NO ACTION / RESTRICT'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE '
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END AS on_delete_behavior
FROM pg_constraint
WHERE contype = 'f'
AND connamespace = 'public'::regnamespace
ORDER BY table_name;

/*les tables et leurs colonnes et more infos about them dans ma db*/

SELECT 
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;

/*change the name of a column */

ALTER TABLE categories
RENAME COLUMN nom TO name;

/*FOREIGN Keys*/

SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name;

/**/

/**/

/**/
