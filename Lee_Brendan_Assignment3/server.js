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
console.log(products_data);

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

app.get("/add_to_cart", function (request, response) {
    // Process the form by redirecting to the receipt page if everything is valid.
    let valid = true;
    let ordered = "";
    for (i = 0; i < products_data.length; i++) {  // Iterate over all text boxes in the form.
        var name = "quantity" + i;
        var q = request.body[name];
        if (typeof q != 'undefined') {
            if (isNonNegativeInteger(q)) { 
                // We have a valid quantity. Add to the ordered string.
                products_data[i].total_sold += Number(q);
                ordered += name + "=" + q + "&";
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
        response.redirect('products_display.html');

    } else {
        // If everything is good, redirect to the login page.
        response.redirect('/cart' + ordered);
        request.session.cart[products_key] = quantities;
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

app.get("/get_cart", function (request, response) {
    let params = new URLSearchParams(request.query);
    subtotal = 0;

//Compute Tax
// 5% tax rate because that is the average throughout the united states 
var tax_rate = 0.04;
var tax = tax_rate * subtotal;
// Compute Shipping
if (subtotal <50) {
  shipping = 15;
}
else if (subtotal <=100-199.99) {
  shipping = 10;
}
else (shipping = 3)

//compute total
var total = subtotal + tax + shipping;
    str = `
    <style>
    html {
        background: ivory;
    }
    
    .center {
        margin-left: auto;
        margin-right: auto;
      }
    
      table {
        width: 70%;
        border-collapse: collapse;
        border: 2px solid;
      }
    
      footer h1 { 
        text-align: center;
      }

      h4 { 
        text-align: center;
      }

      body {
        margin: 0;
        font-family: Arial, Helvetica, sans-serif;
        width:100%;
      }
      
      .topnav {
        overflow: hidden;
        background-color: green;
      }
      
      .topnav a {
        float: left;
        color: #f2f2f2;
        text-align: center;
        padding: 14px 16px;
        text-decoration: none;
        font-size: 17px;
      }
      
      .topnav a:hover {
        background-color: rgb(3, 109, 3);
      }
      
      .topnav a.active {
        background-color: #04AA6D;
        color: white;
      }
      .links {
        font-size: 20px;
      }
    </style>
    <body>
    <form action="?${quantities}" method="POST">
    <div class="topnav">
        <a href="index.html">Home</a>
        <a href="display_products.html">Products</a>
        <a href="./login.html">Login</a>
        <a href="./register.html">Register</a>
        <a href="./cart.html">View Cart (<span id="cart_total">0</span>)</a>
      </div>
      <table class = "center" border="2">
        <tbody>
          <tr>
            <!--Put Welcome here-->
            <th style="text-align: center;" width="16%">Product</th>
            <th style="text-align: center;" width="13%">Price</th>
            <th style="text-align: center;" width="25%">Quantity</th>
            <th style="text-align: center;" width="59%">Extended Price</th>
          </tr>
  
          <td colspan="4" width="100%">&nbsp;</td>
  
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><strong>Sub-total</strong></td>
            <td width="54%"> $<script> document.write(subtotal.toFixed(2));</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;"></span><strong>Tax @ 4%</strong></td>
            <td width="54%">$<script>document.write(tax.toFixed(2));</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><strong>Shipping</strong></td>
            <td width="54%">$<script>document.write(shipping.toFixed(2));</script></td>
          </tr>
          <tr>
            <td style="text-align: center;" colspan="3" width="67%"><strong>Total</strong></td>
            <td width="54%">$<script>document.write(total.toFixed(2));</script></td>
          </tr>
        </tbody>
      </table>
      <footer>
        <h4>
        <div><b>OUR SHIPPING POLICY IS:</b></div>
          <br><b>Subtotals less than $50 will have $15 shipping.</b></br>
          <br><b>If subtotal is $100 - $199.99 it will be $10 shipping.</b></br>
          <br><b>Subtotals over $200 will get free shipping!</b></br>
        </h4>
      </footer>
</body>
        `;
    response.send(str);
    });
    
//app.post("/get_cart)", function (request, response) { Validation here?

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
                response.redirect('./invoice.html?' + user_name + "&" + params.toString()); // If username and pass match go to invoice
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
                    response.redirect("invoice.html?" + user_name + "&" + params.toString());
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