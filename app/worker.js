var reader = new FileReader();

var modified_cache;

addEventListener('message', function(e){

  var interval = 500;

  var multiplier = 1;

  var poll = function(){
    reader.readAsText(e.data);
    setTimeout(poll, interval * multiplier);
  };

  poll();

  reader.onload = function(file){
    var modified = +new Date(e.data.lastModifiedDate);

    if( modified_cache !== modified ){

      multiplier = 1;
      modified_cache = modified;

      postMessage({
        body: file.target.result,
        size: file.total,
        lastModified: file.timeStamp
      });
    }

    if( multiplier < 8 )
      multiplier += 1;
  };

}, false);
