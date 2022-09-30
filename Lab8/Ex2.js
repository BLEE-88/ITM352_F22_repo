const { count } = require("console");

require("./products_data.js"); 
var num_products = 5;
var counter = 1;

while (counter <= num_products) {
    if (counter > num_products/2) {
    }
    if (counter > num_products/4 && counter < num_products*3/4) {
        console.log(eval('name'+counter) + " is sold out!");
   } else {
        console.log(counter + ". " + eval('name'+counter));
   }
    counter++;
}

console.log("That's all we have!");