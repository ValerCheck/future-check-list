$(function() {
	Parse.$ = jQuery;
	Parse.initialize("xPr8kCeFs8jcXaqusyVcSrWrrTe44VeEsAjAmhNZ", 
		"ng2aLn8y3chCeklWmEeJpy1LqkjRz1zKHq5uxouI");
	
	var Task = Parse.Object.extend("Task");

	var TaskList = Parse.Collection.extend({
		model: Task
	});

	var TaskView = Parse.View.extend({
		tagName: "li",
		
		template: Handlebars.compile($('#task-tpl').html()),
		
		events: {
			"click .task-delete" : "clear"
		},

		initialize : function(){},

		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			return this;			
		},

		clear: function(){
			var self = this;
			this.model.destroy().then(function(){
				self.remove();
			});
		}
	});

	var UserTasksView = Parse.View.extend({
		
		events: {
			"click #task-add" : "createTaskView",
			"click .user-logout" : "logout"
		},

		el: '.content',

		initialize: function(){

			var self = this;

			//this.bind("createTaskView",this);

			this.$el.html(Handlebars.compile($('#user-list-template').html()));
			this.input = this.$("#task-add-content");
			this.tasks = new TaskList;
			this.tasks.query = new Parse.Query(Task);
			this.tasks.query.find().then(function(collection){
				return self.tasks.fetch();
			}).then(function(){
				self.addAll();
			});

		},

		addTask: function(task){
			var view = new TaskView({model:task});
			this.$('#task-list').append(view.render().el);
		},

		addAll: function(){
			this.$('#task-list').html("");
		
			this.tasks.each(this.addTask);
		},

		logout: function(){
			Parse.User.logOut();
			new LogInView();
			delete this;
		},

		createTaskView: function(e){
			var self = this;
			console.log(Parse.User.current());



			if(!self.input.val()) return;

			var newTask = new Task({
				content: self.input.val(),
				ACL: new Parse.ACL(Parse.User.current())
			});
			newTask.save().then(function(){
				self.tasks.add(newTask);
				self.input.val('');
				self.addAll();	
			});		
		}
	});

	var LogInView = Parse.View.extend({
		events: {
			"submit form.login-form" : "logIn",
			"submit form.signup-form" : "signUp",
			"click #register-link" : "showSignUpPanel",
			"click #login-link" : "showLogInPanel"
		},

		el: ".content",

		initialize: function(){
			this.render();
		},

		logIn: function(e){
			var self = this;
			var username = this.$('#login-username').val();
			var password = this.$('#login-password').val();

			Parse.User.logIn(username, password, {
				success: function(user){
					new UserTasksView();
					delete self;
				},

				error: function(user, error){
					self.$(".login-form .error").html("Invalid username or password. Please try again!").show();
					self.$(".login-form button").removeAttr("disabled");
				}
			});

			this.$(".login-form button").attr("disabled", "disabled");

			return false;
		},

		signUp: function(e){
			var self = this;
			var username = this.$("#signup-username").val();
			var password = this.$("#signup-password").val();

			Parse.User.signUp(username, password, { ACL: new Parse.ACL()},{
				success: function(user){
					new UserTasksView();
					delete self;
				},
				error: function(user, error){
					self.$(".signup-form .error").html(error.message).show();
					self.$(".signup-form button").removeAttr("disabled");
				}
			});

			this.$(".signup-form button").attr("disabled","disabled");

			return false;
		},

		showSignUpPanel: function(){
			this.$(".login-form").hide();
			this.$(".signup-form").show();
			return false;
		},

		showLogInPanel: function(){
			this.$('.signup-form').fadeIn('normal');
			this.$('.signup-form').css('top',15 + 'px');
			this.$('.signup-form').hide();
			this.$('.login-form').show();
		},

		render: function(){
			this.$el.html(Handlebars.compile($('#user-login-template').html()));
		}
	});

	var AppView = Parse.View.extend({
		el: $("#futureCheckListApp"),

		initialize: function(){
			if (Parse.User.current()){
				new UserTasksView();
			} else {
				new LogInView();
			}
		}
	});
	
	new AppView();

});

