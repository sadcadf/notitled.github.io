# 🔄 СМЕНА ДОМЕНА И ПРИВАТНОСТЬ

## ВОПРОС 1: Как изменить домен на `notitled.github.io`?

У тебя 3 варианта:

---

### 🎯 ВАРИАНТ 1: Изменить username на GitHub (ПРОЩЕ ВСЕГО)

Если изменишь username `sadcadf` → `notitled`, репозиторий **автоматически** станет `notitled.github.io`!

#### Шаги:

1. **Открой:** https://github.com/settings/admin
2. **Change username**
3. **Новый username:** `notitled`
4. **Подтверди**

**⚠️ ВАЖНО:**
- Все старые ссылки (`sadcadf.github.io`) перенаправятся на новые
- Твои другие репозитории тоже изменят URL
- GitHub сохранит редирект на **несколько недель**

#### После смены username:

```bash
cd /Users/dimailev/anti/нд/blog

# Обнови remote URL
git remote set-url origin https://github.com/notitled/notitled.github.io.git

# Замени домены в файлах
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" index.html
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" assets/js/app.js
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" feed.xml
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" sitemap.xml
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" robots.txt

# Пересобери JS
npx -y terser assets/js/app.js -o assets/js/app.min.js -c -m

# Запуш
git add .
git commit -m "Update domain to notitled.github.io"
git push
```

**Сайт будет на:** `https://notitled.github.io/` ✨

---

### 🌐 ВАРИАНТ 2: Купить кастомный домен

Можешь оставить username `sadcadf`, но купить `notitled.ru` или `notitled.com`

#### Шаги:

