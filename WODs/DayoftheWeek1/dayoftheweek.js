var monthKey = {
    "January": 0,
    "February": 3,
    "March": 2,
    "April": 5,
    "May": 0,
    "June": 3,
    "July": 5,
    "August": 1,
    "September": 4,
    "October": 6,
    "November": 2,
    "December": 4,
}

var daynumber= ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

var day = 12;
var month = "September";
var year = 2021;

var step1 = year;
var step2 = parseInt(step1 /4) + step1;
var step3 = step2 - parseInt(step1 /100);
var step4 = parseInt(step1 /400) + step3;
var step5 = day + step4;
var step6 = monthKey[month] + step5;
var step7 = step6 % 7;

console.log(daynumber[step7] + ", " + month + "-" + day + "-" + year)