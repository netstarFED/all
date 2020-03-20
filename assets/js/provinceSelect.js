/********省市级联动**********************/
/**
 *需要传3个select的id
 *默认的省市区值
 *province省份的id
 *city市的id
 *area区的id
 */
var provinceSelect = {};
provinceSelect.init = function(formID,provinceID,cityID,areaID){
	alert('sdfoweurowe');
	provinceSelect.formID = formID;
	provinceSelect.proviceID = provinceID;
	provinceSelect.cityID = cityID;
	provinceSelect.areaID = areaID;
	provinceSelect.GetProvince();
}
provinceSelect.GetProvince = function(){
	var arrProvince = provinceInfo;
	var subdata = [];
	for(var provinceIndex in arrProvince) {
		var proJson = {"value":arrProvince[provinceIndex].name,"text":arrProvince[provinceIndex].name};
		subdata.push(proJson);
	}
	var selectJson = [
		{
			id: 		provinceSelect.proviceID,
			subdata: 	subdata
		}
	]
	formPlane.edit(selectJson,provinceSelect.formID);
}
provinceSelect.GetCity = function(cityStr){
	var allProvince = provinceInfo;
	var subdata = [];
	for(var provinceIndex in allProvince){
		var cityData = '';
		if(allProvince[provinceIndex].name == cityStr){
			cityData = allProvince[provinceIndex].sub;
		}
		for(var cityIndex in cityData){
			var cityJson = {"value":cityData[cityIndex].name,"text":cityData[cityIndex].name};
			subdata.push(cityJson);
		}
	}
	var selectJson = [
		{
			id: 		provinceSelect.cityID,
			subdata: 	subdata
		}
	]
	formPlane.edit(selectJson,provinceSelect.formID);
}
provinceSelect.GetArea = function(areaStr){
	var allProvince = provinceInfo;
	var subdata = [];
	for(var provinceIndex in allProvince){
		var cityData = allProvince[provinceIndex].sub;
		if(typeof(cityData)!='undefined'){
			for(var cityIndex in cityData){
				if(cityData[cityIndex].name == areaStr){
					var areaData = cityData[cityIndex].sub;
					for(areaIndex in areaData){
						var areaJson = {"value":areaData[areaIndex].name,"text":areaData[areaIndex].name};
						subdata.push(areaJson);
					}
				}
			}
		}
	}
	var selectJson = [
		{
			id: 		provinceSelect.areaID,
			subdata: 	subdata
		}
	]
	formPlane.edit(selectJson,provinceSelect.formID);
}