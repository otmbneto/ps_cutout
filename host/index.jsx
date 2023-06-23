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

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

function getFilename(){
	return String(activeDocument.name);
}

function getFullpath(){
	return String(activeDocument.fullName);
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

// Check the operating system
function checkOperatingSystem() {
	if ($.os.indexOf("Windows") !== -1) {
		return "Windows";
	} else if ($.os.indexOf("Macintosh") !== -1) {
		return "macOS";
	} else {
		return "Unknown";
	}
}

function getExecutable(){

	var photoshopExe = null;
	var os = checkOperatingSystem();
	if(os == "Windows"){
		photoshopExe = new File(app.path + "/Photoshop.exe");
	}
	else if(os == "macOS"){
		photoshopExe = new File(app.path + "/Adobe Photoshop.app");
	}

	return photoshopExe;
}

// Get the Photoshop installation path
function getPhotoshopInstallationPath() {
	try {
		// Create a new File object pointing to the Photoshop executable
		var photoshopPath = new File(app.path);
		// Return the path of the installation folder
		return photoshopPath.fsName;
	} catch (error) {
		return null;
	}
}
  
// Load and run the "Delete All Empty Layers.jsx" script
function deleteAllEmptyLayers() {
	var status = true;
	try {
		var scriptFile = new File(getPhotoshopInstallationPath() +"/Presets/Scripts/Delete All Empty Layers.jsx");
		app.load(scriptFile);
	} catch (error) {
		status = "Error loading script:" + error;
	}
	return status;
}

function getLayerSet(name){

	var layerSet;
	try{
		layerSet = activeDocument.layerSets.getByName(name);
	}
	catch(e){
		layerSet = null;
	}

	return layerSet;
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

function SavePNG(saveFile){   

	var pngSaveOptions = new PNGSaveOptions;
	pngSaveOptions.compression = 9;
	pngSaveOptions.interlaced = false;
	makedirs(saveFile.substring(0, saveFile.lastIndexOf('/')));
	saveAs(saveFile, pngSaveOptions, true, Extension.LOWERCASE);   
	
}

function SavePSD(saveFile){   

	var psdSaveOptions = new PhotoshopSaveOptions();   
	psdSaveOptions.embedColorProfile = true; 
	psdSaveOptions.alphaChannels = true;   
	psdSaveOptions.layers = true;
	psdSaveOptions.annotations = true;
	psdSaveOptions.spotColors = true; 
	makedirs(saveFile.substring(0, saveFile.lastIndexOf('/')));
	saveAs(saveFile, psdSaveOptions, true, Extension.LOWERCASE);   
	
}

function SavePSB(saveFile) { 

	var desc1 = new ActionDescriptor(); 
	var desc2 = new ActionDescriptor(); 
	desc2.putBoolean( stringIDToTypeID('maximizeCompatibility'), true ); 
	desc1.putObject( charIDToTypeID('As  '), charIDToTypeID('Pht8'), desc2 ); 
	desc1.putPath( charIDToTypeID('In  '), new File(saveFile) ); 
	desc1.putBoolean( charIDToTypeID('LwCs'), true );
	makedirs(saveFile.substring(0, saveFile.lastIndexOf('/')));
	executeAction( charIDToTypeID('save'), desc1, DialogModes.NO ); 

};

function saveDocument(saveFile){

	if(getFullpath().endsWith(".psd")){
		SavePSD(String(saveFile));
	}
	else if(getFullpath().endsWith(".psb")){
		SavePSB(String(saveFile));
	}

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

function createCloseUp(scene,margin){

	var catethus = getCatethus(margin);
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
function getOutputPaths(episode){
	var root = "//192.168.10.100/projects/127_Lupi_Baduki/01_EPISODIOS/" + episode +"/02_ASSETS/01_BG/02_POST_BOARD/06_FECHAMENTO/";
	//var root = "X:/output/127_Lupi_Baduki/01_EPISODIOS/" + episode +"/02_ASSETS/01_BG/02_POST_BOARD/06_FECHAMENTO/";
	closeup_comp = root + "02_COMP/"
	closeup_proxy = root + "01_PRE_COMP/"
	return [closeup_comp,closeup_proxy];
}

function pad(num, size) {
    num = num.toString();
    while (num.length < size) num = "0" + num;
    return num;
}

function getVersion(basename,saveAt,format){
	var f = new Folder(saveAt);
	var files = f.getFiles (/(psd|psb|png)$/);//returns file object list
	var version = 1;
	for(var i = 0;i < files.length;i++){
		if(files[i].name.indexOf(basename) != -1 && files[i].name.indexOf(format) != -1){
            version++;
		}
	}
	return "v" + pad(version,2);
}

function generateCloseupName(projCode,episode,scene,saveAt,format){
 	var basename = projCode + "_" + episode + "_" + scene;//LEB_EP000_SC0000 
	return basename + "_" + getVersion(basename,saveAt,format) + format;//LEB_EPXXX_SCXXXX_vXX.psd
}

function isLayerEmpty(layer_name){
	return getFrameCount(layer_name) == 0;
}

function getFrameCount(scene_name){
	var frames = activeDocument.layerSets.getByName("CENAS").layerSets.getByName(scene_name).layers;
	return frames.length;
}

function getEpisode(s) {
	var rx = /EP\d{3}/g;
	var arr = s.match(rx);
	return arr == null ? null : arr[0]; 
}

function deleteOtherGuides(scene_name){

	var guide = getLayerSet("GUIDE");
	if(guide == null){
		return false;
	}

	var layers = guide.layers;
	for(var i=0;i < layers.length;i++){

		if(layers[i].name.indexOf(scene_name) == -1){
			layers[i].remove();
		}

	}

}

function execute(scenes_to_close,margin){

	var episode = getEpisode(getFilename());
	if(episode == null){
		return "ERROR: episode not found";
	}
	var originalState = activeDocument.activeHistoryState;
	var scenes = getScenes("CENAS");
	var saveFile = null;
	
	deleteAllEmptyLayers();
	var currentState = activeDocument.activeHistoryState;
	for(var i=0;i<scenes.length;i++){

		//if scene is not checked in the interface,ignore it.
		if(scenes_to_close.indexOf(scenes[i].name) == -1){
			continue;
		}

		deleteOtherGuides(scenes[i].name);

		//remove other layers from the file about to be saved.
		for(j = 0;j<scenes.length;j++){
			if(j == i){
				continue;
			}
			scenes[j].remove();
		}

		createCloseUp(scenes[i],margin);
		saveFile = getOutputPaths(episode);
		saveDocument(saveFile[0] + generateCloseupName("LEB",episode,scenes[i].name,saveFile[0],".psd"));
		SavePNG(saveFile[0] + generateCloseupName("LEB",episode,scenes[i].name,saveFile[0],".png"));
		resize(Math.ceil(0.25*getWidth()),Math.ceil(0.25*getHeight()));
		saveDocument(saveFile[1] + generateCloseupName("LEB",episode,scenes[i].name,saveFile[1],".psd"));
		SavePNG(saveFile[1] + generateCloseupName("LEB",episode,scenes[i].name,saveFile[1],".png"));
		activeDocument.activeHistoryState = currentState;
		scenes = getScenes("CENAS");
	}

	activeDocument.activeHistoryState = originalState;
	return "Fechamentos criados com sucesso!";
}