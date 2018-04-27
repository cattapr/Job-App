'use strict';

let { When, Then, And, Given} = require('cucumber');
let { By, until, Key } = require('selenium-webdriver');
let { expect } = require('chai');


Given('att en arbetssökande besöker startsidan', function (next) {
  this.driver.get(`file:///Users/vanja/Desktop/Job-App/index.html`);
  next();
});


Given(/väljer (.*) i en meny/, function(val, next) {
  this.driver.findElement(By.id('numberOfJobs'))
    this.driver.findElement(By.css(`option[value='${val}']`));
      this.click()
      .then(function() {
        next();
      });
  });


Then(/uppdateras listan med (.*) annonser/, function (antal, next) {
  this.driver.wait(until.elementLocated(By.css('#jobContainer')));
  
  this.driver.findElements(By.css('#loaderContainer ~ div'))
    .then(function(elements) {
      expect(elements.length).to.not.equal(antal);
      next();
    });
});
