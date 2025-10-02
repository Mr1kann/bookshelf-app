document.addEventListener("DOMContentLoaded", function () {
  const books = [];
  const RENDERER = "render-book";
  const addForm = document.getElementById("bookForm");
  const searchForm = document.getElementById("searchBook");
  const SAVED_BOOKS = "saved-books";
  const STORAGE_KEY = "BOOK_SHELF";
  const searchInput = document.getElementById("searchBookTitle");
  const searchResultsContainer = document.getElementById("searchResults");

  addForm.addEventListener("submit", function (event) {
    event.preventDefault();
    addBook();
  });

  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    searchBook();
  });

  function generateId() {
    return +new Date();
  }

  function bookObj(id, title, author, year = Number, isComplete) {
    return {
      id,
      title,
      author,
      year,
      isComplete,
    };
  }

  function addBook() {
    const id = generateId();
    const title = document.getElementById("bookFormTitle").value;
    const author = document.getElementById("bookFormAuthor").value;
    const year = parseInt(document.getElementById("bookFormYear").value);
    const isComplete = document.getElementById("bookFormIsComplete").checked;

    const book = bookObj(id, title, author, year, isComplete);
    books.push(book);

    alert(`"${title}" berhasil ditambahkan!`);

    document.dispatchEvent(new Event(RENDERER));
    saveData();
  }

  document.addEventListener(RENDERER, function () {
    const incompleteBookList = document.getElementById("incompleteBookList");
    const completeBookList = document.getElementById("completeBookList");

    incompleteBookList.innerHTML = "";
    completeBookList.innerHTML = "";

    for (const book of books) {
      const bookElement = makeBook(book);
      if (book.isComplete) {
        completeBookList.append(bookElement);
      } else {
        incompleteBookList.append(bookElement);
      }
    }
  });

  function makeBook(bookObject) {
    const titleText = document.createElement("h3");
    titleText.textContent = bookObject.title;
    titleText.setAttribute("data-testid", "bookItemTitle");

    const authorText = document.createElement("p");
    authorText.textContent = `Penulis: ${bookObject.author}`;
    authorText.setAttribute("data-testid", "bookItemAuthor");

    const yearText = document.createElement("p");
    yearText.textContent = `Tahun: ${bookObject.year}`;
    yearText.setAttribute("data-testid", "bookItemYear");

    const textContainer = document.createElement("div");
    textContainer.append(titleText, authorText, yearText);

    const buttonContainer = document.createElement("div");

    const deleteButton = document.createElement("button");
    deleteButton.textContent = "Hapus Buku";
    deleteButton.setAttribute("data-testid", "bookItemDeleteButton");

    deleteButton.addEventListener("click", function () {
      removeBook(bookObject.id);
    });

    const toggleButton = document.createElement("button");
    toggleButton.setAttribute("data-testid", "bookItemIsCompleteButton");
    if (bookObject.isComplete) {
      toggleButton.textContent = "Belum selesai dibaca";
      toggleButton.addEventListener("click", function () {
        addToUncompleted(bookObject.id);
      });
    } else {
      toggleButton.textContent = "Selesai dibaca";
      toggleButton.addEventListener("click", function () {
        addToComplete(bookObject.id);
      });
    }

    function findBook(bookId) {
      for (const booksItem of books) {
        if (booksItem.id === bookId) {
          return booksItem;
        }
      }
      return null;
    }

    function findBookIndex(bookId) {
      for (let i = 0; i < books.length; i++) {
        if (books[i].id === bookId) {
          return i;
        }
      }
      return -1;
    }

    function addToUncompleted(bookId) {
      const bookTarget = findBook(bookId);

      if (bookTarget === null) {
        return;
      }

      bookTarget.isComplete = false;
      alert(
        `"${bookTarget.title}" dipindahkan ke daftar belum selesai dibaca!`
      );
      document.dispatchEvent(new Event(RENDERER));
      saveData();
    }

    function addToComplete(bookId) {
      const bookTarget = findBook(bookId);

      if (bookTarget === null) {
        return;
      }

      bookTarget.isComplete = true;
      alert(`"${bookTarget.title}" dipindahkan ke daftar selesai dibaca!`);
      document.dispatchEvent(new Event(RENDERER));
      saveData();
    }

    function removeBook(bookId) {
      const bookTargetIndex = findBookIndex(bookId);

      if (bookTargetIndex === -1) return;

      const removedBook = books[bookTargetIndex];
      alert(`"${removedBook.title}" berhasil dihapus!`);

      books.splice(bookTargetIndex, 1);
      document.dispatchEvent(new Event(RENDERER));
      saveData();
    }

    buttonContainer.append(toggleButton, deleteButton);

    const container = document.createElement("div");
    container.setAttribute("data-bookid", bookObject.id);
    container.setAttribute("data-testid", "bookItem");
    container.classList.add("bookCard");
    container.append(textContainer, buttonContainer);

    return container;
  }

  function isStorageExist() {
    if (typeof Storage === undefined) {
      alert("Browser Tidak mendukung Local Storage");
      return false;
    }
    return true;
  }

  function saveData() {
    if (isStorageExist()) {
      const parsed = JSON.stringify(books);
      localStorage.setItem(STORAGE_KEY, parsed);
      document.dispatchEvent(new Event(SAVED_BOOKS));
    }
  }

  function loadBookFromStorage() {
    const serializedBook = localStorage.getItem(STORAGE_KEY);
    let booksData = JSON.parse(serializedBook);

    if (booksData !== null) {
      for (const book of booksData) {
        books.push(book);
      }
    }

    document.dispatchEvent(new Event(RENDERER));
  }

  if (isStorageExist()) {
    loadBookFromStorage();
  }

  document.addEventListener(SAVED_BOOKS, function (event) {
    console.log(localStorage.getItem(STORAGE_KEY));
  });

  function searchBook() {
    const query = searchInput.value.toLowerCase();

    const searchResults = books.filter((book) =>
      book.title.toLowerCase().includes(query)
    );

    renderSearchResults(searchResults);
  }

  function renderSearchResults(results) {
    searchResultsContainer.innerHTML = "";

    if (results.length === 0) {
      const noResultsMessage = document.createElement("p");
      noResultsMessage.textContent = "Tidak ada buku yang ditemukan.";
      searchResultsContainer.append(noResultsMessage);
      return;
    }

    for (const book of results) {
      const bookElement = makeBook(book);
      searchResultsContainer.append(bookElement);
    }
  }
});
