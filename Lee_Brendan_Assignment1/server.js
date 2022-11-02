// Server from Lab 13 with some changes
var express = require('express');
var app = express();
var path = require('path');

app.use(express.static(__dirname + '/public'));
app.use('/css',express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true })); 

function isNonNegativeInteger(queryString, returnErrors = false) { //Checks for errors
    errors = []; // assume no errors at first
    if (Number(queryString) != queryString) {
        errors.push('Not a number!'); // Check if string is a number value
    } else {
        if (queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
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
        response.redirect('products_display.html?error=Invalid%20Quantity');

    } else {
        // If everything is good, redirect to the invoice page.
        response.redirect('invoice.html?' + ordered);
    }
 });

app.listen(8080, () => console.log(`listening on port 8080`));