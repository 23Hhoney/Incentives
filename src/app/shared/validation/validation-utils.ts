import { isDate, isEmpty } from "lodash";

export function checkValidText(value): boolean {
   // console.log('console.log chek item value', value);
    if(isEmpty(value) || (value+'').trim().length === 0 ) {
        return false;
    }
    return true;
}

export function checkValidDate(value): boolean {
    console.log('console.log chek item value', value);
    if(value && !isDate(value) && value instanceof Date ) {
        return true;
    }
    return false;
}

export function checkValidEmail(value): boolean {
    // var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  without +
    // var mailformat = /^[a-zA-Z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$/
    // var mailformat = /^\w+([\+.-]?\w)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;  with + and -
    var mailformat = /^\w+([\+.]?\w)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(isEmpty(value) || (value+'').trim().length === 0 || !value.match(mailformat)) {
        return false;
    }
    return true;
}

export function checkValidPhone(value): boolean {
    var phoneformat = /^\d{10}$/; // Adjusted regex for 10-digit phone number
    if (!value || (value + '').trim().length === 0 || !(value + '').match(phoneformat)) {
        return false;
    }
    return true;
}
