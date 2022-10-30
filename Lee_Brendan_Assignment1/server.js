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

var products = require(__dirname + '/products.json');
products.forEach( (prod,i) => {prod.total_sold = 0}); 

app.get("/product_data.", function (request, response, next) {
   response.type('.js');
   var products_str = `var products = ${JSON.stringify(products)};`;
   response.send(products_str);
});

app.post("/process_form", function (request, response) {
    //response.send(request.body)
    var q = request.body['quantity'];
    if (typeof q != 'undefined') {
        if (isNonNegativeInteger(q)) {  // We have a valid quantity
            
            let brand = products[0]['flower'];
            let brand_price = products[0]['price'];
            products[0].total_sold += Number(q);

            response.send(`<H1>Invoice</H1><BR>Thank you for purchasing <B>${q}</B> ${brand} at ${brand_price} each for a total of ${brand_price * q}`);
        } else {
            response.send(`${q} is not a valid quantity -- hit the back button`);
        }
    } else {
        response.send("Enter some quantities!");
    }
});
// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));