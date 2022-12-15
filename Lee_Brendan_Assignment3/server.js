var express = require('express');
var app = express();
var path = require('path');
var fs = require('fs');
var errors = {};
var session = require('express-session');
var cookieParser = require('cookie-parser');
var nodemailer = require('nodemailer');

//Gets products.json 
products_data = require('./products.json');

//From Professor Kazman's lab 15
app.use(express.urlencoded({ extended: true }));
app.use(session({secret: "MySecretKey", resave: true, saveUninitialized: true}));
app.use(express.static(__dirname + '/public'));
app.use(cookieParser());

app.all('*', function (request, response, next) {
  console.log(`Got a ${request.method} to path ${request.path}`);
  // need to initialize an object to store the cart in the session. We do it when there is any request so that we don't have to check it exists
  // anytime it's used
  if(typeof request.session.cart == 'undefined') { 
  request.session.cart = {}; 
} 
  next();
});
// Code from assignment 3 examples https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
app.post("/get_products_data", function (request, response) {
    response.json(products_data);
});

// Code from assignment 3 examples https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
app.post("/get_cart", function (request, response) { //Responds to loadjson get_Cart
  response.json(request.session.cart);
});

//Received help from Bobby Roth FA22
function get_typeof(Number) 
{var type; 
    if (Number == 0) {
        type = "Flowers"; 
    }
    else if (Number == 1) {
        type = "Fruits"
    }
    else {
        type = "Souvenirs"
    }
    return type
}

//Generating the cart on the server

