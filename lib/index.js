#! /usr/bin/env node

var fs = require("fs"),
    exec = require('child_process').exec,
    masterNpmCmd = [],
    masterCmd = "";

// Recursive helper function for walking npm-shrinkwrap.json
function processDeps(dependencies, depth){
  if(!dependencies) { return; }
  var packageName,
    packageVersion,
    packageObj,
    cmd;
  for(packageName in dependencies){
    packageObj = dependencies[packageName];
    if(depth > 0){
      packageVersion = packageObj.version;
      cmd = packageName + "@" + packageVersion;
      console.log("Found " + cmd + "...");
      masterNpmCmd.push(cmd); // for now just used for count
      masterCmd += " " + cmd;
    }
    processDeps(packageObj.dependencies, depth + 1);
  }
}
try{
  console.log("shrinkwrapping...");
  exec("npm shrinkwrap",function(error, stdout, stderr){
       console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
          throw error;
      }
      console.log("reading npm-shrinkwrap.json...");
      fs.readFile("npm-shrinkwrap.json", "utf-8", function(err, data){
      if(err) throw err;
      var json = JSON.parse(data);
      processDeps(json.dependencies,0);
      if(masterNpmCmd.length > 0){
        console.log(masterNpmCmd.length + " deps need to be flattened...");
        exec("npm install " + masterCmd + " --save",function(error,stdout,stderr){
           console.log('stdout: ' + stdout);
             console.log('stderr: ' + stderr);
             if (error !== null) {
                 throw error;
             }
             console.log("npm dedupe....");
             exec("npm dedupe",function(error,stdout,stderr){
                console.log('stdout: ' + stdout);
               console.log('stderr: ' + stderr);
               if (error !== null) {
                    throw error;
               }
               console.log("shrinkwrapping again...");
               exec("npm shrinkwrap",function(error, stdout, stderr){
                 console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
                if (error !== null) {
                    throw error;
                }
                console.log("Done!");
              });
            });
        });
      } else {
        console.log("No deps need to be flattened!");
      }
    });
  });
}
catch(e){
  throw e;
}

