//Please note that all page methods are bound to buttons automatically
//by the custom navigator, look how it's done in the html

(function () {
    "use strict";

    WinJS.UI.Pages.define("./pages/contactcard/contactcard.html", {
        simpleContact: function (arg) {
            WinJSContrib.Contacts.showContact({ firstName: "John", lastName: "Doe", email: "johndoe@doe.com", phone: "0123456789" }, arg.elt);
        },

        advancedContact: function (arg) {
            WinJSContrib.Contacts.showContact({
                firstName: "John",
                lastName: "Doe",
                email: "johndoe@doe.com",
                phone: "0123456789",
                work: {
                    email: "johndoe-work@doe.com",
                    phone: "0123456789",
                    address: {
                        street: "5 rue d'Uzès",
                        locality: "Paris",
                        postalCode: "75002"
                    }
                },
                home: {
                    email: "johndoe-home@doe.com",
                    phone: "0123456789"
                },
            }, arg.elt);
        },

        searchContact: function (arg) {
            var txtMail = this.element.querySelector("#txtMail");
            WinJSContrib.Contacts.showContact({ email: txtMail.value }, arg.elt);
        }
    });
})();
