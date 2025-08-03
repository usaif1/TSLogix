import { create } from 'zustand';

interface PasswordChangeForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordVisibility {
  current: boolean;
  new: boolean;
  confirm: boolean;
}

interface ProfileState {
  // Password change modal state
  showPasswordModal: boolean;
  isChangingPassword: boolean;
  
  // Form data
  passwordForm: PasswordChangeForm;
  passwordErrors: Record<string, string>;
  passwordVisibility: PasswordVisibility;

  // Actions
  setShowPasswordModal: (show: boolean) => void;
  setIsChangingPassword: (loading: boolean) => void;
  
  updatePasswordForm: (field: keyof PasswordChangeForm, value: string) => void;
  setPasswordErrors: (errors: Record<string, string>) => void;
  clearPasswordError: (field: string) => void;
  
  togglePasswordVisibility: (field: keyof PasswordVisibility) => void;
  
  resetPasswordForm: () => void;
}

const initialPasswordForm: PasswordChangeForm = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const initialPasswordVisibility: PasswordVisibility = {
  current: false,
  new: false,
  confirm: false,
};

export const ProfileStore = create<ProfileState>((set, get) => ({
  // Initial state
  showPasswordModal: false,
  isChangingPassword: false,
  passwordForm: initialPasswordForm,
  passwordErrors: {},
  passwordVisibility: initialPasswordVisibility,

  // Actions
  setShowPasswordModal: (show: boolean) => {
    set({ showPasswordModal: show });
    if (!show) {
      // Reset form when closing modal
      get().resetPasswordForm();
    }
  },

  setIsChangingPassword: (loading: boolean) => set({ isChangingPassword: loading }),

  updatePasswordForm: (field: keyof PasswordChangeForm, value: string) => {
    set((state) => ({
      passwordForm: {
        ...state.passwordForm,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    const errors = get().passwordErrors;
    if (errors[field]) {
      get().clearPasswordError(field);
    }
  },

  setPasswordErrors: (errors: Record<string, string>) => set({ passwordErrors: errors }),

  clearPasswordError: (field: string) => {
    set((state) => ({
      passwordErrors: {
        ...state.passwordErrors,
        [field]: ""
      }
    }));
  },

  togglePasswordVisibility: (field: keyof PasswordVisibility) => {
    set((state) => ({
      passwordVisibility: {
        ...state.passwordVisibility,
        [field]: !state.passwordVisibility[field]
      }
    }));
  },

  resetPasswordForm: () => {
    set({
      passwordForm: initialPasswordForm,
      passwordErrors: {},
      passwordVisibility: initialPasswordVisibility,
    });
  },
}));