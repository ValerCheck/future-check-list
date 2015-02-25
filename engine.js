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
			"click #task-add" : "createTaskView"
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
			
			var self = this;

			this.tasks.each(function(task){
				self.addTask(task);
			});
		},

		createTaskView: function(e){
			var self = this;
			this.tasks.create({
				content: self.input.val()
			});

			self.input.val('');
			self.addAll();
		}
	});

	//new UserTasksView();

});

