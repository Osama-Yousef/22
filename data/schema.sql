DROP TABLE IF EXISTS practiceetable;
CREATE TABLE practiceetable (

id SERIAL PRIMARY KEY ,

image VARCHAR(255),
language VARCHAR(255),
title VARCHAR(255),
overview TEXT,
vote VARCHAR(255)

);