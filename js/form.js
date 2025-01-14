const form = document.querySelector('.img-upload__form');
const fileInput = document.querySelector('.img-upload__input');
const uploadOverlay = document.querySelector('.img-upload__overlay');
const closeButton = document.querySelector('.img-upload__cancel');
const body = document.body;
const hashtagsInput = form.querySelector('.text__hashtags');
const descriptionInput = form.querySelector('.text__description');

const MAX_HASHTAGS = 5;
const MAX_SYMBOLS = 20;
const MAX_DESCRIPTION_LENGTH = 140;

const pristine = new Pristine(form, {
  classTo: 'img-upload__field-wrapper',
  errorTextParent: 'img-upload__field-wrapper',
  errorTextClass: 'pristine-error',
});

// Правила для валидации хэштегов
const hashtagRules = [
  {
    check: (inputArray) => inputArray.every((item) => item !== '#'),
    error: 'Хэштег не может состоять только из одной решётки',
  },
  {
    check: (inputArray) => inputArray.every((item) => !item.slice(1).includes('#')),
    error: 'Хэштеги разделяются пробелами',
  },
  {
    check: (inputArray) => inputArray.every((item) => item[0] === '#'),
    error: 'Хэштег должен начинаться с символа "#"',
  },
  {
    check: (inputArray) => inputArray.every((item, index, array) => array.indexOf(item) === index),
    error: 'Хэштеги не должны повторяться',
  },
  {
    check: (inputArray) => inputArray.every((item) => item.length <= MAX_SYMBOLS),
    error: `Максимальная длина одного хэштега ${MAX_SYMBOLS} символов, включая решётку`,
  },
  {
    check: (inputArray) => inputArray.length <= MAX_HASHTAGS,
    error: `Нельзя указать больше ${MAX_HASHTAGS} хэштегов`,
  },
];

// Функция для валидации хэштегов
const validateHashtags = (value) => {
  if (!value.trim()) {
    return true; // Пустое значение валидно
  }
  const inputArray = value.trim().toLowerCase().split(/\s+/);
  return hashtagRules.every((rule) => rule.check(inputArray));
};

// Функция для получения текста ошибки
const getHashtagsError = (value) => {
  if (!value.trim()) {
    return '';
  }
  const inputArray = value.trim().toLowerCase().split(/\s+/);
  for (const rule of hashtagRules) {
    if (!rule.check(inputArray)) {
      return rule.error;
    }
  }
  return '';
};

// Правило для валидации комментария
const validateDescription = (value) => value.length <= MAX_DESCRIPTION_LENGTH;
const getDescriptionError = () =>
  `Длина комментария не может превышать ${MAX_DESCRIPTION_LENGTH} символов.`;
pristine.addValidator(hashtagsInput, validateHashtags, getHashtagsError);
pristine.addValidator(descriptionInput, validateDescription, getDescriptionError);


const openEditForm = () => {
  uploadOverlay.classList.remove('hidden');
  body.classList.add('modal-open');
  closeButton.addEventListener('click', closeEditForm);
  document.addEventListener('keydown', onEscKeyPress);
};

// Закрытие формы редактирования
function closeEditForm() {
  uploadOverlay.classList.add('hidden');
  body.classList.remove('modal-open');

  form.reset(); // Сбрасываем форму
  pristine.reset(); // Сбрасываем состояние Pristine

  closeButton.removeEventListener('click', closeEditForm);
  document.removeEventListener('keydown', onEscKeyPress);
}

// Закрытие формы при нажатии Escape
function onEscKeyPress(evt) {
  if (evt.key === 'Escape' &&
    !hashtagsInput.matches(':focus') &&
    !descriptionInput.matches(':focus')) {
    evt.preventDefault();
    closeEditForm();
  }
}

// Отключение обработки Escape при фокусе на полях ввода
[hashtagsInput, descriptionInput].forEach((input) => {
  input.addEventListener('keydown', (evt) => {
    if (evt.key === 'Escape') {
      evt.stopPropagation();
    }
  });
});

// Открытие формы при выборе файла
fileInput.addEventListener('change', () => {
  openEditForm();
});

// Обработчик отправки формы
form.addEventListener('submit', (evt) => {
  evt.preventDefault();
  const isValid = pristine.validate();
  if (isValid) {
    form.submit();
  }
});
