$(function() {
	Parse.$ = jQuery;
	Parse.initialize("xPr8kCeFs8jcXaqusyVcSrWrrTe44VeEsAjAmhNZ", 
		"ng2aLn8y3chCeklWmEeJpy1LqkjRz1zKHq5uxouI");
	
	var Task = Parse.Object.extend("Task");

	var TaskList = Parse.Collection.extend({
		model: Task
	});

	/*var taskList = new TaskList();

	taskList.fetch({
		success: function(tasks){
			var tasksView = new TaskList({collection: tasks});
			tasksView.render();
			$('#taskList').html(tasksView.el);
		},
		error: function(tasks, error){
			console.log(error);
		}
	});*/

	var TaskView = Parse.View.extend({
		tagName: "li",
		
		template: Handlebars.compile($('#task-tpl').html()),
		
		events: {
			"click .task-delete" : "clear"
		},

		initialize : function(){
			this.model.bind('destroy',this.remove);
		},

		render: function(){
			console.warn('Render task view: ' + this.model);
			this.$el.html(this.template(this.model.toJSON()));
			console.log(this.model);
			return this;			
		},

		clear: function(){
			this.model.destroy();
		}
	});

	var UserTasksView = Parse.View.extend({
		el: '.content',
		initialize: function(){
			var self = this;
			
			this.$el.html(Handlebars.compile($('#task-list-template').html()));
			
			this.tasks = new TaskList;
			this.tasks.query = new Parse.Query(Task);
			console.log(this.tasks.length);
			this.tasks.fetch({
				success : function(collection){
					console.log(collection);
					console.log('length is ' + collection.length);
					self.addAll();
				},
				error : function(collection,error){
					console.log(error);
				}
			});
			

		},

		addTask: function(task){
			console.log('Task (addTask):');
			console.log(task);
			var view = new TaskView({model:task});
			console.log('TaskView (addTask):');
			console.log(view);
			this.$('#task-list').append(view.render().el);
			console.log('Rendered element (addTask):');
			console.log(view.render().el);
		},

		addAll: function(){
			console.log('Run addAll function!');
			this.$('#task-list').html("");
			console.log('Tasks (addAll): ');
			console.log(this.tasks);
			
			var self = this;

			this.tasks.each(function(task){
				self.addTask(task);
				console.log("Task: ");
				console.log(task);
			});
		}
	});

	new UserTasksView();

});

