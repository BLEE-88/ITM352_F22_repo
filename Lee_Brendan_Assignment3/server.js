// Server from Professor Kazman's Lab 13 with some changes
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var errors = {};
var session = require('express-session');
var cookieParser = require('cookie-parser');

//Gets products.json 
var products_data = require('./products.json');
const { allowedNodeEnvironmentFlags } = require('process');

app.use(express.urlencoded({ extended: true }));
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));

app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.post("/get_products_data", function (request, response) {
    response.json(products_data);
});
app.all('*', function (request, response, next) {
    console.log(`Got a ${request.method} to path ${request.path}`);
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    // anytime it's used
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } 
    next();
});

/*app.post("/add_to_cart", function (request, response) {
    // Process the form by redirecting to the receipt page if everything is valid.
    let valid = true; //Assume valid quantities
    var products_key = request.body['products_key']; // get the product key sent from the form post
    var quantities = request.body['quantities']; // Get quantities from the form post and convert strings from form post to numbers
    var products = products_data[products_key];

    for (i = 0; i < products_key.length; i++) {  // Iterate over all text boxes in the form.
        var name = "quantities" + i;
        var q = request.body[name];
        if (typeof q != 'undefined') {
            if (isNonNegativeInteger(q)) { 
                // We have a valid quantity. Create session with quantities
                request.session.cart[products_key] = quantities;
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
        // If we found an error, redirect back to the display_products page.
        error_message =`<script> alert('Your quantity is invalid!'); window.history.go(-1);</script>`;
        response.send(error_message); //send error message if quantity is invalid, go back 1 page
    } else {
        // If everything is good, redirect to the cart page.
        response.redirect('./cart.html');
    }
 }); */

 app.post('/add_to_cart', function (request, response) {
    var quantities = request.body["quantities"];
    var this_product_key = request.body["products_key"];

    // Assume no quantities
    var valid_quantities = false;

    // Check quantities are non-negative integers 
    for (i in quantities) { 
        if (isNonNegInt(quantities[i]) == false) {
            error_message =`<script> alert('Your quantity is invalid! Please make corrections'); window.history.go(-1);</script>`;
            response.send(error_message); //send error message if quantity is invalid, go back 1 page
        }
        /* Check if quantities were selected */
        if (quantities[i] > 0) {
            valid_quantities = true;
        }
        /* Check if quantity desired is available */
        if (Number(quantities[i]) > products_data[this_product_key][i].qtyavl) {
            error_message =`<script> alert('We do not have that many products in stock!'); window.history.go(-1);</script>`;
            response.send(error_message); //send error message if quantity is invalid, go back 1 page
        } else {
            response.redirect("./display_products.html?" + params.toString())
            request.session.cart[products_key] = quantities;
        }
    }
 });

// From assignment 2 Examples page on website
var fname = "user_data.json";

 // From Professor's lab 14
 if (fs.existsSync(fname)) {
     var data = fs.readFileSync(fname, 'utf-8');
     var users = JSON.parse(data);
    } else {
        console.log(`${fname} does not exist!`);
    };

//From Professor Kazman's lab 14, includes app get and app all
app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
 });

app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.get("/login", function (request, response) {
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
    <a href="/register?${params.toString()}">Don't have an account? Register here!</a>
    </form>
    </div>
    </body>
        `;
    response.send(str);
    });
    //Login validation from Assignment 2 example page on website with some changes made by me
    app.post("/login", function (request, response) {
        let params = new URLSearchParams(request.query);
        // Process login form POST and redirect to logged in page if ok, back to login page if not
        user_name = request.body['username'].toLowerCase();
        the_password = request.body['password'];
        if (typeof users[user_name] != 'undefined') {
            if (users[user_name].password == the_password) {
                response.redirect('./display_products.html?' + user_name + "&" + params.toString()); // If username and pass match go to invoice
                response.cookie('username', user_name, { maxAge: 30 * 60 * 1000 });
            } else {
                response.send(`Wrong password!`); //Wrong password if not
            }
            return;
        }
        response.send(`${user_name} does not exist!`); //If username matches one already existing
    });
    
    
    // Created register form on server with base from Assignment 2 examples with changes made by me, styles made by me
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
    // Register form with error messages
    <body>
    <form action="?${params.toString()}" method="POST">
    <div class="login-box">
        <h2>Sign Up Here!</h2>
                <form id="register_form" action="register" method="POST">
                <label>Username</label>
                <input type="text" name="username" size="30" placeholder="enter username"></br>
                ${ (typeof errors['user_exists'] != 'undefined')?errors['user_exists']:''}
                ${ (typeof errors['no_username'] != 'undefined')?errors['no_username']:''}
                <br>
                <label>Email</label>
                <input type="email" name="email" size="30" placeholder="enter email"><br/>
                ${ (typeof errors['invalid_email'] != 'undefined')?errors['invalid_email']:''}
                <br>
                <label>Full Name:</label>
                <input type="text" name="fullname" size="30" placeholder="enter full name"><br />
                ${ (typeof errors['invalid_name'] != 'undefined')?errors['invalid_name']:''}
                <br>
                <label>Password:</label>
                <input type="password" name="newpassword" size="30" placeholder="enter password"><br />
                ${ (typeof errors['passtooshort'] != 'undefined')?errors['passtooshort']:''}
                ${ (typeof errors['passtoolong'] != 'undefined')?errors['passtoolong']:''}
                <br>
                <label>Confirm Password:</label>
                <input type="password" name="repeat_password" size="30" placeholder="re-enter password"></br>
                ${ (typeof errors['passnotmatch'] != 'undefined')?errors['passnotmatch']:''}
                <br>
                <input type="submit" value="Register" name="register_user" id="register">
                </div>
    </form>
    </body>
        `;
    response.send(str);
    });
    // Registration validation made by me(Brendan Lee)
    app.post("/register", function (request, response) {
            // process a simple register form
            let params = new URLSearchParams(request.query);
            good = false;
            username = request.body.username.toLowerCase(); //Tests text case
            email = request.body.email.toLowerCase();
            password = request.body.newpassword.length
        
            if(typeof users[username] != 'undefined') { //If user already exists
                errors['user_exists'] = `User already exists!`;
                good = true;
            }
            if(request.body.username == '') { //Username box is filled in
                errors['no_username'] = `You need to select a username!`;
                good = true;
            }
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) { //tests if email matches validation
            } else {
                errors['invalid_email'] = `Invalid email!`;
                good = true;
            }
            if (/^[a-z ,.'-]+$/i.test(request.body.fullname)) { //Name matches valid format
            } else {
                errors['invalid_name'] = `Please use a real name!`;
                good = true;
            } 
            if (password < 10) { //Password is not long enough
                errors['passtooshort'] = `Your password is too short!`;
                good = true;
            }
            if (password > 16) { //Password is too long
                errors['passtoolong'] = `Your password is too long!`;
                good = true;
            }
            if (request.body.newpassword != request.body.repeat_password) { //Not matching passwords
                errors['passnotmatch'] = `Password does not match!`;
                good = true;
            }
    
            if (!good) { //Testing if there are no errors if there are no errors then add it to user_data, from Assignment 2 examples with some changes made by me

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
                    response.redirect("display_products.html?" + user_name + "&" + params.toString());
                    response.cookie('username', user_name, { maxAge: 30 * 60 * 1000 });
                } else {
                    response.redirect('/login?error = User Already Exists!');
                }
            }
            else {
                response.redirect("/register?" + "&" + params.toString());
            }
         });
    
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
app.listen(8080, () => console.log(`listening on port 8080`));