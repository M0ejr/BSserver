BEGIN TRANSACTION;

INSERT INTO 
   users (
      name, email, entries, joined
      ) 
      values (
         'Moejr',
         'moejr@gmail.com', 
         5, 
         '2023-01-01'
      );
INSERT INTO 
   login (
      hash, email
      ) 
      VALUES (
         'mmmmmmmmmm', 
         'moejr@gmail.com'
      );

COMMIT;