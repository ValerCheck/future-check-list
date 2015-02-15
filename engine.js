$(function() {
	Parse.$ = jQuery;
	Parse.initialize("xPr8kCeFs8jcXaqusyVcSrWrrTe44VeEsAjAmhNZ", "ng2aLn8y3chCeklWmEeJpy1LqkjRz1zKHq5uxouI");
	var TestObject = Parse.Object.extend("TestObject");
	var testObject = new TestObject();
	testObject.save((foo:"bar")).then(function(object){
		alert("okay, it is just a test of Parse SDK");
	})
});