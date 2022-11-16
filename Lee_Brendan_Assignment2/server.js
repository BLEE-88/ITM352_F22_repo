// Server from Lab 13 with some changes
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');

app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); 

function isNonNegativeInteger(queryString, returnErrors = false) { //Checks for errors
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) {
        errors.push('Not a number!'); // Check if string is a number value
    } else {
        if (queryString < 0) errors.push('Please make an order!'); // Check if it is non-negative
        if (parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
    }
    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
}
//Gets products.json
var products = require(__dirname + '/products.json'); 
products.forEach((prod, i) => { prod.total_sold = 0 });

app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

// Posts PurchaseForm and redirects to invoice or gives error
app.post("/Purchase", function (request, response) {
    let params = new URLSearchParams(request.query);
    // Process the form by redirecting to the receipt page if everything is valid.
    let valid = true;
    let ordered = "";
    for (i = 0; i < products.length; i++) {  // Iterate over all text boxes in the form.
        var flower = "quantity" + i;
        var q = request.body[flower];
        if (typeof q != 'undefined') {
            if (isNonNegativeInteger(q)) { 
                // We have a valid quantity. Add to the ordered string.
                products[i].total_sold += Number(q);
                ordered += flower + "=" + q + "&";
            } else {
                // We have an invalid quantity. Set the valid flag to false.
                valid = false;
            }
        } else {
            // The textbox was not found.  Signal a problem.
            valid = false;
        }
    }
    if (!valid) {
        // If we found an error, redirect back to the products_display page.
        response.redirect('products_display.html?error=Invalid%20Quantity');

    } else {
        // If everything is good, redirect to the invoice page.
        response.redirect('/login?' + ordered + params.toString());
    }
 });

 var fs = require('fs');
const { query } = require('express');
const { URLSearchParams } = require('url');
var fname = "user_data.json";
 
 if (fs.existsSync(fname)) {
     var data = fs.readFileSync(fname, 'utf-8');
     var users = JSON.parse(data);
     console.log(users);
 };

 app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

app.get("/login", function (request, response) {
// Give a simple login form
let params = new URLSearchParams(request.query);
str = `
<style>
body {
	background: url(images/forestbckgrnd.jpg);
	background-size: cover;
	font-family: 'Times New Roman'; font-size: 18px;
    display: flex;
    flex-flow: row wrap;
    justify-content: space-evenly;
	align-items: center;
}
.login-box{
    width: 500px;
    height: 250px;
    background: ivory;
    text-align: center;
    padding-left: 20px;
    border-style: solid;
    border-width: 1px;
    }
</style>
<body>
<form action="?${params.toString()}" method="POST">

<div class="login-box">
<h1>Login!</h1>
<label>Username</label>
<input type="text" name="username" size="30" placeholder="enter username"></br>
<br>
<label>Password</label>
<input type="password" name="password" size="30" placeholder="enter password"></br>
<br>
<input type="submit" value="Submit" id="submit">
<br>
<br>
<a href="/register?" + ${params.toString()}>Don't have an account? Register here!</a>
</form>
</div>
</body>
    `;
response.send(str);
});

 app.post("/login", function (request, response) {
    let params = new URLSearchParams(request.query);
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    the_username = request.body['username'].toLowerCase();
    the_password = request.body['password'];
    if (typeof users[the_username] != 'undefined') {
        if (users[the_username].password == the_password) {
            response.redirect('./invoice.html?' + params.toString());
        } else {
            response.send(`Wrong password!`);
        }
        return;
    }
    response.send(`${the_username} does not exist!`);
});

// From Assignment 2 Examples

app.get("/register", function (request, response) {
    console.log(request.params.toString());
// Give a simple login form
let params = new URLSearchParams(request.query);
str = `
<style>
body {
background: url(images/forestbckgrnd.jpg);
background-size: cover;
font-family: 'Times New Roman'; font-size: 18px;
display: flex;
flex-flow: row wrap;
justify-content: space-evenly;
align-items: center;
}

.login-box{
width: 500px;
height: 350px;
background: ivory;
text-align: center;
padding-left: 20px;
border-style: solid;
border-width: 1px;
}
</style>

<body>
<form action="?${params.toString()}" method="POST">
<div class="login-box">
    <h2>Sign Up Here!</h2>
            <form id="register_form" action="register" method="POST">
            <label>Username</label>
            <input type="text" name="username" size="30" placeholder="enter username"></br>
            <br>
            <label>Email</label>
            <input type="email" name="email" size="30" placeholder="enter email"><br/>
            <br>
            <label>Full Name:</label>
            <input type="text" name="fullname" size="30" placeholder="enter full name"><br />
            <br>
            <label>Password:</label>
            <input type="password" name="newpassword" size="30" placeholder="enter password"><br />
            <br>
            <label>Confirm Password:</label>
            <input type="password" name="repeat_password" size="30" placeholder="re-enter password"></br>
            <br>
            <input type="submit" value="Register" name="register_user" id="register">
            </div>
</form>
</body>
    `;
response.send(str);
});

app.post("/register", function (request, response) {
        // process a simple register form
        let params = new URLSearchParams(request.query);
        notgood = false;
        username = request.body.username.toLowerCase();
        email = request.body.email.toLowerCase();
        password = request.body.newpassword.length
    
        if(typeof users[username] != 'undefined') {
            response.send(`Hey! ${username} is already registered!`);
            notgood = true;
        }
        if(request.body.username == '') {
            response.send(`You need to enter a username!`);
            notgood = true;
        }
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) { //tests if email matches validation
        } else {
            response.send(`Invalid email format!`);
            notgood = true;
        }
        if (/^[a-z ,.'-]+$/i.test(request.body.fullname)) {
        } else {
            response.send(`Please use a real name!`);
            notgood = true;
        }
        if (password < 10) {
            response.send(`Password too short!`);
            notgood = true;
        }
        if (password > 16) {
            response.send(`Password too long!`);
            notgood = true;
        }
        if (request.body.newpassword != request.body.repeat_password) {
            response.send(`Passwords do not match!`);
            notgood = true;
        }

        if (!notgood) { //no errors
            let POST = request.body;
        
            let user_name = POST["username"];
            let user_pass = POST["newpassword"];
            let user_email = POST["email"];
            let user_pass2 = POST["repeat_password"];
        
            if (users[user_name] == undefined) {
                users[user_name] = {};
                users[user_name].name = user_name;
                users[user_name].password = user_pass;
                users[user_name].email = user_email;
        
                let data = JSON.stringify(users);
                fs.writeFileSync(fname, data, 'utf-8');
                response.redirect("invoice.html?" + params.toString());
            } else {
                response.redirect('/login.html?error = User Already Exists!');

            }
        }
     });
     app.post("/invoice", function (request, response) {
        the_username = request.body['username'].toLowerCase();
        the_password = request.body['password'];
        if (typeof users[the_username] != 'undefined') {
            if (users[the_username].password == the_password) {
                loggedin.push({})
     }
    }
});


app.listen(8080, () => console.log(`listening on port 8080`));