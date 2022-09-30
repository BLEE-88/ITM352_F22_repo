const { counter } = require("console");

require("./products_data.js"); 
var num_products = 5;

for(var counter = 1; eval("typeof name"+counter) != 'undefined'; counter++) {
    if (counter > num_products/4 && counter < num_products*3/4) {
        console.log(eval('name'+counter) + " is sold out!");
   } else {
        console.log(counter + ". " + eval('name'+counter));
   }
}

console.log("That's all we have!");