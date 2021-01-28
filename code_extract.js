#!/usr/bin/env node

var marked   = require('marked');
var readline = require('readline');
var cvitek_mlir = 'tar zxf cvitek_mlir.tar.gz'
var cvitek_tpu_samples = 'tar zxf cvitek_tpu_samples.tar.gz';
var cvitek_tpu_sdk = 'tar zxf cvitek_tpu_sdk.tar.gz';

var codedown = function(src, lang) {

  var renderer = new marked.Renderer();

  var renderers =
    Object.getOwnPropertyNames(marked.Renderer.prototype);

  for (var i = 0; i < renderers.length; i++) {
    var f = renderers[i];
    if (f !== 'constructor') {
      renderer[renderers[i]] = function () { return ''; };
    }
  }

  renderer.code =
    function (src, language, escaped) {
      var prune_src = src.replace(new RegExp(cvitek_mlir, 'g'), '')
                         .replace(new RegExp(cvitek_tpu_samples, 'g'), '')
                         .replace(new RegExp(cvitek_tpu_sdk, 'g'), '')
                         .replace(/1000/g, '10')
                         .replace(/50000/g, '50');
      var code = prune_src;
      if (language === "python") {
        code = "echo \"" + prune_src + "\" | python3";
      }
      return (language === lang[0]) || (language == lang[1]) ? code + '\n\n' : '';
    };

  renderer.heading = function (text, level, raw, slugger) {
    if ((level == 2) && (parseInt(raw) > 3)) {
      //console.log(parseInt(raw));
      return ("cd $WORK_PATH\n");
    }
    return text;
  };

  renderer.listitem = function (text) {
    return text;
  };

  renderer.list = function (body, ordered) {
    return body;
  };

  marked.use({ renderer: renderer });

  var output = marked(src);
  output = output.replace(/\n+$/g, '');

  return output;
};


if (process.argv.length === 4) {

  console.log("export WORK_PATH=$PWD");
  console.log("export MODEL_PATH=/work/mlir-models/");
  console.log(cvitek_mlir);
  console.log(cvitek_tpu_samples);
  console.log(cvitek_tpu_sdk);

  var source = [];

  readline.createInterface({
    terminal: false,
    input: process.stdin,
  }).on('line', function (line) {
    source.push(line);
  }).on('close', function () {
    var lang = [process.argv[2], process.argv[3]];
    output = codedown(source.join('\n'), lang);
    console.log(output);
  });

} else {
  console.log('usage: codedown <lang>');
  console.log('ex: codedown haskell');
}
