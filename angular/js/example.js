var myApp = angular.module('plumbApp', []);

//controllers manage an object $scope in AngularJS (this is the view model)
myApp.controller('PlumbCtrl', function($scope) {

	// define a module with library id, schema id, etc.
	function module(library_id, schema_id, title, description, x, y) {
		this.library_id = library_id;
		this.schema_id = schema_id;
		this.title = title;
		this.description = description;
		this.x = x;
		this.y = y;
	}

	function connection(source_schema_id, target_schema_id ) {
		this.source_schema_id = source_schema_id;
		this.target_schema_id = target_schema_id;
	}

	// module should be visualized by title, icon
	$scope.library = [];

	// library_uuid is a unique identifier per module type in the library
	$scope.library_uuid = 0; 

	// state is [identifier, x position, y position, title, description]
	$scope.schema = {};
	$scope.schema.modules = [];

	$scope.schema.connections = [];

	// schema_uuid should always yield a unique identifier, can never be decreased
	$scope.schema_uuid = 0; 

	// todo: find out how to go back and forth between css and angular
	$scope.library_topleft = {
			x: 15,
			y: 145,
			item_height: 50,
			margin: 5,
	};

	$scope.module_css = {
			width: 154,
			height: 109, // actually variable
	};


	$scope.redraw = function() {
		$scope.schema_uuid = 0;
		jsPlumb.detachEveryConnection();
		$scope.schema.modules = [];
		$scope.schema.connections = [];
		$scope.schema.connections = [{"source_schema_id":"4","target_schema_id":"3"}];
		$scope.schema.modules = [{"library_id":1,"schema_id":3,"title":"Camera","description":"Hooks up to hardware camera and sends out an image at 20 Hz","x":461,"y":246.5},{"library_id":0,"schema_id":4,"title":"Sum","description":"Aggregates an incoming sequences of values and returns the sum","x":150,"y":118.5}];	
		//jsPlumb.doWhileSuspended(function() {
  			// import here - does not work
		//	jsPlumb.connect({source:"jsPlumb_1_6", target:"jsPlumb_1_4"});
		//});
		$scope.library = [];
		$scope.addModuleToLibrary("Sum", "Aggregates an incoming sequences of values and returns the sum", 
				$scope.library_topleft.x+$scope.library_topleft.margin, 
				$scope.library_topleft.y+$scope.library_topleft.margin);
		$scope.addModuleToLibrary("Camera", "Hooks up to hardware camera and sends out an image at 20 Hz", 
				$scope.library_topleft.x+$scope.library_topleft.margin, 
				$scope.library_topleft.y+$scope.library_topleft.margin+$scope.library_topleft.item_height);	
	};

	// add a module to the library
	$scope.addModuleToLibrary = function(title, description, posX, posY) {
		console.log("Add module " + title + " to library, at position " + posX + "," + posY);
		var library_id = $scope.library_uuid++;
		var schema_id = -1;
		var m = new module(library_id, schema_id, title, description, posX, posY);
		$scope.library.push(m);
	};

	// add a module connection
	$scope.addModuleConnection = function(source_schema_id, target_schema_id) {
		console.log("Add module connection " + source_schema_id + " to " + target_schema_id);
		var c = new connection(source_schema_id, target_schema_id);
		$scope.schema.connections.push(c);
		console.log($scope.schema.connections);

	};

	// add a module connection
	$scope.removeModuleConnection = function(source_schema_id, target_schema_id) {
		console.log("Remove module connection " + source_schema_id + " to " + target_schema_id);
		for (var i = 0; i < $scope.schema.connections.length; i++) {
			// compare in non-strict manner
			if ($scope.schema.connections[i].source_schema_id == source_schema_id && $scope.schema.connections[i].target_schema_id == target_schema_id) {
				console.log("Remove state at position " + i);
				$scope.schema.connections.splice(i, 1);
			}
		}

	};

	// add a module to the schema
	$scope.addModuleToSchema = function(library_id, posX, posY) {
		console.log($scope.schema.modules);
		console.log("Add module " + title + " to schema, at position " + posX + "," + posY);
		var schema_id = $scope.schema_uuid++;
		var title = "Unknown";
		var description = "Likewise unknown";
		for (var i = 0; i < $scope.library.length; i++) {
			if ($scope.library[i].library_id == library_id) {
				title = $scope.library[i].title;
				description = $scope.library[i].description;
			}
		}
		var m = new module(library_id, schema_id, title, description, posX, posY);
		$scope.schema.modules.push(m);
		console.log($scope.schema.modules);
	};

	$scope.handleDrop = function(e){
		var dragEl = e.el,
		dragIndex = dragEl.getAttribute('data-identifier'),
		dropEl = document.getElementById('container');

		if (dragEl.classList.contains('menu-item')) {
			console.log("Drag event on " + dragIndex);
			var x = event.pageX - dropEl.offsetLeft - ($scope.module_css.width / 2);
			var y = event.pageY - dropEl.offsetTop - ($scope.module_css.height / 2);
			$scope.addModuleToSchema(dragIndex, x, y);
			$scope.$apply();
		}
    };

	$scope.removeState = function(schema_id) {
		console.log("Remove state " + schema_id + " in array of length " + $scope.schema.modules.length);
		for (var i = 0; i < $scope.schema.modules.length; i++) {
			// compare in non-strict manner
			if ($scope.schema.modules[i].schema_id == schema_id) {
				console.log("Remove module at position " + i);
				var j = $scope.schema.connections.length;
				while(j--) {
					console.log($scope.schema.connections[j]);
					if ($scope.schema.connections[j].source_schema_id == schema_id || $scope.schema.connections[j].target_schema_id == schema_id) {
						console.log("Remove connections at position " + j);
						$scope.schema.connections.splice(j, 1);
					}
				}
				$scope.schema.modules.splice(i, 1);
			}
		}
	};

	$scope.init = function() {
		jsPlumb.bind("ready", function() {
			console.log("Set up jsPlumb listeners (should be only done once)");
			jsPlumb.importDefaults({
				//Connector:"Straight",
				ConnectionOverlays : [
					[ "Arrow", { location:1 } ]
				]
			});
			jsPlumb.bind("connection", function (info) {
				$scope.$apply(function () {
					console.log(info.connection.source.getAttribute('data-identifier'));
					var sourceSchemaId = info.connection.source.getAttribute('data-identifier');
					var targetSchemaId = info.connection.target.getAttribute('data-identifier');
					console.log(info.connection.source);
					//$scope.addModuleConnection(info.sourceId, info.targetId);
					$scope.addModuleConnection(sourceSchemaId, targetSchemaId);
					console.log("Possibility to push connection into array");
					//Is this necessary?
					jsPlumb.revalidate(info.connection.source);
					jsPlumb.revalidate(info.connection.target);
					////jsPlumb.repaint();
				});
			});
			jsPlumb.bind("click", function(conn, originalEvent) {
				if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?")){
					jsPlumb.detach(conn);
					$scope.$apply(function () {
						var sourceSchemaId = document.getElementById(conn.sourceId).getAttribute('data-identifier');
						var targetSchemaId = document.getElementById(conn.targetId).getAttribute('data-identifier');
						$scope.removeModuleConnection(sourceSchemaId,targetSchemaId);
					});
				}
			});



		});
	}
});

