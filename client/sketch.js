var csInterface = new CSInterface();

var clearButtonElm = document.getElementById("executeBtn");
clearButtonElm.addEventListener("click", executeCallback);

function executeCallback(){

	let checkboxes = document.querySelectorAll('input[type="checkbox"]');
	let scenes = "";
	let margin = document.getElementById("margin-input").value;
	checkboxes.forEach(checkbox =>{

		if(checkbox.checked){
			scenes += checkbox.name + ",";
		}

	});
	var hostCall = "supervised_execution(\"" + scenes + "\"," + margin + ")";
	csInterface.evalScript(hostCall,function(output){

		alert(output);

	});

}

function getArtLayers(layerSetName){

	var hostCall = "isLayerEmpty(\"" + layerSetName + "\")";
	var label;
	var content = "";
	var color = "red";
	csInterface.evalScript(hostCall,function(result){

		label = document.getElementById("label" + layerSetName);
		if(result === "true"){
			content += "Layer esta vazio;"
		}

		if(!checkSceneName(layerSetName)){
			content += "Nomenclatura esta incorreta"
		}

		if(content.length == 0){
			content = "Layer ok";
			color = "green";
		}

		label.innerHTML = " " + content;
		label.style="color:" + color;


	});
}

function HelloWorld(){

	alert("OIII MUNDO");

}

function checkSceneName(scene_name){
	return /(sc|SC)\d{4}$/.test(scene_name);
}

function getScenes(){

	let hostCall = "getScenesNames('CENAS')";
	csInterface.evalScript(hostCall,function(result){

		var scenes = result.split(",");
		const container = document.getElementById("list-container");
		let div;
		let item;
		let label;
		let status;
		scenes.forEach(todo => {

			item = document.createElement("input");
			item.type = "checkbox";
			item.name = todo;
			label = document.createElement("label");
			label.for = todo;
			label.innerHTML = todo;
			status = document.createElement("span");
			status.id = "label" + todo;
			status.innerHTML = " Waiting...";

			div = document.createElement("div");
			div.appendChild(item);
			div.appendChild(label);
			div.appendChild(status);
			container.appendChild(div);
			getArtLayers(todo);
		});
	});

}
