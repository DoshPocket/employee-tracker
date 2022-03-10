INSERT INTO department (`name`)
VALUES ('engineering'), ('sales'), ('marketing');
       
INSERT INTO roles (title, salary, department_id)
VALUES ('engineer', 100000, 1), ('sales clerk', 80000, 2), ('marketer', 90000, 3);

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ('Gob', 'Bluth', 1, 1), ('Owen', 'DeGroot', 2, 2), ('Bertha', 'Gump', 3, NULL);