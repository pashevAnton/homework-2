const contactStorageKey = "contactList";

let contacts = loadContacts();
let editingContactId = null;

function saveContacts() {
  localStorage.setItem(contactStorageKey, JSON.stringify(contacts));
}

function loadContacts() {
  const saved = localStorage.getItem(contactStorageKey);
  return saved ? JSON.parse(saved) : {};
}

function getLetter(name) {
  return name[0].toLowerCase();
}

function generateId() {
  return Date.now().toString();
}

function clearInputFields() {
  document.getElementById("name").value = "";
  document.getElementById("job").value = "";
  document.getElementById("phone").value = "";
}

function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  const messageSpan = document.getElementById("notification-message");

  messageSpan.textContent = message;
  notification.classList.remove("hidden");
  notification.style.backgroundColor = type === "error" ? "#f44336" : "#4CAF50";

  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.classList.add("hidden");
    }, 300);
  }, 3000);
}

function isValidContact(name, job, phone) {

  document.getElementById("phone").addEventListener("input", function (e) {
    let value = e.target.value.replace(/[^\d+]/g, "");
  
    if (!value.startsWith("+")) {
      value = "+" + value.replace("+", "");
    }
  
    const raw = value.replace("+", "");
  
    let formatted = "+";
  
    if (raw.length > 0) formatted += raw.substring(0, 1);
    if (raw.length > 1) formatted += " " + raw.substring(1, 4);
    if (raw.length > 4) formatted += "-" + raw.substring(4, 7);
    if (raw.length > 7) formatted += "-" + raw.substring(7, 9);
    if (raw.length > 9) formatted += "-" + raw.substring(9, 11);
  
    e.target.value = formatted;
  });

  if (!name.trim() || !job.trim() || !phone.trim()) {
    showNotification("All fields must be filled!", "error");
    return false;
  }

  const nameJobRegex = /^[A-Za-z\s]+$/;
  if (!nameJobRegex.test(name)) {
    showNotification("Name must contain only English letters and spaces", "error");
    return false;
  }
  if (!nameJobRegex.test(job)) {
    showNotification("Job must contain only English letters and spaces", "error");
    return false;
  }

  const phoneRegex = /^\+\d{1} \d{3}-\d{3}-\d{2}-\d{2}$/;
  if (!phoneRegex.test(phone)) {
    showNotification("Phone format must be +X XXX-XXX-XX-XX", "error");
    return false;
  }

  const duplicate = Object.values(contacts).some(letterGroup =>
    letterGroup.some(contact =>
      contact.name.toLowerCase() === name.toLowerCase() &&
      contact.phone === phone
    )
  );

  if (duplicate) {
    showNotification("Contact with the same name and phone already exists", "error");
    return false;
  }

  return true;
}

function renderLetter(letter) {
  const container = document.querySelector(`.element__letter[data-id="${letter}"]`);
  const parent = container.parentElement;

  parent.querySelectorAll(".contact-card").forEach((el) => el.remove());

  if (contacts[letter]) {
    contacts[letter].forEach((contact) => {
      const card = document.createElement("div");
      card.className = "contact-card";
      card.innerHTML = `
        <div class="contact-card-content">
          <div>Name: ${contact.name}</div>
          <div>Job: ${contact.job}</div>
          <div>Contact: ${contact.phone}</div>
        </div>
        <div class="contact-action">
          <button class="delete-button" onclick="deleteContact('${letter}', '${contact.id}')"><i class="fas fa-times"></i></button>
        </div>
      `;
      parent.appendChild(card);
    });
    container.textContent = `${letter.toUpperCase()} (${contacts[letter].length})`;
  } else {
    container.textContent = letter.toUpperCase();
  }
}

function renderAll() {
  for (let i = 97; i <= 122; i++) {
    renderLetter(String.fromCharCode(i));
  }
}

function saveContact() {
  const name = document.getElementById("name").value.trim();
  const job = document.getElementById("job").value.trim();
  const phone = document.getElementById("phone").value.trim();

  if (!isValidContact(name, job, phone)) return;

  const letter = getLetter(name);
  const id = generateId();
  const newContact = { id, name, job, phone };

  if (!contacts[letter]) contacts[letter] = [];
  contacts[letter].push(newContact);

  saveContacts();
  renderLetter(letter);
  clearInputFields();
  showNotification(`Contact ${name} successfully added!`);
}

function deleteContact(letter, id) {
  contacts[letter] = contacts[letter].filter((c) => c.id !== id);
  if (contacts[letter].length === 0) delete contacts[letter];
  
  saveContacts();

  const header = document.querySelector(`[data-id="${letter}"]`);
  if (header) {
    const count = contacts[letter] ? contacts[letter].length : 0;
    header.textContent = count > 0
      ? `${letter.toUpperCase()} (${count})`
      : `${letter.toUpperCase()}`;
  }
  const input = document.querySelector(".search-popup__input");
  input.oninput();
  showNotification("Contact successfully deleted!");
}

