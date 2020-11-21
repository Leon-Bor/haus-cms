$(document).ready(function () {
  function checkKeyRequest() {
    $('.error-missing-key').hide();
    $('.error-invalid-key').hide();
    $.ajax({
      url: '/cms/auth',
      type: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('authorization', $('input').val());
      },
      success: function () {
        $('.form').hide();
        $('.next-step').show();
        $('.next-step').css('display', 'flex');
      },
      error: function (params) {
        $('.error-invalid-key').show();
      },
    });
  }

  if (localStorage.getItem('haus-editKey')) {
    checkKeyRequest();
  }

  $('.submit-key').click(function (el) {
    if (!$('input').val()) {
      $('.error-missing-key').show();
    } else {
      checkKeyRequest();
    }
  });
});
