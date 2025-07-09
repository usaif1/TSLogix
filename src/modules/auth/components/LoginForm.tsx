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

  const [error, setError] = useState<string>("");

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear any previous errors
    setError("");

    const UserId = formData.userId.trim();
    const Password = formData.loginPassword.trim();

    try {
      const response = await AuthService.login({
        userId: UserId,
        password: Password,
      });

      console.log("response", response);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      const errorMessage =
        "Error al iniciar sesión. Por favor intente nuevamente.";
      setError(errorMessage);
      console.log("error", errorMessage);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear error when user starts typing
    if (error) {
      setError("");
    }

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

      {/* Error message display */}
      {error && (
        <div className="mt-2">
          <Text size="sm" weight="font-normal" additionalClass="text-red-500">
            {error}
          </Text>
        </div>
      )}

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
