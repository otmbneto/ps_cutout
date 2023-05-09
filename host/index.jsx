/*#############################################################################
#                                                                  _    _     #
#  index.jsx                                                      , `._) '>   #
#                                                                 '//,,,  |   #
#                                                                     )_/     #
#    by: ~Ottoni Bastos             '||                     ||`       /_|     #
#    e-mail: otmbneto@protonmail.com ||      ''             ||                #
#                                    ||''|,  ||  '||''| .|''||  .|''|,        #
#    created: 05/05/2023             ||  ||  ||   ||    ||  ||  ||  ||        #
#    modified: 05/05/2023           .||..|' .||. .||.   `|..||. `|..|'        #
#                                                                             #
#############################################################################*/

//convinience functions for debbuging purposes.
function getFilename(){
	return activeDocument.name;
}

function getFullpath(){
	return activeDocument.fullName;
}

function getWidth(){
	return Math.round(activeDocument.width.value);
}

function getHeight(){
	return Math.round(activeDocument.height.value);
}

function resizeImage(width,height,resolution,resampleMethod){
	activeDocument.resizeImage(width,height,resolution,resampleMethod);
}

function resizeCanvas(uvWidth,uvHeight){
	activeDocument.resizeCanvas(uvWidth,uvHeight);
}

function saveAs(file,options,asCopy,extension){
	file = new File(file);
	activeDocument.saveAs(file,options,asCopy,extension); 
}

function getScenes(root){
 
	var scenes = [];
	var layerSets = activeDocument.layerSets.getByName(root);
	for(var i = 0;i < layerSets.layers.length;i++){
		
		if(layerSets.layers[i].typename == "LayerSet"){
			scenes.push(layerSets.layers[i]);
		}

	}
	return scenes;	
}

function getScenesNames(root){

	var sceneNames = [];
	var scenes = getScenes(root);

	for(var i=0;i<scenes.length;i++){
		sceneNames.push(scenes[i].name);
	}

	return sceneNames;
}

function cropImage(bounds){

	// Create a new selection based on the rectangle layer's bounds
	activeDocument.selection.select([[bounds[0].value, bounds[1].value], [bounds[2].value, bounds[3].value]]);
	// Crop the image to the selection
	activeDocument.crop(bounds);
}


function resize(newWidth,newHeight){

	// these are our values for the END RESULT width and height (in pixels) of our image
	// do the resizing.  if height > width (portrait-mode) resize based on height.  otherwise, resize based on width
	var uvWidth = null;
	var uvHeight = null;
	if (getHeight() > getWidth()) {
		uvHeight = UnitValue(newHeight,"px");
	}
	else {
		uvWidth = UnitValue(newWidth,"px");
	}
	resizeImage(uvWidth,uvHeight,null,ResampleMethod.BICUBIC);
	
	uvHeight = uvHeight == null ? UnitValue(newHeight,"px") : uvHeight;
	uvWidth = uvWidth == null ? UnitValue(newWidth,"px") : uvWidth;

	resizeCanvas(uvWidth,uvHeight);

}

function SavePSD(saveFile){   

	psdSaveOptions = new PhotoshopSaveOptions();   
	psdSaveOptions.embedColorProfile = true; 
	psdSaveOptions.alphaChannels = true;   
	psdSaveOptions.layers = true;
	psdSaveOptions.annotations = true;
	psdSaveOptions.spotColors = true; 

	makedirs(saveFile.substring(0, saveFile.lastIndexOf('/')));
	
	saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);   
	
}

//function stole from camelo003 to pad string.
function formatPad(num, base){
	var fill = (base - 1) - num.toString().length;
	var str = "";
	while(fill > 0){
		str = str + "0";
		fill = fill - 1;
	}
	str = str + num.toString() + "0";
	return str;
}

//returns the amount of pixels for width and height margin.(this assumes a isoceles triangule)
function getCatethus(hypotenuse){

	catethus = Math.ceil(Math.sqrt(Math.pow(hypotenuse,2)/2));
	return catethus
}

function createCloseUp(scene){

	var margin = 100;
	var catethus = getCatethus(margin);
	//var scenes = getScenes("CENAS");
	var frames = null;
	var minWidth=99999999;
	var maxWidth=0;
	var minHeight=99999999;
	var maxHeight=0;
	var bounds = null;

	frames = scene.layers;
	for(var j=0;j<frames.length;j++){
	
		// Get the bounds of the rectangle layer
		var rectBounds = frames[j].bounds;
		if (rectBounds[0] < minWidth){
			minWidth = rectBounds[0];
		}

		if (rectBounds[2] > maxWidth){
			maxWidth = rectBounds[2];
		}

		if (rectBounds[1] < minHeight){
			minHeight = rectBounds[1];
		}

		if (rectBounds[3] > maxHeight){
			maxHeight = rectBounds[3];

		}

	}

	//add the margin
	minWidth = minWidth - catethus >= 0 ? minWidth - catethus : 0;
	minHeight = minHeight - catethus >= 0 ? minHeight - catethus : 0;
	maxWidth = maxWidth + catethus <=  getWidth() ? maxWidth + catethus : getWidth();
	maxHeight = maxHeight + catethus <= getHeight() ? maxHeight + catethus : getHeight();

	bounds = [minWidth,minHeight,maxWidth,maxHeight];
	cropImage(bounds);

}

function makedirs(folderString){

	var f = new Folder(folderString);
	if (f.exists == false) {
		f.create()
	}

}

//TODO: ask for real paths.
function getOutputPaths(episode,scene){

	var root = "X:/output/"
	closeup_comp = root + episode + "/" + scene + "/COMP/"
	closeup_proxy = root + episode + "/" + scene + "/ANIMATION/"

	return [closeup_comp,closeup_proxy];

}

function execute(episode){

	var savedState = activeDocument.activeHistoryState;
	var scenes = getScenes("CENAS");
	var saveFile = null;
	for(var i=0;i<scenes.length;i++){

		for(j = 0;j<scenes.length;j++){
			if(j == i){
				continue;
			}
			scenes[j].remove();
		}

		createCloseUp(scenes[i]);
		saveFile = getOutputPaths(episode,scenes[i].name);
		SavePSD(saveFile[0] + getFilename());
		resize(Math.ceil(0.25*getWidth()),Math.ceil(0.25*getHeight()));
		SavePSD(saveFile[1] + getFilename());
		activeDocument.activeHistoryState = savedState;
		scenes = getScenes("CENAS");
	}

}