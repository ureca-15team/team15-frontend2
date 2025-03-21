import React, { useState, useEffect } from 'react';
import logo from '../../assets/loginLogo.jpg';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../../api/auth';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(0); // 로그인 시도 횟수 상태 추가
  const [disabled, setDisabled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedAttempts = localStorage.getItem(
      `loginAttempts_${formData.email}`,
    );
    const storedDisabled = localStorage.getItem('loginDisabled');
    const storedDisabledUntil = localStorage.getItem('loginDisabledUntil');

    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts, 10));
    } else {
      setLoginAttempts(0);
    }

    if (storedDisabled === 'true' && storedDisabledUntil) {
      const disabledUntil = new Date(storedDisabledUntil);
      const now = new Date();
      if (now < disabledUntil) {
        setDisabled(true);
        setErrorMessage(
          '로그인 시도가 너무 많습니다.<br />1분 후 다시 시도해주세요.',
        );
        const remainingTime = disabledUntil - now;
        setTimeout(() => {
          setDisabled(false);
          setLoginAttempts(0);
          localStorage.setItem('loginDisabled', 'false');
          localStorage.setItem(`loginAttempts_${formData.email}`, '0');
          localStorage.removeItem('loginDisabledUntil');
          setErrorMessage(''); // 경고 메시지 초기화
        }, remainingTime);
      } else {
        localStorage.setItem('loginDisabled', 'false');
        localStorage.setItem(`loginAttempts_${formData.email}`, '0');
        localStorage.removeItem('loginDisabledUntil');
      }
    }
  }, [formData.email]);

  useEffect(() => {
    if (disabled === true) {
      const disabledUntil = new Date(new Date().getTime() + 60000);
      localStorage.setItem('loginDisabled', 'true');
      localStorage.setItem('loginDisabledUntil', disabledUntil.toISOString());
      setTimeout(() => {
        setDisabled(false);
        setLoginAttempts(0);
        localStorage.setItem('loginDisabled', 'false');
        localStorage.setItem(`loginAttempts_${formData.email}`, '0');
        localStorage.removeItem('loginDisabledUntil');
        setErrorMessage(''); // 경고 메시지 초기화
      }, 60000);
    }
  }, [disabled]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setErrorMessage('이메일을 입력해주세요.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('비밀번호를 입력해주세요.');
      return;
    }
    try {
      const response = await login(formData.email, formData.password);
      console.log('Response:', response);
      console.log('Response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공:', data);
        setLoginAttempts(0); // 로그인 성공 시 시도 횟수 초기화
        localStorage.setItem(`loginAttempts_${formData.email}`, '0');
        navigate('/'); // 로그인 성공 후 홈 화면으로 이동
      } else {
        if (response.status === 429) {
          setErrorMessage(
            '로그인 시도가 너무 많습니다.<br />1분 후 다시 시도해주세요.',
          );
          setDisabled(true);
        } else {
          const errorData = await response.json();
          setErrorMessage(
            `${errorData.message}<br /> (로그인 시도 횟수: ${loginAttempts + 1}/5)`,
          );
        }
        setLoginAttempts((prevAttempts) => {
          const newAttempts = prevAttempts + 1;
          if (newAttempts > 5) {
            localStorage.setItem(`loginAttempts_${formData.email}`, '0');
            return 0;
          } else {
            localStorage.setItem(
              `loginAttempts_${formData.email}`,
              newAttempts.toString(),
            );
            return newAttempts;
          }
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(
        '네트워크 오류가 발생했습니다. 나중에 다시 시도해주세요.',
      );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="loginBox">
        <Link to="/">
          <img className="loginImg" src={logo} alt="logo" />
        </Link>
        <div className="inputDiv">
          <input
            className="loginEmailInput"
            name="email"
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div className="inputDiv">
          <input
            className="loginPwInput"
            name="password"
            type="password"
            placeholder="비밀번호"
            value={formData.password}
            onChange={handleChange}
          />
        </div>

        <button className="submitButton" type="submit" disabled={disabled}>
          로그인
        </button>
        {errorMessage && (
          <p
            className="errorMessage"
            dangerouslySetInnerHTML={{ __html: errorMessage }}
          ></p>
        )}
        <section className="loginSection">
          <Link to="/register">
            <span className="register">회원가입</span>
          </Link>
        </section>
      </div>
    </form>
  );
};

export default Login;
