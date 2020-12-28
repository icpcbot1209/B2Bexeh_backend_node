
exports.loadModel =loadModel;
exports.loadController =loadController;


function loadModel(path){
    var path = "./modules"+path;
    try{        
        return require(path)
    }catch(err){
        __debug(err);
        throw new Error("Couldn't load Model with path '"+path+"/");
    }
}

function loadController(path){
    var path = "./modules"+path;
    try{        
        return require(path)
    }catch(err){
        __debug(err);
        throw new Error("Couldn't load controller with path '"+path+"/");
    }
}