app.get('/cart', function (request, response) {
let shopping_cart = request.session.cart;

var subtotal = 0;
var tax_rate = 0.04;
// Compute Shipping
var shipping = 0;

function calc_shipping(subtotal) {
    if (subtotal <=50-99.99) {
        shipping = 20;
      }
      else if (subtotal <=100-199.99) {
        shipping = 15;
      }
      else (shipping = 10)
      return shipping
}
    if (typeof shopping_cart == "undefined") { //Create the cart if everything is good
    document.write("There are no items in your shopping cart");
    } else {
        response.write(`
        <!DOCTYPE html>
<script src="./functions.js"></script>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cart</title>
  <link href="cart-style.css" rel="stylesheet">
  <link href="nav.css" rel="stylesheet">

<script> 
// LoadJSON Code from assignment 3 examples https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
//Functions to loadJSON and to assign the action to a button https://stackoverflow.com/questions/2701041/how-can-i-set-the-form-action-through-javascript

loadJSON('get_products_data', function (response) {
  // Parsing JSON string into object
  products_data = JSON.parse(response);
});
    
  function UpdateCart() {
    document.getElementById("Cart_Form").action = '/UpdateCart';
    document.getElementById("Cart_Form").method = 'GET';
    document.getElementById("Cart_Form").submit();
  }

  function Checkout() {
    document.getElementById("Cart_Form").action = '/Checkout';
    document.getElementById("Cart_Form").method = 'GET';
  }

  function Gotologin() {
    document.getElementById("Cart_Form").action = '/Login';
    document.getElementById("Cart_Form").method = 'GET';
    document.getElementById("Cart_Form").submit();
  }

//function to get invalid quantities by taking values in the table data to test values

  function invalidqty(value, id, type, index) {
    if (value > products_data[type][index].qtyavl) { //Check if value inputted is greater than qtyavl of that product
      document.getElementById(id).value=products_data[type][index].qtyavl
      alert("We do not have that much in stock!")
    } else if (value < 0) {
      document.getElementById(id).value=1 //Change the value to 1 if quantity entered is less than 0
      alert("Please enter a positive value")
    } 
  }

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
};
</script>
</head>
<body>
    <div class="topnav">
        <a href="index.html">Home</a>
        <a href="display_products.html?products_key=Flowers">Products</a>
        `)
        if (typeof request.cookies["useremail"] != "undefined") { //Checks for cookie "username", if user logged in display logout, else display login
          response.write(`<a href="/logout" id="logout">Logout</a>`);
        } else {
          response.write(`<a href="/login" id="login">Login</a>`);
        }
        response.write(`
        <a href="/register">Register</a>
        <a href="/cart">View Cart</a>
      </div>
      <form action="/checkout" method="GET" id= "Cart_Form" onsubmit="Checkout()">
      <table class = "center" border="2">
        <tbody>
          <tr>
            <th style="text-align: center;" width="16%">Product</th>
            <th style="text-align: center;" width="13%">Price</th>
            <th style="text-align: center;" width="25%">Quantity</th>
            <th style="text-align: center;" width="59%">Extended Price</th>
          </tr>
          `)

          var type;
          var extended_price;
          for (var i = 0; i<Object.keys(products_data).length; i++)
          {
            let type = get_typeof(i); 
            if (typeof shopping_cart[type] == "undefined") { 
                continue;
            } else {
            for (var j = 0; j<products_data[type].length; j++) { //If quantity entered is equal to 0 continue
                if (shopping_cart[type][j] == 0) {
                    continue;
                } else { //else Generate the table with cart information
                    extended_price = products_data[type][j].price * request.session.cart[type][j];
                    response.write(`<tr><td>${products_data[type][j].name}</td>
                    <td>$${products_data[type][j].price}</td>
                    <td><input type="number" id=${request.session.cart[type][j]} name=${type + j} value=${request.session.cart[type][j]}
                    onkeyup="invalidqty(this.value, '${request.session.cart[type][j]}', '${type}', ${j})" min=0 max=${products_data[type][j].qtyavl}
                    </td>
                    <td>$${extended_price.toFixed(2)}</td></tr>
                    `)
                    subtotal += extended_price;
                }
            }
        }
          }
        shipping = calc_shipping(subtotal);
          response.write(`
          <tr>
          <td style="text-align: center;" colspan="3" width="67%">Sub-total</td>
          <td width="54%"><strong>$${(subtotal).toFixed(2)}</strong></td>
        </tr>
        <tr>
          <td style="text-align: center;" colspan="3" width="67%"><span style="font-family: arial;"></span><strong>Tax @ 4%</strong></td>
          <td width="54%"><strong>$${(tax_rate * subtotal).toFixed(2)}</script></strong></td>
        </tr>
        <tr>
          <td style="text-align: center;" colspan="3" width="67%"><strong>Shipping</strong></td>
          <td width="54%"><strong>$${shipping.toFixed(2)}</script></strong></td>
        </tr>
        <tr>
          <td style="text-align: center;" colspan="3" width="67%"><b>Total</b></td>
          <td width="54%"><strong>$${(subtotal + shipping + (tax_rate * subtotal)).toFixed(2)}</script></strong></td>
        </tr>
      </table>
      </body>
      <footer>
      <h3>To remove an item set the quantity to 0 and update!</h3>
      <input type="button" onclick="UpdateCart()" value="Update Cart">
    
        <h4>
    <div><b>OUR SHIPPING POLICY IS:</b></div>
      <br><b>Subtotals less than $50 will have $20 shipping.</b></br>
      <br><b>If subtotal is $100 - $199.99 it will be $15 shipping.</b></br>
      <br><b>Subtotals over $200 will get $10 shipping!</b></br>
    </h4>
    
      </footer>
          `);
            if (typeof request.cookies["useremail"] != "undefined") { //Change the button type depending on if user is logged in or not
              response.write(`<h3><button type="submit" name="checkout">checkout</button></h3>`)
            } else {
              response.write("<h2>Please sign in to complete your purchase!</h2>")
              response.write(`<input type="button" onclick="Gotologin()" value="Login">`)
            }
            response.write(`
          </form>
        </html>
        `)
        response.end()
    }
});

app.get('/UpdateCart', function (request, response) {
  for (let type in request.session.cart) { //loop through cart products
    for (let j in request.session.cart[type]) { //get the quantities in the cart type
      console.log(request.query[type + j]);
       if (typeof request.query[type + j] != 'undefined') { //get quantity input
          request.session.cart[type][j] = Number(request.query[type + j]); //Changes the quantity entered to the new quantity in the form
        } else if (request.query[type +j] == 0) {
          request.session.cart[type][j] = 0;
        }
    }
  }
  response.redirect("./cart");
});