1. **Купи домен:**
   - [Namecheap](https://www.namecheap.com/) - ~$10/год
   - [Reg.ru](https://www.reg.ru/) - для .ru домена
   - [Cloudflare](https://www.cloudflare.com/products/registrar/) - по себестоимости

2. **Настрой на GitHub:**
   - https://github.com/sadcadf/notitled.github.io/settings/pages
   - **Custom domain:** введи `notitled.ru`
   - **Enforce HTTPS** ✅

3. **Настрой DNS у регистратора:**

**Для apex домена (notitled.ru):**
```
Type: A
Name: @
Value: 185.199.108.153

Type: A  
Name: @
Value: 185.199.109.153

Type: A
Name: @
Value: 185.199.110.153

Type: A
Name: @
Value: 185.199.111.153
```

**Для поддомена (www.notitled.ru или blog.notitled.ru):**
```
Type: CNAME
Name: www  (или blog)
Value: sadcadf.github.io
```

4. **Дождись propagation** (5-60 минут)

5. **Обнови домены в коде:**
```bash
sed -i '' "s/sadcadf.github.io/notitled.ru/g" index.html
sed -i '' "s/sadcadf.github.io/notitled.ru/g" assets/js/app.js
# ... и т.д.
```

**Сайт будет на:** `https://notitled.ru/` ✨

---

### 👥 ВАРИАНТ 3: Создать новый аккаунт

Создай новый GitHub аккаунт с username `notitled`, но **НЕ РЕКОМЕНДУЮ**:
- Нужно будет перезаливать код
- Управлять двумя аккаунтами
- Сложнее

---

## ВОПРОС 2: Как сделать репозиторий приватным?

**Проблема:** GitHub Pages **НЕ РАБОТАЕТ** с приватными репозиториями на Free плане! ❌

### Варианты решения:

---

### 🔐 ВАРИАНТ 1: GitHub Pro (платно)

**Цена:** $4/месяц

**Что получишь:**
- Приватные репозитории + GitHub Pages ✅
- 3000 минут Actions в месяц
- 2GB Packages storage

**Как подключить:**
1. https://github.com/settings/billing/plans
2. Upgrade to Pro
3. Сделай репозиторий приватным:
   - Settings → General → Change visibility → Private

**Но сайт всё равно будет публичным!** (только код приватный)

---

### ☁️ ВАРИАНТ 2: Netlify/Vercel (БЕСПЛАТНО + приватный repo)

**Преимущества:**
- ✅ Бесплатно
- ✅ Приватный репозиторий
- ✅ Автоматический деплой
- ✅ HTTPS
- ✅ Быстрее чем GitHub Pages

#### Netlify (рекомендую):

1. **Сделай репозиторий приватным:**
   - https://github.com/sadcadf/notitled.github.io/settings
   - Danger Zone → Change visibility → Private

2. **Зарегистрируйся на Netlify:**
   - https://app.netlify.com/signup
   - Sign up with GitHub

3. **Подключи репозиторий:**
   - New site from Git
   - Connect to GitHub
   - Выбери `notitled.github.io`
   - Build settings: (оставить пустыми)
   - Publish directory: `.` (корень)
   - Deploy!

4. **Готово!** Сайт будет на `random-name.netlify.app`

5. **Кастомный домен (опционально):**
   - Domain settings → Add custom domain
   - `notitled.ru` или subdomain Netlify даст бесплатно

**Плюсы:**
- ✅ Репозиторий приватный
- ✅ Автодеплой при push
- ✅ Netlify DNS (быстрее)
- ✅ Rollback на старые версии
- ✅ Deploy previews для веток

---

#### Vercel (альтернатива):

1. **Приватный репозиторий** (как с Netlify)

2. **Зарегистрируйся:**
   - https://vercel.com/signup
   - Continue with GitHub

3. **Import Project:**
   - New Project
   - Import Git Repository
   - Выбери `notitled.github.io`
   - Deploy

**Готово!** Сайт на `random-name.vercel.app`

---

### 🤔 ВАРИАНТ 3: Cloudflare Pages (самый быстрый)

1. **Приватный репозиторий**
2. **Регистрация:** https://pages.cloudflare.com
3. **Connect GitHub**
4. **Select repository** → Deploy
5. **Готово!** + бесплатный Cloudflare CDN

---

## 📊 СРАВНЕНИЕ

| Вариант | Цена | Приватный repo | Деплой |
|---------|------|----------------|--------|
| **GitHub Pages Free** | 0₽ | ❌ | Только public |
| **GitHub Pages Pro** | ~$4/мес | ⚠️ Код да, сайт нет | Public repo |
| **Netlify** | 0₽ | ✅ | ✅ |
| **Vercel** | 0₽ | ✅ | ✅ |
| **Cloudflare Pages** | 0₽ | ✅ | ✅ |

---

## 🎯 МОЯ РЕКОМЕНДАЦИЯ

### Для смены домена:
**Измени username** `sadcadf` → `notitled` (самое простое)

### Для приватности:
**Перейди на Netlify:**
1. Сделай репозиторий приватным
2. Подключи к Netlify
3. Автодеплой настроен
4. Бесплатно навсегда

---

## 🚀 БЫСТРАЯ ИНСТРУКЦИЯ (если хочешь оба сразу)

### 1. Измени username на GitHub
```
https://github.com/settings/admin
sadcadf → notitled
```

### 2. Обнови remote
```bash
cd /Users/dimailev/anti/нд/blog
git remote set-url origin https://github.com/notitled/notitled.github.io.git
```

### 3. Замени домены
```bash
sed -i '' "s/sadcadf.github.io/notitled.github.io/g" index.html assets/js/app.js feed.xml sitemap.xml robots.txt
npx -y terser assets/js/app.js -o assets/js/app.min.js -c -m
git add .
git commit -m "Update to notitled.github.io"
git push
```

### 4. Сделай репозиторий приватным
```
https://github.com/notitled/notitled.github.io/settings
→ Change visibility → Private
```

### 5. Подключи Netlify
```
https://app.netlify.com/
→ New site → Import from GitHub → Deploy
```

**Готово!** Приватный код + публичный сайт на `notitled.github.io` (или Netlify) ✨

---

## ❓ FAQ

### Q: Если репозиторий приватный, сайт тоже будет приватным?
**A:** Нет! Сайт всегда публичный. Приватный только исходный код.

### Q: Можно ли сделать сайт полностью приватным?
**A:** Да, но нужен отдельный хостинг с авторизацией (не GitHub Pages/Netlify/Vercel).

### Q: Netlify бесплатный навсегда?
**A:** Да! 100GB трафика в месяц бесплатно (меньше лимита редко кто превышает).

---

**Что выбираешь?** 😊
1. Меняешь username на `notitled`?
2. Покупаешь домен `notitled.ru`?
3. Переходишь на Netlify для приватности?
4. Всё вместе?

Скажи и помогу настроить! 🚀
