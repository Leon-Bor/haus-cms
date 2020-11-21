/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param {string} path the path to send the post request to
 * @param {object} params the paramiters to add to the url
 * @param {string} [method=post] the method to use on the form
 */

function getParameterByName(name, url = window.location.href) {
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function post(path, data) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST', path);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.onload = function () {
    if (xhr.status === 200) {
      var userInfo = JSON.parse(xhr.responseText);
    }
  };
  xhr.send(JSON.stringify(data));
}

var edit = getParameterByName('edit') || localStorage.getItem('haus-edit') || ''; // "lorem"
localStorage.setItem('haus-edit', edit);
var editKey = getParameterByName('editKey') || localStorage.getItem('haus-editKey') || ''; // "" (present with empty value)
localStorage.setItem('haus-editKey', editKey);
console.log('Edit', edit);
if (edit == 'true') {
  var link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/cms/content-tools.min.css';
  document.head.appendChild(link);

  var link3 = document.createElement('link');
  link3.rel = 'stylesheet';
  link3.href = '/cms/haus-globals.css';
  document.head.appendChild(link3);

  var script = document.createElement('script');
  script.src = '/cms/content-tools.min.js';
  document.body.appendChild(script);

  window.addEventListener('load', function () {
    var editor;
    console.log('editor launched');
    editor = ContentTools.EditorApp.get();
    editor.init('*[data-editable]', 'data-haus-id');

    editor.addEventListener('saved', function (ev) {
      console.log(ev.detail());

      post(`/cms/content?editKey=${localStorage.getItem('haus-editKey')}`, ev.detail().regions);
    });
  });
}
