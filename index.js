// Import modules
const inquirer = require('inquirer');
const mysql = require('mysql2');
const consoleTables = require("console.table");

// Connect to database
const db = mysql.createConnection(
    {
      host: 'localhost',
      user: 'root',
      password: 'password',
      database: 'emptrack_db'
    },
    console.log(`Connected to the emptrack_db database.`)
  );

// connects to sql server and sql database
db.connect(function(err){
    if (err) throw err;
    console.log("Employee Management System")
    initPrompt();
})

// prompts user with list of options to choose from
function initPrompt() {
  inquirer.prompt ({
    name: 'action',
    type: 'list',
    message: 'Welcome to our employee database! What would you like to do?',
    choices: [
        "Add a department.",
        "Add a role.",
        "Add an employee.",
        "View departments.",
        "View roles.",
        "View employees.",
        "View total budget utilization by department.",
        "View employees with the same manager.",
        "View employees by department.",
        "Update an employee's role.",
        "Update an employee's manager.",
        "Delete a department.",
        "Delete a role.",
        "Delete an employee.",
        "Exit.",
      ],
    }).then(function(answer){
        switch (answer.action) {
        case "Add a department.":
          addDepartment();
          break;

        case "Add a role.":
          addRole();
          break;

        case "Add an employee.":
          addEmployee();
          break;

        case "View departments.":
          viewDepartment();
          break;

        case "View roles.":
          viewRole();
          break;

        case "View employees.":
          viewEmployee();
          break;

        case "View total budget utilization by department.":
          budgetUtilized();
          break;

        case "View employees with the same manager.":
          viewEmpByManager();
          break;

        case "View employees by department.":
          viewEmpByDepartment();
          break;

        case "Update an employee's role.":
          updateRole();
          break;

        case "Update an employee's manager.":
          updateEmpManager();
          break;

        case "Delete a department.":
          deleteDepartment();
          break;

        case "Delete a role.":
          deleteRole();
          break;

        case "Delete an employee.":
          deleteEmployee();
          break;

        case "Exit.":
          db.end();
          break;
      }
    })
}

// view all departments in the database
function viewDepartment (){
const sql = `SELECT * FROM department`;
db.query (sql, (err,result) =>{
  if (err) throw err;
  console.table(result);
  initPrompt();
});
}

//view all roles in the database
function viewRole () {
const sql = `SELECT role.id,title, department.name AS department,salary
  FROM role 
  LEFT JOIN department 
  ON role.department_id = department.id
  ORDER BY role.id;`;
db.query (sql, (err,result) =>{
  if (err) throw err;
  console.table(result);
  initPrompt();
});
}

//view all employees in the database
function viewEmployee() {
const sql = `SELECT employee.id,employee.first_name,employee.last_name,title,name AS department,salary,
  CONCAT(e.first_name," ",e.last_name) AS manager
  FROM employee
  LEFT JOIN role
  ON employee.role_id = role.id
  LEFT JOIN department
  ON role.department_id = department.id
  LEFT JOIN employee e
  ON employee.manager_id = e.id
  ORDER BY employee.role_id;`;
db.query (sql, (err,result) =>{
  if (err) throw err;
  console.table(result);
  initPrompt();
});
}

// add a department to the database
function addDepartment () {
  inquirer.prompt({
    name: 'newDepartment', 
    type: 'input', 
    message: 'Which department would you like to add?'
    }).then(function (answer) {
    db.query(
        'INSERT INTO department SET ?',
        {
         name: answer.newDepartment
        });
        const sql = 'SELECT * FROM department';
        connection.query(sql, function(err, res) {
        if(err)throw err;
        console.log('New department has been added!');
        console.table('All Departments:', res);
        initPrompt();
      })
  })
}

// add a role to the database
function addRole () {

}

//add an employee to the database
function addEmployee () {

}

//update a role in the database
function updateRole () {

}

//Update employee managers in the database
function updateEmpManager (){

}

//view employees by manager
function viewEmpByManager () {
db.query (
  `SELECT DISTINCT CONCAT(e.first_name," ",e.last_name) AS manager_name
  FROM employee
  LEFT JOIN employee e
  ON employee.manager_id = e.id
  WHERE employee.manager_id IS NOT NULL`, (err,result) =>{
  if (err) throw err;
  inquirer.prompt({
        name: "manager",
        type: "list",
        message: "Which manager's team would you like to view?",
        choices: () =>
        result.map((result) => result.manager_name),
        })
        .then ((answer) => {
          db.query (
          `SELECT employee.id,employee.first_name,employee.last_name,title,name AS department,salary
          FROM employee
          LEFT JOIN role
          ON employee.role_id = role.id
          LEFT JOIN department
          ON role.department_id = department.id
          LEFT JOIN employee e
          ON employee.manager_id = e.id
          WHERE CONCAT(e.first_name," ",e.last_name) = "${answer.manager}"
          ORDER BY employee.role_id`, (err,finalResult) =>{
            if (err) throw err;
            console.table(answer.manager + "'s Team: ", finalResult);
            initPrompt();
        })
  })
})
}

//View employees by department
function viewEmpByDepartment () {
db.query (
  `SELECT DISTINCT name FROM department`, (err,result) =>{
  if (err) throw err;
  inquirer.prompt({
        name: "department",
        type: "list",
        message: "Which department would you like to view?",
        choices: () =>
        result.map((result) => result.name),
        })
        .then ((answer) => {
          db.query (
          `SELECT employee.id,employee.first_name,employee.last_name,title,name AS department,salary,
          CONCAT(e.first_name," ",e.last_name) as manager
          FROM employee
          LEFT JOIN role
          ON employee.role_id = role.id
          LEFT JOIN department
          ON role.department_id = department.id
          LEFT JOIN employee e
          ON employee.manager_id = e.id
          WHERE name = "${answer.department}"
          ORDER BY employee.role_id`, (err,finalResult) =>{
            if (err) throw err;
            console.table("Employees under " + answer.department + " Department: ", finalResult);
            initPrompt();
        })
  })
})
}

//Delete departments
function deleteDepartment () {
  db.query("SELECT * FROM department", (err, result) => {
  if (err) throw err;
  inquirer.prompt({
      name: "department",
      type: "list",
      message: "Which department would you like to delete?",
      choices: () => 
        result.map((result) => result.name)
    })
    .then ((answer) => {
    db.query(`SET FOREIGN_KEY_CHECKS=0; DELETE FROM department WHERE ?`, {name: answer.department},
        (err, result) => {
            if (err) throw err;
            console.table(result);
            initPrompt();
        });
    })
})
}
//Delete roles
function deleteRole(){

}

//Delete employees
function deleteEmployee(){

}

//View the total utilized budget of a department
function budgetUtilized (){
db.query (
  `SELECT DISTINCT name from department`, (err,result) =>{
  if (err) throw err;
  inquirer.prompt({
        name: "department",
        type: "list",
        message: "Which department would you like to view?",
        choices: () =>
        result.map((result) => result.name),
        })
        .then ((answer) => {
          db.query (
          `SELECT name AS department, SUM(salary) AS utilized_budget
          FROM employee
          LEFT JOIN role
          ON employee.role_id = role.id
          LEFT JOIN department
          ON role.department_id = department.id
          WHERE name = "${answer.department}"
          GROUP BY name`, (err,finalResult) =>{
            if (err) throw err;
            console.table("The combined salaries of all employees in " + answer.department + " department is:", finalResult);
            initPrompt();
        })
  })
})
}