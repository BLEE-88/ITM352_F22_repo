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
app.post("/PurchaseForm", function (request, response) {
    // Process the form by redirecting to the receipt page if everything is valid.
    let valid = true;
    let ordered = "";
    let POST = request.body;

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
    var stringified = querystring.stringify(POST);
    if (!valid) {
        // If we found an error, redirect back to the products_display page.
        response.redirect('products_display.html?error=Invalid%20Quantity');

    } else {
        // If everything is good, redirect to the invoice page.
        response.redirect('./login.html' + stringified);
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

 app.post("/login", function (request, response) {
    // Process login form POST and redirect to logged in page if ok, back to login page if not
    let POST = request.body;
    let user_name = POST["username"];
    let user_pass = POST["password"];

    console.log("User name=" + user_name + " password=" + user_pass);
    
 if (users[user_name] != undefined) {
        if (users[user_name].password == user_pass) {
            response.redirect("invoice.html?" + user_name);
        } else {
            response.redirect("/login.html?error='User does not exist!'");
        }
    }

app.post("/register_form", function (request, response) {
        // process a simple register form
        let POST = request.body;
        console.log(POST);
        let user_name = POST["username"];
        let user_pass = POST["password"];
        let user_email = POST["email"];
        let user_pass2 = POST["repeat_password"];
    
        if (users[user_name] == undefined) {
            users[user_name] = {};
            users[user_name].name = user_name;
            users[user_name].password = user_pass;
            users[user_name].email = user_email;
    
            let data = JSON.stringify(users);
            fs.writeFileSync(fname, data, 'utf-8');
    
            response.send("Got a registration");
        } else {
            response.send("User " + user_name + " already exists!");
        }
     });
});
app.listen(8080, () => console.log(`listening on port 8080`));