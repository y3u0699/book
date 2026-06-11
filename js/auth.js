const eyeOpen = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const eyeClosed = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;

    document.getElementById('toggle-btn').innerHTML = eyeClosed;

    function togglePassword() {
      const input = document.getElementById('password');
      const btn = document.getElementById('toggle-btn');
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = eyeOpen;
      } else {
        input.type = 'password';
        btn.innerHTML = eyeClosed;
      }
    }

    
    document.getElementById('username').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') document.getElementById('password').focus();
    });

    document.getElementById('password').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') handleLogin();
    });

    function showError(message) {
      const el = document.getElementById('error-message');
      el.textContent = message;
      el.classList.add('show');
    }

    function hideError() {
      const el = document.getElementById('error-message');
      el.classList.remove('show');
    }

    function handleLogin() {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value.trim();
      const btn = document.getElementById('login-btn');

      hideError();

      // 前端驗證：帳號或密碼不得為空 (400)
      if (!username || !password) {
        showError('帳號或密碼不得為空');
        return;
      }

      btn.disabled = true;
      btn.textContent = '登入中...';

      // ↓ 預覽用假帳號，之後要拿掉
      const fakeAccounts = {
        'admin': { userId: 1, username: 'admin', role: 'ADMIN' },
        'user':  { userId: 2, username: 'user',  role: 'USER'  }
      };
      if (fakeAccounts[username] && password === '1234') {
        const data = fakeAccounts[username];
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('role', data.role);
        window.location.href = 'index.html';
        return;
      } else {
        btn.disabled = false;
        btn.textContent = '登 入';
        showError('帳號或密碼錯誤');
        return;
      }
      // ↑ 預覽用假帳號，之後要拿掉

      // 呼叫後端 API
      fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username, password: password })
      })
      .then(function(res) {
        if (res.status === 401) {
          throw new Error('401');
        }
        if (!res.ok) {
          throw new Error('error');
        }
        return res.json();
      })
      .then(function(data) {
        // 登入成功：把使用者資訊存到 sessionStorage
        sessionStorage.setItem('userId', data.userId);
        sessionStorage.setItem('username', data.username);
        sessionStorage.setItem('role', data.role);

        // 跳轉到書籍列表頁
        window.location.href = 'index.html';
      })
      .catch(function(err) {
        btn.disabled = false;
        btn.textContent = '登 入';

        if (err.message === '401') {
          showError('帳號或密碼錯誤');
        } else {
          showError('系統發生錯誤，請稍後再試');
        }
      });
    }