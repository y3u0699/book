let currentRole = '';
    let editingBookId = null;
    let currentView = 'grid';
    let totalBooks = 0;

    function switchView(view) {
      currentView = view;
      document.getElementById('btn-grid').classList.toggle('active', view === 'grid');
      document.getElementById('btn-list').classList.toggle('active', view === 'list');
      document.getElementById('book-grid').style.display = view === 'grid' ? 'grid' : 'none';
      document.getElementById('book-list').style.display = view === 'list' ? 'block' : 'none';
    }

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
      const adminSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C9C9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="9" r="3.5"/>
        <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7"/>
        <path d="M8 6.5c0 0 1-2.5 4-2.5s4 2.5 4 2.5" stroke-linecap="round"/>
        <path d="M7.5 6.5h9" stroke-linecap="round" stroke-width="2"/>
      </svg>`;
      const userSVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F5C9C9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="8" r="4"/>
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
      </svg>`;
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
        { bookId: 1, title: 'Software Engineering', author: 'Ian Sommerville', publisher: 'Pearson', isbn: '9780137035151', price: 850, coverUrl: 'https://covers.openlibrary.org/b/isbn/9780137035151-M.jpg', createdAt: '2026-06-11T10:00:00', updatedAt: '2026-06-11T10:00:00' }
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
      document.getElementById('book-grid').style.display = show ? 'none' : 'grid';
      document.getElementById('book-list').style.display = 'none';
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
      if (currentRole === 'ADMIN') thActions.style.display = '';
      books.forEach(function(book) {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${book.title}</td>
          <td>${book.author}</td>
          <td>${book.publisher}</td>
          <td>${book.isbn}</td>
          <td>NT$ ${book.price}</td>
          ${currentRole === 'ADMIN' ? `
          <td><div class="td-actions">
            <button class="edit-btn" onclick="openEditModal(${book.bookId})" title="修改">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            </button>
            <button class="delete-btn" onclick="handleDelete(${book.bookId})" title="刪除">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            </button>
          </div></td>` : ''}
        `;
        tbody.appendChild(tr);
      });

      books.forEach(function(book) {
        const card = document.createElement('div');
        card.className = 'book-card';
        card.innerHTML = `
          <div class="book-content">
            <div style="display:flex;gap:16px;">
              <div style="flex:1;display:flex;flex-direction:column;gap:6px;min-width:0;">
                <div class="book-title" title="${book.title}">${book.title}</div>
                <div class="book-author">${book.author}</div>
                <div class="book-info">
                  出版社：${book.publisher}<br>
                  ISBN：${book.isbn}<br>
                  建立時間：${formatDate(book.createdAt)}<br>
                  更新時間：${formatDate(book.updatedAt)}
                </div>
                <div class="book-price">NT$ ${book.price}</div>
              </div>
              <div class="book-cover">
                ${book.coverUrl
                  ? `<img src="${book.coverUrl}" alt="書封面">`
                  : `<svg width="32" height="32" viewBox="0 0 52 52" fill="none">
                      <rect x="8" y="6" width="24" height="32" rx="2" stroke="#8B1A1A" stroke-width="2"/>
                      <line x1="8" y1="12" x2="32" y2="12" stroke="#8B1A1A" stroke-width="1.5"/>
                      <rect x="16" y="10" width="24" height="32" rx="2" stroke="#8B1A1A" stroke-width="2" fill="#F5F0E8"/>
                      <line x1="16" y1="16" x2="40" y2="16" stroke="#8B1A1A" stroke-width="1.5"/>
                      <line x1="21" y1="22" x2="35" y2="22" stroke="#8B1A1A" stroke-width="1.5" stroke-linecap="round"/>
                      <line x1="21" y1="27" x2="35" y2="27" stroke="#8B1A1A" stroke-width="1.5" stroke-linecap="round"/>
                      <line x1="21" y1="32" x2="29" y2="32" stroke="#8B1A1A" stroke-width="1.5" stroke-linecap="round"/>
                    </svg>`
                }
              </div>
            </div>
            ${currentRole === 'ADMIN' ? `
            <div class="book-actions-hover">
              <button class="edit-btn" onclick="openEditModal(${book.bookId})" title="修改">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              </button>
              <button class="delete-btn" onclick="handleDelete(${book.bookId})" title="刪除">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
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
      ['f-title','f-author','f-publisher','f-isbn','f-price'].forEach(function(id) {
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
      if (!title)     return showModalError('書名不可為空');
      if (!author)    return showModalError('作者不可為空');
      if (!publisher) return showModalError('出版社不可為空');
      if (!isbn)      return showModalError('ISBN 不可為空');
      if (price === '' || Number(price) < 0) return showModalError('價格不可小於 0');

      const body = { title, author, publisher, isbn, price: Number(price) };

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