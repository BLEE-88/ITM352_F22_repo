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
// From Assignment 1 Example 
function process_quantity_form (POST, response) {
    if (typeof POST['PurchaseButton'] != 'undefined') {
       var contents = fs.readFileSync('./views/display_quantity_template.view', 'utf8');
       receipt = '';
        for(i in products) { 
            let q = POST[`quantity${i}`];
            let item = products[i]['flower'];
            let item_price = products[i]['price'];
            if (isNonNegIntString(q)) {
            receipt += eval('`' + contents + '`'); // render template string
            } else {
            receipt += `<h3><font color="red">${q} is not a valid quantity for ${flower}!</font></h3>`;
            }
        }
      response.send(receipt);
      response.end();
    }
 }
 app.get("/products.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
 });

// route all other GET requests to files in public 
app.use(express.static(__dirname + '/public'));

// start server
app.listen(8080, () => console.log(`listening on port 8080`));