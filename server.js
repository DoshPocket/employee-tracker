const inquirer = require("inquirer")
const mysql = require("mysql2")
const consoleTable = require('console.table')

const PORT = process.env.PORT || 3001;

require("dotenv").config();

const db = mysql.createConnection(
  {
      host: 'localhost',
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
  },
  console.log(`Connected to company_db.`)
);

function startTracker() {
  inquirer.prompt([
  {
  type: "list",
  message: "What would you like to do?",
  name: "choice",
  choices: [
            "View all departments", 
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
            "Quit",
          ]
    },
  ]).then(function(val) {
    switch (val.choice) {
        case "View all departments":
          viewAllDepartments();
        break;

      case "View all roles":
          viewAllRoles();
        break;
      case "View all employees":
          viewAllEmployees();
        break;
      
      case "Add a department":
            addDepartment();
          break;

      case "Add a role":
            addRole();
          break;
  
      case "Add an employee":
            addEmployee();
          break;
  
      case "Update an employee role":
            updateRole();
          break;

      case "Quit":
            quitTracker();
          break;

        }
  })
};

const viewAllDepartments = () => {
  db.query(`SELECT department.id AS ID, department.name AS Department FROM department;`, 
  function(err, res) {
    if (err) throw err
    console.table(res)
    startTracker()
  })
};

function viewAllRoles() {
  db.query(`SELECT roles.id AS ID, roles.title AS Title, department.name AS Department, roles.salary AS Salary FROM roles
  LEFT JOIN department ON roles.department_id = department.id;`, 
  function(err, res) {
    if (err) throw err
    console.table(res)
    startTracker()
  })
};

function viewAllEmployees() {
  db.query(`SELECT employee.id AS ID, employee.first_name AS 'First Name', employee.last_name AS 'Last Name', roles.title AS Role,
  department.name AS Department, CONCAT (manager.first_name, " ", manager.last_name) AS Manager, roles.salary as Salary FROM employee 
  LEFT JOIN roles ON employee.role_id = roles.id
  LEFT JOIN department ON roles.department_id = department.id
  LEFT JOIN employee manager ON employee.manager_id = manager.id
  ; `, 
  function(err, res) {
    if (err) throw err
    console.table(res)
    startTracker()
  })
};

function addDepartment() {
  inquirer.prompt([
    {
    type: "input",
    message: "What is the new department name?",
    name: "department",
    validate: input => {
      if (input) {
          return true;
      }
      return "Please enter a new department name."
      }
    },
  ]).then(data => {
    const newDepartment = data.department;
    const sql = `INSERT INTO department (name) VALUES ('${newDepartment}');`;
    db.query(sql, (err, data) => {
        if (err) throw err;
        console.table(data);
        startTracker();
    });
});
};

function addRole() {
  const sql = `SELECT id, name from department;`;
  db.query(sql, (err, data) => {
    if (err) throw err;
      const allDepartments = data.map(({ id, name }) => ({
          name: name,
          value: id
      }));
      inquirer.prompt([
          {
              type: "input",
              message: "What is the new role name?",
              name: "role",
              validate: input => {
                  if (input) {
                      return true;
                  }
                  return "Please enter a new role name.";
              }
          },
          {
              type: "number",
              message: "What is the salary?",
              name: "salary",
          },
          {
              type: "list",
              message: "To which department does the role belong?",
              name: "department",
              choices: allDepartments
          }
      ]).then(data => {
          let deptId = data.department;
          let salary = data.salary;
          let role = data.role;

          const sql = `INSERT INTO roles (title, salary, department_id) VALUES ('${role}', ${salary}, ${deptId});`;
          db.query(sql, (err, data) => {
              if (err) throw err;
              console.table(data);
              startTracker();
          });
      });
  });
};

function addEmployee() {
  const sql = `SELECT id, title from roles;`;
  db.query(sql, (err, data) => {
    if (err) throw err;
      const allRoles = data.map(({ id, title }) => ({
          name: title,
          value: id
      }));
      const sqlManager = `SELECT id, first_name, last_name from employee;`;
      db.query(sqlManager, (err, data) => {
        if (err) throw err;
        const allManagers =  data.map(({ id, first_name, last_name }) => ({
         name:  `${first_name} ${last_name}`,
         value: id
        }));
        inquirer.prompt([
          {
              type: "input",
              message: "What is the new employee's first name?",
              name: "first_name",
              validate: input => {
                  if (input) {
                      return true;
                  }
                  return "Please enter a first name.";
              }
          },
          {
              type: "input",
              message: "What is the new employee's last name?",
              name: "last_name",
              validate: input => {
                if (input) {
                    return true;
                }
                return "Please enter a first name.";
            }
          },
          {
            type: "list",
            message: "What is the new employee's role?",
            name: "role",
            choices: allRoles
        },
        
          {
              type: "list",
              message: "Who is the new employee's manager?",
              name: "manager",
              choices: allManagers
        
          }
        ]).then(data => {
          let first_name = data.first_name;
          let last_name = data.last_name;
          let role = data.role;
          let manager = data.manager;
        
          const sql = `INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ('${first_name}', '${last_name}', ${role}, ${manager});`;
          db.query(sql, (err, data) => {
              if (err) throw err;
              console.table(data);
              startTracker();
          });
        });
      });
    });
};

function updateRole() {

  const sql = `SELECT id, first_name, last_name from employee;`;
  db.query(sql, (err, data) => {
      const allEmployees = data.map(({ id, first_name, last_name }) => ({
          name: first_name + " " + last_name,
          value: id
      }));
      inquirer.prompt([
          {
              type: "list",
              message: "Which employee would you like to update?",
              name: "employee",
              choices: allEmployees
          }
      ]).then((data) => {
          let employeeId = "";
          let updatedRoleId = "";
          employeeId = data.employee

          const sqlRole = `SELECT id, title FROM roles;`;
          db.query(sqlRole, (err, data) => {
              const allRoles = data.map(({ title, id }) => ({ name: title, value: id }));
              inquirer.prompt([
                  {
                      type: "list",
                      message: "What is the employee's new role?",
                      name: "role",
                      choices: allRoles
                  }
              ]).then((data) => {
                  updatedRoleId = data.role;
                  updateEmployee()
              });

              function updateEmployee() {
                  const sqlUpdatedRole = `UPDATE employee SET role_id = ${updatedRoleId} where id = ${employeeId};`;
                  db.query(sqlUpdatedRole, (err, data) => {
                      if (err) throw err;
                      console.log("Employee role updated successfully.");
                      startTracker();
                  });
              };
          });
      });
  });
};

function quitTracker() {
  db.end();
};

startTracker();
