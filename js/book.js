let currentRole = '';
    let editingBookId = null;
    let currentView = 'list';
    let totalBooks = 0;

    function switchView(view) {
      currentView = view;
      document.getElementById('btn-grid').classList.toggle('active', view === 'grid');
      document.getElementById('btn-list').classList.toggle('active', view === 'list');
      document.getElementById('book-grid').style.display = view === 'grid' ? 'grid' : 'none';
      document.getElementById('book-list').style.display = view === 'list' ? 'block' : 'none';
    }

    // 預設切換到清單模式
    window.addEventListener('load', function() {
      document.getElementById('btn-grid').classList.remove('active');
      document.getElementById('btn-list').classList.add('active');
    });

    // 頁面載入時初始化
    window.onload = function() {
      let role = sessionStorage.getItem('role');
      let username = sessionStorage.getItem('username');

      // 未登入則跳回登入頁
      if (!role) {
        window.location.href = 'login.html';
        return;
      }

      currentRole = role;
      document.getElementById('header-username').textContent = username;
      document.getElementById('dropdown-username').textContent = username;

      // 根據角色切換圖示
      const adminSVG = `<i id="user-icon" class="fa-solid fa-user-shield" style="font-size:15px;color:#F5C9C9;"></i>`;
      const userSVG = `<i id="user-icon" class="fa-solid fa-user" style="font-size:15px;color:#F5C9C9;"></i>`;
      document.getElementById('user-icon').outerHTML = role === 'ADMIN' ? adminSVG : userSVG;

      // ADMIN 才顯示新增按鈕
      if (role === 'ADMIN') {
        document.getElementById('add-btn').style.display = 'block';
      }

      loadBooks();
    };

    // 載入書籍列表
    function loadBooks(keyword) {
      showLoading(true);

      // ↓ 預覽用假資料，之後要拿掉
      const fakeBooks = [
        { bookId: 1, title: 'Software Engineering', author: 'Ian Sommerville', publisher: 'Pearson', isbn: '9780137035151', price: 850, bookUrl: 'https://www.pearson.com', createdAt: '2026-06-11T10:00:00', updatedAt: '2026-06-11T10:00:00' }
      ];
      const filtered = keyword ? fakeBooks.filter(b => b.title.includes(keyword) || b.author.includes(keyword) || b.publisher.includes(keyword) || b.isbn.includes(keyword)) : fakeBooks;
      setTimeout(function() { showLoading(false); renderBooks(filtered); }, 1000);
      return;
      // ↑ 預覽用假資料，之後要拿掉

      let url = 'http://localhost:8080/api/books';
      if (keyword) url += '?keyword=' + encodeURIComponent(keyword);

      fetch(url)
        .then(function(res) { return res.json(); })
        .then(function(data) { showLoading(false); renderBooks(data); })
        .catch(function() { showLoading(false); renderBooks([]); });
    }

    // 顯示或隱藏載入動畫
    function showLoading(show) {
      document.getElementById('loading-overlay').classList.toggle('show', show);
      if (!show) {
        if (currentView === 'grid') {
          document.getElementById('book-grid').style.display = 'grid';
          document.getElementById('book-list').style.display = 'none';
        } else {
          document.getElementById('book-grid').style.display = 'none';
          document.getElementById('book-list').style.display = 'block';
        }
      } else {
        document.getElementById('book-grid').style.display = 'none';
        document.getElementById('book-list').style.display = 'none';
      }
      if (show) document.getElementById('empty-state').style.display = 'none';
    }

    // 渲染書籍卡片
    function renderBooks(books) {
      const grid = document.getElementById('book-grid');
      const empty = document.getElementById('empty-state');
      grid.innerHTML = '';

      if (books.length === 0) {
        const keyword = document.getElementById('search-input').value.trim();
        empty.textContent = (keyword && totalBooks > 0) ? '查無符合條件的書籍' : '目前書庫尚未上架任何書籍';
        empty.style.display = 'block';
        return;
      }

      totalBooks = books.length;

      empty.style.display = 'none';

      // 清單模式渲染
      const tbody = document.getElementById('book-table-body');
      const thActions = document.getElementById('th-actions');
      tbody.innerHTML = '';
      thActions.style.display = '';
      thActions.textContent = currentRole === 'ADMIN' ? '操作' : '連結';
      books.forEach(function(book) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher}</td>
          <td>${book.isbn}</td>
          <td>NT$ ${book.price}</td>
          <td><div class="td-actions">
            <button class="link-btn" onclick="${book.bookUrl ? `window.open('${book.bookUrl}', '_blank')` : `alert('此書籍尚無連結')`}" title="開啟連結">
              <i class="fa-solid fa-arrow-up-right-from-square"></i>
            </button>
            ${currentRole === 'ADMIN' ? `
            <button class="edit-btn" onclick="openEditModal(${book.bookId})" title="修改">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="delete-btn" onclick="handleDelete(${book.bookId})" title="刪除">
              <i class="fa-solid fa-trash-can"></i>
            </button>` : ''}
          </div></td>
        `;
        tbody.appendChild(tr);
      });

      books.forEach(function(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
          <div class="book-content">
            <div style="display:flex;flex-direction:column;gap:6px;">
                <div class="book-title" title="${book.title}"
                  style="${book.bookUrl ? 'cursor:pointer;text-decoration:underline;' : 'cursor:default;'}"
                  onclick="${book.bookUrl ? `window.open('${book.bookUrl}', '_blank')` : `alert('此書籍尚無連結')`}"
                >${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-info">
                  出版社：${book.publisher}<br>
                  ISBN：${book.isbn}<br>
                  建立時間：${formatDate(book.createdAt)}<br>
                  更新時間：${formatDate(book.updatedAt)}
                </div>
                <div class="book-price">NT$ ${book.price}</div>
              </div>
            </div>
            ${currentRole === 'ADMIN' ? `
            <div class="book-actions-hover">
              <button class="edit-btn" onclick="openEditModal(${book.bookId})" title="修改">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="delete-btn" onclick="handleDelete(${book.bookId})" title="刪除">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>` : ''}
          </div>
        `;
        grid.appendChild(card);
      });
    }

    // 日期格式化
    function formatDate(dateStr) {
      if (!dateStr) return '-';
      return dateStr.replace('T', ' ').substring(0, 16);
    }

    // 下拉選單開關
    function toggleDropdown() {
      const menu = document.getElementById('dropdown-menu');
      const toggle = document.getElementById('user-toggle');
      menu.classList.toggle('show');
      toggle.classList.toggle('open');
    }

    // 點擊其他地方關閉選單
    document.addEventListener('click', function(e) {
      const dropdown = document.querySelector('.user-dropdown');
      if (dropdown && !dropdown.contains(e.target)) {
        document.getElementById('dropdown-menu').classList.remove('show');
        document.getElementById('user-toggle').classList.remove('open');
      }
    });

    // 輸入時控制 ✕ 顯示
    function handleSearchInput() {
      const val = document.getElementById('search-input').value;
      const btn = document.getElementById('clear-btn');
      btn.style.display = val ? 'flex' : 'none';
    }

    // 清除搜尋
    function clearSearch() {
      document.getElementById('search-input').value = '';
      document.getElementById('clear-btn').style.display = 'none';
    }

    // 搜尋
    function handleSearch() {
      const keyword = document.getElementById('search-input').value.trim();
      loadBooks(keyword);
    }

    // 按 Enter 搜尋
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleSearch();
    });

    // 開啟新增 Modal
    function openAddModal() {
      editingBookId = null;
      document.getElementById('modal-title').textContent = '新增書籍';
      clearForm();
      document.getElementById('modal-overlay').classList.add('show');
    }

    // 開啟修改 Modal
    function openEditModal(bookId) {
      editingBookId = bookId;
      document.getElementById('modal-title').textContent = '修改書籍';
      clearForm();

      fetch('http://localhost:8080/api/books/' + bookId)
        .then(function(res) { return res.json(); })
        .then(function(book) {
          document.getElementById('f-title').value = book.title;
          document.getElementById('f-author').value = book.author;
          document.getElementById('f-publisher').value = book.publisher;
          document.getElementById('f-isbn').value = book.isbn;
          document.getElementById('f-price').value = book.price;
          document.getElementById('f-url').value = book.bookUrl || '';
          document.getElementById('modal-overlay').classList.add('show');
        });
    }

    // 關閉 Modal
    function closeModal() {
      document.getElementById('modal-overlay').classList.remove('show');
      clearForm();
    }

    // 清空表單
    function clearForm() {
      ['f-title','f-author','f-publisher','f-isbn','f-price','f-url'].forEach(function(id) {
        document.getElementById(id).value = '';
      });
      document.getElementById('modal-error').classList.remove('show');
    }

    // 表單送出（新增或修改）
    function handleSubmit() {
      const title     = document.getElementById('f-title').value.trim();
      const author    = document.getElementById('f-author').value.trim();
      const publisher = document.getElementById('f-publisher').value.trim();
      const isbn      = document.getElementById('f-isbn').value.trim();
      const price     = document.getElementById('f-price').value;

      // 前端驗證
      const bookUrl = document.getElementById('f-url').value.trim();

      if (!title)     return showModalError('書名不可為空');
      if (!author)    return showModalError('作者不可為空');
      if (!publisher) return showModalError('出版社不可為空');
      if (!isbn)      return showModalError('ISBN 不可為空');
      if (price === '' || Number(price) < 0) return showModalError('價格不可小於 0');
      const body = { title, author, publisher, isbn, price: Number(price), bookUrl };

      const url    = editingBookId
        ? 'http://localhost:8080/api/books/' + editingBookId
        : 'http://localhost:8080/api/books';
      const method = editingBookId ? 'PUT' : 'POST';

      fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      .then(function(res) {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(function() {
        closeModal();
        loadBooks();
      })
      .catch(function() {
        showModalError('系統發生錯誤，請稍後再試');
      });
    }

    let deletingBookId = null;

    // 開啟刪除確認視窗
    function handleDelete(bookId) {
      deletingBookId = bookId;
      document.getElementById('confirm-overlay').classList.add('show');
    }

    // 關閉刪除確認視窗
    function closeConfirm() {
      deletingBookId = null;
      document.getElementById('confirm-overlay').classList.remove('show');
    }

    // 確認刪除
    function confirmDelete() {
      if (!deletingBookId) return;
      fetch('http://localhost:8080/api/books/' + deletingBookId, { method: 'DELETE' })
        .then(function(res) {
          if (!res.ok) throw new Error();
          closeConfirm();
          loadBooks();
        })
        .catch(function() {
          closeConfirm();
          alert('刪除失敗，請稍後再試');
        });
    }

    // 顯示 Modal 錯誤訊息
    function showModalError(msg) {
      const el = document.getElementById('modal-error');
      el.textContent = msg;
      el.classList.add('show');
    }

    // 登出
    function handleLogout() {
      fetch('http://localhost:8080/api/auth/logout', { method: 'POST' })
        .finally(function() {
          sessionStorage.clear();
          window.location.href = 'login.html';
        });
    }