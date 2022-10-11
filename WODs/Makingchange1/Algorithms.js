step1 = 6.32;
step2 = (step1 * 100);
step3 = parseInt(step2 % 25);
step4 = step3;
step5 = parseInt(step4 % 10);
step6 = step5;
step7 = parseInt(step6 % 5);
step8 = step7;
step9 = [step8 , step4, step4];
step10 = Math.floor(step2/25);
step11 = Math.floor(step4/10);
step12 = Math.floor(step6/5);
step13 = Math.floor(step8/1);
step14 = [step10, step11, step12, step13]; //Quarters, Dimes, Nickels, Pennies



console.log(step14);