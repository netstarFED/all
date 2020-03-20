
demos.form.base = {
	main:function(){
		var navJson = {
			id: "demo-frame-framebase-nav",
			btns:
			[
				[
					{
						text: 		'保存',
						handler: 	save,
					}
				]
			],
		}
		controlPlane.formNavInit(navJson);
		var formJson = 
			{
				id:  		"demo-frame-framebase-form",
				size: 		"standard",
				format: 	"standard",
				fillbg: 	true,
				form:
				[
					[
						{
							id: 		'psmselect',
							label: 		'人员选择器',
							type: 		'person-select-system',
							rules:'required',
							//rules: 		'max:2',//'required',
							value: 			['2','3'],
							column: 	12,
						}
					]
				]
			}
		formPlane.formInit(formJson);
		function save(){
			var json = formPlane.getFormJSON('demo-frame-framebase-form');
			console.log(json);
		};
	}
}

	
$(function(){
	nsFrame.init(demos.form.base);
});
	
	