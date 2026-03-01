# Forwarder Bot

Телеграм-бот, который копирует сообщения с указанным хештегом из чата A в чат B.

## Что умеет

- слушает сообщения только в `SOURCE_CHAT_ID`
- проверяет наличие нужного хештега `FORWARD_HASHTAG`
- если хештег есть — копирует сообщение в `TARGET_CHAT_ID`
- копирование через `copyMessage`, поэтому работают текст, фото, видео и т.д.

## Настройка

1. Создайте бота через BotFather и получите `BOT_TOKEN`.
2. Добавьте бота в оба чата (A и B).
3. Дайте боту права на чтение сообщений в чате A и публикацию в чате B.
4. Скопируйте `.env.example` в `.env` и заполните значения.

```bash
cp .env.example .env
```

## Запуск через Docker (polling)

```bash
docker compose up --build -d
```

Бот работает через long polling и не требует публичного URL.

## Деплой в Vercel (webhook)

1. Задеплойте проект в Vercel.
2. В Vercel добавьте переменные окружения из `.env.example`.
3. Укажите `WEBHOOK_URL`, например:
   `https://your-project.vercel.app/api/webhook`
4. Локально выполните:

```bash
npm install
npm run set-webhook
```

После этого Telegram начнёт присылать апдейты в Vercel-функцию `api/webhook`.

## Автоматическая выкладка в Vercel (GitHub Actions)

В репозитории добавлен workflow `.github/workflows/vercel-deploy.yml`:

- на `pull_request` — собирает и выкладывает **Preview**
- на `push` в `main` — выкладывает **Production**

### Какие секреты нужно добавить в GitHub

В `Settings → Secrets and variables → Actions` добавьте:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

### Какой именно токен нужен

Нужен **Vercel Personal Access Token**:

1. Vercel → `Settings` → `Tokens`
2. `Create Token`
3. Скопируйте значение в GitHub Secret `VERCEL_TOKEN`

Токен должен иметь доступ к проекту, который вы деплоите (в нужной Team/Scope).

### Где взять ORG_ID и PROJECT_ID

Самый простой путь локально:

```bash
npx vercel link
```

После линковки появится файл `.vercel/project.json` с `orgId` и `projectId`.
Их положите в `VERCEL_ORG_ID` и `VERCEL_PROJECT_ID`.

## Важные детали

- `FORWARD_HASHTAG` можно задавать как `forward` или `#forward`.
- Для супергрупп chat id обычно начинается с `-100`.
- Если в сообщении нет текста/подписи или нет hashtag entity — бот не пересылает сообщение.
