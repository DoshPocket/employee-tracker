const inquirer = require("inquirer")
const mysql = require("mysql")

const connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "7dkJ0^#dHfb2",
  database: "company_db"
});

connection.connect(function(err) {
  if (err) throw err
  console.log("Connected as Id" + connection.threadId)
  startTracker();
});

function startTracker() {
  inquirer.prompt([
  {
  type: "list",
  message: "What would you like to do?",
  name: "choice",
  choices: [
            "View all deparments", 
            "View all roles",
            "View all employees",
            "Add a department",
            "Add a role",
            "Add an employee",
            "Update an employee role",
          ]
    }
  ]).then(function(val) {
    switch (val.choice) {
        case "View all departments":
          viewAllDepartment();
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

        }
  })
};