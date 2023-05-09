var csInterface = new CSInterface();

var clearButtonElm = document.getElementById("executeBtn");
clearButtonElm.addEventListener("click", executeCallback);

function executeCallback(){
	
	var episode = "";
	var hostCall = "execute(" + episode +")";
	csInterface.evalScript(hostCall);

}

function getScenes(){

	var hostCall = "getScenesNames(\"CENAS\")";
	csInterface.evalScript(hostCall,function(result){
		var scenes = result.split(",");
		alert(typeof scenes);
		const fieldSet = document.getElementById("mainFieldSet");
		scenes.forEach(todo => {
			let newForm = document.createElement("form");
			let text = document.createElement("input");
			text.type = "text";
			text.id = "text" + todo;
			text.value = "0000";
			text.size = "6";
			newForm.appendChild(text);
			let btn = document.createElement("input");
			btn.type = "submit";
			btn.id = "executeBtn" + todo;
			btn.value = "fill" + todo;
			newForm.appendChild(btn);
			fieldSet.appendChild(newForm);
		});
	});

}
