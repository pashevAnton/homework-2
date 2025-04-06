type Contact = {
  name: string;
  job: string;
  phone: string;
  id: string;
};

type Contacts = {
  [letter: string]: Contact[];
};
const contactStorageKey: string = "contactList";

let contacts = loadContacts();
let editingContactId = null;

function saveContacts() {
  localStorage.setItem(contactStorageKey, JSON.stringify(contacts));
}

function loadContacts() {
  const saved = localStorage.getItem(contactStorageKey);
  return saved ? JSON.parse(saved) : {};
}

function getLetter(name: string) {
  return name[0].toLowerCase();
}

function generateId() {
  return Date.now().toString();
}

function clearInputFields(): void {
  const nameInput = document.getElementById("name") as HTMLInputElement | null;
  const jobInput = document.getElementById("job") as HTMLInputElement | null;
  const phoneInput = document.getElementById(
    "phone"
  ) as HTMLInputElement | null;

  if (nameInput) nameInput.value = "";
  if (jobInput) jobInput.value = "";
  if (phoneInput) phoneInput.value = "";
}

function showNotification(
  message: string,
  type: "success" | "error" = "success"
): void {
  const notification = document.getElementById(
    "notification"
  ) as HTMLElement | null;
  const messageSpan = document.getElementById(
    "notification-message"
  ) as HTMLElement | null;

  if (notification && messageSpan) {
    messageSpan.textContent = message;
    notification.classList.remove("hidden");
    notification.style.backgroundColor =
      type === "error" ? "#f44336" : "#4CAF50";

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
}

function isValidContact(name: string, job: string, phone: string): boolean {

  if (!name.trim() || !job.trim() || !phone.trim()) {
    showNotification("All fields must be filled!", "error");
    return false;
  }

  const nameJobRegex = /^[A-Za-z\s]+$/;
  if (!nameJobRegex.test(name)) {
    showNotification(
      "Name must contain only English letters and spaces",
      "error"
    );
    return false;
  }
  if (!nameJobRegex.test(job)) {
    showNotification(
      "Job must contain only English letters and spaces",
      "error"
    );
    return false;
  }

  const phoneRegex = /^\+\d{1} \d{3}-\d{3}-\d{2}-\d{2}$/;
  if (!phoneRegex.test(phone)) {
    showNotification("Phone format must be +X XXX-XXX-XX-XX", "error");
    return false;
  }

  return true;
}

function isDuplicateContact(
  name: string,
  phone: string,
  contacts: Contacts
): boolean {
  return Object.values(contacts).some((letterGroup) =>
    letterGroup.some(
      (contact) =>
        contact.name.toLowerCase() === name.toLowerCase() &&
        contact.phone === phone
    )
  );
}

function renderLetter(letter: string): void {
  const container = document.querySelector(
    `.element__letter[data-id="${letter}"]`
  ) as HTMLElement;
  const parent = container.parentElement as HTMLElement;

  parent.querySelectorAll(".contact-card").forEach((el) => el.remove());

  if (contacts[letter]) {
    contacts[letter].forEach((contact: Contact) => {
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
    container.textContent = `${letter.toUpperCase()} (${
      contacts[letter].length
    })`;
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
  const name = (
    document.getElementById("name") as HTMLInputElement
  ).value.trim();
  const job = (document.getElementById("job") as HTMLInputElement).value.trim();
  const phone = (
    document.getElementById("phone") as HTMLInputElement
  ).value.trim();

  if (!isValidContact(name, job, phone)) return;
  const isDuplicate = isDuplicateContact(name, phone, contacts);
  if (isDuplicate) {
    showNotification(
      "Contact with the same name and phone already exists",
      "error"
    );
    return;
  }

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

function deleteContact(letter: string, id: string): void {
  contacts[letter] = contacts[letter].filter((c: any) => c.id !== id);

  if (contacts[letter].length === 0) delete contacts[letter];

  saveContacts();

  const header = document.querySelector(`[data-id="${letter}"]`) as HTMLElement;
  if (header) {
    const count = contacts[letter] ? contacts[letter].length : 0;
    header.textContent =
      count > 0
        ? `${letter.toUpperCase()} (${count})`
        : `${letter.toUpperCase()}`;
  }

  const input = document.querySelector(
    ".search-popup__input"
  ) as HTMLInputElement;
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
  const popup = document.querySelector(".search-popup") as HTMLElement;
  const input = popup.querySelector(".search-popup__input") as HTMLInputElement;
  const output = popup.querySelector(".search-popup__output") as HTMLElement;

  popup.classList.add("active");
  input.value = "";
  output.innerHTML = "";

  input.oninput = () => {
    const query = input.value.trim().toLowerCase();
    output.innerHTML = "";
    if (!query) return;

    Object.keys(contacts).forEach((letter) => {
      contacts[letter].forEach((contact: Contact) => {
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

  const showAllButton = popup.querySelector(
    ".search-popup__show-all"
  ) as HTMLElement;
  showAllButton.onclick = () => {
    input.value = "";
    output.innerHTML = "";

    Object.keys(contacts).forEach((letter) => {
      contacts[letter].forEach((contact: Contact) => {
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

function openEditModal(letter: string, id: string): void {
  const contact = contacts[letter]?.find((c: any) => c.id === id);
  if (!contact) return;

  editingContactId = id;

  const popup = document.querySelector(".edit-popup") as HTMLElement;
  popup.classList.add("active");

  const nameInput = popup.querySelector(
    ".edit-popup__inputs__name"
  ) as HTMLInputElement;
  const jobInput = popup.querySelector(
    ".edit-popup__inputs__job"
  ) as HTMLInputElement;
  const phoneInput = popup.querySelector(
    ".edit-popup__inputs__phone"
  ) as HTMLInputElement;

  nameInput.value = contact.name;
  jobInput.value = contact.job;
  phoneInput.value = contact.phone;

  popup
    .querySelector(".edit-popup__inputs__submit")
    ?.addEventListener("click", () => {
      const newName = nameInput.value.trim();
      const newJob = jobInput.value.trim();
      const newPhone = phoneInput.value.trim();

      if (!isValidContact(newName, newJob, newPhone)) return;

      const newLetter = getLetter(newName);

      const contactIndex = contacts[letter].findIndex((c: any) => c.id === id);
      if (contactIndex !== -1) {
        contacts[letter].splice(contactIndex, 1);
        if (contacts[letter].length === 0) delete contacts[letter];
      }

      const updatedContact: Contact = {
        id,
        name: newName,
        job: newJob,
        phone: newPhone,
      };
      if (!contacts[newLetter]) contacts[newLetter] = [];
      contacts[newLetter].push(updatedContact);

      saveContacts();
      renderAll();
      showNotification(`Contact successfully changed!`);

      const input = document.querySelector(
        ".search-popup__input"
      ) as HTMLInputElement;
      if (input && input.oninput) {
        input.oninput(new Event("input"));
      }

      popup.classList.remove("active");
    });
}

function setupModalClose(
  modalSelector: string,
  closeSelector: string,
  bgSelector: string
): void {
  const modal = document.querySelector(modalSelector) as HTMLElement;
  const closeButton = modal.querySelector(closeSelector) as HTMLElement;
  const bgElement = modal.querySelector(bgSelector) as HTMLElement;

  if (modal && closeButton && bgElement) {
    closeButton.onclick = () => modal.classList.remove("active");
    bgElement.addEventListener("click", () => modal.classList.remove("active"));
  }
}

document.querySelectorAll(".element__letter").forEach((el: Element) => {
  el.addEventListener("click", () =>
    renderLetter(el.getAttribute("data-id") as string)
  );
});

document.querySelectorAll(".column__element").forEach((element: Element) => {
  element.addEventListener("click", () => {
    element.querySelectorAll(".contact-card").forEach((card: Element) => {
      const cardElement = card as HTMLElement;
      cardElement.style.display =
        cardElement.style.display === "flex" ? "none" : "flex";
    });
  });
});

const searchButton = document.querySelector(
  ".controls__button__open-search-modal"
) as HTMLElement;
if (searchButton) {
  searchButton.addEventListener("click", openSearchModal);
}

const phoneInput = document.getElementById(
  "phone"
) as HTMLInputElement | null;

if (phoneInput) {
  phoneInput.addEventListener("focus", function () {
    formatPhoneNumber(phoneInput);
  });

  phoneInput.addEventListener("input", function (e) {
    const target = e.target as HTMLInputElement;
    formatPhoneNumber(target);
  });
}

function formatPhoneNumber(target: HTMLInputElement) {
  let value = target.value.replace(/[^\d+]/g, "");

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

  target.value = formatted;
}

setupModalClose(".search-popup", ".search-popup__close", ".search-popup__bg");
setupModalClose(".edit-popup", ".edit-popup__close", ".edit-popup__bg");

renderAll();