//Generate the invoice on the server used Assignment 2 invoice and Code from assignment 3 examples https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
app.get('/checkout', function (request, response) {
  var user_email = request.cookies["useremail"];
  var invoice_str = `Here is an invoice of your order ${user_email}! <table border>
  <tr>
  <th style="text-align: center;" width="16%">Product</th>
  <th style="text-align: center;" width="13%">Price</th>
  <th style="text-align: center;" width="25%">Quantity</th>
  <th style="text-align: center;" width="59%">Extended Price</th>
</tr>`;
let shopping_cart = request.session.cart;
var tax = 0.04;
subtotal = 0;
for (products_key in shopping_cart) {
  for (i = 0; i < shopping_cart[products_key].length; i++) {
     if (typeof shopping_cart[products_key] == 'undefined') 
     continue;
     quantity = shopping_cart[products_key][i]; //Get the quantities ordered
     extended_price = quantity * products_data[products_key][i].price; //Calculate extended price
     subtotal += extended_price;
     if (quantity > 0) { //Create a table row if quantity is greater than 0
        invoice_str += `<tr><td align="right">${products_data[products_key][i].name}</td>
        <td align="right">$${quantity}</td>
        <td align="right">$${products_data[products_key][i].price}</td>
        <td align="right">$${extended_price}
        <tr>`;
     }
  }
}
//Compute tax
var tax_rate = 0.04;
var tax = tax_rate * subtotal;

// Compute delivery
if (subtotal <=50-99.99) {
  shipping = 20;
}
else if (subtotal <=100-199.99) {
  shipping = 15;
}
else { (shipping = 10) // 5% of subtotal
}
// Compute grand total
var total = subtotal + tax + shipping;
  
//Attach additional costs into invoice string
invoice_str += `<tr>
<tr><td colspan="4" align="right">Subtotal: $${subtotal.toFixed(2)}</td></tr>
<tr><td colspan="4" align="right">Tax: $${tax.toFixed(2)}</td></tr>
<tr><td colspan="4" align="right">Shipping: $${shipping.toFixed(2)}</td></tr>
<tr><td colspan="4" align="right">Total: $${total.toFixed(2)}</td></tr>
</table>`;

// Code from assignment 3 examples https://dport96.github.io/ITM352/morea/180.Assignment3/reading-code-examples.html
// Set up mail server. Only will work on UH Network due to security restrictions
  var transporter = nodemailer.createTransport({
    host: "mail.hawaii.edu",
    port: 25,
    secure: false, // use TLS
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false
    }
  });

  var mailOptions = {
    from: 'manoa_garden@hawaii.edu',
    to: user_email,
    subject: 'Your Basket from the Manoa Garden',
    html: invoice_str
  };

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      invoice_str += `<br>There was an error and your invoice could not be emailed to ${user_email}`;
    } else {
      invoice_str += `<br>Your invoice was mailed to ${user_email}`;
    }
    response.send(invoice_str);
  });
 
});

//Add items to cart
app.get('/add_cart', function (request, response) {
    let params = new URLSearchParams(request.query);
    let products_key = params.get("products_key");
    var valid_quantities = false; //assume no errors
    let quantities = []; // Assume no quantities

      for (var i = 0; i < products_data[products_key].length; i++) { //Turns the quantities inputted into a number
          if (params.has(`quantities${i}`)) { //If there are quantities
            quantities[i] = Number(params.get(`quantities${i}`));
          }
      }
    for (i in quantities) { 
        if (isNonNegativeInteger(quantities[i]) == false) { //Tests against isnonnegativeinteger function
        }
        //Check that quantities are selected
        if (quantities[i] > 0) {
            valid_quantities = true;
        } 
        }  
        if (valid_quantities) {
            shopping_cart = request.session.cart;

             if (typeof shopping_cart == "undefined"){ //If no shopping cart, create an array in session
                request.session.cart = {};
                request.session.cart[products_key] = quantities;
                
            } else if (typeof shopping_cart[products_key] == 'undefined') {
                request.session.cart[products_key] = quantities;

            } else {
                for (var i = 0; i < products_data[products_key].length; i++) {
                    if ((quantities[i] + request.session.cart[products_key][i]) >= products_data[products_key][i].qtyavl) {
                        request.session.cart[products_key][i] = products_data[products_key][i].qtyavl; //If greater than or equal to change quantity in cart to qtyavl
                    } else {
                        request.session.cart[products_key][i] += quantities[i]; //Add selected quantities to quantities in cart.
                    }
                }
            } console.log(request.session.cart[products_key] + "i am here");
                response.redirect('./display_products.html?products_key='+ products_key);
            } else {
            response.redirect("./display_products.html?" + params.toString())
        } 
    }
 );


