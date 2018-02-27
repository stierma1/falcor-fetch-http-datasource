function breakQueryIntoSubQueries(paths, maxSize){
  //Leave some wiggle room
  if(paths.length <= 2){
    return [paths];
  }
  if(encodeURIComponent(JSON.stringify(paths)).length <= maxSize){
    return [paths];
  }

  var mid = Math.ceil(paths.length / 2);
  var divide1 = [];
  var divide2 = [];

  for(var i = 0; i < mid; i++){
    divide1.push(paths[i]);
  }
  for(i; i < paths.length; i++){
    divide2.push(paths[i]);
  }

  return breakQueryIntoSubQueries(divide1).concat(breakQueryIntoSubQueries(divide2));
}

function mergeResponses(source, destination){
  for(var i in source){
    if(typeof(source[i]) === "string" || typeof(source[i]) === "number" || typeof(source[i]) === "boolean" || source[i] === null || source[i] === undefined){
      destination[i] = source[i];
    } else {
      destination[i] = destination[i] || {};
      destination[i] = mergeResponses(source[i], destination[i]);
    }
  }

  return destination;
}


module.exports = {mergeResponses, breakQueryIntoSubQueries};
