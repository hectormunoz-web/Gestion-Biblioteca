CREATE DATABASE biblioteca_db CHARACTER SET utf8mb4;
CREATE USER 'biblioteca_user'@'localhost' IDENTIFIED BY 'biblioteca_pass';
GRANT ALL PRIVILEGES ON biblioteca_db.* TO 'biblioteca_user'@'localhost';
FLUSH PRIVILEGES;