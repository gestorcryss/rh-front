import { useState } from "react";
import { Link } from "react-router";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "../../icons";
import Label from "../form/Label";
import Input from "../form/input/InputField";
import Checkbox from "../form/input/Checkbox";
import Button from "../ui/button/Button";

interface SignUpFormProps {
  onRegister: (data: {
    numero_mecanografico: string;
    nome_completo: string;
    username: string;
    email: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  isLoading: boolean;
}

export default function SignUpForm({ onRegister, isLoading }: SignUpFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChecked, setIsChecked] = useState(false);
  
  const [formData, setFormData] = useState({
    numero_mecanografico: "",
    nome_completo: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  
  const [errors, setErrors] = useState<{
    numero_mecanografico?: string;
    nome_completo?: string;
    username?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
  }>({});

  const validate = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.numero_mecanografico) {
      newErrors.numero_mecanografico = "Número mecanográfico é obrigatório";
    }
    
    if (!formData.nome_completo) {
      newErrors.nome_completo = "Nome completo é obrigatório";
    }
    
    if (!formData.username) {
      newErrors.username = "Nome de usuário é obrigatório";
    } else if (formData.username.length < 3) {
      newErrors.username = "Nome de usuário deve ter pelo menos 3 caracteres";
    }
    
    if (!formData.email) {
      newErrors.email = "Email é obrigatório";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }
    
    if (!formData.password) {
      newErrors.password = "Senha é obrigatória";
    } else if (formData.password.length < 6) {
      newErrors.password = "Senha deve ter pelo menos 6 caracteres";
    }
    
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = "Confirmação de senha é obrigatória";
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = "As senhas não coincidem";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      await onRegister(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Limpar erro do campo ao digitar
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <div className="flex flex-col flex-1">
      <div className="w-full max-w-md pt-10 mx-auto">
        <Link
          to="/"
          className="inline-flex items-center text-sm text-gray-500 transition-colors hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
        >
          <ChevronLeftIcon className="size-5" />
          Voltar para o dashboard
        </Link>
      </div>
      <div className="flex flex-col justify-center flex-1 w-full max-w-md mx-auto">
        <div>
          <div className="mb-5 sm:mb-8">
            <h1 className="mb-2 font-semibold text-gray-800 text-title-sm dark:text-white/90 sm:text-title-md">
              Criar nova conta
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Preencha os dados abaixo para se cadastrar
            </p>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              <div>
                <Label>
                  Número Mecanográfico <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="numero_mecanografico"
                  value={formData.numero_mecanografico}
                  onChange={handleChange}
                  placeholder="Ex: FUNC001"
                  error={!!errors.numero_mecanografico}
                />
                {errors.numero_mecanografico && (
                  <p className="mt-1 text-sm text-red-500">{errors.numero_mecanografico}</p>
                )}
              </div>

              <div>
                <Label>
                  Nome Completo <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="nome_completo"
                  value={formData.nome_completo}
                  onChange={handleChange}
                  placeholder="Digite seu nome completo"
                  error={!!errors.nome_completo}
                />
                {errors.nome_completo && (
                  <p className="mt-1 text-sm text-red-500">{errors.nome_completo}</p>
                )}
              </div>

              <div>
                <Label>
                  Nome de Usuário <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Ex: joao.silva"
                  error={!!errors.username}
                />
                {errors.username && (
                  <p className="mt-1 text-sm text-red-500">{errors.username}</p>
                )}
              </div>

              <div>
                <Label>
                  Email <span className="text-error-500">*</span>
                </Label>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  error={!!errors.email}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <Label>
                  Senha <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Digite sua senha"
                    error={!!errors.password}
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-500">{errors.password}</p>
                )}
              </div>

              <div>
                <Label>
                  Confirmar Senha <span className="text-error-500">*</span>
                </Label>
                <div className="relative">
                  <Input
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    placeholder="Confirme sua senha"
                    error={!!errors.password_confirmation}
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                  >
                    {showConfirmPassword ? (
                      <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    ) : (
                      <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                    )}
                  </span>
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Checkbox checked={isChecked} onChange={setIsChecked} />
                <span className="block font-normal text-gray-700 text-theme-sm dark:text-gray-400">
                  Aceito os{" "}
                  <Link to="/terms" className="text-brand-500 hover:underline">
                    Termos de Uso
                  </Link>{" "}
                  e{" "}
                  <Link to="/privacy" className="text-brand-500 hover:underline">
                    Política de Privacidade
                  </Link>
                </span>
              </div>

              <div>
                <Button 
                
                  className="w-full" 
                  size="sm"
                  disabled={isLoading || !isChecked}
                >
                  {isLoading ? "Cadastrando..." : "Cadastrar"}
                </Button>
              </div>
            </div>
          </form>

          <div className="mt-5">
            <p className="text-sm font-normal text-center text-gray-700 dark:text-gray-400 sm:text-start">
              Já tem uma conta?{" "}
              <Link
                to="/signin"
                className="text-brand-500 hover:text-brand-600 dark:text-brand-400"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}