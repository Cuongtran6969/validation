
function Validator(options) {
  function getParent(element, selector) {
    //trong khi element có thẻ cha bên ngoài nó để tìm đến thằng cuối cùng
    while(element.parentElement) {
      //nếu thẻ cha bên ngoài element là thằng cần tìm(selector) thì trả về
      if(element.parentElement.matches(selector)) {
        return element.parentElement
      }else{
        //còn không thì lấy thằng tiếp theo là thằng con và lấy thằng tiếp theo là cha để kiểm tra
        element = element.parentElement;
      }
    }

  }
    var selectorRules = {}
//B4.ham thuc hien validate
    function validate(inputElement, rule) {
        var errorMessage;
        //error đã được gọi bên html = form-message
        var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        //rules chứa những hàm có selector tại vị trí blur [f]
        var rules = selectorRules[rule.selector]
        for(var i=0; i<rules.length; i++) {
          switch(inputElement.type) {
            case 'radio':
              case 'checkbox':
                errorMessage = rules[i]
                (formElement.querySelector(rule.selector + ':checked'));
              break;
              default:
                errorMessage = rules[i](inputElement.value)
          }


            //lap qua tung validate cua thang blur
  //var errorMessage = rule.test(inputElement.value)
        // errorMessage = rules[i](inputElement.value)
        //neu duoi ham test co hien thi ra loi thi thoat khoi vong lap(ko chay cai tiep theo nua)
        if(errorMessage) break;
        }
      // ở ngoài vòng lặp kiểm tra xử lý thằng vừa được kiểm tra có lỗi
        if(errorMessage) {
            errorElement.innerText = errorMessage
            getParent(inputElement, options.formGroupSelector).classList.add('invalid')
        }else{
            errorElement.innerText ='';
            getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
        }
// convert ra kieu boolean neu co loi la false, ngc lai la true
        return !errorMessage;
    }
//B1 lay element cua form can validate
    var formElement = document.querySelector(options.form);
    if(formElement) {
    formElement.onsubmit = function(e) {
        e.preventDefault();
 // ban đầu isFormValid = ko có lỗi 
        var isFormValid = true;

//B3 thuc hien lap qua tung rule de Validate
        options.rules.forEach(function(rule) {
          var inputElement = formElement.querySelector(rule.selector);
         
          //isValid = validate() = false = co loi
          var isValid = validate(inputElement, rule)
          if(!isValid) {
            isFormValid = false;
          }
        });
        //convert sang array Array.from()
        
        if(isFormValid) {
            if(typeof options.onSubmit === 'function') {
              var enableInputs = formElement.querySelectorAll('[name]:not([disabled])');        
              var formValues = Array.from(enableInputs).reduce(function(values, input) {
   switch(input.type) {
         case 'radio':
           if(input.matches(':checked')) {
              values[input.name] = input.value
          };
          break;
          case 'checkbox':
            if(!values[input.name]) {
              values[input.name] = []
            }
            if(input.matches(':checked')) {
              values[input.name].push(input.value)
          };
           break;
           case 'file':
            values[input.name] = input.files;
            break;
           default:
            values[input.name] = input.value;
  //khi giá trị nhập vào rỗng thì giá trị trc giấu && sẽ rỗng
}
                return values;
              }, {});
              options.onSubmit(formValues);
            }else{
                formElement.submit()
            }
        }

    }

//b2 lặp qua từng rule đề kiểm xem blur và báo lỗi 
        options.rules.forEach(function(rule) {

            //2.1 lấy tất cả các f() chứa selector
            //save the rule for input
            //2. nếu thằng sau cũng chứa selector đó và 1. đã được gắn array thì cho thằng sau vào cùng 1 mảng vs thằng trước [f, f]
            if(Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            }else{
                //#selector = f(value)
                //1. nếu không phải là array thì gắn cho nó là array
                selectorRules[rule.selector] = [rule.test];
            }
//2.2 kiểm tra blur để hàn validate kiểm tra 
            //get input element which contain selector
            var inputElements = formElement.querySelectorAll(rule.selector);
            Array.from(inputElements).forEach(function(inputElement) {
              if(inputElement) {
                  //xu ly khi bluk khoi input
                  inputElement.onblur = function() {
                      validate(inputElement, rule)   
                  }
                  //xu ly moi khi nguoi dung nhap vao
                  inputElement.oninput = function() {
              var errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
              errorElement.innerText ='';
              getParent(inputElement, options.formGroupSelector).classList.remove('invalid')
                  }
              }
          });

            })

    }
}
//kiểm tra nhập vào của name
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function(value) {
          return value ? undefined : message|| 'Vui long nhap truong nay'
    }
  }
}
// kiểm tra nhập vào của email
Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function(value) {
    var regex =  /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
         return regex.test(value) ? undefined : 'Vui long nhap email'  
        }
    }
}
Validator.minLength = function (selector, min) {
    return {
      selector: selector,
      test: function(value) {
            return value.length >= min ? undefined : `Vui long nhap toi thieu ${min} ky tu`
      }
    }
  }
Validator.confired = function (selector, getConfirmValue, message) {
    return {
      selector: selector,
      test: function(value) {
            return value === getConfirmValue() ? undefined : message || `Khong trung khop mat khau`
      }
    }
  }