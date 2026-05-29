
CREATE USER 'FlaskUser'@'localhost' IDENTIFIED BY 'password123';


GRANT ALL PRIVILEGES ON Sistema_Turnos.* TO 'FlaskUser'@'localhost' WITH GRANT OPTION;


SHOW GRANTS FOR 'FlaskUser'@'localhost';