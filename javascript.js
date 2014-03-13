var originalfile = 'http://lab.clausdevidre.com/OpenGTT/oregon.gtt.xml';
var editingfile = 'http://lab.clausdevidre.com/OpenGTT/Catalan.gtt.xml';

function onLoad(){

  if (window.File && window.FileReader && window.FileList && window.Blob) {
    $('#editfile').on( "change", handleFileSelect);
    $('#originalfile').on( "change", handleFileSelect);
  } else {
    alert('The File APIs are not fully supported in this browser.');
  }
}

function loadEditFile(content){
  var xmlDoc = $.parseXML(content);
  $('#container').html('');
  $(xmlDoc).find("str").each(function( index ) {
    $('#progress').attr('aria-valuenow',index);
    var str = $( this );
    var tag = str.find("tag").text();
    var edit = str.find("txt").text();
    var row = '<div class="form-group has-error"> \
          <label for="'+tag+'" class="col-sm-5 control-label">'+tag+'</label> \
          <div class="col-sm-7">';
    lines = edit.split(/\r\n|\r|\n/g).length;
    if(lines <= 1){
      row  += '<input type="text" class="edit form-control"  value="'+edit+'" id="'+tag+'" name="'+tag+'">';
    } else {
      row  += '<textarea class="edit form-control" id="'+tag+'" name="'+tag+'" rows="'+lines+'">'+edit+'</textarea>';
    }
    row  += '</div></div>';
    $('#container').append(row);
  });
  $('#originalgroup').show();
  $('#editgroup').hide();
  $('#save').show();
  $('.edit').on('input',inputchanged);
  $('#save').on('click',save);
  $('#working').hide();
}

function loadOriginalFile(content){
  var xmlDoc = $.parseXML(content);
  var $xml = $(xmlDoc);
  $(xmlDoc).find("str").each(function( index ) {
    var str = $( this );
    var tag = str.find("tag").text();
    var original = str.find("txt").text();
    if(original != "" && original != "undefined"){
      $('#'+tag+'.edit').attr('value',original);
      var group = $('#'+tag+'.edit').parents('.form-group');
      group.removeClass("has-error");
      group.removeClass("has-warning");
      group.addClass("has-success");
    }
  });
  $('#originalgroup').hide();
  $('#working').hide();
}

function save(evt){
  $('#output').html('');

  $('.edit').each(function( index ) {
    var tag = $(this).attr('id');
    var txt = $(this).val();
    txt = txt.replace(/\</g,"&lt;");
    txt = txt.replace(/\>/g,"&gt;");
    txt = txt.replace(/\>/g,"&gt;");
    txt = txt.replace(/(\r\n|\n|\r)/gm,"&#13;\r");
    var text = '<str><tag>'+tag+'</tag><txt>'+txt+'</txt></str>'+"\n";
    text = $('#output').val() + text;
    $('#output').val(text);
  });
  $('#output').show();
  $('#container').hide();
  $('#save').hide();
  $('#working').show();
  $('#originalgroup').hide();
  $('#working').text('XML generated');
}

function inputchanged(evt){
  var obj = $(this).parents('.form-group');
  obj.removeClass("has-error");
  obj.removeClass("has-success");
  obj.addClass("has-warning");
}

function handleFileSelect(evt){
  $('#working').show();
  var files = evt.target.files; // FileList object

  // Loop through the FileList and render image files as thumbnails.
  for (var i = 0, f; f = files[i]; i++) {
    // Only process xml files.
    if (!f.type.match('text/xml')) {
      $('#working').html('Not valid XML file: '+escape(f.name));
      $('#working').removeClass('alert-info');
      $('#working').addClass('alert-danger');
      return;
    }

    $('#working').removeClass('alert-danger');
    $('#working').addClass('alert-info');
    $('#working').html('Loading '+escape(f.name)+'...');

    console.log(escape(f.name), ' (', f.type || 'n/a', ') - ',
                f.size, ' bytes, last modified: ',
                f.lastModifiedDate ? f.lastModifiedDate.toLocaleDateString() : 'n/a');

    var reader = new FileReader();

    // If we use onloadend, we need to check the readyState.
    if(evt.target.id  == 'editfile'){
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
            try {
              loadEditFile(evt.target.result);
            } catch(err) {
              $('#working').html('Not valid XML');
              $('#working').removeClass('alert-info');
              $('#working').addClass('alert-danger');
              return;
            }
        }
      };
    } else {
      reader.onloadend = function(evt) {
        if (evt.target.readyState == FileReader.DONE) { // DONE == 2
          try {
            loadOriginalFile(evt.target.result);
          } catch(err) {
            $('#working').html('Not valid XML');
            $('#working').removeClass('alert-info');
            $('#working').addClass('alert-danger');
            return;
          }
        }
      };
    }

    try {
      reader.readAsText(f);
    } catch(err) {
      $('#working').html('Not valid XML '+err.message);
      $('#working').removeClass('alert-info');
      $('#working').addClass('alert-danger');
      return;
    }
  }
}


$(document).ready(function(){
  onLoad();
});
