// use Bootstrap to validate the forms
(function() {
  'use strict';

  // Fetch all the forms we want to applu custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.validated-form');

  // Loop over them and prevent submission
  // Old way of transforming it into an array
  // now can be called as Array.from
  Array.prototype.slice.call(forms)
    .forEach(function(form) {
      form.addEventListener('submit', function(event) {
        if (!form.checkValidity()) {
          event.preventDefault();
          event.stopPropagation();
        }

        form.classList.add('was-validated');
      }, false)
    })
})()