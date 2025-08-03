// dependencies
import React, { useState } from "react";
import { ArrowRight } from "@phosphor-icons/react";

// components
import Button from "@/components/Button";
import CustomText from "@/components/Text";

// service
import { AuthService } from "@/globalService";

const LoginForm: React.FC = () => {
  const [formData, setFormData] = useState({
    userId: "",
    loginPassword: "",
  });

  const [error, setError] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Clear any previous errors
    setError("");
    setIsLoading(true);

    const UserId = formData.userId.trim();
    const Password = formData.loginPassword.trim();

    try {
      await AuthService.login({
        userId: UserId,
        password: Password,
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setError("Error al iniciar sesión. Por favor intente nuevamente.");
    } finally {
      setIsLoading(false);
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
    <form className="space-y-6" onSubmit={onSubmit}>
      <div>
        <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-2">
          ID de Usuario
        </label>
        <input
          type="text"
          onChange={onChange}
          value={formData.userId}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingrese su ID de usuario"
          autoComplete="off"
          name="userId"
        />
      </div>
      
      <div>
        <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-2">
          Contraseña
        </label>
        <input
          type="password"
          value={formData.loginPassword}
          onChange={onChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ingrese su contraseña"
          name="loginPassword"
        />
      </div>

      {/* Error message display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <CustomText size="sm" weight="font-normal" additionalClass="text-red-800">
            {error}
          </CustomText>
        </div>
      )}

      <Button 
        type="submit" 
        disabled={isLoading}
        additionalClass={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading 
            ? 'bg-blue-400 cursor-not-allowed' 
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        <div className="flex gap-x-2 items-center justify-center">
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <CustomText color="text-white" weight="font-medium">
                Iniciando sesión...
              </CustomText>
            </>
          ) : (
            <>
              <CustomText color="text-white" weight="font-medium">
                Iniciar Sesión
              </CustomText>
              <ArrowRight weight="bold" size={18} />
            </>
          )}
        </div>
      </Button>
    </form>
  );
};

export default LoginForm;
