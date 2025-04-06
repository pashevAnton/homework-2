"use strict";
var contactStorageKey = "contactList";
var contacts = loadContacts();
var editingContactId = null;
function saveContacts() {
    localStorage.setItem(contactStorageKey, JSON.stringify(contacts));
}
function loadContacts() {
    var saved = localStorage.getItem(contactStorageKey);
    return saved ? JSON.parse(saved) : {};
}
function getLetter(name) {
    return name[0].toLowerCase();
}
function generateId() {
    return Date.now().toString();
}
function clearInputFields() {
    var nameInput = document.getElementById("name");
    var jobInput = document.getElementById("job");
    var phoneInput = document.getElementById("phone");
    if (nameInput)
        nameInput.value = "";
    if (jobInput)
        jobInput.value = "";
    if (phoneInput)
        phoneInput.value = "";
}
function showNotification(message, type) {
    if (type === void 0) { type = "success"; }
    var notification = document.getElementById("notification");
    var messageSpan = document.getElementById("notification-message");
    if (notification && messageSpan) {
        messageSpan.textContent = message;
        notification.classList.remove("hidden");
        notification.style.backgroundColor =
            type === "error" ? "#f44336" : "#4CAF50";
        setTimeout(function () {
            notification.classList.add("show");
        }, 10);
        setTimeout(function () {
            notification.classList.remove("show");
            setTimeout(function () {
                notification.classList.add("hidden");
            }, 300);
        }, 3000);
    }
}
function isValidContact(name, job, phone) {
    if (!name.trim() || !job.trim() || !phone.trim()) {
        showNotification("All fields must be filled!", "error");
        return false;
    }
    var nameJobRegex = /^[A-Za-z\s]+$/;
    if (!nameJobRegex.test(name)) {
        showNotification("Name must contain only English letters and spaces", "error");
        return false;
    }
    if (!nameJobRegex.test(job)) {
        showNotification("Job must contain only English letters and spaces", "error");
        return false;
    }
    var phoneRegex = /^\+\d{1} \d{3}-\d{3}-\d{2}-\d{2}$/;
    if (!phoneRegex.test(phone)) {
        showNotification("Phone format must be +X XXX-XXX-XX-XX", "error");
        return false;
    }
    return true;
}
function isDuplicateContact(name, phone, contacts) {
    return Object.values(contacts).some(function (letterGroup) {
        return letterGroup.some(function (contact) {
            return contact.name.toLowerCase() === name.toLowerCase() &&
                contact.phone === phone;
        });
    });
}
function renderLetter(letter) {
    var container = document.querySelector(".element__letter[data-id=\"".concat(letter, "\"]"));
    var parent = container.parentElement;
    parent.querySelectorAll(".contact-card").forEach(function (el) { return el.remove(); });
    if (contacts[letter]) {
        contacts[letter].forEach(function (contact) {
            var card = document.createElement("div");
            card.className = "contact-card";
            card.innerHTML = "\n        <div class=\"contact-card-content\">\n          <div>Name: ".concat(contact.name, "</div>\n          <div>Job: ").concat(contact.job, "</div>\n          <div>Contact: ").concat(contact.phone, "</div>\n        </div>\n        <div class=\"contact-action\">\n          <button class=\"delete-button\" onclick=\"deleteContact('").concat(letter, "', '").concat(contact.id, "')\"><i class=\"fas fa-times\"></i></button>\n        </div>\n      ");
            parent.appendChild(card);
        });
        container.textContent = "".concat(letter.toUpperCase(), " (").concat(contacts[letter].length, ")");
    }
    else {
        container.textContent = letter.toUpperCase();
    }
}
function renderAll() {
    for (var i = 97; i <= 122; i++) {
        renderLetter(String.fromCharCode(i));
    }
}
function saveContact() {
    var name = document.getElementById("name").value.trim();
    var job = document.getElementById("job").value.trim();
    var phone = document.getElementById("phone").value.trim();
    if (!isValidContact(name, job, phone))
        return;
    var isDuplicate = isDuplicateContact(name, phone, contacts);
    if (isDuplicate) {
        showNotification("Contact with the same name and phone already exists", "error");
        return;
    }
    var letter = getLetter(name);
    var id = generateId();
    var newContact = { id: id, name: name, job: job, phone: phone };
    if (!contacts[letter])
        contacts[letter] = [];
    contacts[letter].push(newContact);
    saveContacts();
    renderLetter(letter);
    clearInputFields();
    showNotification("Contact ".concat(name, " successfully added!"));
}
function deleteContact(letter, id) {
    contacts[letter] = contacts[letter].filter(function (c) { return c.id !== id; });
    if (contacts[letter].length === 0)
        delete contacts[letter];
    saveContacts();
    var header = document.querySelector("[data-id=\"".concat(letter, "\"]"));
    if (header) {
        var count = contacts[letter] ? contacts[letter].length : 0;
        header.textContent =
            count > 0
                ? "".concat(letter.toUpperCase(), " (").concat(count, ")")
                : "".concat(letter.toUpperCase());
    }
    var input = document.querySelector(".search-popup__input");
    if (input && input.oninput) {
        input.oninput(new Event("input"));
    }
    showNotification("Contact successfully deleted!");
}
function clearContacts() {
    contacts = {};
    saveContacts();
    renderAll();
    showNotification("You have deleted all contacts!");
}
function openSearchModal() {
    var popup = document.querySelector(".search-popup");
    var input = popup.querySelector(".search-popup__input");
    var output = popup.querySelector(".search-popup__output");
    popup.classList.add("active");
    input.value = "";
    output.innerHTML = "";
    input.oninput = function () {
        var query = input.value.trim().toLowerCase();
        output.innerHTML = "";
        if (!query)
            return;
        Object.keys(contacts).forEach(function (letter) {
            contacts[letter].forEach(function (contact) {
                if (contact.name.toLowerCase().startsWith(query)) {
                    var div = document.createElement("div");
                    div.className = "contact-card";
                    div.style.display = "flex";
                    div.innerHTML = "\n            <div class=\"contact-card-content\">\n              <div>Name: ".concat(contact.name, "</div>\n              <div>Job: ").concat(contact.job, "</div>\n              <div>Phone: ").concat(contact.phone, "</div>\n            </div>\n            <div class=\"contact-actions\">\n              <button class=\"edit-button\" onclick=\"openEditModal('").concat(letter, "', '").concat(contact.id, "')\"><i class=\"fas fa-pen\"></i></button>\n              <button class=\"delete-button\" onclick=\"deleteContact('").concat(letter, "', '").concat(contact.id, "')\"><i class=\"fas fa-times\"></i></button>\n            </div>\n          ");
                    output.appendChild(div);
                }
            });
        });
    };
    var showAllButton = popup.querySelector(".search-popup__show-all");
    showAllButton.onclick = function () {
        input.value = "";
        output.innerHTML = "";
        Object.keys(contacts).forEach(function (letter) {
            contacts[letter].forEach(function (contact) {
                var div = document.createElement("div");
                div.className = "contact-card";
                div.style.display = "flex";
                div.innerHTML = "\n          <div class=\"contact-card-content\">\n            <div>Name: ".concat(contact.name, "</div>\n            <div>Job: ").concat(contact.job, "</div>\n            <div>Phone: ").concat(contact.phone, "</div>\n          </div>\n          <div class=\"contact-actions\">\n            <button class=\"edit-button\" onclick=\"openEditModal('").concat(letter, "', '").concat(contact.id, "')\"><i class=\"fas fa-pen\"></i></button>\n            <button class=\"delete-button\" onclick=\"deleteContact('").concat(letter, "', '").concat(contact.id, "')\"><i class=\"fas fa-times\"></i></button>\n          </div>\n        ");
                output.appendChild(div);
            });
        });
    };
}
function openEditModal(letter, id) {
    var _a, _b;
    var contact = (_a = contacts[letter]) === null || _a === void 0 ? void 0 : _a.find(function (c) { return c.id === id; });
    if (!contact)
        return;
    editingContactId = id;
    var popup = document.querySelector(".edit-popup");
    popup.classList.add("active");
    var nameInput = popup.querySelector(".edit-popup__inputs__name");
    var jobInput = popup.querySelector(".edit-popup__inputs__job");
    var phoneInput = popup.querySelector(".edit-popup__inputs__phone");
    nameInput.value = contact.name;
    jobInput.value = contact.job;
    phoneInput.value = contact.phone;
    (_b = popup
        .querySelector(".edit-popup__inputs__submit")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", function () {
        var newName = nameInput.value.trim();
        var newJob = jobInput.value.trim();
        var newPhone = phoneInput.value.trim();
        if (!isValidContact(newName, newJob, newPhone))
            return;
        var newLetter = getLetter(newName);
        var contactIndex = contacts[letter].findIndex(function (c) { return c.id === id; });
        if (contactIndex !== -1) {
            contacts[letter].splice(contactIndex, 1);
            if (contacts[letter].length === 0)
                delete contacts[letter];
        }
        var updatedContact = {
            id: id,
            name: newName,
            job: newJob,
            phone: newPhone,
        };
        if (!contacts[newLetter])
            contacts[newLetter] = [];
        contacts[newLetter].push(updatedContact);
        saveContacts();
        renderAll();
        showNotification("Contact successfully changed!");
        var input = document.querySelector(".search-popup__input");
        if (input && input.oninput) {
            input.oninput(new Event("input"));
        }
        popup.classList.remove("active");
    });
}
function setupModalClose(modalSelector, closeSelector, bgSelector) {
    var modal = document.querySelector(modalSelector);
    var closeButton = modal.querySelector(closeSelector);
    var bgElement = modal.querySelector(bgSelector);
    if (modal && closeButton && bgElement) {
        closeButton.onclick = function () { return modal.classList.remove("active"); };
        bgElement.addEventListener("click", function () { return modal.classList.remove("active"); });
    }
}
document.querySelectorAll(".element__letter").forEach(function (el) {
    el.addEventListener("click", function () {
        return renderLetter(el.getAttribute("data-id"));
    });
});
document.querySelectorAll(".column__element").forEach(function (element) {
    element.addEventListener("click", function () {
        element.querySelectorAll(".contact-card").forEach(function (card) {
            var cardElement = card;
            cardElement.style.display =
                cardElement.style.display === "flex" ? "none" : "flex";
        });
    });
});
var searchButton = document.querySelector(".controls__button__open-search-modal");
if (searchButton) {
    searchButton.addEventListener("click", openSearchModal);
}
var phoneInput = document.getElementById("phone");
if (phoneInput) {
    phoneInput.addEventListener("focus", function () {
        formatPhoneNumber(phoneInput);
    });
    phoneInput.addEventListener("input", function (e) {
        var target = e.target;
        formatPhoneNumber(target);
    });
}
function formatPhoneNumber(target) {
    var value = target.value.replace(/[^\d+]/g, "");
    if (!value.startsWith("+")) {
        value = "+" + value.replace("+", "");
    }
    var raw = value.replace("+", "");
    var formatted = "+";
    if (raw.length > 0)
        formatted += raw.substring(0, 1);
    if (raw.length > 1)
        formatted += " " + raw.substring(1, 4);
    if (raw.length > 4)
        formatted += "-" + raw.substring(4, 7);
    if (raw.length > 7)
        formatted += "-" + raw.substring(7, 9);
    if (raw.length > 9)
        formatted += "-" + raw.substring(9, 11);
    target.value = formatted;
}
setupModalClose(".search-popup", ".search-popup__close", ".search-popup__bg");
setupModalClose(".edit-popup", ".edit-popup__close", ".edit-popup__bg");
renderAll();
