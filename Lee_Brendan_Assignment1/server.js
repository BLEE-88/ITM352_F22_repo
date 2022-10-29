var products_array = require(__dirname + '/products.json');

var express = require('express');
var app = express();

// Routing 

// monitor all requests
app.all('*', function (request, response, next) {
   console.log(request.method + ' to ' + request.path);
   next();
});

// process purchase request (validate quantities, check quantity available)
function isNonNegIntString (queryString, returnErrors=false) {
    errors = []; // assume no errors at first
        if(Number(queryString) != queryString) errors.push('Not a number!'); // Check if string is a number value
        if(queryString < 0) errors.push('Negative value!'); // Check if it is non-negative
        if(parseInt(queryString) != queryString) errors.push('Not an integer!'); // Check that it is an integer
    
        if (returnErrors) {
    return errors;
} else if (errors.length == 0) {
    return true;
} else {
    return false;
}

}
app.all('*', function (request, response, next) {
    console.log(request.method + ' to path ' + request.path);
    next();
});

app.get("/products.json", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post("/process_form", function (request, response) {
    // Process the form by redirecting to the receipt page
    var q = request.body['Purchase'];
    if (typeof q != 'undefined') {
        if (isNonNegativeInteger(q)) {  // We have a valid quantity
            response.redirect('invoice.html?quantity=' + q);
        } 
    } else {
        response.send("Enter a valid quantity!");
    }
});


// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));