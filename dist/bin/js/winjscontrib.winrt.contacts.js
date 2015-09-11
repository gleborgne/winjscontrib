/* 
 * WinJS Contrib v2.1.0.4
 * licensed under MIT license (see http://opensource.org/licenses/MIT)
 * sources available at https://github.com/gleborgne/winjscontrib
 */

/// <reference path="//Microsoft.WinJS.2.0/js/base.js" />
/// <reference path="//Microsoft.WinJS.2.0/js/ui.js" />
var WinJSContrib = WinJSContrib || {};
WinJSContrib.WinRT = WinJSContrib.WinRT || {};
WinJSContrib.WinRT.Contacts = WinJSContrib.WinRT.Contacts || {};

(function () {
    "use strict";
    var ContactsNS = Windows.ApplicationModel.Contacts;
    var MAX_EMAIL_ADDRESS_LENGTH = 321;
    var MAX_PHONE_NUMBER_LENGTH = 50;

    function addMail(contact, email, kind) {
        if (email && email.length > 0) {
            if (email.length <= MAX_EMAIL_ADDRESS_LENGTH) {
                var ctemail = new ContactsNS.ContactEmail();
                ctemail.address = email;

                if (kind)
                    ctemail.kind = kind;

                contact.emails.append(ctemail);
            }
            else {
                WinJS.log && WinJS.log("The email address you entered is too long.", "sample", "error");
                return;
            }
        }
    }

    function addPhone(contact, phone, kind) {
        if (phone && phone.length > 0) {
            if (phone.length <= MAX_PHONE_NUMBER_LENGTH) {
                var ctphone = new ContactsNS.ContactPhone();
                ctphone.number = phone;
                if (kind)
                    ctphone.kind = kind;

                contact.phones.append(ctphone);
            }
            else {
                WinJS.log && WinJS.log("The phone number you entered is too long.", "sample", "error");
                return;
            }
        }
    }

    function addAddress(contact, address, kind) {
        if (address) {
            var ctaddress = new ContactsNS.ContactAddress();

            if (address.street && address.street.length)
                ctaddress.streetAddress = address.street;
            if (address.locality && address.locality.length)
                ctaddress.locality = address.locality;
            if (address.region && address.region.length)
                ctaddress.region = address.region;
            if (address.country && address.country.length)
                ctaddress.country = address.country;
            if (address.postalCode && address.postalCode.length)
                ctaddress.postalCode = address.postalCode;
            if (kind)
                ctaddress.kind = kind;

            contact.addresses.append(ctaddress);
        }
    }

    WinJSContrib.WinRT.Contacts.show = function (ct, elt) {
        var contact = new ContactsNS.Contact();

        if (ct.firstName && ct.firstName.length > 0) {
            contact.firstName = ct.firstName;
        }

        if (ct.lastName && ct.lastName.length > 0) {
            contact.lastName = ct.lastName;
        }

        addMail(contact, ct.email);
        addPhone(contact, ct.phone);
        addAddress(contact, ct.address);

        if (ct.work) {
            addMail(contact, ct.work.email, ContactsNS.ContactEmailKind.work);
            addPhone(contact, ct.work.phone, ContactsNS.ContactPhoneKind.work);
            addAddress(contact, ct.work.address, ContactsNS.ContactAddressKind.work);
        }

        if (ct.home) {
            addMail(contact, ct.home.email, ContactsNS.ContactEmailKind.home);
            addPhone(contact, ct.home.phone, ContactsNS.ContactPhoneKind.home);
            addAddress(contact, ct.home.address, ContactsNS.ContactAddressKind.home);
        }

        var boundingRect = elt.getBoundingClientRect();
        var selectionRect = { x: boundingRect.left, y: boundingRect.top, width: boundingRect.width, height: boundingRect.height };

        if (window.Windows && window.Windows.Phone) {
            WinJSContrib.Alerts.message('Oupss...', 'this feature is not available on Windows Phone (yet). Run the application on Windows to see it live.')
        }
        else {
            ContactsNS.ContactManager.showContactCard(contact, selectionRect, Windows.UI.Popups.Placement.default);
            WinJS.log && WinJS.log("ContactManager.showContactCard() was called.", "sample", "status");
        }
    }
})();