function clearContacts() {
  contacts = {};
  saveContacts();
  renderAll();
  showNotification("You have deleted all contacts!");
}

function openSearchModal() {
  const popup = document.querySelector(".search-popup");
  const input = popup.querySelector(".search-popup__input");
  const output = popup.querySelector(".search-popup__output");

  popup.classList.add("active");
  input.value = "";
  output.innerHTML = "";

  input.oninput = () => {
    const query = input.value.trim().toLowerCase();
    output.innerHTML = "";
    if (!query) return;
  
    Object.keys(contacts).forEach((letter) => {
      contacts[letter].forEach((contact) => {
        if (contact.name.toLowerCase().startsWith(query)) {
          const div = document.createElement("div");
          div.className = "contact-card";
          div.style.display = "flex";
          div.innerHTML = `
            <div class="contact-card-content">
              <div>Name: ${contact.name}</div>
              <div>Job: ${contact.job}</div>
              <div>Phone: ${contact.phone}</div>
            </div>
            <div class="contact-actions">
              <button class="edit-button" onclick="openEditModal('${letter}', '${contact.id}')"><i class="fas fa-pen"></i></button>
              <button class="delete-button" onclick="deleteContact('${letter}', '${contact.id}')"><i class="fas fa-times"></i></button>
            </div>
          `;
          output.appendChild(div);
        }
      });
    });
  };
  

  popup.querySelector(".search-popup__show-all").onclick = () => {
    input.value = "";
    output.innerHTML = "";
  
    Object.keys(contacts).forEach((letter) => {
      contacts[letter].forEach((contact) => {
        const div = document.createElement("div");
        div.className = "contact-card";
        div.style.display = "flex";
        div.innerHTML = `
          <div class="contact-card-content">
            <div>Name: ${contact.name}</div>
            <div>Job: ${contact.job}</div>
            <div>Phone: ${contact.phone}</div>
          </div>
          <div class="contact-actions">
            <button class="edit-button" onclick="openEditModal('${letter}', '${contact.id}')"><i class="fas fa-pen"></i></button>
            <button class="delete-button" onclick="deleteContact('${letter}', '${contact.id}')"><i class="fas fa-times"></i></button>
          </div>
        `;
        output.appendChild(div);
      });
    });
  };
}

function openEditModal(letter, id) {
  const contact = contacts[letter].find((c) => c.id === id);
  if (!contact) return;

  editingContactId = id;

  const popup = document.querySelector(".edit-popup");
  popup.classList.add("active");

  const nameInput = popup.querySelector(".edit-popup__inputs__name");
  const jobInput = popup.querySelector(".edit-popup__inputs__job");
  const phoneInput = popup.querySelector(".edit-popup__inputs__phone");

  nameInput.value = contact.name;
  jobInput.value = contact.job;
  phoneInput.value = contact.phone;

  popup.querySelector(".edit-popup__inputs__submit").onclick = () => {
    const newName = nameInput.value.trim();
    const newJob = jobInput.value.trim();
    const newPhone = phoneInput.value.trim();

    if (!isValidContact(newName, newJob, newPhone)) return;

    const newLetter = getLetter(newName);

    const contactIndex = contacts[letter].findIndex((c) => c.id === id);
    if (contactIndex !== -1) {
      contacts[letter].splice(contactIndex, 1);
      if (contacts[letter].length === 0) delete contacts[letter];
    }

    const updatedContact = { id, name: newName, job: newJob, phone: newPhone };
    if (!contacts[newLetter]) contacts[newLetter] = [];
    contacts[newLetter].push(updatedContact);

    saveContacts();
    renderAll();
    showNotification(`Contact successfully changed!`);

    const input = document.querySelector(".search-popup__input");
    if (input && input.oninput) input.oninput();

    popup.classList.remove("active");
  };
}

function setupModalClose(modalSelector, closeSelector, bgSelector) {
  const modal = document.querySelector(modalSelector);
  modal.querySelector(closeSelector).onclick = () => modal.classList.remove("active");
  modal.querySelector(bgSelector).addEventListener("click", () => modal.classList.remove("active"));
}

document.querySelectorAll(".element__letter").forEach((el) => {
  el.addEventListener("click", () => renderLetter(el.getAttribute("data-id")));
});

document.querySelectorAll(".column__element").forEach((element) => {
  element.addEventListener("click", () => {
    element.querySelectorAll(".contact-card").forEach((card) => {
      card.style.display = card.style.display === "flex" ? "none" : "flex";
    });
  });
});

document.querySelector(".controls__button__open-search-modal").addEventListener("click", openSearchModal);

setupModalClose(".search-popup", ".search-popup__close", ".search-popup__bg");
setupModalClose(".edit-popup", ".edit-popup__close", ".edit-popup__bg");

renderAll();
