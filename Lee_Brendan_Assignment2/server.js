// Server from Lab 13 with some changes
var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
const querystring = require("querystring")

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
app.post("/PurchaseForm", function (request, response) {
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
        response.redirect('invoice.html?error=Invalid%20Quantity');

    } else {
        // If everything is good, redirect to the invoice page.
        response.redirect('login.html?' + ordered);
    }
 });

 var fs = require('fs');
 var fname = "user_data.json";
 
 if (fs.existsSync(fname)) {
     var data = fs.readFileSync(fname, 'utf-8');
     var users = JSON.parse(data);
     console.log(users);
 } else {
     console.log("Sorry file " + fname + " does not exist.");
 }


 app.post("/login_form", function (request, response) {
    console.log(request);
    query_string_object = request.query; //save quantities from query string
    query_string_object["username"] = request.body.username; // put username in query_string_object

    if (typeof users[request.body.username] != 'undefined') { //if username exists in userdata.json
        if (request.body.password != users[request.body.username].password) { //if the password doesn't match the stored password
        query_string_object['password_error']= "Password is incorrect!";
        } else { // if the password does match 
            console.log(request);
            response.redirect("./invoice.html?" + querystring.stringify(query_string_object)); // redirect to invoice with the two strings
            return; // we're done here
        }

    } else { // if the username does not exist in userdata.json
        query_string_object['username_error']= "User does not exist! Please register.";
    }
    // If we get here there was an error and need to go back to login with the quantity data and errors
    response.redirect("./login.html?" + querystring.stringify(query_string_object)); // redirect to invoice with the two strings
});

// From Assignment 2 Examples
app.post("/register_form", function (request, response) {
        // process a simple register form
        errors = [];
        username = request.body.username.toLowerCase();
        email = request.body.email.toLowerCase();
        password = request.body.newpassword.length
    
        if(typeof users_reg_data[username] != 'undefined') {
            errors.push = `Hey! ${username} is already registered!`;
        }
        if(request.body.username == '') {
            errors.push =("You need to select a username!");
        }
        if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) { //tests if email matches validation
        } else {
            errors.push("Invalid email format!");
        }
        if (/^[a-z ,.'-]+$/i.test(request.body.fullname)) {
        } else {
            errors.push("Please use a real name!");
        }
        if (password < 10) {
            errors.push = ("password too short");
        }
        if (password > 16) {
            errors.push = ("password too long");
        }
        if (password != request.body.repeat_password) {
            errors.push = ("Passwords do not match");
        }

        if (errors.length == 0) {
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
                response.redirect('invoice.html?' + ordered);
            } else {
                response.redirect('/login.html?error = User Already Exists!');

            }
        }
     });

app.listen(8080, () => console.log(`listening on port 8080`));