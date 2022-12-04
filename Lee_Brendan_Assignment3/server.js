// Server from Professor Kazman's Lab 13 with some changes
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var errors = {};
var session = require('express-session');
var cookieParser = require('cookie-parser');
//Gets products.json 
var products = require(__dirname + '/products.json');

app.use(express.urlencoded({ extended: true }));
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));
app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser());

function isNonNegativeInteger(queryString, returnErrors = false) { //Function that checks for errors from Professor Kazman's Labs- Used in multiple labs
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) errors.push('Not a number!'); // Check if string is a number value
    if (queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
    if (parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer

    if (returnErrors) {
        return errors;
    } else if (errors.length == 0) {
        return true;
    } else {
        return false;
    }
}
app.all('*', function (request, response, next) {
    console.log(`Got a ${request.method} to path ${request.path}`);
    // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
    // anytime it's used
    if(typeof request.session.cart == 'undefined') { request.session.cart = {}; } 
    next();
});

app.post("/get_products_data", function (request, response) {
    response.json(products_data);
});

app.get("/add_to_cart", function (request, response) {
    var products_key = request.query['products_key']; // get the product key sent from the form post
    var quantities = request.query['quantities'].map(Number); // Get quantities from the form post and convert strings from form post to numbers
    request.session.cart[products_key] = quantities; // store the quantities array in the session cart object with the same products_key. 
    response.redirect('./cart.html');
});

app.get("/get_cart", function (request, response) {
    response.json(request.session.cart);
});


// From assignment 2 Examples page on website
var fs = require('fs');
const { query } = require('express');
const { URLSearchParams } = require('url');
var fname = "user_data.json";

 // From Professor Port's lab 14
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

//Login validation from Assignment 2 example page on website with some changes made by me
 app.post("/login", function (request, response) {
    let params = new URLSearchParams(request.query);
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    user_name = request.body['username'].toLowerCase();
    the_password = request.body['password'];
    if (typeof users[user_name] != 'undefined') {
        if (users[user_name].password == the_password) {
            response.cookie('username', user_name);
            response.redirect('./invoice.html?' + user_name + "&" + params.toString()); // If username and pass match go to invoice
        } else {
            response.send(`Wrong password!`); //Wrong password if not
        }
        return;
    }
    response.send(`${user_name} does not exist!`); //If username matches one already existing
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
                response.redirect("./invoice.html?" + user_name + "&" + params.toString());
            } else {
                response.redirect('./login.html?error = User Already Exists!');

            }
        }
        else {
            response.redirect("./register.html" + "&" + params.toString());
        }
     });

app.listen(8080, () => console.log(`listening on port 8080`));