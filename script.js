// Telegram Bot Configuration
// ВАЖНО: Замените эти значения на ваши реальные данные
const TELEGRAM_BOT_TOKEN = '8415264016:AAECSMghWhuxZxnh4N0g5xyKB5G5dAX7iEQ'; // Токен вашего Telegram бота
const TELEGRAM_CHAT_ID = '6864478711'; // ID чата, куда отправлять заявки

// Функция для плавной прокрутки к форме
function scrollToForm() {
    const formSection = document.getElementById('form');
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Функция для форматирования телефона
function formatPhone(phone) {
    // Удаляем все нецифровые символы
    const cleaned = phone.replace(/\D/g, '');
    // Форматируем в формат +7 (999) 123-45-67
    if (cleaned.length === 11 && cleaned[0] === '8') {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 11 && cleaned[0] === '7') {
        return `+7 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7, 9)}-${cleaned.slice(9)}`;
    } else if (cleaned.length === 10) {
        return `+7 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 8)}-${cleaned.slice(8)}`;
    }
    return phone;
}

// Функция для отправки сообщения в Telegram
async function sendToTelegram(name, phone, comment) {
    const message = `
🔔 <b>Новая заявка с сайта</b>

👤 <b>Имя:</b> ${name}
📞 <b>Телефон:</b> ${phone}
💬 <b>Комментарий:</b> ${comment || 'Не указан'}

⏰ <b>Время:</b> ${new Date().toLocaleString('ru-RU')}
    `.trim();

    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: message,
                parse_mode: 'HTML',
            }),
        });

        const data = await response.json();
        
        if (response.ok && data.ok) {
            return { success: true };
        } else {
            console.error('Telegram API error:', data);
            return { success: false, error: data.description || 'Ошибка отправки' };
        }
    } catch (error) {
        console.error('Network error:', error);
        return { success: false, error: 'Ошибка сети' };
    }
}

// Обработка отправки формы
document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    const submitButton = form.querySelector('.btn-submit');

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Получаем значения полей
        const name = document.getElementById('name').value.trim();
        const phone = document.getElementById('phone').value.trim();
        const comment = document.getElementById('comment').value.trim();

        // Валидация
        if (!name || !phone) {
            showMessage('Пожалуйста, заполните все обязательные поля', 'error');
            return;
        }

        // Форматируем телефон
        const formattedPhone = formatPhone(phone);

        // Блокируем кнопку отправки
        submitButton.disabled = true;
        submitButton.textContent = 'Отправка...';

        // Скрываем предыдущие сообщения
        formMessage.style.display = 'none';

        // Отправляем в Telegram
        const result = await sendToTelegram(name, formattedPhone, comment);

        if (result.success) {
            showMessage('Спасибо! Ваша заявка отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
            form.reset();
        } else {
            showMessage('Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже или свяжитесь с нами по телефону.', 'error');
        }

        // Разблокируем кнопку
        submitButton.disabled = false;
        submitButton.textContent = 'Отправить заявку';
    });

    // Функция для отображения сообщений
    function showMessage(text, type) {
        formMessage.textContent = text;
        formMessage.className = `form-message ${type}`;
        formMessage.style.display = 'block';

        // Автоматически скрываем сообщение через 5 секунд (только для успешных)
        if (type === 'success') {
            setTimeout(() => {
                formMessage.style.display = 'none';
            }, 5000);
        }
    }

    // Маска для телефона (опционально)
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', function(e) {
        let value = e.target.value.replace(/\D/g, '');
        
        if (value.length > 0) {
            if (value[0] === '8') {
                value = '7' + value.slice(1);
            }
            if (value[0] !== '7' && value.length <= 10) {
                value = '7' + value;
            }
            
            let formatted = '+7';
            if (value.length > 1) {
                formatted += ' (' + value.slice(1, 4);
            }
            if (value.length >= 4) {
                formatted += ') ' + value.slice(4, 7);
            }
            if (value.length >= 7) {
                formatted += '-' + value.slice(7, 9);
            }
            if (value.length >= 9) {
                formatted += '-' + value.slice(9, 11);
            }
            
            e.target.value = formatted;
        }
    });
});
