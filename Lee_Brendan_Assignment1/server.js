var products_array = require(__dirname + '/products.json');
var express = require('express');
var app = express();

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available) From Lab and Wods
function isNonNegativeInteger(queryString, returnErrors = false) {
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
app.post("/MakePurchase", function (request, response) {
    // Process the form and redirect to the receipt page if everything is valid
    let validquantity = true;
    let ordered = "";
 
    for (i = 0; i < products.length; i++) {  // Iterate over all text boxes in the form.
        var name = "quantity" + i;
        var q = request.body[name];
        if (typeof q != 'undefined') {
            if (isNonNegativeInteger(q)) { 
                // We have a valid quantity. Add to the ordered string.
                products[i].total_sold += Number(q);
                ordered += name + "=" + q + "&";
            } else {
                // We have an invalid quantity. Set the valid flag to false.
                validquantity = false;
            }
        } else {
            // The textbox was not found.  Signal a problem.
            validquantity = false;
        }
    }
 
    if (!validquantity) {
        // If we found an error, redirect back to the order page.
        response.redirect('products_display.html?error=Invalid%20Quantity');
    } else {
        // If everything is good, redirect to the receipt page.
        response.redirect('invoice.html?' + ordered);
    }
 
 });
 

 app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
 });

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));