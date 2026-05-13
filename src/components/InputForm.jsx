// pages/loginPage.jsx
import "../styles/InputForm.css";

export default function InputForm() {
  return (
    <div className="input-area">
      <div>
        <label htmlFor="username">USERNAME OR EMAIL</label>
        <input id="username" type="text" required />
      </div>
      <div>
        <label htmlFor="password">PASSWORD</label>
        <input id="password" type="password" required />
      </div>
    </div>
  );
}
