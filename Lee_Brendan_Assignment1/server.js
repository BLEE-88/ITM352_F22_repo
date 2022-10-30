var products = require(__dirname + '/products.json');

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

app.get("/product_data.js", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post('/process_form', function (request, response, next) {
    let brand = products[0]['flower'];
    let brand_price = products[0]['price'];

    console.log(request.body);
    var q = request.body['quantity_textbox'];
    if (typeof q != 'undefined') {
        if(isNonNegInt(q)) { 
            products[0].total_sold += Number(q);
            response.redirect('./invoice.html?quantity='+q);
        } else {
            response.redirect('./invoice.html?error=Invalid%20Quantity&quantity_textbox=' + q);
        }
    } else {
        response.send(`Hey! You need to pick some stuff!`);
    }

    next();
});

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));