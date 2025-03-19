export const login = async (email, password) => {
  const response = await fetch('http://localhost:8080/member/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 세션 쿠키를 포함하여 요청
    body: JSON.stringify({
      email,
      pwd: password,
    }),
  });

  if (!response.ok) {
    throw new Error('로그인 실패');
  }

  return response.json();
};

export const checkLoginStatus = async () => {
  const response = await fetch('http://localhost:8080/member/status', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 세션 쿠키를 포함하여 요청
  });

  if (!response.ok) {
    throw new Error('로그인 상태 확인 실패');
  }

  return response.json();
};

export const logout = async () => {
  const response = await fetch('http://localhost:8080/member/logout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // 세션 ID를 포함하여 요청
  });

  if (!response.ok) {
    throw new Error('로그아웃 실패');
  }

  return response.json();
};