// From assignment 2 Examples page on website
var fname = "user_data.json";

 // From Professor's lab 14 to get users info from JSON
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
//From Professor Kazman's Lab 14, Assignment 2 Example code with changes by me
app.get("/login", function (request, response) {
    let params = new URLSearchParams(request.query);
    response.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    *{margin: 0;
    padding: 0;
    }
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
        margin-top: 40px;
    }
    header {
        font-family: Arial, Helvetica, sans-serif;
        width:110%;
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
    
    </head>
    
    <header>
    <div class="topnav">
        <a href="index.html">Home</a>
        <a href="display_products.html?products_key=Flowers">Products</a>
        `)
        if (typeof request.cookies["useremail"] != "undefined") { //Checks for cookie "username", if user logged in display logout, else display login
          response.write(`<a href="/logout" id="logout">Logout</a>`);
        } else {
          response.write(`<a href="/login" id="login">Login</a>`);
        }
        response.write(`
        <a href="/register">Register</a>
        <a href="/cart">View Cart</span></a>
      </div>
    </header>
    <body>
    <form action="?${params.toString()}" method="POST">
  
    <div class="login-box">
    <br>
    <h1>Login!</h1>
    <br>
    <label>Email</label>
    <input type="email" name="email" size="30" placeholder="enter email"></br>
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
    </html>
    `)
    response.end()
    });
    //Login validation from Assignment 2 example page on website with some changes made by me
    app.post("/login", function (request, response) {
        let params = new URLSearchParams(request.query);
        // Process login form POST and redirect to logged in page if ok, back to login page if not
        user_email = request.body['email'].toLowerCase();
        the_password = request.body['password'];
        if (typeof users[user_email] != 'undefined') {
            if (users[user_email].password == the_password) {
                response.cookie('useremail', user_email, { maxAge: 30 * 60 * 1000 }); //Create a cookie containing user email, should last for 30 minutes
                response.redirect('./display_products.html?products_key=Flowers'); // If username and pass match go to invoice
            } else {
              response.send(`<script>alert('Incorrect Password'); location.href="/login"</script>`);
            }
        } else {
          response.send(`<script>alert('User does not exist'); location.href="/login"</script>`);
        }  
    });
    
    // Created register form on server with base from Assignment 2 examples with changes made by me, styles made by me
    app.get("/register", function (request, response) {
        console.log(request.params.toString());
    // Give a simple login form
    let params = new URLSearchParams(request.query);
    response.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <style>
    *{margin: 0;
    padding: 0;
    }
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
        margin-top: 40px;
    }
    header {
        font-family: Arial, Helvetica, sans-serif;
        width:110%;
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
    
    </head>
    
    <header>
    <div class="topnav">
        <a href="index.html">Home</a>
        <a href="display_products.html?products_key=Flowers">Products</a>
        `)
        if (typeof request.cookies["useremail"] != "undefined") { //Checks for cookie "username", if user logged in display logout, else display login
          response.write(`<a href="/logout" id="logout">Logout</a>`);
        } else {
          response.write(`<a href="/login" id="login">Login</a>`);
        }
        response.write(`
        <a href="/register">Register</a>
        <a href="/cart">View Cart</span></a>
      </div>
    </header>
    <body>
    <form action="?${params.toString()}" method="POST">
    <div class="login-box">
    <br>
        <h2>Sign Up Here!</h2>
        <br>
                <form id="register_form" action="register" method="POST">
                <label>Username</label>
                <input type="text" name="username" size="30" placeholder="enter username"></br>
                ${ (typeof errors['user_exists'] != 'undefined')?errors['user_exists']:''}
                ${ (typeof errors['no_username'] != 'undefined')?errors['no_username']:''}
                <br>
                <label>Email</label>
                <input type="email" name="email" size="30" placeholder="enter email"><br/>
                ${ (typeof errors['email_exists'] != 'undefined')?errors['email_exists']:''}
                ${ (typeof errors['invalid_email'] != 'undefined')?errors['invalid_email']:''}
                <br>
                <label>Full Name:</label>
                <input type="text" name="fullname" size="30" placeholder="enter full name"><br />
                ${ (typeof errors['invalid_name'] != 'undefined')?errors['invalid_name']:''}
                <br>
                <label>Password:</label>
                <input type="password" name="newpassword" size="30" placeholder="enter password"><br/>
                <h5>Your password should be 10-16 characters</h5>
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
    `)
    response.end()
    });
    // Registration validation made by me(Brendan Lee)
    app.post("/register", function (request, response) {
            // process a simple register form
            let params = new URLSearchParams(request.query);
            invalid = false;
            username = request.body.username.toLowerCase(); //Tests text case
            email = request.body.email.toLowerCase();
            password = request.body.newpassword.length
        
            if(typeof users[username] != 'undefined') { //If user already exists
                errors['user_exists'] = `User already exists!`;
                invalid = true;
            }
            if(typeof users[email] != 'undefined') { //If user already exists
              errors['email_exists'] = `User already exists!`;
              invalid = true;
          }
            if(request.body.username == '') { //Username box is filled in
                errors['no_username'] = `You need to select a username!`;
                invalid = true;
            }
            if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) { //tests if email matches validation
            } else {
                errors['invalid_email'] = `Invalid email!`;
                invalid = true;
            }
            if (/^[a-z ,.'-]+$/i.test(request.body.fullname)) { //Name matches valid format
            } else {
                errors['invalid_name'] = `Please use a real name!`;
                invalid = true;
            } 
            if (password <= 10) { //Password is not long enough
                errors['passtooshort'] = `Your password should be 10-16 characters!`;
                invalid = true;
            }
            if (password >= 16) { //Password is too long
                errors['passtoolong'] = `Your password should be 10-16 characters!`;
                invalid = true;
            }
            if (request.body.newpassword != request.body.repeat_password) { //Not matching passwords
                errors['passnotmatch'] = `Password does not match!`;
                invalid = true;
            }
    
            if (!invalid) { //Testing if there are no errors if there are no errors then add it to user_data, from Assignment 2 examples with some changes made by me

                let POST = request.body;
            
                let user_email = POST["email"];
                let user_pass = POST["newpassword"];
                let user_name = POST["username"];
                let user_fullname = POST["fullname"];
                let user_pass2 = POST["repeat_password"];
            
                if (users[user_email] == undefined) {
                    users[user_email] = {};
                    users[user_email].name = user_name;
                    users[user_email].fullname = user_fullname;
                    users[user_email].username = user_name;
                    users[user_email].password = user_pass;
            
                    let data = JSON.stringify(users);
                    fs.writeFileSync(fname, data, 'utf-8');
                    response.cookie('useremail', user_email, { maxAge: 30 * 60 * 1000 });
                    response.redirect("display_products.html?products_key=Flowers");
                    
                } else {
                    response.redirect('/login?error = User Already Exists!');
                }
            } else {
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
    };

app.get("/logout", function (request, response) { //Destroys session and clears cookie on logout
        response.clearCookie("useremail");
        request.session.destroy();
        //redirect to the index.html page when user logs out
        response.send(`<script>alert('Logged Out'); location.href="/index.html"</script>`);
     });


app.listen(8080, () => console.log(`listening on port 8080`));