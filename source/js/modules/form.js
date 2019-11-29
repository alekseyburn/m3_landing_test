/* polyfill remove() for ie11
 */

(function() {
  var arr = [window.Element, window.CharacterData, window.DocumentType];
  var args = [];

  arr.forEach(function (item) {
    if (item) {
      args.push(item.prototype);
    }
  });

  // from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
  (function (arr) {
    arr.forEach(function (item) {
      if (item.hasOwnProperty('remove')) {
        return;
      }
      Object.defineProperty(item, 'remove', {
        configurable: true,
        enumerable: true,
        writable: true,
        value: function remove() {
          this.parentNode.removeChild(this);
        }
      });
    });
  })(args);
})();

/* ----------------------------
	CustomValidation prototype
	- Keeps track of the list of invalidity messages for this input
	- Keeps track of what validity checks need to be performed for this input
	- Performs the validity checks and sends feedback to the front end
---------------------------- */

function CustomValidation(input) {
  this.invalidities = [];
  this.validityChecks = [];

  //add reference to the input node
  this.inputNode = input;

  //trigger method to attach the listener
  this.registerListener();
}

CustomValidation.prototype = {
  addInvalidity: function(message) {
    this.invalidities.push(message);
  },
  getInvalidities: function() {
    return this.invalidities.join('. \n');
  },
  checkValidity: function(input) {
    for ( var i = 0; i < this.validityChecks.length; i++ ) {

      var isInvalid = this.validityChecks[i].isInvalid(input);
      if (isInvalid) {
        this.addInvalidity(this.validityChecks[i].invalidityMessage);
      }

      var requirementElement = this.validityChecks[i].element;

      if (requirementElement) {
        if (isInvalid) {
          requirementElement.classList.add('invalid');
          requirementElement.classList.remove('valid');
        } else {
          requirementElement.classList.remove('invalid');
          requirementElement.classList.add('valid');
        }

      } // end if requirementElement
    } // end for
  },
  checkInput: function() { // checkInput now encapsulated

    this.inputNode.CustomValidation.invalidities = [];
    this.checkValidity(this.inputNode);

    if ( this.inputNode.CustomValidation.invalidities.length === 0 && this.inputNode.value !== '' ) {
      this.inputNode.setCustomValidity('');
    } else {
      var message = this.inputNode.CustomValidation.getInvalidities();
      this.inputNode.setCustomValidity(message);
    }
  },
  registerListener: function() { //register the listener here

    var CustomValidation = this;

    this.inputNode.addEventListener('keyup', function() {
      CustomValidation.checkInput();
    });


  }

};



/* ----------------------------
	Validity Checks
	The arrays of validity checks for each input
	Comprised of three things
		1. isInvalid() - the function to determine if the input fulfills a particular requirement
		2. invalidityMessage - the error message to display if the field is invalid
		3. element - The element that states the requirement
---------------------------- */

var mailValidityChecks = [
  {
    isInvalid: function(input) {
      return !input.value.match(/@/g);
    },
    invalidityMessage: 'Необходим символ "@"',
    element: document.querySelector('.form__requirements li:nth-child(1)')
  },
  {
    isInvalid: function(input) {
      return !input.value.match(/^([a-z\d\-]+)@/g);
    },
    invalidityMessage: 'Часть адреса перед "@"',
    element: document.querySelector('.form__requirements li:nth-child(2)')
  },
  {
    isInvalid: function(input) {
      return !input.value.match(/@([a-z\d\-]+)/g);
    },
    invalidityMessage: 'Часть адреса после "@"',
    element: document.querySelector('.form__requirements li:nth-child(3)')
  },
  {
    isInvalid: function(input) {
      return !input.value.match(/@([a-z\d\-]+)\./g);
    },
    invalidityMessage: 'Наличие "." перед доменом',
    element: document.querySelector('.form__requirements li:nth-child(4)')
  },
  {
    isInvalid: function(input) {
      return !input.value.match(/@([a-z\d\-]+)\.([a-z]{2,8})(\.[a-z]{2,8})?$/g);
    },
    invalidityMessage: 'Наличие домена после "."',
    element: document.querySelector('.form__requirements li:nth-child(5)')
  }
];


/* ----------------------------
	Setup CustomValidation
	Setup the CustomValidation prototype for each input
	Also sets which array of validity checks to use for that input
---------------------------- */

var mailInput = document.querySelector('.form__field');

mailInput.CustomValidation = new CustomValidation(mailInput);
mailInput.CustomValidation.validityChecks = mailValidityChecks;

/* ----------------------------
	Event Listeners
---------------------------- */

var input = document.querySelector('input:not([type="submit"])');


var submit = document.querySelector('.form__send-button');
var form = document.querySelector('.form');
let requirements = document.querySelector('.form__requirements');
function validate() {
    input.CustomValidation.checkInput();
}

submit.addEventListener('click', validate);
form.addEventListener('submit', validate);

form.addEventListener('focusin', () => {
  requirements.classList.remove('non-visible');
  requirements.classList.add('visible');
});

form.addEventListener('focusout', () => {
  requirements.classList.add('non-visible');
  requirements.classList.remove('visible');
});

submit.addEventListener('click', (evt) => {
  if (input.checkValidity()) {
    evt.preventDefault();
     let successMessage = document.createElement('p');
    successMessage.innerHTML = "Успешно отправлено";
    successMessage.classList.add('success');
    form.insertAdjacentElement('beforeend', successMessage);
    setTimeout(() => successMessage.remove(), 2000);
  }
});
