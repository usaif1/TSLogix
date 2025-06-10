// dependencies
import React, { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";

// components
import { Button, Text } from "@/components";

// service
import { AuthService } from "@/globalService";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    userId: "",
    loginPassword: "",
  });

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const UserId = formData.userId.trim();
    const Password = formData.loginPassword.trim();


    AuthService.login({
      userId: UserId,
      password: Password,
    });
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <form className="login_form" onSubmit={onSubmit}>
      <div className="login_form_block">
        <label htmlFor="userId">ID de Usuario</label>
        <input
          type="text"
          onChange={onChange}
          value={formData.userId}
          className="login_input mt-1.5"
          placeholder="Ingrese su ID de usuario"
          autoComplete="off"
          name="userId"
        />
      </div>
      <div className="login_form_block">
        <label htmlFor="loginPassword">Contraseña</label>
        <input
          type="password"
          value={formData.loginPassword}
          onChange={onChange}
          className="login_input mt-1.5"
          name="loginPassword"
        />
      </div>

      <Button type="submit">
        <div className="flex gap-x-2 items-center">
          <Text color="text-white" weight="font-normal">
            Iniciar Sesión
          </Text>
          <ArrowRight weight="bold" />
        </div>
      </Button>
    </form>
  );
};

export default LoginForm;
