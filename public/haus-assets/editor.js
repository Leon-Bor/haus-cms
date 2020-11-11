/**
 * sends a request to the specified url from a form. this will change the window location.
 * @param {string} path the path to send the post request to
 * @param {object} params the paramiters to add to the url
 * @param {string} [method=post] the method to use on the form
 */

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

window.addEventListener('load', function () {
  var editor;
  console.log('editor launched');
  editor = ContentTools.EditorApp.get();
  editor.init('*[data-editable]', 'data-haus-id');

  editor.addEventListener('saved', function (ev) {
    console.log(ev.detail());

    post(`/haus/?editKey=${localStorage.getItem('haus-editKey')}`, ev.detail().regions);
  });
});
