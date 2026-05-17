// тип для ошибок формы
export type FormErrors = {
  [key: string]: string;
};

// валидация регистрации
export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
}

export const validateRegister = (data: RegisterFormData): FormErrors => {
  const errors: FormErrors = {};

  // валидация имени пользователя
  if (!data.username.trim()) {
    errors.username = 'Имя пользователя обязательно';
  } else if (data.username.length < 3) {
    errors.username = 'Имя пользователя должно содержать минимум 3 символа';
  } else if (data.username.length > 30) {
    errors.username = 'Имя пользователя не должно превышать 30 символов';
  } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
    errors.username = 'Имя пользователя может содержать только буквы, цифры и подчёркивания';
  }

  // валидация почты
  if (!data.email.trim()) {
    errors.email = 'Почта обязательна';
  } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(data.email)) {
    errors.email = 'Введите корректный email-адрес';
  }

  // валидация пароля
  if (!data.password) {
    errors.password = 'Пароль обязателен';
  } else if (data.password.length < 6) {
    errors.password = 'Пароль должен содержать минимум 6 символов';
  } else if (data.password.length > 50) {
    errors.password = 'Пароль не должен превышать 50 символов';
  }

  return errors;
};

// валидация для входа
export interface LoginFormData {
  email: string;
  password: string;
}

export const validateLogin = (data: LoginFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.email.trim()) {
    errors.email = 'Почта или логин обязателен';
  }

  if (!data.password) {
    errors.password = 'Пароль обязателен';
  }

  return errors;
};

// валидация создания статьи
export interface ArticleFormData {
  title: string;
  content: string;
  poster?: File | null; // добавление картинки
}

export const validateArticle = (data: ArticleFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.title.trim()) {
    errors.title = 'Заголовок обязателен';
  } else if (data.title.length < 3) {
    errors.title = 'Заголовок должен содержать минимум 3 символа';
  } else if (data.title.length > 100) {
    errors.title = 'Заголовок не должен превышать 100 символов';
  }

  if (!data.content.trim()) {
    errors.content = 'Содержание статьи обязательно';
  } else if (data.content.length < 10) {
    errors.content = 'Содержание статьи должно содержать минимум 10 символов';
  } else if (data.content.length > 5000) {
    errors.content = 'Содержание статьи не должно превышать 5000 символов';
  }

  // валидация файла (если передан)
  if (data.poster) {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(data.poster.type)) {
      errors.poster = 'Поддерживаются только JPEG, PNG, WEBP и GIF';
    }
    if (data.poster.size > 5 * 1024 * 1024) { // 5MB
      errors.poster = 'Размер файла не должен превышать 5MB';
    }
  }

  return errors;
};

// валидация комментариев
export interface CommentFormData {
  text: string;
}

export const validateComment = (data: CommentFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.text.trim()) {
    errors.text = 'Комментарий не может быть пустым';
  } else if (data.text.length < 1) {
    errors.text = 'Комментарий слишком короткий';
  } else if (data.text.length > 500) {
    errors.text = 'Комментарий не должен превышать 500 символов';
  }

  return errors;
};

// валидация редактирования профиля
export interface EditProfileFormData {
  username: string;
  email: string;
}

export const validateEditProfile = (data: EditProfileFormData): FormErrors => {
  const errors: FormErrors = {};

  if (!data.username.trim()) {
    errors.username = 'Имя пользователя обязательно';
  } else if (data.username.length < 3) {
    errors.username = 'Имя пользователя должно содержать минимум 3 символа';
  } else if (data.username.length > 30) {
    errors.username = 'Имя пользователя не должно превышать 30 символов';
  }

  if (!data.email.trim()) {
    errors.email = 'Email обязателен';
  } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(data.email)) {
    errors.email = 'Введите корректный email адрес';
  }

  return errors;
};

export const hasErrors = (errors: FormErrors): boolean => {
  return Object.keys(errors).length > 0;
};

export const getErrorMessage = (errors: FormErrors, field: string): string | null => {
  return errors[field] || null;
};