myApp.directive('postRender', [ '$timeout', function($timeout) {
	var def = {
			restrict : 'A', 
			terminal : true,
			transclude : true,
			link : function(scope, element, attrs) {
				$timeout(scope.redraw, 0);  //Calling a scoped method
			}
	};
	return def;
}]);


//directives link user interactions with $scope behaviours
//now we extend html with <div plumb-item>, we can define a template <> to replace it with "proper" html, or we can 
//replace it with something more sophisticated, e.g. setting jsPlumb arguments and attach it to a double-click 
//event
myApp.directive('plumbItem', ['$document', function($document) {
	return {
		replace: true,
		controller: 'PlumbCtrl',
		link: function (scope, element, attrs) {
			console.log("Add plumbing for the 'item' element");
			var clickX = 0, clickY = 0, dropX = 0, dropY = 0, startX = scope.module.x,startY = scope.module.y, mouseX = 0, mouseY = 0;
			var containerHeight = element[0].parentElement.offsetHeight, containerWidth = element[0].parentElement.offsetWidth;
			var moduleHeight = scope.module_css.height, moduleWidth = scope.module_css.width;
			
			jsPlumb.makeTarget(element, {
				anchor: 'Continuous',
				endpoint:"Dot",					
				paintStyle:{ fillStyle:"#7AB02C",radius:11 },
				ConnectionsDetachable:true,
				deleteEndpointsOnDetach:false,
				isTarget:true,
				maxConnections: 1,
				beforeDrop:function(event){
					if (event.sourceId == event.targetId) //Prevent loopback
						return false;
					else{
						return true;
					}
				}
			});

			jsPlumb.draggable(element, {
				containment: 'parent'
			});
			// this should actually done by a AngularJS template and subsequently a controller attached to the dbl-click event
			var closebutton = angular.element(element[0].querySelector('.closebutton'));
			closebutton.bind('click', function(e) {
				jsPlumb.detachAllConnections(element);
				// stop event propagation, so it does not directly generate a new state
				e.stopPropagation();
				//we need the scope of the parent, here assuming <plumb-item> is part of the <plumbApp>			
				scope.$parent.removeState(attrs.identifier);
				scope.$parent.$digest();
			});

			element.on('mousedown', function(event) {
		      // Prevent default dragging of selected content
		      event.preventDefault();
		      clickX = event.pageX;
		      clickY = event.pageY;
		      if (!angular.element(event.target).hasClass('connect'))
		      	$document.on('mouseup', mouseup);
		    });

		    function mousemove(event) {

		    }

		    function mouseup(event) {
		      	$document.off('mouseup', mouseup);
		      	dropX = event.pageX;
		      	dropY = event.pageY;
			    console.log('dragDistanceX:' + (dropX - clickX));
			    console.log('dragDistanceY:' + (dropY - clickY));
		      	console.log('startX:' + startX + ' startY:' + startY);

			  	startX = startX + (dropX - clickX);
		      	startY = startY + (dropY - clickY);
		      	console.log('containerWidth:' + containerWidth + ' moduleWidth:' + moduleWidth);
		      	console.log('containerHeight:' + containerHeight + ' moduleHeight:' + moduleHeight);
		      	if (startX < 0)
		      		startX = 0;

		      	if (startX > (containerWidth - moduleWidth))
		      		startX = containerWidth - moduleWidth;

		      	if (startY > (containerHeight - moduleHeight))
		      		startY = containerHeight - moduleHeight;

		      	if (startY < 0)
		      		startY = 0;

		      	console.log('startX(after):' + startX + ' startY(after):' + startY);

		      	scope.module.x = startX;
		      	scope.module.y = startY;
		      	scope.$apply();
		    }

		}
	};
}]);

