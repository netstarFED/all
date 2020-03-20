personUI.componentPersonPlane = function(formID,personJson){
	for(var person in personJson){
		var config = personJson[person];
		config.formID = formID;
		nsUI.personSelect.init(config);
	}	
}