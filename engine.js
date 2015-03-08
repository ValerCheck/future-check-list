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
			"mouseover .task-view"   : "showTaskOptions",
			"mouseout .task-view"    : "hideTaskOptions",
			"click .task-content"    : "toggleTaskContent",
			"click .task-delete"     : "clear",
			"click .task-finish"     : "finish",
			"click .task-undone"     : "undone",
			"click .task-edit"       : "edit",
			"dblclick .task-content" : "edit", 
			"click .finish-edit"     : "update",
			"keypress .edit"         : "updateOnEnter"
		},

		initialize : function(){},

		render: function(){
			this.$el.html(this.template(this.model.toJSON()));
			this.input = this.$('.edit');
			if (this.model.get("done")){
				this.$('.task-content').css('text-decoration','line-through');
				this.$('.task-finish').hide();
				this.$('.task-undone').show();
			} else {
				this.$('.task-undone').hide();
			}
			return this;			
		},

		showTaskOptions: function(e){
			if(this.$('.task-actions').css('display') == 'none'){
				this.$('.task-actions').show();	
				this.$('.task-view').css('border-bottom','1px dashed black');
			}			
		},

		hideTaskOptions : function(e){
			if(this.$('.task-actions').css('display') != 'none'){
				this.$('.task-actions').hide();
				this.$('.task-view').css('border-bottom','1px dashed transparent');
			}
		},

		finish: function(){
			this.model.set("done",true);
			this.model.save();
			this.$('.task-content').css('text-decoration','line-through');
			this.$('.task-finish').hide();
			this.$('.task-undone').fadeIn('slow', function(){});
			
		},

		undone: function(){
			this.model.set("done",false);
			this.model.save();
			this.$('.task-content').css('text-decoration','none');
			this.$('.task-undone').hide();
			this.$('.task-finish').fadeIn('fast', function(){});
		},

		toggleTaskContent: function(){
			if (this.$('.task-content').css('overflow') == "hidden"){
				this.$('.task-content').css({'overflow':'visible','white-space':'normal','word-wrap':'break-word'});
			} else {
				this.$('.task-content').css({'overflow':'hidden','white-space':'nowrap'});
			}
		},

		edit: function(){
			if(this.$el.hasClass('editing')){
				return;
			}
			this.$('.task-edit').addClass('finish-edit');
			this.$('.task-view').addClass('editing');
			this.input.focus();
		},

		updateOnEnter: function(e){
			if (e.keyCode != 13){
				return;
			}
			this.update();
		},

		update: function() {
			this.model.save({content:this.input.val()});
			this.$('.task-edit').removeClass('finish-edit');
			this.$('.task-view').removeClass('editing');
			this.render();
		},

		clear: function(){
			var self = this;
			this.$el.fadeOut('fast', function() {});
			this.model.destroy().then(function(){
				self.remove();
			});
		}
	});

	var UserTasksView = Parse.View.extend({
		
		events: {
			"keypress #task-add-content" : "createOnEnterTaskView",
			"click #task-add-button" : "createOnClickTaskView",
			"click #logout-button" : "logout"
		},

		el: '#futureCheckListApp',

		initialize: function(){

			var self = this;

			this.$('.content').html(Handlebars.compile($('#user-list-template').html()));
			this.input = this.$("#task-add-content");
			this.tasks = new TaskList;
			this.tasks.query = new Parse.Query(Task);
			this.tasks.query.find().then(function(collection){
				return self.tasks.fetch();
			}).then(function(){
				self.addAll();
			});
			var currentUser = Parse.User.current();
			this.$('#current-user').show();
			this.$('#logout-button').show();
			this.$('#current-user').html("You are logged in as: " + currentUser.get("username"));
			
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
			this.$('#current-user').html('');
			this.$('#current-user').hide();
			this.$('#logout-button').hide();
			new LogInView();
			delete this.userTasksView;
		},

		createOnClickTaskView: function(e){
			this.createTaskView();
		},

		createOnEnterTaskView: function(e){
			var self = this;
			if (e.keyCode != 13) return;
			this.createTaskView();
		},

		createTaskView: function(){
			var self = this;

			if(!self.input.val()) return;

			var newTask = new Task({
				content: self.input.val(),
				done: false,
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
		
		el : $("#futureCheckListApp"),

		initialize: function(){
			var currentUser = Parse.User.current();
			if (currentUser){
				this.$('#current-user').show();
				this.$('#logout-button').show();
				new UserTasksView();
				this.$('#current-user').html("You are logged in as: " + currentUser.get("username"));
			} else {
				this.$('#current-user').hide();
				this.$('#logout-button').hide();
				new LogInView();
			}
		},
	});
	
	new AppView();

});