//
// This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
// painted again on its original position, and the full module should be displayed on the dragged to location.
//
myApp.directive('plumbMenuItem', function() {
	return {
		replace: true,
		controller: 'PlumbCtrl',
		link: function (scope, element, attrs) {
			console.log("Add plumbing for the 'menu-item' element");

			// jsPlumb uses the containment from the underlying library, in our case that is jQuery.

			jsPlumb.draggable(element, {
				clone:true,
				stop: function(e){
					scope.$parent.handleDrop(e);
				}
			});
		}
	};
});

myApp.directive('plumbConnect', function() {
	return {
		replace: true,
		link: function (scope, element, attrs) {
			console.log("Add plumbing for the 'connect' element");

			jsPlumb.makeSource(element, {
				parent: element.parent(),
				anchor: 'Continuous',
				isSource:true,
				deleteEndpointsOnDetach:false,
				connector:[ "Bezier", { stub:[40, 60], gap:10, cornerRadius:5, alwaysRespectStubs:true } ],								                
				paintStyle:{ 
					strokeStyle:"#7AB02C",
					fillStyle:"transparent",
					radius:7,
					lineWidth:3 
				},
				connectorStyle:{
					lineWidth:4,
					strokeStyle:"#61B7CF",
					joinstyle:"round",
					outlineColor:"transparent",
					outlineWidth:2
				},
				connectorHoverStyle:{
					lineWidth:4,
					strokeStyle:"#216477",
					outlineWidth:2,
					outlineColor:"transparent"
				}
			});
		}
	};
});


